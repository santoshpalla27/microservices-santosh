const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database connections
const initializeApp = async () => {
  try {
    // Database connection setup
    const db = require('./config/db.config');
    // Load Redis module but don't wait for connection
    const redis = require('./config/redis.config');
    
    // Simple route for testing
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to User Record Application' });
    });
    
    // Routes
    require('./routes/user.routes')(app);
    
    // Set port and start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
    
    // Preload Redis connection to be ready when first API call comes in
    console.log('Initializing Redis connection in background...');
    redis.getRedisClient().catch(err => {
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