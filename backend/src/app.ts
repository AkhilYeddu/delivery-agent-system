import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env';
import agentRoutes from './routes/agent.routes';
import telemetryRoutes from './routes/telemetry.routes';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';

export const createApp = (): express.Application => {
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
