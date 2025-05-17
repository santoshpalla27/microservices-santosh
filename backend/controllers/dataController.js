const DataModel = require('../models/dataModel');
const { redisClient } = require('../config/redis');

const DataController = {
  // Save data to PostgreSQL
  saveToPostgres: async (req, res) => {
    try {
      const { key, value } = req.body;
      
      if (!key || !value) {
        return res.status(400).json({ error: 'Key and value are required' });
      }
      
      const data = await DataModel.saveToPostgres(key, value);
      res.status(201).json(data);
    } catch (error) {
      console.error('Error saving to PostgreSQL:', error);
      
      // Check if the error is related to database connection
      if (error.code === 'ECONNREFUSED' || error.code === '57P01' || error.code === '3D000') {
        return res.status(503).json({ 
          error: 'Database service unavailable. Please try again later.',
          details: error.message
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  },

  // Save data to Redis
  saveToRedis: async (req, res) => {
    try {
      const { key, value } = req.body;
      
      if (!key || !value) {
        return res.status(400).json({ error: 'Key and value are required' });
      }
      
      // Check if Redis is connected
      if (!redisClient.isOpen) {
        try {
          await redisClient.connect();
        } catch (connError) {
          return res.status(503).json({ 
            error: 'Redis Cluster service unavailable. Please try again later.',
            details: connError.message
          });
        }
      }
      
      // Try to set the key-value in Redis with retry
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          await redisClient.set(key, value);
          
          // Include timestamp for consistency with PostgreSQL data format
          const timestamp = new Date().toISOString();
          
          res.status(201).json({ 
            key, 
            value, 
            created_at: timestamp 
          });
          
          return; // Success - exit the function
        } catch (setError) {
          retries++;
          
          // If this is a CLUSTERDOWN error, wait before retrying
          if (setError.message.includes('CLUSTERDOWN')) {
            console.warn(`Redis Cluster down, retry ${retries}/${maxRetries}...`);
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            // For other errors, don't retry
            throw setError;
          }
        }
      }
      
      // If we got here, all retries failed
      throw new Error('Redis Cluster is not available after multiple retries');
      
    } catch (error) {
      console.error('Error saving to Redis Cluster:', error);
      res.status(503).json({ 
        error: 'Unable to save to Redis Cluster. The cluster may still be initializing.',
        details: error.message
      });
    }
  },

  // Get all data from PostgreSQL
  getAllFromPostgres: async (req, res) => {
    try {
      const data = await DataModel.getAllFromPostgres();
      res.json(data);
    } catch (error) {
      console.error('Error getting data from PostgreSQL:', error);
      
      // Check if the error is related to database connection
      if (error.code === 'ECONNREFUSED' || error.code === '57P01' || error.code === '3D000') {
        return res.status(503).json({ 
          error: 'Database service unavailable. Please try again later.',
          details: error.message
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  },

  // Get all data from Redis
  getAllFromRedis: async (req, res) => {
    try {
      // Check if Redis is connected
      if (!redisClient.isOpen) {
        try {
          await redisClient.connect();
        } catch (connError) {
          return res.status(503).json({ 
            error: 'Redis Cluster service unavailable. Please try again later.',
            details: connError.message
          });
        }
      }
      
      // Try to get all keys with retry logic
      let retries = 0;
      const maxRetries = 3;
      let keys = [];
      
      while (retries < maxRetries) {
        try {
          keys = await redisClient.keys('*');
          break; // Success - exit the loop
        } catch (keysError) {
          retries++;
          
          // If this is a CLUSTERDOWN error, wait before retrying
          if (keysError.message.includes('CLUSTERDOWN')) {
            console.warn(`Redis Cluster down, retry ${retries}/${maxRetries}...`);
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            // For other errors, don't retry
            throw keysError;
          }
        }
      }
      
      // If we reach maxRetries without success
      if (retries >= maxRetries) {
        return res.status(503).json({
          error: 'Redis Cluster is not available after multiple retries',
          details: 'The cluster may still be initializing'
        });
      }
      
      // Process the keys
      const data = [];
      
      for (const key of keys) {
        try {
          const value = await redisClient.get(key);
          data.push({
            key,
            value,
            // Redis doesn't store timestamps by default, so we don't have created_at
            // This is for UI consistency
            created_at: null
          });
        } catch (getError) {
          console.warn(`Could not get value for key ${key}:`, getError.message);
          // Continue with other keys
        }
      }
      
      res.json(data);
    } catch (error) {
      console.error('Error getting data from Redis Cluster:', error);
      res.status(503).json({ 
        error: 'Unable to retrieve data from Redis Cluster. The cluster may still be initializing.',
        details: error.message
      });
    }
  }
};

module.exports = DataController;