import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import reportRoutes from './routes/report.routes';
import healthRoutes from './routes/health.routes';

const app = express();

// Middleware de seguridad
app.use(helmet());

// CORS - Permitir todas las IPs (como los otros servicios)
app.use(cors({
  origin: '*',
  credentials: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Demasiadas solicitudes desde esta IP, intente de nuevo más tarde.',
});
app.use(limiter);

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/health', healthRoutes);
app.use('/reports', reportRoutes);

// Manejo de rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Manejo de errores
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined
  });
});

export default app;
