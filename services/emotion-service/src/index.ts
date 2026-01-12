import app from './app';
import config from './config/config';

const server = app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║     😊 Emotion Service - EmoTrack Platform 😊         ║
╚════════════════════════════════════════════════════════╝

📍 Servidor iniciado en: http://localhost:${config.port}
🌍 Ambiente: ${config.nodeEnv}
📦 Servicio: ${config.serviceName}
🔐 CORS habilitado para: ${config.corsOrigin.join(', ')}

Rutas disponibles:
  ✅ /health - Health check
  ✅ /api/v1/emotions - CRUD de emociones
  ✅ /api/v1/emotions/user/:userId - Emociones del usuario
  ✅ /api/v1/emotions/stats/:userId - Estadísticas
  ✅ /api/v1/emotions/range/:userId - Rango de fechas

⚙️ Configuración:
  - Emociones permitidas: ${config.allowedEmotions.join(', ')}
  - Rate Limit: ${config.rateLimit.maxRequests} requests por ${config.rateLimit.windowMs}ms
  - Base de datos: ${config.database.host}:${config.database.port}/${config.database.name}

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
