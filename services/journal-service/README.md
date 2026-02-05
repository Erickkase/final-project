# Journal Service

> 📓 Microservicio de diario personal y reflexiones emocionales

Servicio de diario personal y reflexiones emocionales para EmoTrack.

## Características

- ✅ Creación y gestión de entradas de diario
- ✅ Categorización por tipo de entrada
- ✅ Estados de ánimo (mood tracking)
- ✅ Sistema de etiquetas (tags)
- ✅ Búsqueda de entradas
- ✅ Prompts diarios de reflexión
- ✅ Estadísticas de escritura
- ✅ Rachas de escritura (streaks)
- ✅ Vinculación con emociones
- ✅ Entradas privadas/públicas
- ✅ Validación de datos
- ✅ Autenticación JWT

## API Endpoints

### Health Check
```
GET /health
```

### Entradas de Diario
```
GET    /journal                     - Obtener entradas (con filtros)
GET    /journal/:id                 - Obtener entrada específica
POST   /journal                     - Crear entrada
PUT    /journal/:id                 - Actualizar entrada
DELETE /journal/:id                 - Eliminar entrada
GET    /journal/search/query?q=...  - Buscar entradas
GET    /journal/tags/:tag           - Obtener entradas por etiqueta
POST   /journal/:id/emotions        - Vincular emoción a entrada
```

### Estadísticas y Prompts
```
GET /journal/stats/summary           - Estadísticas del usuario
GET /journal/prompts/daily?count=3   - Prompts diarios
GET /journal/prompts/category/:cat   - Prompts por categoría
```

## Filtros Disponibles

- `category` - Filtrar por categoría
- `mood` - Filtrar por estado de ánimo
- `tags` - Filtrar por etiquetas (separadas por coma)
- `startDate` - Fecha inicio
- `endDate` - Fecha fin
- `limit` - Limitar resultados

## Estados de Ánimo (Mood)

- `very_negative` - Muy negativo
- `negative` - Negativo
- `neutral` - Neutral
- `positive` - Positivo
- `very_positive` - Muy positivo

## Categorías

- `personal` - Personal
- `work` - Trabajo
- `relationships` - Relaciones
- `health` - Salud
- `gratitude` - Gratitud
- `reflection` - Reflexión
- `goals` - Objetivos
- `challenges` - Desafíos

## Modelo de Entrada

```typescript
{
  id: string
  userId: string
  title: string
  content: string
  mood: JournalMood
  category: JournalCategory
  tags: string[]
  isPrivate: boolean
  emotionIds?: string[]
  createdAt: Date
  updatedAt: Date
}
```

## Estadísticas Incluidas

- Total de entradas
- Entradas por mood
- Entradas por categoría
- Promedio de entradas por semana
- Racha más larga
- Racha actual
- Etiquetas más usadas

## Variables de Entorno

```env
PORT=3009
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
EMOTION_SERVICE_URL=http://localhost:3002
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
docker build -t journal-service .
docker run -p 3009:3009 journal-service
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
│   └── journal.routes.ts      # Rutas de diario
├── services/
│   └── journal.service.ts     # Lógica de negocio
├── __tests__/
│   ├── config.test.ts
│   └── journal.service.test.ts
├── app.ts                     # Configuración Express
└── index.ts                   # Entry point
```

## Testing

```bash
npm test
```

- Tests unitarios: ✅ 20+ tests
- Coverage: > 80%
- Integrado con CI/CD

## Validaciones

- Título: 3-200 caracteres
- Contenido: 10-10000 caracteres
- Tags: Ilimitados
- Mood: Valores predefinidos
- Category: Valores predefinidos

## Prompts de Reflexión

El servicio incluye prompts predefinidos para ayudar a los usuarios a reflexionar:

- Gratitud
- Desafíos
- Reflexión personal
- Relaciones
- Progreso de objetivos

## Funcionalidades Avanzadas

- Cálculo de rachas de escritura consecutiva
- Análisis de tendencias de mood
- Vinculación con emociones registradas
- Sistema de búsqueda full-text
- Filtrado avanzado multi-criterio

## Clean Architecture

- **Domain Layer**: Entidades JournalEntry, JournalPrompt
- **Application Layer**: JournalService con casos de uso
- **Infrastructure Layer**: Express, HTTP
- **Presentation Layer**: Rutas y controladores

Siguiendo principios SOLID y clean code.



