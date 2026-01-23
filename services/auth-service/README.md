# Auth Service - EmoTrack Platform

Servicio de autenticación con JWT que gestiona el registro, login y autenticación de usuarios en la plataforma EmoTrack.

## 📋 Descripción

El Auth Service proporciona:
- Registro de usuarios con validación de contraseña
- Login con JWT
- Refresh tokens para mantener sesiones activas
- Verificación de tokens
- Logout con invalidación de tokens
- Contraseñas encriptadas con bcryptjs

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración de variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` y configura según tus necesidades.

### Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

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
│   └── auth.routes.ts         # Endpoints de autenticación
├── services/
│   ├── jwt.service.ts         # Generación y validación de JWT
│   └── password.service.ts    # Encriptación y validación de contraseñas
├── app.ts                     # Configuración de Express
└── index.ts                   # Punto de entrada
```

## 🔌 Endpoints Disponibles

### Health Check
- `GET /health` - Estado del servicio

### Autenticación
- `POST /api/v1/auth/register` - Registrar nuevo usuario
- `POST /api/v1/auth/login` - Iniciar sesión
- `GET /api/v1/auth/verify` - Verificar token JWT
- `POST /api/v1/auth/refresh` - Refrescar token expirado
- `POST /api/v1/auth/logout` - Cerrar sesión

## 📝 Ejemplos de Uso

### Registro

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "Segura123!",
    "name": "Juan Pérez",
    "role": "student"
  }'
```

Respuesta:
```json
{
  "statusCode": 201,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "email": "usuario@example.com",
      "role": "student"
    }
  },
  "requestId": "uuid"
}
```

### Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "Segura123!"
  }'
```

### Verificar Token

```bash
curl -X GET http://localhost:3001/api/v1/auth/verify \
  -H "Authorization: Bearer eyJhbGc..."
```

### Refrescar Token

```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'
```

### Logout

```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'
```

## 🔐 Seguridad Implementada

- ✅ JWT con algoritmo HS256
- ✅ Contraseñas encriptadas con bcryptjs
- ✅ Validación de fuerza de contraseña
- ✅ Refresh tokens separados del token de acceso
- ✅ Invalidación de tokens en logout
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Helmet para headers seguros

## 📋 Requisitos de Contraseña

Las contraseñas deben cumplir con:
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial (!@#$%^&*)

## 🔐 Variables de Entorno

```env
NODE_ENV=development
PORT=3001
SERVICE_NAME=auth-service

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRATION=30d

CORS_ORIGIN=http://localhost:3000,http://localhost:3001
BCRYPT_ROUNDS=10

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=emotrack_auth

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

LOG_LEVEL=debug
REQUEST_TIMEOUT=30000
```

## 📊 Estructura de JWT

El token JWT contiene:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@example.com",
  "role": "student",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## 🧪 Testing

```bash
npm run test
```

## 🐛 Manejo de Errores

El servicio retorna errores en el siguiente formato:

```json
{
  "statusCode": 400,
  "message": "Mensaje de error",
  "errors": ["Error 1", "Error 2"],
  "requestId": "uuid"
}
```

## 📝 Notas

- Los tokens JWT expiran después del tiempo configurado en `JWT_EXPIRATION`
- Los refresh tokens tienen una expiración más larga (`JWT_REFRESH_EXPIRATION`)
- Los usuarios se almacenan en memoria (simulado) - integrar BD en producción
- Cambiar `JWT_SECRET` y `JWT_REFRESH_SECRET` en producción
- Rate limiting se aplica globalmente por IP

## 👥 Contribución

Sigue [Conventional Commits](https://www.conventionalcommits.org/) para tus commits.

## 📄 Licencia

MIT




