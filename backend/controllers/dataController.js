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
      
      await redisClient.set(key, value);
      
      // Include timestamp for consistency with PostgreSQL data format
      const timestamp = new Date().toISOString();
      
      res.status(201).json({ 
        key, 
        value, 
        created_at: timestamp 
      });
    } catch (error) {
      console.error('Error saving to Redis:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all data from PostgreSQL
  getAllFromPostgres: async (req, res) => {
    try {
      const data = await DataModel.getAllFromPostgres();
      res.json(data);
    } catch (error) {
      console.error('Error getting data from PostgreSQL:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all data from Redis
  getAllFromRedis: async (req, res) => {
    try {
      const keys = await redisClient.keys('*');
      const data = [];
      
      for (const key of keys) {
        const value = await redisClient.get(key);
        data.push({
          key,
          value,
          // Redis doesn't store timestamps by default, so we don't have created_at
          // This is for UI consistency
          created_at: null
        });
      }
      
      res.json(data);
    } catch (error) {
      console.error('Error getting data from Redis:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = DataController;