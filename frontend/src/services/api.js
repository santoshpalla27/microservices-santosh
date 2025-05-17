import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Data API service
const api = {
  // PostgreSQL operations
  saveToPostgres: async (key, value) => {
    try {
      const response = await axios.post(`${API_URL}/data/postgres`, { key, value });
      return response.data;
    } catch (error) {
      console.error('Error saving to PostgreSQL:', error);
      throw error;
    }
  },
  
  getAllFromPostgres: async () => {
    try {
      const response = await axios.get(`${API_URL}/data/postgres`);
      return response.data;
    } catch (error) {
      console.error('Error fetching PostgreSQL data:', error);
      throw error;
    }
  },
  
  // Redis operations
  saveToRedis: async (key, value) => {
    try {
      const response = await axios.post(`${API_URL}/data/redis`, { key, value });
      return response.data;
    } catch (error) {
      console.error('Error saving to Redis:', error);
      throw error;
    }
  },
  
  getAllFromRedis: async () => {
    try {
      const response = await axios.get(`${API_URL}/data/redis`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Redis data:', error);
      throw error;
    }
  }
};

export default api;