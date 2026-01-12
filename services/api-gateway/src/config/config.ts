import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Servidor
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  serviceName: process.env.SERVICE_NAME || 'api-gateway',

  // Microservicios
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    emotion: process.env.EMOTION_SERVICE_URL || 'http://localhost:3003',
    report: process.env.REPORT_SERVICE_URL || 'http://localhost:3004',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
    motivation: process.env.MOTIVATION_SERVICE_URL || 'http://localhost:3006',
    aiAnalysis: process.env.AI_ANALYSIS_SERVICE_URL || 'http://localhost:3007',
    audit: process.env.AUDIT_SERVICE_URL || 'http://localhost:3008',
    backup: process.env.BACKUP_SERVICE_URL || 'http://localhost:3009',
    integration: process.env.INTEGRATION_SERVICE_URL || 'http://localhost:3010',
  },

  // Seguridad
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Observabilidad
  prometheus: {
    port: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
    enabled: process.env.PROMETHEUS_ENABLED === 'true',
  },

  // Timeouts
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
  serviceTimeout: parseInt(process.env.SERVICE_TIMEOUT || '15000', 10),

  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;
