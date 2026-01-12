import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import config from './config/config';

// Importar rutas
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import emotionRoutes from './routes/emotion.routes';
import reportRoutes from './routes/report.routes';

const app = express();

// Interfaces para request extendido
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

// ========== MIDDLEWARES DE SEGURIDAD ==========

// Helmet - Protege contra vulnerabilidades HTTP conocidas
app.use(helmet());

// CORS - Control de acceso entre dominios
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
);

// Rate Limiting - Limita solicitudes por IP
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// ========== MIDDLEWARES DE PARSEO ==========

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ========== MIDDLEWARES DE LOGGING ==========

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// ========== MIDDLEWARES PERSONALIZADOS ==========

// Request ID - Asigna un ID único a cada solicitud
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  req.startTime = Date.now();
  
  // Agregar request ID a los headers de respuesta
  res.setHeader('X-Request-ID', req.requestId);
  
  next();
});

// Logger de solicitud
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.requestId} ${req.method} ${req.url}`);
  next();
});

// ========== RUTAS ==========

// Health Check
app.use('/health', healthRoutes);

// API v1
const apiV1 = express.Router();

// Rutas de microservicios
apiV1.use('/auth', authRoutes);
apiV1.use('/emotions', emotionRoutes);
apiV1.use('/reports', reportRoutes);

// Montar rutas v1
app.use('/api/v1', apiV1);

// ========== MANEJO DE ERRORES ==========

// Ruta no encontrada
app.use((req: Request, res: Response) => {
  res.status(404).json({
    statusCode: 404,
    message: 'Ruta no encontrada',
    path: req.url,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

// Middleware de errores global
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const duration = Date.now() - req.startTime;
  
  console.error(`[${new Date().toISOString()}] Error en ${req.requestId}:`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    statusCode,
    message,
    path: req.url,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    duration: `${duration}ms`,
    ...(config.isDevelopment && { stack: err.stack }),
  });
});

export default app;
