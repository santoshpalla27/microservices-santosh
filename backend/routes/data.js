const express = require('express');
const router = express.Router();
const DataController = require('../controllers/dataController');

// PostgreSQL routes
router.post('/postgres', DataController.saveToPostgres);
router.get('/postgres', DataController.getAllFromPostgres);

// Redis routes
router.post('/redis', DataController.saveToRedis);
router.get('/redis', DataController.getAllFromRedis);

module.exports = router;