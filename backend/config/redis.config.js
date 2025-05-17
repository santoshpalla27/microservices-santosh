const Redis = require('ioredis');

// Parse Redis nodes from environment variable
const parseRedisNodes = () => {
  const nodesStr = process.env.REDIS_NODES || 'redis-node-0:6379';
  return nodesStr.split(',').map(nodeStr => {
    const [host, port] = nodeStr.split(':');
    return { host, port: parseInt(port || 6379) };
  });
};

// Function to test if a Redis node is available
const testRedisNode = async (host, port, password, attempt = 1, maxAttempts = 5) => {
  console.log(`Testing Redis node ${host}:${port} (attempt ${attempt}/${maxAttempts})...`);
  
  const client = new Redis({
    host,
    port,
    password,
    connectTimeout: 5000,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null  // Don't retry automatically
  });
  
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      client.disconnect();
      if (attempt < maxAttempts) {
        console.log(`Timeout connecting to ${host}:${port}, retrying...`);
        resolve(testRedisNode(host, port, password, attempt + 1, maxAttempts));
      } else {
        console.log(`Failed to connect to ${host}:${port} after ${maxAttempts} attempts`);
        resolve(false);
      }
    }, 5000);
    
    client.ping().then(() => {
      clearTimeout(timeoutId);
      client.disconnect();
      console.log(`Successfully connected to Redis node ${host}:${port}`);
      resolve(true);
    }).catch(err => {
      clearTimeout(timeoutId);
      client.disconnect();
      console.error(`Error connecting to Redis node ${host}:${port}:`, err.message);
      if (attempt < maxAttempts) {
        console.log(`Retrying connection to ${host}:${port}...`);
        setTimeout(() => {
          resolve(testRedisNode(host, port, password, attempt + 1, maxAttempts));
        }, 3000);
      } else {
        console.log(`Failed to connect to ${host}:${port} after ${maxAttempts} attempts`);
        resolve(false);
      }
    });
  });
};

// Create a standalone Redis client (not cluster)
const createStandaloneClient = async (nodes, password) => {
  try {
    console.log(`Creating standalone Redis client to node ${nodes[0].host}:${nodes[0].port}`);
    
    const client = new Redis({
      host: nodes[0].host,
      port: nodes[0].port,
      password: password,
      connectTimeout: 10000,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        console.log(`Retrying Redis connection, attempt #${times}`);
        return Math.min(Math.pow(2, times) * 500, 10000);
      }
    });
    
    client.on('error', (err) => {
      console.error('Redis client error:', err.message);
    });
    
    client.on('connect', () => {
      console.log(`Connected to Redis at ${nodes[0].host}:${nodes[0].port}`);
    });
    
    client.on('ready', () => {
      console.log('Redis client is ready');
    });
    
    return client;
  } catch (err) {
    console.error('Failed to create standalone Redis client:', err.message);
    return null;
  }
};

// Wait before returning the Redis client
const waitBeforeReturnClient = (client) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(client);
    }, 1000);
  });
};

// Initialize Redis client
let redisClient = null;
let clientInitialization = null;

// Get Redis client (with initialization if needed)
const getRedisClient = async () => {
  if (redisClient) {
    return redisClient;
  }
  
  if (clientInitialization) {
    return clientInitialization;
  }
  
  clientInitialization = (async () => {
    try {
      const nodes = parseRedisNodes();
      const password = process.env.REDIS_PASSWORD || 'password';
      
      // Test if the primary Redis node is available
      const isRedisAvailable = await testRedisNode(nodes[0].host, nodes[0].port, password);
      
      if (!isRedisAvailable) {
        console.error(`Primary Redis node ${nodes[0].host}:${nodes[0].port} is not available`);
        // Return a mock Redis client for graceful fallback
        return {
          // Read operations
          hgetall: async () => ({}),
          smembers: async () => ([]),
          get: async () => null,
          
          // Write operations
          hmset: async () => "OK",
          hset: async () => 1,
          sadd: async () => 1,
          srem: async () => 1,
          del: async () => 1,
          set: async () => "OK",
          
          // Others
          on: () => {},
          quit: async () => {},
          disconnect: async () => {}
        };
      }
      
      // Create a standalone Redis client
      const client = await createStandaloneClient(nodes, password);
      
      // Wait a bit before returning the client
      redisClient = await waitBeforeReturnClient(client);
      clientInitialization = null;
      
      return redisClient;
    } catch (err) {
      console.error('Error initializing Redis client:', err);
      clientInitialization = null;
      throw err;
    }
  })();
  
  return clientInitialization;
};

module.exports = {
  getRedisClient
};