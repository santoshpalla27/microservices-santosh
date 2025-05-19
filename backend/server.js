const express = require('express');
const mysql = require('mysql2/promise');
const redis = require('redis');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// MySQL Connection Pool
const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'mysql',
  user: process.env.MYSQL_USER || 'user',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'userdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Redis Cluster Client
const redisNodes = (process.env.REDIS_NODES || 'redis-node-0:6379,redis-node-1:6379,redis-node-2:6379,redis-node-3:6379,redis-node-4:6379,redis-node-5:6379')
  .split(',')
  .map(node => {
    const [host, port] = node.split(':');
    return { url: `redis://${host}:${port}` };
  });

const redisClient = redis.createCluster({
  rootNodes: redisNodes,
  defaults: {
    password: process.env.REDIS_PASSWORD || 'bitnami123'
  }
});

// Initialize Redis connection
(async () => {
  await redisClient.connect();
  console.log('Connected to Redis Cluster!');
})().catch(err => {
  console.error('Redis connection error:', err);
});

// Test database connections on startup
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Connect to Redis first
  try {
    await redisClient.connect();
    console.log('Connected to Redis Cluster!');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
  
  // Then connect to MySQL with retries
  let mysqlConnected = false;
  let retries = 10;
  
  while (!mysqlConnected && retries > 0) {
    try {
      const connection = await mysqlPool.getConnection();
      console.log('Connected to MySQL database!');
      connection.release();
      mysqlConnected = true;
      
      // Add routes after successful connection
      setupRoutes();
    } catch (err) {
      console.error(`Error connecting to MySQL (${retries} retries left):`, err);
      retries -= 1;
      // Wait 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  if (!mysqlConnected) {
    console.error('Failed to connect to MySQL after multiple attempts');
    // Still set up routes so Redis operations can work
    setupRoutes();
  }
});

