# Analytics Service

Análisis avanzado de datos emocionales para EmoTrack.

## Características

- ✅ Análisis de patrones emocionales
- ✅ Cálculo de tendencias de humor
- ✅ Score de positividad
- ✅ Evaluación de riesgo
- ✅ Insights personalizados
- ✅ Comparación de períodos
- ✅ Recomendaciones inteligentes

## API Endpoints

### Health Check
```
GET /health
```

### Analytics
```
GET /analytics/patterns?days=30      - Patrones emocionales
GET /analytics/trends?days=30        - Tendencias de humor
GET /analytics/positivity?days=30    - Score de positividad
GET /analytics/risk                  - Evaluación de riesgo
GET /analytics/insights?days=30      - Insights comprehensivos
GET /analytics/compare?period1=7&period2=14 - Comparar períodos
```

## Variables de Entorno

```env
PORT=3007
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
EMOTION_SERVICE_URL=http://localhost:3002
USER_SERVICE_URL=http://localhost:3006
```

## Desarrollo

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
npm start
```

## Docker

```bash
docker build -t analytics-service .
docker run -p 3007:3007 analytics-service
```

## Métricas Calculadas

- **Positivity Score**: 0-100 basado en emociones positivas vs negativas
- **Risk Level**: low/medium/high basado en patrones recientes
- **Patterns**: Frecuencia y características de cada emoción
- **Trends**: Tendencias diarias de humor
- **Recommendations**: Sugerencias personalizadas

## Testing

✅ 8 tests unitarios
✅ Coverage > 70%
✅ Integrado con CI/CD



