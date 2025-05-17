import axios from 'axios';

// Set base URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://184.73.142.47:5000/api';

// Create an axios instance with increased timeout
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: false
});

// Add a response interceptor for consistent error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.log('API Error:', error.message);
    
    // Add custom error details if available
    if (error.response?.data) {
      error.details = error.response.data;
    }
    
    return Promise.reject(error);
  }
);

// API service functions
const api = {
  // Create a new user
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error.message);
      throw error;
    }
  },
  
  // Get all users from MySQL
  getMySQLUsers: async () => {
    try {
      const response = await apiClient.get('/users/mysql');
      return response.data;
    } catch (error) {
      console.error('Get MySQL users error:', error.message);
      throw error;
    }
  },
  
  // Get all users from Redis
  getRedisUsers: async () => {
    try {
      const response = await apiClient.get('/users/redis');
      return response.data;
    } catch (error) {
      console.error('Get Redis users error:', error.message);
      throw error;
    }
  },
  
  // Get a single user from MySQL by ID
  getMySQLUser: async (id) => {
    try {
      const response = await apiClient.get(`/users/mysql/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get MySQL user ${id} error:`, error.message);
      throw error;
    }
  },
  
  // Get a single user from Redis by ID
  getRedisUser: async (id) => {
    try {
      const response = await apiClient.get(`/users/redis/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get Redis user ${id} error:`, error.message);
      throw error;
    }
  },
  
  // Delete a user from MySQL
  deleteMySQLUser: async (id) => {
    try {
      const response = await apiClient.delete(`/users/mysql/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete MySQL user ${id} error:`, error.message);
      throw error;
    }
  },
  
  // Delete a user from Redis
  deleteRedisUser: async (id) => {
    try {
      const response = await apiClient.delete(`/users/redis/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete Redis user ${id} error:`, error.message);
      throw error;
    }
  }
};

export default api;