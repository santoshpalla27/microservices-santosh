const db = require('../config/db.config');
const { getRedisClient } = require('../config/redis.config');

// User model
const User = {
  // Create a user in MySQL database
  createInMySQL: async (user) => {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
      [user.name, user.email, user.phone]
    );
    
    const id = result.insertId;
    return { id, ...user };
  },
  
  // Create a user in Redis
  createInRedis: async (user) => {
    const client = await getRedisClient();
    
    // Generate a unique ID for Redis
    const id = `user:${Date.now()}`;
    const userData = {
      id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      created_at: new Date().toISOString()
    };
    
    // Store user as hash in Redis
    await client.hSet(id, userData);
    
    // Add to users set for listing
    await client.sAdd('users', id);
    
    return userData;
  },
  
  // Find all users from MySQL
  findAllFromMySQL: async () => {
    const [rows] = await db.execute('SELECT * FROM users');
    return rows;
  },
  
  // Find all users from Redis
  findAllFromRedis: async () => {
    const client = await getRedisClient();
    
    // Get all user IDs from the set
    const userIds = await client.sMembers('users');
    
    // Get all user data
    const users = [];
    for (const id of userIds) {
      const userData = await client.hGetAll(id);
      if (Object.keys(userData).length > 0) {
        users.push(userData);
      }
    }
    
    return users;
  },
  
  // Find a user by id from MySQL
  findByIdFromMySQL: async (id) => {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },
  
  // Find a user by id from Redis
  findByIdFromRedis: async (id) => {
    const client = await getRedisClient();
    const userData = await client.hGetAll(`user:${id}`);
    return Object.keys(userData).length > 0 ? userData : null;
  },
  
  // Delete a user from MySQL
  deleteFromMySQL: async (id) => {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
  
  // Delete a user from Redis
  deleteFromRedis: async (id) => {
    const client = await getRedisClient();
    const redisId = `user:${id}`;
    
    // Remove from users set
    await client.sRem('users', redisId);
    
    // Delete the hash
    const deleted = await client.del(redisId);
    return deleted > 0;
  }
};

module.exports = User;