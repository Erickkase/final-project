# Goal Service

> 🎯 Microservicio de gestión de objetivos y metas de bienestar

Gestión de objetivos y metas de bienestar emocional para EmoTrack.

## Características

- ✅ Creación y gestión de objetivos
- ✅ Seguimiento de progreso
- ✅ Estadísticas de cumplimiento
- ✅ Categorías de bienestar
- ✅ Estados: activo, completado, pausado, cancelado
- ✅ Notificaciones de progreso
- ✅ Validación de datos
- ✅ Autenticación JWT

## API Endpoints

### Health Check
```
GET /health
```

### Objetivos
```
GET    /goals                    - Obtener objetivos del usuario
GET    /goals/:id                - Obtener objetivo específico
POST   /goals                    - Crear objetivo
PUT    /goals/:id                - Actualizar objetivo
DELETE /goals/:id                - Eliminar objetivo
GET    /goals/:id/progress       - Obtener progreso
POST   /goals/:id/progress       - Agregar progreso
```

### Gestión de Estado
```
PATCH /goals/:id/pause     - Pausar objetivo
PATCH /goals/:id/resume    - Reanudar objetivo
PATCH /goals/:id/complete  - Completar objetivo
PATCH /goals/:id/cancel    - Cancelar objetivo
```

### Estadísticas
```
GET /goals/stats/summary     - Estadísticas del usuario
GET /goals/overdue/list      - Objetivos vencidos
```

## Categorías de Objetivos

- `emotional_balance` - Balance emocional
- `stress_reduction` - Reducción de estrés
- `positive_mindset` - Mentalidad positiva
- `self_care` - Autocuidado
- `social_connection` - Conexión social
- `physical_wellness` - Bienestar físico
- `mindfulness` - Mindfulness
- `sleep_improvement` - Mejora del sueño

## Estados

- `active` - Activo
- `completed` - Completado
- `paused` - Pausado
- `cancelled` - Cancelado

## Modelo de Objetivo

```typescript
{
  id: string
  userId: string
  title: string
  description?: string
  category: GoalCategory
  targetValue: number
  currentValue: number
  unit: string
  status: GoalStatus
  startDate: Date
  targetDate: Date
  completedDate?: Date
  createdAt: Date
  updatedAt: Date
}
```

## Variables de Entorno

```env
PORT=3008
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
NOTIFICATION_SERVICE_URL=http://localhost:3005
```

## Desarrollo

```bash
npm install
npm run dev
npm test
npm run test:watch
npm run test:coverage
npm run lint
npm run build
npm start
```

## Docker

```bash
docker build -t goal-service .
docker run -p 3008:3008 goal-service
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
│   └── goal.routes.ts         # Rutas de objetivos
├── services/
│   └── goal.service.ts        # Lógica de negocio
├── __tests__/
│   ├── config.test.ts
│   └── goal.service.test.ts
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

## Funcionalidades Avanzadas

- Auto-completar cuando se alcanza el objetivo
- Cálculo de porcentaje de completitud
- Días restantes para la fecha límite
- Detección de objetivos vencidos
- Estadísticas de rendimiento
- Tasa de cumplimiento

## Clean Architecture

- **Domain Layer**: Entidades Goal, GoalProgress
- **Application Layer**: GoalService con casos de uso
- **Infrastructure Layer**: Express, HTTP
- **Presentation Layer**: Rutas y controladores

Siguiendo principios SOLID y clean code.



