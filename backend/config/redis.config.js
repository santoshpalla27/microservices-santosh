const IORedis = require('ioredis');

// Parse Redis nodes from environment variable
const parseRedisNodes = () => {
  const nodesStr = process.env.REDIS_NODES || 'redis-node-0:6379';
  return nodesStr.split(',').map(nodeStr => {
    const [host, port] = nodeStr.split(':');
    return { host, port: parseInt(port || 6379) };
  });
};

// Function to wait until Redis is ready
const waitForRedisCluster = async (nodes, password, maxAttempts = 60) => {
  let attempts = 0;
  const singleNodeClient = new IORedis({
    host: nodes[0].host,
    port: nodes[0].port,
    password: password,
    connectionName: 'health-check-client',
    lazyConnect: true,
    connectTimeout: 3000,
    maxRetriesPerRequest: 1
  });
  
  while (attempts < maxAttempts) {
    try {
      await singleNodeClient.connect();
      const result = await singleNodeClient.ping();
      if (result === 'PONG') {
        console.log(`Redis node ${nodes[0].host}:${nodes[0].port} is now available after ${attempts} attempts`);
        await singleNodeClient.disconnect();
        return true;
      }
    } catch (err) {
      console.log(`Waiting for Redis to be ready (attempt ${attempts + 1}/${maxAttempts})...`);
    } finally {
      try {
        if (singleNodeClient.status === 'ready') {
          await singleNodeClient.disconnect();
        }
      } catch (err) { /* ignore disconnect errors */ }
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between attempts
  }
  
  console.error(`Redis still not ready after ${maxAttempts} attempts`);
  return false;
};

// Create Redis Cluster client
const createRedisClient = async () => {
  try {
    const nodes = parseRedisNodes();
    const password = process.env.REDIS_PASSWORD || 'password';
    
    console.log(`Setting up Redis Cluster with nodes: ${JSON.stringify(nodes)}`);
    
    // Wait for Redis cluster to be ready
    console.log('Waiting for Redis cluster to be available...');
    const isReady = await waitForRedisCluster(nodes, password);
    if (!isReady) {
      console.error('Redis cluster is not available after maximum retries');
      return null;
    }
    
    console.log('Redis cluster is available, creating cluster client...');
    
    // Add delay to ensure all nodes are properly connected to each other in the cluster
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Create a Redis Cluster client using ioredis
    const clusterOptions = {
      redisOptions: {
        password: password
      },
      clusterRetryStrategy: (times) => {
        console.log(`Retrying cluster connection, attempt #${times}`);
        return Math.min(100 + Math.exp(times), 20000);
      },
      maxRedirections: 16,
      retryDelayOnFailover: 2000,
      retryDelayOnTryAgain: 3000,
      enableReadyCheck: true,
      scaleReads: 'slave',
      natMap: {},
      readOnly: false
    };
    
    // Try to create a cluster client first
    try {
      const client = new IORedis.Cluster(
        nodes.map(node => ({
          host: node.host,
          port: node.port
        })),
        clusterOptions
      );
      
      // Set up event handlers
      client.on('error', (err) => {
        console.error('Redis Cluster client error:', err);
      });
      
      client.on('connect', () => {
        console.log('Connected to Redis Cluster');
      });
      
      client.on('ready', () => {
        console.log('Redis Cluster client ready');
      });
      
      client.on('reconnecting', () => {
        console.log('Reconnecting to Redis Cluster');
      });
      
      client.on('end', () => {
        console.log('Redis Cluster connection ended');
      });
      
      console.log('Created Redis Cluster client successfully');
      return client;
    } catch (err) {
      console.error('Failed to create Redis Cluster client, falling back to single node:', err.message);
      
      // Fallback to single node if cluster creation fails
      const singleClient = new IORedis({
        host: nodes[0].host,
        port: nodes[0].port,
        password: password,
        retryStrategy: (times) => Math.min(100 + Math.exp(times), 20000)
      });
      
      singleClient.on('error', (err) => {
        console.error('Redis client error:', err);
      });
      
      singleClient.on('connect', () => {
        console.log('Connected to Redis (single node)');
      });
      
      console.log('Created single node Redis client as fallback');
      return singleClient;
    }
  } catch (err) {
    console.error('Failed to create Redis client:', err);
    return null;
  }
};

// Singleton pattern for Redis client
let redisClient = null;
let initializationPromise = null;

const getRedisClient = async () => {
  if (!redisClient && !initializationPromise) {
    // Store the initialization promise so we don't try to create multiple clients in parallel
    initializationPromise = createRedisClient().then(client => {
      redisClient = client;
      return client;
    }).catch(err => {
      console.error('Error initializing Redis client:', err);
      initializationPromise = null;
      return null;
    });
  }
  
  if (initializationPromise) {
    return initializationPromise;
  }
  
  return redisClient;
};

module.exports = {
  getRedisClient
};
