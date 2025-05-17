const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./src/routes/routes');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/', routes);

app.get('/', (req, res) => {
  res.json({ message: 'API Gateway is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});