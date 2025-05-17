const { createClient } = require('redis');

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

// Helper function to create and initialize the Redis Cluster if needed
const initializeCluster = async () => {
  try {
    // Get a direct connection to one of the nodes for admin operations
    const adminClient = createClient({
      url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@${process.env.REDIS_HOST || 'redis-node-0'}:${process.env.REDIS_PORT || '6379'}`,
      socket: { connectTimeout: 10000 }
    });
    
    await adminClient.connect();
    
    // Check cluster state
    const clusterInfo = await adminClient.sendCommand(['CLUSTER', 'INFO']);
    if (clusterInfo.includes('cluster_state:ok')) {
      console.log('Redis Cluster is already initialized and working properly');
      await adminClient.quit();
      return true;
    }
    
    console.log('Redis Cluster needs initialization...');
    
    // Get all node addresses
    const nodes = [
      'redis-node-0:6379', 
      'redis-node-1:6379', 
      'redis-node-2:6379',
      'redis-node-3:6379', 
      'redis-node-4:6379', 
      'redis-node-5:6379'
    ];
    
    // Reset all nodes (necessary for clean initialization)
    for (const node of nodes) {
      const [host, port] = node.split(':');
      const nodeClient = createClient({
        url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@${host}:${port}`,
        socket: { connectTimeout: 5000 }
      });
      
      try {
        await nodeClient.connect();
        await nodeClient.sendCommand(['CLUSTER', 'RESET']);
        await nodeClient.quit();
        console.log(`Reset node ${host}`);
      } catch (err) {
        console.warn(`Could not reset node ${host}:`, err.message);
        // Continue with other nodes
      }
    }
    
    // Wait a moment for all nodes to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create the cluster
    console.log('Creating Redis Cluster...');
    
    // Get IP addresses for each node
    const nodeAddresses = [];
    for (const node of nodes) {
      const [host, port] = node.split(':');
      // Assuming that the host name resolves to the correct IP
      // In a Docker environment, the service names (like redis-node-0) should resolve correctly
      nodeAddresses.push(`${host}:${port}`);
    }
    
    const createClusterCmd = [
      'CLUSTER', 'CREATE', 
      ...nodeAddresses, 
      'REPLICAS', '1'
    ];
    
    // We need to send 'yes' to confirm
    try {
      // Issue the create command
      const createResult = await adminClient.sendCommand(createClusterCmd);
      console.log('Cluster creation result:', createResult);
    } catch (err) {
      // If there's an error here, it might be because it's asking for confirmation
      // We'll try to send 'yes' via a separate command
      console.warn('Error during cluster creation, trying alternate method:', err.message);
      
      try {
        // Try a different node
        await adminClient.quit();
        const alternateClient = createClient({
          url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@redis-node-1:6379`,
          socket: { connectTimeout: 10000 }
        });
        await alternateClient.connect();
        
        // Use cluster meet to connect nodes instead
        for (let i = 0; i < nodes.length; i++) {
          for (let j = 0; j < nodes.length; j++) {
            if (i !== j) {
              try {
                const [host, port] = nodes[j].split(':');
                await alternateClient.sendCommand(['CLUSTER', 'MEET', host, port]);
                console.log(`Connected node ${nodes[i]} to ${nodes[j]}`);
              } catch (meetErr) {
                console.warn(`Error connecting nodes: ${meetErr.message}`);
              }
            }
          }
        }
        
        await alternateClient.quit();
      } catch (altErr) {
        console.error('Alternate method failed:', altErr.message);
        return false;
      }
    }
    
    // Wait for cluster to stabilize
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verify cluster state
    try {
      const verifyClient = createClient({
        url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@redis-node-0:6379`,
        socket: { connectTimeout: 10000 }
      });
      await verifyClient.connect();
      const finalClusterInfo = await verifyClient.sendCommand(['CLUSTER', 'INFO']);
      await verifyClient.quit();
      
      if (finalClusterInfo.includes('cluster_state:ok')) {
        console.log('Redis Cluster is now initialized and working properly');
        return true;
      } else {
        console.error('Cluster creation completed but cluster state is not OK');
        return false;
      }
    } catch (verifyErr) {
      console.error('Error verifying cluster state:', verifyErr.message);
      return false;
    }
  } catch (err) {
    console.error('Error initializing Redis Cluster:', err.message);
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
      
      // Try to check cluster state and initialize if needed
      try {
        const clusterInfo = await redisClient.sendCommand(['CLUSTER', 'INFO']).catch(() => '');
        
        if (!clusterInfo || !clusterInfo.includes('cluster_state:ok')) {
          console.log('Redis Cluster is not properly initialized. Initializing...');
          await initializeCluster();
        }
      } catch (clusterErr) {
        console.warn('Could not check cluster state:', clusterErr.message);
        // Don't exit, try to continue with other operations
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