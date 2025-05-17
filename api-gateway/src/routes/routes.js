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

// Route for task service (auth required)
router.use('/tasks', verifyToken, createProxyMiddleware({
  target: TASK_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/tasks': '/tasks'
  },
  onProxyReq: (proxyReq, req) => {
    // Add user ID to query parameters
    const url = new URL(proxyReq.path, `http://${proxyReq.getHeader('host')}`);
    url.searchParams.set('userId', req.userId);
    proxyReq.path = `${url.pathname}${url.search}`;
  }
}));

// Route for notification service (auth required)
router.use('/notifications', verifyToken, createProxyMiddleware({
  target: NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/notifications': '/notifications'
  },
  onProxyReq: (proxyReq, req) => {
    // Add user ID to query parameters if not present
    if (!req.query.userId) {
      const url = new URL(proxyReq.path, `http://${proxyReq.getHeader('host')}`);
      url.searchParams.set('userId', req.userId);
      proxyReq.path = `${url.pathname}${url.search}`;
    }
  }
}));

// Route for analytics service (auth required)
router.use('/analytics', verifyToken, createProxyMiddleware({
  target: ANALYTICS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/analytics': '/analytics'
  }
}));

module.exports = router;