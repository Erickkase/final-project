import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import config from './config/config';

const app = express();

// Extended request interface
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
      userId?: string; // From JWT token
    }
  }
}

// Security middlewares

// Helmet - Protects against known HTTP vulnerabilities
app.use(helmet());

// CORS - Cross-origin resource sharing (enabled for AWS)
app.use(
  cors({
    origin: '*', // Allow all IPs for AWS deployment
    credentials: false, // Disabled because origin is '*'
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
);

// Rate limiting - Limit requests per IP
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middlewares

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middlewares

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Custom middlewares

// Request ID - Assigns unique ID to each request
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  req.startTime = Date.now();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.requestId);

  next();
});

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.requestId} ${req.method} ${req.url}`);
  next();
});

// Extract userId from header (simulated)
app.use((req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  if (userId) {
    req.userId = userId;
  }
  next();
});

// Routes

// Health check - Simple route to verify service is up
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('ok');
});

// API v1
const apiV1 = express.Router();

// Load emotion routes
const emotionRoutes = require('./routes/emotion.routes').default || require('./routes/emotion.routes');
apiV1.use('/emotions', emotionRoutes);

// Mount v1 routes
app.use('/api/v1', apiV1);

// Error handling

// Route not found
app.use((req: Request, res: Response) => {
  res.status(404).json({
    statusCode: 404,
    message: 'Route not found',
    path: req.url,
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

// Global error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const duration = Date.now() - req.startTime;

  console.error(`[${new Date().toISOString()}] Error in ${req.requestId}:`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

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
