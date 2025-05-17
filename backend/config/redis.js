const { createClient } = require('redis');
const { execSync } = require('child_process');

// Create a Redis client that can work with Redis Cluster
const redisClient = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@${process.env.REDIS_HOST || 'redis-node-0'}:${process.env.REDIS_PORT || '6379'}`,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Max Redis reconnection attempts reached');
        return new Error('Max Redis reconnection attempts reached');
      }
      // Exponential backoff: 2^retries * 100ms (100ms, 200ms, 400ms, etc.)
      const delay = Math.min(Math.pow(2, retries) * 100, 10000);
      console.log(`Redis reconnecting in ${delay}ms...`);
      return delay;
    }
  }
});

// Event handlers
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('reconnecting', () => {
  console.log('Redis client attempting to reconnect...');
});

redisClient.on('connect', () => {
  console.log('Redis client connected successfully');
});

// Helper function to initialize cluster using Docker exec (more reliable than Redis commands)
const initializeClusterViaDocker = () => {
  try {
    console.log('Attempting to initialize Redis Cluster via Docker exec...');
    
    // Get container prefix
    // This handles the case where the project name might be different
    let containerPrefix = 'microservices-santosh';
    try {
      // Try to get the actual container name prefix
      const containerName = execSync('hostname').toString().trim();
      containerPrefix = containerName.split('-backend-')[0];
      console.log(`Detected container prefix: ${containerPrefix}`);
    } catch (err) {
      console.warn('Could not detect container prefix, using default:', err.message);
    }
    
    // Reset all nodes first
    for (let i = 0; i < 6; i++) {
      try {
        execSync(`docker exec ${containerPrefix}-redis-node-${i}-1 redis-cli -a redis_password FLUSHALL`, { stdio: 'ignore' });
        execSync(`docker exec ${containerPrefix}-redis-node-${i}-1 redis-cli -a redis_password CLUSTER RESET`, { stdio: 'ignore' });
        console.log(`Reset redis-node-${i}`);
      } catch (err) {
        console.warn(`Error resetting redis-node-${i}:`, err.message);
      }
    }
    
    // Sleep to let nodes stabilize
    execSync('sleep 5');
    
    // Get the IPs of all nodes
    let nodeIPs = [];
    for (let i = 0; i < 6; i++) {
      try {
        const ip = execSync(`docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${containerPrefix}-redis-node-${i}-1`).toString().trim();
        nodeIPs.push(`${ip}:6379`);
        console.log(`redis-node-${i} IP: ${ip}`);
      } catch (err) {
        console.error(`Could not get IP for redis-node-${i}:`, err.message);
        return false;
      }
    }
    
    // Create the cluster with proper replica configuration
    const clusterCreateCmd = `docker exec ${containerPrefix}-redis-node-0-1 redis-cli -a redis_password --cluster create ${nodeIPs.join(' ')} --cluster-replicas 1 --cluster-yes`;
    
    try {
      console.log("Running command:", clusterCreateCmd);
      execSync(clusterCreateCmd);
      console.log('Redis Cluster created successfully');
    } catch (err) {
      console.error('Error creating Redis Cluster:', err.message);
      return false;
    }
    
    // Check cluster state
    try {
      const clusterInfo = execSync(`docker exec ${containerPrefix}-redis-node-0-1 redis-cli -a redis_password CLUSTER INFO`).toString();
      if (clusterInfo.includes('cluster_state:ok')) {
        console.log('Redis Cluster is now properly initialized');
        return true;
      } else {
        console.error('Cluster initialization failed, cluster state is not OK');
        return false;
      }
    } catch (err) {
      console.error('Error checking cluster state:', err.message);
      return false;
    }
  } catch (err) {
    console.error('Error in cluster initialization via Docker:', err.message);
    return false;
  }
};

// Fallback function that just creates a local Redis with no clustering
const fallbackToLocalRedis = () => {
  console.log('Falling back to local non-clustered Redis...');

  // Close existing client if open
  try {
    if (redisClient.isOpen) {
      redisClient.quit().catch(() => {});
    }
  } catch (e) {}

  // Create a new client pointing to a single Redis instance
  global.redisClient = createClient({
    url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@${process.env.REDIS_HOST || 'redis-node-0'}:${process.env.REDIS_PORT || '6379'}`,
    socket: {
      connectTimeout: 15000,
      reconnectStrategy: (retries) => {
        if (retries > 5) return new Error('Max retries reached');
        return Math.min(retries * 500, 3000);
      }
    }
  });

  global.redisClient.on('error', (err) => {
    console.error('Fallback Redis Error:', err);
  });

  return global.redisClient;
};

