import axios from 'axios';

// Set base URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API service functions
const api = {
  // Create a new user
  createUser: async (userData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },
  
  // Get all users from MySQL
  getMySQLUsers: async () => {
    const response = await apiClient.get('/users/mysql');
    return response.data;
  },
  
  // Get all users from Redis
  getRedisUsers: async () => {
    const response = await apiClient.get('/users/redis');
    return response.data;
  },
  
  // Get a single user from MySQL by ID
  getMySQLUser: async (id) => {
    const response = await apiClient.get(`/users/mysql/${id}`);
    return response.data;
  },
  
  // Get a single user from Redis by ID
  getRedisUser: async (id) => {
    const response = await apiClient.get(`/users/redis/${id}`);
    return response.data;
  },
  
  // Delete a user from MySQL
  deleteMySQLUser: async (id) => {
    const response = await apiClient.delete(`/users/mysql/${id}`);
    return response.data;
  },
  
  // Delete a user from Redis
  deleteRedisUser: async (id) => {
    const response = await apiClient.delete(`/users/redis/${id}`);
    return response.data;
  }
};

export default api;