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

// Database connection setup
const db = require('./config/db.config');
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