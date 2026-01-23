# Report Service

Servicio de reportes y análisis de tendencias emocionales para EmoTrack.

## Características

- Generación de reportes de tendencias a 15 días
- Generación de reportes de tendencias a 30 días
- Análisis estadístico de emociones registradas
- API REST para consulta de reportes

## Endpoints

- `GET /health` - Health check del servicio
- `GET /reports/trend/:userId?days=15` - Tendencia emocional de un usuario (15 o 30 días)
- `GET /reports/summary/:userId` - Resumen emocional de un usuario

## Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Tests
npm test
```

## Variables de Entorno

- `PORT` - Puerto del servicio (default: 3003)
- `NODE_ENV` - Entorno de ejecución
- `JWT_SECRET` - Secreto para validar tokens JWT
- `EMOTION_SERVICE_URL` - URL del servicio de emociones
