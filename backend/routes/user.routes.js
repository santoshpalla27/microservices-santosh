module.exports = app => {
  const users = require('../controllers/user.controller');
  const router = require('express').Router();
  
  // Create a new user (with storage choice)
  router.post('/', users.create);
  
  // Retrieve all users from MySQL
  router.get('/mysql', users.findAllMySQL);
  
  // Retrieve all users from Redis
  router.get('/redis', users.findAllRedis);
  
  // Retrieve a single user from MySQL with id
  router.get('/mysql/:id', users.findOneMySQL);
  
  // Retrieve a single user from Redis with id
  router.get('/redis/:id', users.findOneRedis);
  
  // Delete a user from MySQL with id
  router.delete('/mysql/:id', users.deleteMySQL);
  
  // Delete a user from Redis with id
  router.delete('/redis/:id', users.deleteRedis);
  
  // Use the router for /api/users endpoint
  app.use('/api/users', router);
};