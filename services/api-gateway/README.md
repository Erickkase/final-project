# API Gateway - EmoTrack Platform

API Gateway que actúa como punto de entrada único para todos los microservicios de la plataforma EmoTrack.

## 📋 Descripción

El API Gateway es un componente central que:
- Enruta las solicitudes a los microservicios correspondientes
- Gestiona la seguridad (CORS, Rate Limiting, Helmet)
- Proporciona logging y tracing de solicitudes
- Maneja errores de manera centralizada
- Genera reportes de disponibilidad

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración de variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` y configura las URLs de los microservicios.

### Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### Build

```bash
npm run build
```

### Producción

```bash
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── config/
│   └── config.ts              # Configuración centralizada
├── routes/
│   ├── health.routes.ts       # Health check endpoints
│   ├── auth.routes.ts         # Proxy de autenticación
│   ├── emotion.routes.ts      # Proxy de emociones
│   └── report.routes.ts       # Proxy de reportes
├── services/
│   └── service-proxy.ts       # Cliente HTTP para microservicios
├── app.ts                     # Configuración de Express
└── index.ts                   # Punto de entrada
```

## 🔌 Endpoints Disponibles

### Health Check
- `GET /health` - Estado del API Gateway
- `GET /health/ready` - Verificar si está listo
- `GET /health/live` - Verificar si está vivo

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrarse
- `GET /api/v1/auth/verify` - Verificar token
- `POST /api/v1/auth/refresh` - Refrescar token
- `POST /api/v1/auth/logout` - Cerrar sesión

### Emociones
- `GET /api/v1/emotions` - Obtener todas las emociones
- `GET /api/v1/emotions/:id` - Obtener emoción por ID
- `POST /api/v1/emotions` - Crear nueva emoción
- `PUT /api/v1/emotions/:id` - Actualizar emoción
- `DELETE /api/v1/emotions/:id` - Eliminar emoción

### Reportes
- `GET /api/v1/reports` - Obtener todos los reportes
- `GET /api/v1/reports/:id` - Obtener reporte por ID
- `POST /api/v1/reports` - Generar nuevo reporte
- `GET /api/v1/reports/user/:userId` - Obtener reportes del usuario

## 🔐 Seguridad

### Implemented
- **Helmet** - Protege contra vulnerabilidades HTTP comunes
- **CORS** - Control de acceso entre dominios
- **Rate Limiting** - Limita solicitudes por IP
- **Request ID** - Tracing de solicitudes

### Headers Soportados
- `Authorization` - Token JWT
- `X-Request-ID` - ID único de solicitud
- `X-Forwarded-For` - IP del cliente

## ⚙️ Variables de Entorno

### Entrada (Microservicios)
```env
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
EMOTION_SERVICE_URL=http://localhost:3003
REPORT_SERVICE_URL=http://localhost:3004
NOTIFICATION_SERVICE_URL=http://localhost:3005
MOTIVATION_SERVICE_URL=http://localhost:3006
AI_ANALYSIS_SERVICE_URL=http://localhost:3007
AUDIT_SERVICE_URL=http://localhost:3008
BACKUP_SERVICE_URL=http://localhost:3009
INTEGRATION_SERVICE_URL=http://localhost:3010
```

### Salida (Configuración)
```env
NODE_ENV=development
PORT=3000
SERVICE_NAME=api-gateway
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=debug
PROMETHEUS_ENABLED=false
REQUEST_TIMEOUT=30000
SERVICE_TIMEOUT=15000
```

## 📊 Logging

Cada solicitud se registra con:
- Timestamp
- Request ID
- Método HTTP
- URL
- Status Code
- Duración de respuesta

## 🐛 Manejo de Errores

El API Gateway retorna errores en el siguiente formato:

```json
{
  "statusCode": 500,
  "message": "Error message",
  "path": "/api/v1/route",
  "timestamp": "2024-01-12T10:30:00Z",
  "requestId": "uuid",
  "duration": "150ms"
}
```

## 🧪 Testing

```bash
npm run test
```

## 📦 Docker

```bash
docker build -t api-gateway:latest .
docker run -p 3000:3000 --env-file .env api-gateway:latest
```

## 📚 Documentación

Para más información sobre la plataforma EmoTrack, consulta [ARCHITECTURE.md](../../ARCHITECTURE.md)

## 📝 Notas

- Todas las solicitudes deben incluir el header `Content-Type: application/json`
- Los tokens JWT se envían en el header `Authorization: Bearer <token>`
- Rate Limiting se aplica globalmente por IP
- El servicio es stateless y puede ser replicado

## 👥 Contribución

Sigue [Conventional Commits](https://www.conventionalcommits.org/) para tus commits.

## 📄 Licencia

MIT
