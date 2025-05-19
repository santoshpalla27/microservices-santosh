const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS to accept requests from any origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database connections
const initializeApp = async () => {
  try {
    // Database connection setup
    const db = require('./config/db.config');
    
    // Load Redis configuration - will connect and initialize when first used
    const redis = require('./config/redis.config');
    
    // Simple route for testing
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to User Record Application' });
    });
    
    // Health check endpoint
    app.get('/health', async (req, res) => {
      const health = { 
        status: 'UP',
        timestamp: new Date(),
        services: {
          mysql: 'UP',
          redis: 'UNKNOWN'
        }
      };
      
      // Check Redis connection
      try {
        const redisClient = await redis.getRedisClient();
        if (redisClient) {
          const pingResult = await redisClient.ping();
          health.services.redis = pingResult === 'PONG' ? 'UP' : 'DOWN';
        } else {
          health.services.redis = 'DOWN';
        }
      } catch (err) {
        health.services.redis = 'DOWN';
        health.redisError = err.message;
      }
      
      res.json(health);
    });
    
    // Routes
    require('./routes/user.routes')(app);
    
    // Set port and start server with error handling
    const PORT = process.env.PORT || 5000;
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Start server with proper error handling
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Exiting.`);
        process.exit(1);
      } else {
        console.error('Server error:', error);
      }
    });
    
    // Test Redis connection in background (non-blocking)
    console.log('Initializing Redis connection in background...');
    redis.getRedisClient().then(client => {
      if (client) {
        console.log('Redis client ready');
      } else {
        console.warn('Redis client not available, will use mock client');
      }
    }).catch(err => {
      console.error('Initial Redis connection failed, will retry on demand:', err.message);
    });
  } catch (err) {
    console.error('Failed to initialize application:', err);
    // Don't exit process, continue running even if some components fail
    console.log('Server will continue running with limited functionality');
  }
};

// Start the application with proper initialization
initializeApp();

// Start the application with proper initialization
initializeApp();


// Start the application with proper initialization
initializeApp();
