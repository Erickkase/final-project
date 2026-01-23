# Emotion Service - EmoTrack Platform

Servicio que gestiona el registro, análisis y seguimiento de emociones de los usuarios en la plataforma EmoTrack.

## 📋 Descripción

El Emotion Service proporciona:
- Registro de emociones diarias
- Análisis de patrones emocionales
- Estadísticas de emociones por usuario
- Clasificación de intensidad emocional (1-10)
- Seguimiento de contexto (ubicación, clima, triggers)
- Búsqueda y filtrado de emociones

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración de variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` según tus necesidades.

### Desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3003`

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
│   └── emotion.routes.ts      # Endpoints de emociones
├── services/
│   └── emotion.service.ts     # Lógica de emociones
├── app.ts                     # Configuración de Express
└── index.ts                   # Punto de entrada
```

## 🔌 Endpoints Disponibles

### Health Check
- `GET /health` - Estado del servicio

### CRUD de Emociones
- `GET /api/v1/emotions` - Obtener mis emociones (requiere autenticación)
- `GET /api/v1/emotions/:emotionId` - Obtener emoción específica
- `POST /api/v1/emotions` - Crear nueva emoción
- `PUT /api/v1/emotions/:emotionId` - Actualizar emoción
- `DELETE /api/v1/emotions/:emotionId` - Eliminar emoción

### Análisis y Estadísticas
- `GET /api/v1/emotions/user/:userId` - Obtener emociones de un usuario
- `GET /api/v1/emotions/stats/:userId` - Estadísticas de emociones
- `GET /api/v1/emotions/range/:userId` - Emociones en rango de fechas

## 📝 Ejemplos de Uso

### Registrar una emoción

```bash
curl -X POST http://localhost:3003/api/v1/emotions \
  -H "Content-Type: application/json" \
  -H "X-User-ID: user-123" \
  -d '{
    "type": "alegria",
    "intensity": 8,
    "description": "Día productivo en la universidad",
    "tags": ["productividad", "universidad"],
    "location": "Campus A",
    "weather": "soleado",
    "triggers": ["examen aprobado"],
    "notes": "Sentimientos positivos después de examen"
  }'
```

Respuesta:
```json
{
  "statusCode": 201,
  "message": "Emoción registrada exitosamente",
  "data": {
    "emotion": {
      "emotionId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-123",
      "type": "alegria",
      "intensity": 8,
      "description": "Día productivo en la universidad",
      "tags": ["productividad", "universidad"],
      "location": "Campus A",
      "weather": "soleado",
      "triggers": ["examen aprobado"],
      "notes": "Sentimientos positivos después de examen",
      "createdAt": "2024-01-12T15:30:00Z",
      "updatedAt": "2024-01-12T15:30:00Z"
    }
  },
  "requestId": "uuid"
}
```

### Obtener emociones de un usuario

```bash
curl -X GET "http://localhost:3003/api/v1/emotions/user/user-123?limit=10&offset=0"
```

### Obtener estadísticas

```bash
curl -X GET http://localhost:3003/api/v1/emotions/stats/user-123
```

Respuesta:
```json
{
  "statusCode": 200,
  "message": "Estadísticas de emociones obtenidas",
  "data": {
    "stats": {
      "alegria": 15,
      "tristeza": 5,
      "miedo": 3,
      "ira": 2
    },
    "averageIntensity": "6.50",
    "mostFrequentEmotion": "alegria",
    "period": "last_7_days"
  }
}
```

### Obtener emociones en rango de fechas

```bash
curl -X GET "http://localhost:3003/api/v1/emotions/range/user-123?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z"
```

## 🎯 Tipos de Emociones Permitidas

Por defecto:
- `alegria` - Felicidad y entusiasmo
- `tristeza` - Melancolía y pesar
- `miedo` - Ansiedad y preocupación
- `ira` - Enojo e irritación
- `disguto` - Repugnancia
- `sorpresa` - Asombro
- `neutral` - Estado neutral
- `ansiedad` - Nerviosismo
- `culpa` - Remordimiento
- `verguenza` - Humillación
- `orgullo` - Autovaloración
- `esperanza` - Optimismo
- `decepccion` - Deslusión
- `amor` - Afecto
- `odio` - Antagonismo

Configurables en `.env` con `ALLOWED_EMOTIONS`

## 📊 Intensidad de Emociones

Las emociones se clasifican en una escala del 1 al 10:
- **1-3**: Emociones leves
- **4-6**: Emociones moderadas
- **7-10**: Emociones intensas

## 🔐 Seguridad Implementada

- ✅ Autenticación basada en X-User-ID header
- ✅ CORS configurado
- ✅ Helmet para headers seguros
- ✅ Rate limiting
- ✅ Validación de datos de entrada
- ✅ Aislamiento de datos por usuario

## 🔐 Variables de Entorno

```env
NODE_ENV=development
PORT=3003
SERVICE_NAME=emotion-service

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=emotrack_emotions

CORS_ORIGIN=http://localhost:3000,http://localhost:3001
AUTH_SERVICE_URL=http://localhost:3001

ALLOWED_EMOTIONS=alegria,tristeza,miedo,ira,disguto,sorpresa

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

LOG_LEVEL=debug
REQUEST_TIMEOUT=30000
```

## 📈 Análisis de Datos

El servicio proporciona análisis útiles:
- **Estadísticas**: Conteo de emociones por tipo
- **Promedio de intensidad**: Nivel emocional general
- **Emoción más frecuente**: Predominante en los últimos días
- **Rango de fechas**: Filtrado temporal de emociones

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
  "requestId": "uuid"
}
```

## 📝 Notas

- El servicio almacena emociones en memoria (simulado) - integrar BD en producción
- Requiere header `X-User-ID` para endpoints autenticados
- Las emociones se pueden filtrar por fecha, usuario y tipo
- El análisis es en tiempo real

## 👥 Contribución

Sigue [Conventional Commits](https://www.conventionalcommits.org/) para tus commits.

## 📄 Licencia

MIT