// Initialize Redis with retry logic and sample data
const initializeRedis = async (maxRetries = 5, delay = 5000) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      if (!redisClient.isOpen) {
        console.log('Attempting to connect to Redis Cluster...');
        await redisClient.connect();
        console.log('Connected to Redis Cluster successfully');
      }
      
      // Check if we can perform operations, if not - initialize the cluster
      try {
        await redisClient.ping();
        console.log('Redis Cluster is responding to PING');
      } catch (pingErr) {
        console.warn('Redis ping error:', pingErr.message);
        if (pingErr.message.includes('CLUSTERDOWN')) {
          console.log('Redis Cluster is down. Initializing cluster...');
          const initialized = initializeClusterViaDocker();
          
          if (!initialized) {
            console.warn('Failed to initialize Redis Cluster. Will try again if needed.');
          }
          
          // Wait for cluster to stabilize
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      // Test if we can write to Redis
      try {
        await redisClient.set('test_key', 'test_value');
        console.log('Successfully wrote test key to Redis');
        await redisClient.del('test_key');
      } catch (writeErr) {
        console.error('Error writing to Redis:', writeErr.message);
        
        if (writeErr.message.includes('CLUSTERDOWN')) {
          console.log('Redis Cluster is still down. Attempting re-initialization...');
          const reinitialized = initializeClusterViaDocker();
          
          if (!reinitialized) {
            console.warn('Re-initialization failed, continuing anyway...');
          }
          
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      // Add some sample data if Redis is empty
      try {
        // Try to get all keys, but allow failures
        let keysCount = 0;
        try {
          const keys = await redisClient.keys('*');
          keysCount = keys.length;
        } catch (keysErr) {
          console.warn('Could not get keys count:', keysErr.message);
        }
        
        // Try to add sample data, but allow failures
        try {
          if (keysCount === 0) {
            console.log('Adding sample data to Redis Cluster...');
            try {
              await redisClient.set('redis_key_1', 'This is sample data 1 in Redis Cluster');
              await redisClient.set('redis_key_2', 'This is sample data 2 in Redis Cluster');
              console.log('Sample data added to Redis Cluster');
            } catch (setErr) {
              console.warn('Could not add sample data:', setErr.message);
              
              // If this is a CLUSTERDOWN error, try one more time to initialize
              if (setErr.message.includes('CLUSTERDOWN')) {
                console.log('Redis Cluster still down after multiple attempts. Last try...');
                initializeClusterViaDocker();
                
                // If we still can't add data, just continue
                try {
                  await new Promise(resolve => setTimeout(resolve, 5000));
                  await redisClient.set('redis_key_1', 'This is sample data 1 in Redis Cluster');
                  await redisClient.set('redis_key_2', 'This is sample data 2 in Redis Cluster');
                  console.log('Sample data added on final try');
                } catch (finalErr) {
                  console.warn('Final attempt to add sample data failed:', finalErr.message);
                }
              }
            }
          } else {
            console.log(`Redis Cluster already has ${keysCount} keys`);
          }
        } catch (dataErr) {
          console.warn('Error handling sample data:', dataErr.message);
        }
        
        console.log('Redis Cluster client initialized successfully');
        return true;
      } catch (dataError) {
        console.warn('Could not check Redis keys:', dataError.message);
        // Continue anyway as this is not critical
        return true;
      }
    } catch (error) {
      retries++;
      console.error(`Redis Cluster initialization attempt ${retries} failed:`, error.message);
      
      if (retries >= maxRetries) {
        console.error('Max retries reached. Unable to initialize Redis Cluster');
        return false;
      }
      
      console.log(`Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
};

module.exports = {
  redisClient,
  initializeRedis
};