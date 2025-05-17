const User = require('../models/user.model');

// User controller
exports.create = async (req, res) => {
  try {
    const { name, email, phone, storage } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    let result;
    
    // Store in appropriate storage based on request
    if (storage === 'redis') {
      result = await User.createInRedis({ name, email, phone });
    } else {
      result = await User.createInMySQL({ name, email, phone });
    }
    
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'An error occurred while creating the user', error: err.message });
  }
};

// Get all users from MySQL
exports.findAllMySQL = async (req, res) => {
  try {
    const users = await User.findAllFromMySQL();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error retrieving MySQL users:', err);
    res.status(500).json({ message: 'An error occurred while retrieving MySQL users', error: err.message });
  }
};

// Get all users from Redis
exports.findAllRedis = async (req, res) => {
  try {
    const users = await User.findAllFromRedis();
    res.status(200).json(users);
  } catch (err) {
    console.error('Error retrieving Redis users:', err);
    res.status(500).json({ message: 'An error occurred while retrieving Redis users', error: err.message });
  }
};

// Get a user by id from MySQL
exports.findOneMySQL = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdFromMySQL(id);
    
    if (!user) {
      return res.status(404).json({ message: `User with id ${id} not found in MySQL` });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error('Error retrieving MySQL user:', err);
    res.status(500).json({ message: 'An error occurred while retrieving the MySQL user', error: err.message });
  }
};

// Get a user by id from Redis
exports.findOneRedis = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdFromRedis(id);
    
    if (!user) {
      return res.status(404).json({ message: `User with id ${id} not found in Redis` });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error('Error retrieving Redis user:', err);
    res.status(500).json({ message: 'An error occurred while retrieving the Redis user', error: err.message });
  }
};

// Delete a user from MySQL
exports.deleteMySQL = async (req, res) => {
  try {
    const id = req.params.id;
    const success = await User.deleteFromMySQL(id);
    
    if (!success) {
      return res.status(404).json({ message: `User with id ${id} not found in MySQL or could not be deleted` });
    }
    
    res.status(200).json({ message: `User with id ${id} was deleted successfully from MySQL` });
  } catch (err) {
    console.error('Error deleting MySQL user:', err);
    res.status(500).json({ message: 'An error occurred while deleting the MySQL user', error: err.message });
  }
};

// Delete a user from Redis
exports.deleteRedis = async (req, res) => {
  try {
    const id = req.params.id;
    const success = await User.deleteFromRedis(id);
    
    if (!success) {
      return res.status(404).json({ message: `User with id ${id} not found in Redis or could not be deleted` });
    }
    
    res.status(200).json({ message: `User with id ${id} was deleted successfully from Redis` });
  } catch (err) {
    console.error('Error deleting Redis user:', err);
    res.status(500).json({ message: 'An error occurred while deleting the Redis user', error: err.message });
  }
};