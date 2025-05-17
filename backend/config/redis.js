const { createClient } = require('redis');

// Parse Redis cluster nodes from environment variable
const getRedisUrl = () => {
  const nodesString = process.env.REDIS_CLUSTER_NODES || 'redis-node-0:6379';
  // Just use the first node for connection, Redis client will handle redirection
  const firstNode = nodesString.split(',')[0];
  return `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@${firstNode}`;
};

// Create Redis client
const redisClient = createClient({
  url: getRedisUrl(),
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

// Initialize Redis with retry logic and sample data
const initializeRedis = async (maxRetries = 5, delay = 5000) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      if (!redisClient.isOpen) {
        console.log('Attempting to connect to Redis...');
        await redisClient.connect();
        console.log('Connected to Redis successfully');
      }
      
      // Add some sample data if Redis is empty
      try {
        const keysCount = await redisClient.keys('*').then(keys => keys.length).catch(() => 0);
        
        if (keysCount === 0) {
          await redisClient.set('redis_key_1', 'This is sample data 1 in Redis Cluster');
          await redisClient.set('redis_key_2', 'This is sample data 2 in Redis Cluster');
          console.log('Sample data added to Redis');
        }
        
        console.log('Redis client initialized successfully');
        return true;
      } catch (dataError) {
        console.warn('Could not add sample data:', dataError.message);
        // Continue anyway as this is not critical
        return true;
      }
    } catch (error) {
      retries++;
      console.error(`Redis initialization attempt ${retries} failed:`, error.message);
      
      if (retries >= maxRetries) {
        console.error('Max retries reached. Unable to initialize Redis');
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