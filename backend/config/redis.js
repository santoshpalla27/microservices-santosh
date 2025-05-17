const { createCluster } = require('redis');

// Parse Redis cluster nodes from environment variable
const getClusterNodes = () => {
  const nodesString = process.env.REDIS_CLUSTER_NODES || 'redis-node-0:6379,redis-node-1:6379,redis-node-2:6379';
  return nodesString.split(',').map(nodeStr => ({
    url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@${nodeStr}`
  }));
};

// Create Redis Cluster client
const redisClient = createCluster({
  rootNodes: getClusterNodes(),
  defaults: {
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
  }
});

// Event handlers
redisClient.on('error', (err) => {
  console.error('Redis Cluster Client Error:', err);
});

redisClient.on('reconnecting', () => {
  console.log('Redis Cluster client attempting to reconnect...');
});

redisClient.on('connect', () => {
  console.log('Redis Cluster client connected successfully');
});

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
      
      // Check if cluster is ready
      try {
        const clusterInfo = await redisClient.cluster('INFO');
        console.log('Redis Cluster info:', clusterInfo);
      } catch (clusterError) {
        console.warn('Failed to get cluster info. Cluster may still be initializing:', clusterError.message);
      }
      
      // Add some sample data if Redis is empty
      try {
        const keysCount = await redisClient.keys('*').then(keys => keys.length).catch(() => 0);
        
        if (keysCount === 0) {
          await redisClient.set('redis_key_1', 'This is sample data 1 in Redis Cluster');
          await redisClient.set('redis_key_2', 'This is sample data 2 in Redis Cluster');
          console.log('Sample data added to Redis Cluster');
        }
        
        console.log('Redis Cluster client initialized successfully');
        return true;
      } catch (dataError) {
        console.warn('Could not add sample data:', dataError.message);
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