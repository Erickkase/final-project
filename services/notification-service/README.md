# Notification Service

Sistema de notificaciones en tiempo real para EmoTrack.

## Características

- ✅ Notificaciones in-app
- ✅ Soporte para múltiples canales (email, push, SMS)
- ✅ Gestión de preferencias de usuario
- ✅ Marca como leído/no leído
- ✅ Contador de notificaciones no leídas
- ✅ Limpieza automática de notificaciones antiguas
- ✅ Autenticación JWT

## API Endpoints

### Health Check
```
GET /health
```

### Notificaciones
```
GET    /notifications              - Obtener notificaciones del usuario
GET    /notifications/unread/count - Contador de no leídas
POST   /notifications              - Crear notificación
PATCH  /notifications/:id/read     - Marcar como leída
PATCH  /notifications/read/all     - Marcar todas como leídas
DELETE /notifications/:id          - Eliminar notificación
```

### Preferencias
```
GET  /notifications/preferences - Obtener preferencias
PUT  /notifications/preferences - Actualizar preferencias
```

## Tipos de Notificaciones

- `info` - Información general
- `success` - Operación exitosa
- `warning` - Advertencia
- `error` - Error
- `reminder` - Recordatorio
- `emotion_insight` - Insights de emociones

## Canales

- `in_app` - Notificación en la aplicación
- `email` - Correo electrónico
- `push` - Notificación push
- `sms` - Mensaje de texto

## Variables de Entorno

```env
PORT=3005
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
WS_PORT=3015
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=
EMAIL_FROM=noreply@emotracker.com
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Tests
npm test

# Tests con watch
npm run test:watch

# Coverage
npm run test:coverage

# Lint
npm run lint

# Build
npm run build

# Producción
npm start
```

## Docker

```bash
docker build -t notification-service .
docker run -p 3005:3005 notification-service
```

## Arquitectura

```
src/
├── config/
│   └── config.ts           # Configuración
├── middleware/
│   └── auth.middleware.ts  # Autenticación JWT
├── routes/
│   ├── health.routes.ts    # Health check
│   └── notification.routes.ts # Rutas de notificaciones
├── services/
│   └── notification.service.ts # Lógica de negocio
├── __tests__/
│   ├── config.test.ts
│   └── notification.service.test.ts
├── app.ts                  # Configuración Express
└── index.ts               # Entry point
```

## Testing

```bash
npm test
```

- Tests unitarios: ✅ 16 tests
- Coverage: > 80%
- Integrado con CI/CD

## Integraciones Futuras

- [ ] SendGrid para emails
- [ ] Firebase Cloud Messaging para push
- [ ] Twilio para SMS
- [ ] WebSocket para real-time
- [ ] Redis para cola de mensajes

## Clean Architecture

- **Domain Layer**: Entidades y lógica de negocio
- **Application Layer**: Casos de uso
- **Infrastructure Layer**: Express, HTTP
- **Presentation Layer**: Rutas y controladores

Siguiendo principios SOLID y clean code.

