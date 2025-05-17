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