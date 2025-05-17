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

// Create a mock Redis client for fallback
const createMockRedisClient = () => {
  console.log('Creating mock Redis client for fallback');
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
    ping: async () => "PONG",
    quit: async () => {},
    disconnect: async () => {}
  };
};

// Try to connect to Redis Cluster with retries
const tryConnectRedisCluster = async (nodes, password, attempt = 1, maxAttempts = 3) => {
  if (attempt > maxAttempts) {
    console.log(`Failed to connect to Redis Cluster after ${maxAttempts} attempts`);
    return null;
  }
  
  try {
    console.log(`Attempting to connect to Redis Cluster (attempt ${attempt}/${maxAttempts})...`);
    
    // Create client with the appropriate configuration for a cluster
    const client = new Redis.Cluster(
      nodes.map(node => ({
        host: node.host,
        port: node.port
      })),
      {
        redisOptions: {
          password: password,
          connectTimeout: 10000  // 10 seconds
        },
        clusterRetryStrategy: (times) => {
          console.log(`Cluster connection retry ${times}`);
          return Math.min(100 + Math.exp(times), 10000);
        },
        maxRedirections: 16,
        retryDelayOnFailover: 2000,
        scaleReads: 'all'
      }
    );
    
    // Set up event handlers
    client.on('error', (err) => {
      console.error(`Redis Cluster client error: ${err.message}`);
    });
    
    client.on('connect', () => {
      console.log('Connected to Redis Cluster');
    });
    
    // Try to ping to verify connection
    await client.ping('node0');
    console.log('Redis Cluster ping successful');
    return client;
  } catch (err) {
    console.error(`Error connecting to Redis Cluster (attempt ${attempt}/${maxAttempts}):`, err.message);
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, 5000));
    return tryConnectRedisCluster(nodes, password, attempt + 1, maxAttempts);
  }
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
    
    // Test connection
    const pingResult = await client.ping();
    console.log(`Redis ping result: ${pingResult}`);
    
    return client;
  } catch (err) {
    console.error('Failed to create standalone Redis client:', err.message);
    return null;
  }
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
      
      console.log(`Attempting to connect to Redis using nodes: ${JSON.stringify(nodes)}`);
      
      // First, try to connect to the Redis Cluster
      const clusterClient = await tryConnectRedisCluster(nodes, password);
      if (clusterClient) {
        console.log('Successfully connected to Redis Cluster');
        redisClient = clusterClient;
        clientInitialization = null;
        return redisClient;
      }
      
      // If cluster connection failed, try individual node
      console.log('Cluster connection failed, trying standalone connection...');
      const standaloneClient = await createStandaloneClient(nodes, password);
      if (standaloneClient) {
        console.log('Successfully connected to Redis in standalone mode');
        redisClient = standaloneClient;
        clientInitialization = null;
        return redisClient;
      }
      
      // If all attempts failed, use mock client
      console.log('All Redis connection attempts failed, using mock client');
      redisClient = createMockRedisClient();
      clientInitialization = null;
      return redisClient;
      
    } catch (err) {
      console.error('Error initializing Redis client:', err);
      clientInitialization = null;
      
      // Return mock client on error
      console.log('Using mock Redis client due to initialization error');
      return createMockRedisClient();
    }
  })();
  
  return clientInitialization;
};

module.exports = {
  getRedisClient
};