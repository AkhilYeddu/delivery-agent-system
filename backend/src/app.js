const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { config } = require('./config/env');
const agentRoutes = require('./routes/agent.routes');
const telemetryRoutes = require('./routes/telemetry.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const createApp = () => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: '*', // Allow development requests and local frontends
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['X-Cache', 'X-Response-Time-Ms'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // API Routes
  app.use('/api/agents', agentRoutes);
  app.use('/api', telemetryRoutes);

  // Root welcome route
  app.get('/', (_req, res) => {
    res.json({
      name: 'Delivery Agent Management System API',
      version: '1.0.0',
      status: 'active',
      endpoints: {
        agents: '/api/agents',
        stats: '/api/agents/stats',
        health: '/api/health',
        cache: '/api/cache/stats',
      },
    });
  });

  // Catch-all 404
  app.use(notFoundHandler);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

module.exports = {
  createApp,
};

