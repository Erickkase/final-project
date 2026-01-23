import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import analyticsRoutes from './routes/analytics.routes';
import healthRoutes from './routes/health.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/health', healthRoutes);
app.use('/analytics', analyticsRoutes);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error('Error:', err.message);
  res.status(500).json({
    error: config.nodeEnv === 'development' ? err.message : 'Internal server error',
  });
});

export default app;
