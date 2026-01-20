import app from './app';
import config from './config/config';

const server = app.listen(config.port, () => {
  console.log(`
========================================================
     Emotion Service - EmoTrack Platform
========================================================

Server started at: http://localhost:${config.port}
Environment: ${config.nodeEnv}
Service: ${config.serviceName}
CORS enabled for: ${config.corsOrigin.join(', ')}

Available routes:
  /health - Health check
  /api/v1/emotions - Emotions CRUD
  /api/v1/emotions/user/:userId - User emotions
  /api/v1/emotions/stats/:userId - Statistics
  /api/v1/emotions/range/:userId - Date range query

Configuration:
  - Allowed emotions: ${config.allowedEmotions.join(', ')}
  - Rate Limit: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs}ms
  - Database: ${config.database.host}:${config.database.port}/${config.database.name}

Press Ctrl+C to stop the server
  `);
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

export default server;
