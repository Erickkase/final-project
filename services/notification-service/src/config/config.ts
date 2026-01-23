import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  wsPort: parseInt(process.env.WS_PORT || '3015', 10),
  // Email config (future implementation)
  emailService: process.env.EMAIL_SERVICE || 'sendgrid',
  emailApiKey: process.env.EMAIL_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'noreply@emotracker.com',
  // Push notification config (future)
  pushServiceUrl: process.env.PUSH_SERVICE_URL || '',
};
