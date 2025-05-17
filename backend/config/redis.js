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
    
    // Reset all nodes first
    for (let i = 0; i < 6; i++) {
      try {
        execSync(`docker exec microservices-santosh-redis-node-${i}-1 redis-cli -a redis_password FLUSHALL`, { stdio: 'ignore' });
        execSync(`docker exec microservices-santosh-redis-node-${i}-1 redis-cli -a redis_password CLUSTER RESET`, { stdio: 'ignore' });
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
        const ip = execSync(`docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' microservices-santosh-redis-node-${i}-1`).toString().trim();
        nodeIPs.push(`${ip}:6379`);
        console.log(`redis-node-${i} IP: ${ip}`);
      } catch (err) {
        console.error(`Could not get IP for redis-node-${i}:`, err.message);
        return false;
      }
    }
    
    // Create the cluster with proper replica configuration
    const clusterCreateCmd = `docker exec microservices-santosh-redis-node-0-1 redis-cli -a redis_password --cluster create ${nodeIPs.join(' ')} --cluster-replicas 1 --cluster-yes`;
    
    try {
      execSync(clusterCreateCmd, { stdio: 'inherit' });
      console.log('Redis Cluster created successfully');
    } catch (err) {
      console.error('Error creating Redis Cluster:', err.message);
      return false;
    }
    
    // Check cluster state
    try {
      const clusterInfo = execSync(`docker exec microservices-santosh-redis-node-0-1 redis-cli -a redis_password CLUSTER INFO`).toString();
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
        if (pingErr.message.includes('CLUSTERDOWN')) {
          console.log('Redis Cluster is not initialized. Initializing...');
          
          // Use Docker exec to initialize the cluster (most reliable method)
          const initialized = initializeClusterViaDocker();
          
          if (!initialized) {
            throw new Error('Failed to initialize Redis Cluster');
          }
          
          // Wait for cluster to stabilize
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          console.warn('Redis ping error:', pingErr.message);
        }
      }
      
      // Add some sample data if Redis is empty
      try {
        // Try to get all keys, but allow failures
        const keysCount = await redisClient.keys('*')
          .then(keys => keys.length)
          .catch((err) => {
            console.error('Error getting keys:', err.message);
            return 0;
          });
        
        // Try to add sample data, but allow failures
        try {
          if (keysCount === 0) {
            console.log('Adding sample data to Redis Cluster...');
            await redisClient.set('redis_key_1', 'This is sample data 1 in Redis Cluster');
            await redisClient.set('redis_key_2', 'This is sample data 2 in Redis Cluster');
            console.log('Sample data added to Redis Cluster');
          } else {
            console.log(`Redis Cluster already has ${keysCount} keys`);
          }
        } catch (setErr) {
          console.warn('Could not add sample data:', setErr.message);
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