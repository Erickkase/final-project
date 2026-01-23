# Recommendation Service

AI-powered wellness recommendations service for EmoTrack platform. Provides personalized activity suggestions, coping strategies, journal prompts, and lifestyle recommendations based on emotional patterns.

## Features

- **Personalized Recommendations**: Generate context-aware suggestions based on emotional state
- **Multiple Recommendation Types**:
  - Activities (breathing exercises, walks, music therapy, etc.)
  - Coping Strategies (specific techniques for anxiety, stress, sadness, anger)
  - Journal Prompts (reflection questions and exercises)
  - Goal Suggestions (wellness objectives)
  - Lifestyle Tips (sleep, nutrition, digital wellness)
  - Mindfulness Practices
- **Smart Categorization**: Recommendations adapted to emotion category (positive, negative, neutral, mixed)
- **Priority System**: High/medium/low priority recommendations
- **Feedback System**: Users can rate recommendations as helpful/not helpful
- **Expiration Management**: Time-based recommendation relevance
- **Statistics & Insights**: Track recommendation effectiveness and user engagement

## API Endpoints

### Generate Recommendations
```bash
POST /api/recommendations/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "emotionPattern": {
    "dominantEmotion": "anxiety",
    "emotionCategory": "negative",
    "intensity": 7,
    "frequency": 5,
    "trend": "declining"
  },
  "limit": 5
}
```

### Get User Recommendations
```bash
GET /api/recommendations?type=activity&limit=10
Authorization: Bearer <token>
```

### Get Specific Recommendation
```bash
GET /api/recommendations/:id
Authorization: Bearer <token>
```

### Submit Feedback
```bash
POST /api/recommendations/:id/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "helpful": true,
  "feedback": "This activity really helped me!"
}
```

### Get Recommendation Statistics
```bash
GET /api/recommendations/stats/summary
Authorization: Bearer <token>
```

### Clear Expired Recommendations (Admin)
```bash
POST /api/recommendations/admin/clear-expired
Authorization: Bearer <token>
```

### Health Check
```bash
GET /health
```

## Recommendation Types

### Activity Recommendations
Personalized activities based on emotional state:
- **For Negative Emotions**: Breathing exercises, nature walks, music therapy, social connection, yoga
- **For Positive Emotions**: Share joy, set new goals, practice gratitude, help others
- **For Neutral States**: Explore new activities, cardiovascular exercise, organize space
- **For Mixed Emotions**: Guided reflection, acceptance meditation

### Coping Strategies
Evidence-based techniques for specific emotions:
- **Anxiety**: 5-4-3-2-1 grounding technique, expressive writing
- **Stress**: Progressive muscle relaxation, time-boxing (Pomodoro)
- **Sadness**: Behavioral activation, social connection
- **Anger**: Intense physical exercise, pause technique

### Journal Prompts
Reflective questions to promote self-awareness:
- "What do I need right now?"
- "Letter to my past self"
- "Three things I control"
- "My best version"

### Lifestyle Recommendations
Long-term wellness habits:
- Sleep routine establishment
- Caffeine reduction
- Digital disconnection
- Conscious hydration

## Data Models

### Recommendation
```typescript
{
  id: string;
  userId: string;
  type: 'activity' | 'goal' | 'coping_strategy' | 'journal_prompt' | 'lifestyle' | 'mindfulness';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  tags: string[];
  helpful?: boolean;
  createdAt: Date;
  expiresAt?: Date;
}
```

### Emotion Pattern
```typescript
{
  dominantEmotion: string;
  emotionCategory: 'positive' | 'negative' | 'neutral' | 'mixed';
  intensity: number; // 1-10
  frequency: number; // How often this emotion occurs
  trend: 'improving' | 'declining' | 'stable';
}
```

## Environment Variables

```env
PORT=3010
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
NODE_ENV=development
EMOTION_SERVICE_URL=http://localhost:3002
ANALYTICS_SERVICE_URL=http://localhost:3007
GOAL_SERVICE_URL=http://localhost:3008
JOURNAL_SERVICE_URL=http://localhost:3009
```

## Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

## Docker

```bash
# Build image
docker build -t recommendation-service .

# Run container
docker run -p 3010:3010 \
  -e JWT_SECRET=your-secret-key \
  -e EMOTION_SERVICE_URL=http://emotion-service:3002 \
  -e ANALYTICS_SERVICE_URL=http://analytics-service:3007 \
  recommendation-service
```

## Integration with Other Services

### Emotion Service
- Fetches emotion history for pattern analysis
- Validates emotion data

### Analytics Service
- Obtains emotional trends and patterns
- Receives insights for recommendation generation

### Goal Service
- Suggests goals based on emotional patterns
- Tracks goal-related recommendations

### Journal Service
- Provides journal prompts
- Integrates with journaling activities

## Testing

The service includes comprehensive unit tests covering:
- Recommendation generation for different emotion categories
- Type-specific recommendations (activities, coping, prompts)
- Feedback submission and tracking
- Statistics calculation
- Expiration management
- Authorization and error handling

Run tests:
```bash
npm test
```

Coverage report:
```bash
npm run test:coverage
```

## Architecture

The service follows clean architecture principles:

- **Routes Layer**: Express routes handling HTTP requests
- **Service Layer**: Business logic for recommendation generation and management
- **Middleware Layer**: Authentication and request validation
- **Config Layer**: Environment configuration management

## Recommendation Algorithm

1. **Pattern Analysis**: Analyzes emotion category, intensity, frequency, and trend
2. **Context Matching**: Selects appropriate recommendation types
3. **Personalization**: Generates reason based on user's emotional state
4. **Priority Assignment**: Assigns priority based on urgency and relevance
5. **Expiration Setting**: Sets realistic expiration dates per recommendation type
6. **Feedback Learning**: (Future) Adapts recommendations based on user feedback

## Security

- JWT authentication required for all endpoints
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS configuration
- Input validation

## Performance

- In-memory storage for fast access (consider Redis for production)
- Efficient pattern matching algorithms
- Pagination support for large result sets
- Automatic expired recommendation cleanup

## Future Enhancements

- [ ] Machine learning model for personalized recommendations
- [ ] Integration with external wellness APIs
- [ ] Recommendation scheduling and reminders
- [ ] A/B testing for recommendation effectiveness
- [ ] Collaborative filtering based on similar users
- [ ] Multi-language support
- [ ] Audio/video content recommendations
- [ ] Integration with wearable devices

## License

ISC
