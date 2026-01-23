# User Service

Gestión de perfiles y configuración de usuarios para EmoTrack.

## Características

- ✅ Gestión de perfiles de usuario
- ✅ Configuración de preferencias
- ✅ Búsqueda de usuarios
- ✅ Estadísticas de perfil
- ✅ Validación de datos
- ✅ Autenticación JWT

## API Endpoints

### Health Check
```
GET /health
```

### Perfil de Usuario
```
GET    /users/me              - Obtener perfil actual
POST   /users/profile         - Crear perfil
PUT    /users/profile         - Actualizar perfil
DELETE /users/profile         - Eliminar perfil
GET    /users/search?q=query  - Buscar usuarios
GET    /users/stats           - Obtener estadísticas
```

### Configuración
```
GET  /users/settings - Obtener configuración
PUT  /users/settings - Actualizar configuración
```

## Modelos

### UserProfile
```typescript
{
  id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  displayName?: string
  bio?: string
  avatarUrl?: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  timezone?: string
  language?: string
  createdAt: Date
  updatedAt: Date
}
```

### UserSettings
```typescript
{
  userId: string
  theme: 'light' | 'dark' | 'auto'
  emailNotifications: boolean
  pushNotifications: boolean
  weeklyReports: boolean
  privacyMode: boolean
  shareData: boolean
  updatedAt: Date
}
```

## Variables de Entorno

```env
PORT=3006
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
AUTH_SERVICE_URL=http://localhost:3001
MAX_FILE_SIZE=5242880
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
docker build -t user-service .
docker run -p 3006:3006 user-service
```

## Arquitectura

```
src/
├── config/
│   └── config.ts              # Configuración
├── middleware/
│   └── auth.middleware.ts     # Autenticación JWT
├── routes/
│   ├── health.routes.ts       # Health check
│   └── user.routes.ts         # Rutas de usuarios
├── services/
│   └── user.service.ts        # Lógica de negocio
├── __tests__/
│   ├── config.test.ts
│   └── user.service.test.ts
├── app.ts                     # Configuración Express
└── index.ts                   # Entry point
```

## Testing

```bash
npm test
```

- Tests unitarios: ✅ 14 tests
- Coverage: > 80%
- Integrado con CI/CD

## Validaciones

- Nombre y apellido mínimo 2 caracteres
- Bio máximo 500 caracteres
- Edad mínima 13 años
- Formatos de imagen válidos para avatar

## Estadísticas de Perfil

- Completitud del perfil (%)
- Días como miembro
- Fecha de registro
- Estado de verificación

## Clean Architecture

- **Domain Layer**: Entidades UserProfile, UserSettings
- **Application Layer**: UserService con casos de uso
- **Infrastructure Layer**: Express, HTTP
- **Presentation Layer**: Rutas y controladores

Siguiendo principios SOLID y clean code.
