const { createCluster } = require('redis');

// Parse Redis nodes from environment variable
const parseRedisNodes = () => {
  const nodesStr = process.env.REDIS_NODES || 'redis-node-0:6379,redis-node-1:6379';
  return nodesStr.split(',').map(nodeStr => {
    const [host, port] = nodeStr.split(':');
    return { host, port: parseInt(port) };
  });
};

// Create Redis Cluster client
const createRedisClient = async () => {
  try {
    const nodes = parseRedisNodes();
    const password = process.env.REDIS_PASSWORD || 'password';
    
    const client = createCluster({
      rootNodes: nodes.map(node => ({
        url: `redis://${node.host}:${node.port}`,
        password
      })),
      defaults: {
        socket: {
          reconnectStrategy: (retries) => {
            // Reconnect after retries * 100ms
            return Math.min(retries * 100, 3000);
          },
        }
      }
    });

    await client.connect();
    console.log('Redis cluster connection established successfully');
    
    client.on('error', (err) => {
      console.error('Redis cluster error:', err);
    });
    
    return client;
  } catch (err) {
    console.error('Failed to create Redis cluster client:', err);
    return null;
  }
};

// Singleton pattern for Redis client
let redisClient = null;

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = await createRedisClient();
  }
  return redisClient;
};

module.exports = {
  getRedisClient
};