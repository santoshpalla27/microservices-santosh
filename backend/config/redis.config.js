const Redis = require('redis');

// Parse Redis nodes from environment variable
const parseRedisNodes = () => {
  const nodesStr = process.env.REDIS_NODES || 'redis-node-0:6379';
  return nodesStr.split(',').map(nodeStr => {
    const [host, port] = nodeStr.split(':');
    return { host, port: parseInt(port || 6379) };
  });
};

// Create a simple Redis client (not cluster mode)
const createSimpleClient = async () => {
  try {
    const nodes = parseRedisNodes();
    const password = process.env.REDIS_PASSWORD || 'password';
    
    console.log(`Creating simple Redis client to ${nodes[0].host}:${nodes[0].port}`);
    
    const client = Redis.createClient({
      socket: {
        host: nodes[0].host,
        port: nodes[0].port
      },
      password: password,
      retry_strategy: (options) => {
        if (options.attempt > 10) {
          // Stop retrying after 10 attempts
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });
    
    // Set up event handlers
    client.on('error', (err) => {
      console.error('Redis client error:', err.message);
    });
    
    client.on('connect', () => {
      console.log(`Connected to Redis at ${nodes[0].host}:${nodes[0].port}`);
    });
    
    client.on('ready', () => {
      console.log('Redis client is ready');
    });
    
    // Connect to Redis
    await client.connect();
    
    // Initialize with some sample data
    try {
      // Check if we need to initialize
      const existingUsers = await client.sMembers('users');
      if (!existingUsers || existingUsers.length === 0) {
        console.log('No users found in Redis, creating sample data...');
        
        // Create sample users
        const userIds = [];
        for (let i = 1; i <= 3; i++) {
          const id = `user:${1000 + i}`;
          userIds.push(id);
          
          await client.hSet(id, {
            id: id,
            name: `Example User ${i}`,
            email: `user${i}@example.com`,
            phone: `555-000-${1000 + i}`,
            created_at: new Date().toISOString()
          });
        }
        
        // Add to users set
        if (userIds.length > 0) {
          await client.sAdd('users', userIds);
          console.log(`Added ${userIds.length} sample users to Redis`);
        }
      } else {
        console.log(`Found ${existingUsers.length} existing users in Redis`);
      }
    } catch (initErr) {
      console.error('Error initializing Redis with sample data:', initErr.message);
      // Continue even if initialization fails
    }
    
    return client;
  } catch (err) {
    console.error('Failed to create Redis client:', err.message);
    return createMockRedisClient();
  }
};

// Create a mock Redis client for fallback
const createMockRedisClient = () => {
  console.log('Creating mock Redis client for fallback');
  
  // In-memory storage for the mock client
  const hashStorage = {};
  const setStorage = {};
  let mockData = {
    'users': [] // empty set for users
  };
  
  return {
    // Read operations
    hGetAll: async (key) => {
      console.log(`[MOCK] hGetAll for key: ${key}`);
      return hashStorage[key] || {};
    },
    sMembers: async (key) => {
      console.log(`[MOCK] sMembers for key: ${key}`);
      return setStorage[key] || [];
    },
    get: async (key) => {
      console.log(`[MOCK] get for key: ${key}`);
      return mockData[key] || null;
    },
    
    // Write operations
    hSet: async (key, ...args) => {
      console.log(`[MOCK] hSet for key: ${key}, args:`, args);
      if (!hashStorage[key]) hashStorage[key] = {};
      
      // Process arguments
      for (let i = 0; i < args.length; i += 2) {
        if (i + 1 < args.length) {
          hashStorage[key][args[i]] = args[i + 1];
        }
      }
      return "OK";
    },
    sAdd: async (key, member) => {
      console.log(`[MOCK] sAdd ${member} to key: ${key}`);
      if (!setStorage[key]) setStorage[key] = [];
      if (!setStorage[key].includes(member)) {
        setStorage[key].push(member);
        return 1;
      }
      return 0;
    },
    sRem: async (key, member) => {
      console.log(`[MOCK] sRem ${member} from key: ${key}`);
      if (!setStorage[key]) return 0;
      
      const initialLength = setStorage[key].length;
      setStorage[key] = setStorage[key].filter(item => item !== member);
      return initialLength - setStorage[key].length;
    },
    del: async (key) => {
      console.log(`[MOCK] del key: ${key}`);
      if (hashStorage[key]) {
        delete hashStorage[key];
        return 1;
      }
      if (setStorage[key]) {
        delete setStorage[key];
        return 1;
      }
      return 0;
    },
    
    // Utility
    ping: async () => {
      console.log('[MOCK] ping');
      return "PONG";
    },
    on: (event, callback) => {
      // No-op
    },
    quit: async () => {
      console.log('[MOCK] quit');
    },
    disconnect: async () => {
      console.log('[MOCK] disconnect');
    }
  };
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
      // Try to create a simple client first (no cluster mode)
      const client = await createSimpleClient();
      
      if (client) {
        redisClient = client;
        clientInitialization = null;
        
        // Test client with a simple operation
        try {
          const pingResult = await client.ping();
          console.log('Redis ping result:', pingResult);
        } catch (pingErr) {
          console.error('Redis ping failed:', pingErr.message);
          // Return mock client if ping fails
          redisClient = createMockRedisClient();
        }
        
        return redisClient;
      } else {
        console.error('Failed to create Redis client');
        redisClient = createMockRedisClient();
        clientInitialization = null;
        return redisClient;
      }
    } catch (err) {
      console.error('Error initializing Redis client:', err);
      clientInitialization = null;
      
      // Return mock client on error
      console.log('Using mock Redis client due to initialization error');
      redisClient = createMockRedisClient();
      return redisClient;
    }
  })();
  
  return clientInitialization;
};

module.exports = {
  getRedisClient
};

module.exports = {
  getRedisClient
};