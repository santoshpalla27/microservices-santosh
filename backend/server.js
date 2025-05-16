const express = require('express');
const cors = require('cors');
const { initializeDb } = require('./config/postgres');
const { initializeRedis } = require('./config/redis');
const dataRoutes = require('./routes/data');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/data', dataRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

// Initialize databases before starting the server
const startServer = async () => {
  try {
    // Initialize PostgreSQL
    await initializeDb();
    
    // Initialize Redis
    await initializeRedis();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();