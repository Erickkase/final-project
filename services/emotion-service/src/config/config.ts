import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3003', 10),
  serviceName: process.env.SERVICE_NAME || 'emotion-service',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'emotrack_emotions',
    ssl: process.env.DB_SSL === 'true',
  },

  // Security
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Emotions
  allowedEmotions: (process.env.ALLOWED_EMOTIONS || 'alegria,tristeza,miedo,ira,disguto').split(','),

  // Timeouts
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),

  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;
