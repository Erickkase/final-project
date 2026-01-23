import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3010,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  nodeEnv: process.env.NODE_ENV || 'development',
  emotionServiceUrl: process.env.EMOTION_SERVICE_URL || 'http://localhost:3002',
  analyticsServiceUrl: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3007',
  goalServiceUrl: process.env.GOAL_SERVICE_URL || 'http://localhost:3008',
  journalServiceUrl: process.env.JOURNAL_SERVICE_URL || 'http://localhost:3009',
};
