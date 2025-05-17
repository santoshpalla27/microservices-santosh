const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Auth Service is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});