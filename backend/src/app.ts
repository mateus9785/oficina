import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import apiRoutes from './routes/index';
import { errorHandler, notFound } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Security & parsing
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Health check
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // API
  app.use('/api/v1', apiRoutes);

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
