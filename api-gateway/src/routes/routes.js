const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Service URLs from environment variables
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4000';
const TASK_SERVICE_URL = process.env.TASK_SERVICE_URL || 'http://localhost:5000';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8080';
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:9000';

// Route for authentication service (no auth required)
router.use('/auth', createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/auth'
  }
}));

// DEVELOPMENT MODE: Bypass authentication for demo purposes
// In a production app, you would use the commented-out version with authentication
// router.use('/tasks', verifyToken, createProxyMiddleware({...

// Route for task service (auth bypassed for demo)
router.use('/tasks', createProxyMiddleware({
  target: TASK_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/tasks': '/tasks'
  }
}));

// Route for notification service (auth bypassed for demo)
router.use('/notifications', createProxyMiddleware({
  target: NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/notifications': '/notifications'
  }
}));

// Route for analytics service (auth bypassed for demo)
router.use('/analytics', createProxyMiddleware({
  target: ANALYTICS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/analytics': '/analytics'
  }
}));

module.exports = router;