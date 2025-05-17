const { createClient } = require('redis');

// Create Redis client with configuration for a single server
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
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
        await redisClient.connect();
      }
      
      // Add some sample data if Redis is empty
      const keysCount = await redisClient.keys('*').then(keys => keys.length).catch(() => 0);
      
      if (keysCount === 0) {
        await redisClient.set('redis_key_1', 'This is sample data 1 in Redis');
        await redisClient.set('redis_key_2', 'This is sample data 2 in Redis');
        console.log('Sample data added to Redis');
      }
      
      console.log('Redis client initialized successfully');
      return true;
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