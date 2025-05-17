const db = require('../config/db.config');
const { getRedisClient } = require('../config/redis.config');

// User model
const User = {
  // Create a user in MySQL database
  createInMySQL: async (user) => {
    try {
      const [result] = await db.execute(
        'INSERT INTO users (name, email, phone) VALUES (?, ?, ?)',
        [user.name, user.email, user.phone]
      );
      
      const id = result.insertId;
      return { id, ...user };
    } catch (err) {
      console.error('Error creating user in MySQL:', err);
      throw err;
    }
  },
  
  // Create a user in Redis
  createInRedis: async (user) => {
    try {
      const client = await getRedisClient();
      if (!client) {
        throw new Error("Redis client not available");
      }
      
      // Generate a unique ID for Redis
      const id = `user:${Date.now()}`;
      
      // Prepare fields for Redis hash - use array format for hmset
      const fields = [
        'id', id,
        'name', user.name,
        'email', user.email,
        'phone', user.phone || '',
        'created_at', new Date().toISOString()
      ];
      
      console.log(`Creating user in Redis with ID: ${id}`);
      
      // Store user as hash in Redis
      await client.hmset(id, ...fields);
      
      // Add to users set for listing
      await client.sadd('users', id);
      
      console.log(`Successfully created user in Redis: ${id}`);
      
      return {
        id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        created_at: new Date().toISOString()
      };
    } catch (err) {
      console.error("Error creating user in Redis:", err);
      throw err;
    }
  },
  
  // Find all users from MySQL
  findAllFromMySQL: async () => {
    try {
      const [rows] = await db.execute('SELECT * FROM users');
      return rows;
    } catch (err) {
      console.error('Error fetching all users from MySQL:', err);
      return [];
    }
  },
  
  // Find all users from Redis
  findAllFromRedis: async () => {
    try {
      const client = await getRedisClient();
      if (!client) {
        console.error("Redis client not available");
        return [];
      }
      
      // Get all user IDs from the set
      let userIds;
      try {
        userIds = await client.smembers('users');
        console.log(`Found ${userIds.length} user IDs in Redis set`);
      } catch (err) {
        console.error("Error getting members from Redis:", err);
        return [];
      }
      
      // Get all user data
      const users = [];
      for (const id of userIds) {
        try {
          const userData = await client.hgetall(id);
          if (userData && Object.keys(userData).length > 0) {
            users.push(userData);
          }
        } catch (err) {
          console.error(`Error getting user data for ${id}:`, err);
        }
      }
      
      return users;
    } catch (err) {
      console.error("Error in findAllFromRedis:", err);
      return [];
    }
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