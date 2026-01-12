import app from './app';
import config from './config/config';

const server = app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║        🚀 API Gateway - EmoTrack Platform 🚀          ║
╚════════════════════════════════════════════════════════╝

📍 Servidor iniciado en: http://localhost:${config.port}
🌍 Ambiente: ${config.nodeEnv}
📦 Servicio: ${config.serviceName}
🔐 CORS habilitado para: ${config.corsOrigin.join(', ')}

Rutas disponibles:
  ✅ /health - Health check
  ✅ /api/v1/auth - Autenticación
  ✅ /api/v1/emotions - Emociones
  ✅ /api/v1/reports - Reportes

⚙️ Configuración:
  - Rate Limit: ${config.rateLimit.maxRequests} requests por ${config.rateLimit.windowMs}ms
  - Request Timeout: ${config.requestTimeout}ms
  - Service Timeout: ${config.serviceTimeout}ms

Presiona Ctrl+C para detener el servidor
  `);
});

// Manejo de señales para shutdown graceful
process.on('SIGTERM', () => {
  console.log('📛 SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📛 SIGINT recibido. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  console.error('❌ Error no capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rechazada sin manejar:', reason);
  process.exit(1);
});

export default server;
