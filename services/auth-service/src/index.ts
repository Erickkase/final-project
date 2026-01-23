import app from './app';
import config from './config/config';

const server = app.listen(config.port, () => {
  console.log(`
========================================================
      Auth Service - EmoTrack Platform
========================================================

Server started at: http://localhost:${config.port}
Environment: ${config.nodeEnv}
Service: ${config.serviceName}
CORS enabled for: ${config.corsOrigin.join(', ')}

Available routes:
  /health - Health check
  /api/v1/auth/login - User login
  /api/v1/auth/register - User registration
  /api/v1/auth/verify - Token verification
  /api/v1/auth/refresh - Token refresh
  /api/v1/auth/logout - User logout

Configuration:
  - JWT Expiration: ${config.jwt.expiration}
  - Refresh Token Expiration: ${config.jwt.refreshExpiration}
  - Bcrypt Rounds: ${config.bcryptRounds}
  - Rate Limit: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs}ms

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