// Define all routes
function setupRoutes() {
  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', mysql: 'connected', redis: redisClient.isOpen ? 'connected' : 'disconnected' });
  });

  // Get all users from MySQL
  app.get('/api/mysql/users', async (req, res) => {
    try {
      const [rows] = await mysqlPool.query('SELECT * FROM users');
      res.json(rows);
    } catch (err) {
      console.error('Error fetching users from MySQL:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Get a user from MySQL by ID
  app.get('/api/mysql/users/:id', async (req, res) => {
    try {
      const [rows] = await mysqlPool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error('Error fetching user from MySQL:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Create a user in MySQL
  app.post('/api/mysql/users', async (req, res) => {
    const { name, email, phone, address } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    try {
      const [result] = await mysqlPool.query(
        'INSERT INTO users (name, email, phone, address) VALUES (?, ?, ?, ?)',
        [name, email, phone, address]
      );
      
      res.status(201).json({
        id: result.insertId,
        name,
        email,
        phone,
        address
      });
    } catch (err) {
      console.error('Error creating user in MySQL:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Update a user in MySQL
  app.put('/api/mysql/users/:id', async (req, res) => {
    const { name, email, phone, address } = req.body;
    const userId = req.params.id;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    try {
      const [result] = await mysqlPool.query(
        'UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
        [name, email, phone, address, userId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        id: userId,
        name,
        email,
        phone,
        address
      });
    } catch (err) {
      console.error('Error updating user in MySQL:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Delete a user from MySQL
  app.delete('/api/mysql/users/:id', async (req, res) => {
    try {
      const [result] = await mysqlPool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error('Error deleting user from MySQL:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Redis Routes
  
  // Get all users from Redis
  app.get('/api/redis/users', async (req, res) => {
    try {
      // Get all user keys
      const keys = await redisClient.keys('user:*');
      
      if (keys.length === 0) {
        return res.json([]);
      }
      
      // Get user data for each key
      const users = [];
      for (const key of keys) {
        const userData = await redisClient.hGetAll(key);
        if (Object.keys(userData).length > 0) {
          users.push({
            id: key.split(':')[1],
            ...userData
          });
        }
      }
      
      res.json(users);
    } catch (err) {
      console.error('Error fetching users from Redis:', err);
      res.status(500).json({ error: 'Redis error' });
    }
  });

  // Get a user from Redis by ID
  app.get('/api/redis/users/:id', async (req, res) => {
    try {
      const userData = await redisClient.hGetAll(`user:${req.params.id}`);
      
      if (Object.keys(userData).length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        id: req.params.id,
        ...userData
      });
    } catch (err) {
      console.error('Error fetching user from Redis:', err);
      res.status(500).json({ error: 'Redis error' });
    }
  });

  // Create a user in Redis
  app.post('/api/redis/users', async (req, res) => {
    const { name, email, phone, address } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    try {
      // Check if email exists
      const keys = await redisClient.keys('user:*');
      
      for (const key of keys) {
        const userData = await redisClient.hGetAll(key);
        if (userData.email === email) {
          return res.status(409).json({ error: 'Email already exists' });
        }
      }
      
      // Generate a unique ID
      const id = Date.now().toString();
      const userData = {
        name,
        email,
        phone: phone || '',
        address: address || '',
        created_at: new Date().toISOString()
      };
      
      await redisClient.hSet(`user:${id}`, userData);
      
      res.status(201).json({
        id,
        ...userData
      });
    } catch (err) {
      console.error('Error creating user in Redis:', err);
      res.status(500).json({ error: 'Redis error' });
    }
  });

  // Update a user in Redis
  app.put('/api/redis/users/:id', async (req, res) => {
    const { name, email, phone, address } = req.body;
    const userId = req.params.id;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    try {
      // Check if user exists
      const exists = await redisClient.exists(`user:${userId}`);
      
      if (!exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if email is already used by another user
      const keys = await redisClient.keys('user:*');
      
      for (const key of keys) {
        if (key !== `user:${userId}`) {
          const userData = await redisClient.hGetAll(key);
          if (userData.email === email) {
            return res.status(409).json({ error: 'Email already exists' });
          }
        }
      }
      
      const userData = {
        name,
        email,
        phone: phone || '',
        address: address || ''
      };
      
      await redisClient.hSet(`user:${userId}`, userData);
      
      res.json({
        id: userId,
        ...userData
      });
    } catch (err) {
      console.error('Error updating user in Redis:', err);
      res.status(500).json({ error: 'Redis error' });
    }
  });

  // Delete a user from Redis
  app.delete('/api/redis/users/:id', async (req, res) => {
    try {
      const exists = await redisClient.exists(`user:${req.params.id}`);
      
      if (!exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      await redisClient.del(`user:${req.params.id}`);
      
      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error('Error deleting user from Redis:', err);
      res.status(500).json({ error: 'Redis error' });
    }
  });

  // Copy user data from MySQL to Redis
  app.post('/api/mysql-to-redis', async (req, res) => {
    try {
      // Get all users from MySQL
      const [rows] = await mysqlPool.query('SELECT * FROM users');
      
      // Store each user in Redis
      for (const user of rows) {
        const userData = {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          created_at: user.created_at.toISOString()
        };
        
        await redisClient.hSet(`user:${user.id}`, userData);
      }
      
      res.json({ message: `Copied ${rows.length} users from MySQL to Redis` });
    } catch (err) {
      console.error('Error copying users from MySQL to Redis:', err);
      res.status(500).json({ error: 'Operation failed' });
    }
  });

  // Copy user data from Redis to MySQL
  app.post('/api/redis-to-mysql', async (req, res) => {
    try {
      // Get all users from Redis
      const keys = await redisClient.keys('user:*');
      let copiedCount = 0;
      
      for (const key of keys) {
        const userData = await redisClient.hGetAll(key);
        
        if (Object.keys(userData).length > 0) {
          try {
            await mysqlPool.query(
              'INSERT INTO users (name, email, phone, address) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, phone=?, address=?',
              [userData.name, userData.email, userData.phone, userData.address, userData.name, userData.phone, userData.address]
            );
            copiedCount++;
          } catch (err) {
            console.error(`Error inserting user ${key} to MySQL:`, err);
            // Continue with the next user
          }
        }
      }
      
      res.json({ message: `Copied ${copiedCount} users from Redis to MySQL` });
    } catch (err) {
      console.error('Error copying users from Redis to MySQL:', err);
      res.status(500).json({ error: 'Operation failed' });
    }
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  
  try {
    await redisClient.quit();
    console.log('Redis client disconnected');
    
    await mysqlPool.end();
    console.log('MySQL pool closed');
    
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});