const { createClient } = require('redis');

// Define all Redis nodes in the cluster
const REDIS_NODES = [
  'redis-node-0:6379',
  'redis-node-1:6379', 
  'redis-node-2:6379',
  'redis-node-3:6379',
  'redis-node-4:6379',
  'redis-node-5:6379'
];

// Try multiple nodes until finding one that responds
const tryNodes = async () => {
  for (const node of REDIS_NODES) {
    const client = createClient({
      url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@${node}`,
      socket: {
        connectTimeout: 3000,
        reconnectStrategy: false
      }
    });
    
    try {
      await client.connect();
      await client.ping();
      console.log(`Node ${node} is responsive`);
      await client.quit();
      return node;
    } catch (err) {
      console.warn(`Node ${node} is not responsive:`, err.message);
      try {
        await client.quit();
      } catch (e) { /* ignore */ }
    }
  }
  
  // If no nodes responded, return the first one as default
  return REDIS_NODES[0];
};

let activeRedisNode = REDIS_NODES[0]; // Default to first node
(async () => {
  try {
    activeRedisNode = await tryNodes();
    console.log(`Using Redis node: ${activeRedisNode}`);
  } catch (err) {
    console.error('Error finding responsive Redis node:', err.message);
  }
})();

// Create a Redis client that will work with Redis Cluster
const redisClient = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@${activeRedisNode}`,
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

// In-memory fallback for when Redis is completely unavailable
const inMemoryStore = new Map();

// Wrapper functions to handle Redis Cluster errors with retry
const redisOps = {
  async get(key) {
    try {
      return await redisClient.get(key);
    } catch (err) {
      // If MOVED error, follow the redirection
      if (err.message.includes('MOVED') || err.message.includes('ASK')) {
        try {
          // Parse redirection info (example: "MOVED 3999 127.0.0.1:6381")
          const parts = err.message.split(' ');
          if (parts.length >= 3) {
            const redirectNode = parts[2];
            console.log(`Key ${key} is in node ${redirectNode}, following redirection...`);
            
            // Create a new client for the redirect target
            const redirectClient = createClient({
              url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@${redirectNode}`,
              socket: { connectTimeout: 3000 }
            });
            
            try {
              await redirectClient.connect();
              const result = await redirectClient.get(key);
              await redirectClient.quit();
              return result;
            } catch (redirectErr) {
              console.error(`Error following redirection to ${redirectNode}:`, redirectErr.message);
              await redirectClient.quit();
              throw redirectErr;
            }
          }
        } catch (parseErr) {
          console.error('Error parsing redirection info:', parseErr.message);
        }
      }
      
      // Handle CLUSTERDOWN error
      if (err.message.includes('CLUSTERDOWN')) {
        console.warn(`Redis Cluster is down, using in-memory fallback for key ${key}`);
      } else {
        console.warn(`Redis get error for key ${key}, using in-memory fallback:`, err.message);
      }
      
      return inMemoryStore.get(key);
    }
  },
  
  async set(key, value) {
    try {
      await redisClient.set(key, value);
    } catch (err) {
      // If MOVED error, follow the redirection
      if (err.message.includes('MOVED') || err.message.includes('ASK')) {
        try {
          // Parse redirection info (example: "MOVED 3999 127.0.0.1:6381")
          const parts = err.message.split(' ');
          if (parts.length >= 3) {
            const redirectNode = parts[2];
            console.log(`Key ${key} is in node ${redirectNode}, following redirection...`);
            
            // Create a new client for the redirect target
            const redirectClient = createClient({
              url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@${redirectNode}`,
              socket: { connectTimeout: 3000 }
            });
            
            try {
              await redirectClient.connect();
              await redirectClient.set(key, value);
              await redirectClient.quit();
              return;
            } catch (redirectErr) {
              console.error(`Error following redirection to ${redirectNode}:`, redirectErr.message);
              await redirectClient.quit();
              throw redirectErr;
            }
          }
        } catch (parseErr) {
          console.error('Error parsing redirection info:', parseErr.message);
        }
      }
      
      // Handle CLUSTERDOWN error
      if (err.message.includes('CLUSTERDOWN')) {
        console.warn(`Redis Cluster is down, using in-memory fallback for key ${key}`);
      } else {
        console.warn(`Redis set error for key ${key}, using in-memory fallback:`, err.message);
      }
      
      inMemoryStore.set(key, value);
    }
  },
  
  async keys(pattern) {
    const results = new Set();
    
    try {
      // Try to get keys from the first node
      const keys = await redisClient.keys(pattern);
      keys.forEach(key => results.add(key));
    } catch (err) {
      console.warn(`Error getting keys from Redis Cluster:`, err.message);
      
      // If cluster is down, use in-memory fallback
      if (err.message.includes('CLUSTERDOWN')) {
        console.warn('Redis Cluster is down, using in-memory fallback for keys query');
        // Simple glob pattern matching for in-memory
        const allKeys = Array.from(inMemoryStore.keys());
        if (pattern === '*') return allKeys;
        return allKeys.filter(key => key.includes(pattern.replace('*', '')));
      }
      
      // Try each node individually
      for (const node of REDIS_NODES) {
        try {
          const nodeClient = createClient({
            url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@${node}`,
            socket: { connectTimeout: 3000 }
          });
          
          await nodeClient.connect();
          const nodeKeys = await nodeClient.keys(pattern);
          nodeKeys.forEach(key => results.add(key));
          await nodeClient.quit();
        } catch (nodeErr) {
          console.warn(`Error getting keys from node ${node}:`, nodeErr.message);
        }
      }
    }
    
    // If no keys were found in Redis, use in-memory fallback
    if (results.size === 0) {
      const allKeys = Array.from(inMemoryStore.keys());
      if (pattern === '*') return allKeys;
      return allKeys.filter(key => key.includes(pattern.replace('*', '')));
    }
    
    return Array.from(results);
  },
  
  async del(key) {
    try {
      await redisClient.del(key);
    } catch (err) {
      // If MOVED error, follow the redirection
      if (err.message.includes('MOVED') || err.message.includes('ASK')) {
        try {
          // Parse redirection info
          const parts = err.message.split(' ');
          if (parts.length >= 3) {
            const redirectNode = parts[2];
            
            // Create a new client for the redirect target
            const redirectClient = createClient({
              url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@${redirectNode}`,
              socket: { connectTimeout: 3000 }
            });
            
            try {
              await redirectClient.connect();
              await redirectClient.del(key);
              await redirectClient.quit();
              return;
            } catch (redirectErr) {
              console.error(`Error following redirection to ${redirectNode}:`, redirectErr.message);
              await redirectClient.quit();
            }
          }
        } catch (parseErr) {
          console.error('Error parsing redirection info:', parseErr.message);
        }
      }
      
      console.warn(`Redis del error for key ${key}, using in-memory fallback:`, err.message);
      inMemoryStore.delete(key);
    }
  }
};

// Initialize Redis with retry logic and sample data
const initializeRedis = async (maxRetries = 5, delay = 5000) => {
  let retries = 0;
  let redisAvailable = false;
  
  while (retries < maxRetries) {
    try {
      if (!redisClient.isOpen) {
        console.log('Attempting to connect to Redis Cluster...');
        await redisClient.connect();
        console.log('Connected to Redis Cluster successfully');
      }
      
      // Check if Redis is responsive
      try {
        await redisClient.ping();
        console.log('Redis Cluster is responding to PING');
        redisAvailable = true;
      } catch (pingErr) {
        console.warn('Redis ping error:', pingErr.message);
        redisAvailable = false;
        
        // Try another node if this one fails
        if (pingErr.message.includes('CLUSTERDOWN') || pingErr.message.includes('MOVED')) {
          const newNode = await tryNodes();
          console.log(`Switching to Redis node: ${newNode}`);
          
          // Close the current client
          try {
            await redisClient.quit();
          } catch (e) { /* ignore */ }
          
          // Create a new client with the responsive node
          redisClient = createClient({
            url: `redis://:${process.env.REDIS_PASSWORD || 'redis_password'}@${newNode}`,
            socket: {
              reconnectStrategy: (retries) => {
                if (retries > 5) return new Error('Max retries reached');
                return Math.min(Math.pow(2, retries) * 100, 5000);
              }
            }
          });
          
          // Re-add event handlers
          redisClient.on('error', err => console.error('Redis Client Error:', err));
          redisClient.on('reconnecting', () => console.log('Redis client attempting to reconnect...'));
          redisClient.on('connect', () => console.log('Redis client connected successfully'));
          
          // Try to connect again
          await redisClient.connect();
        }
      }
      
      // Add sample data, using fallback if needed
      try {
        console.log('Adding sample data to Redis Cluster...');
        await redisOps.set('redis_key_1', 'This is sample data 1 in Redis Cluster');
        await redisOps.set('redis_key_2', 'This is sample data 2 in Redis Cluster');
        console.log('Sample data added to Redis Cluster');
      } catch (err) {
        console.warn('Error adding sample data:', err.message);
      }
      
      if (redisAvailable) {
        console.log('Redis Cluster client initialized successfully');
      } else {
        console.log('Using in-memory fallback for Redis operations');
      }
      
      return true;
    } catch (error) {
      retries++;
      console.error(`Redis Cluster initialization attempt ${retries} failed:`, error.message);
      
      if (retries >= maxRetries) {
        console.error('Max retries reached. Using in-memory fallback only.');
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
  redisOps,
  initializeRedis
};