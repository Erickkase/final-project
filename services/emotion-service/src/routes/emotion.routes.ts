import { Router, Request, Response, NextFunction } from 'express';
import emotionService, { Emotion } from '../services/emotion.service';
import config from '../config/config';

const router = Router();

// Middleware to validate user authentication
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;

  if (!userId) {
    return res.status(401).json({
      statusCode: 401,
      message: 'User not authenticated',
      requestId: req.requestId,
    });
  }

  req.userId = userId;
  next();
};

// GET /emotions
router.get('/', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const emotions = emotionService.getEmotionsByUser(req.userId!, limit, offset);

    return res.status(200).json({
      statusCode: 200,
      message: 'Emotions retrieved successfully',
      data: {
        emotions,
        count: emotions.length,
      },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

// GET /emotions/:emotionId
router.get('/:emotionId', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const emotion = emotionService.getEmotionById(req.params.emotionId);

    if (!emotion || emotion.userId !== req.userId) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Emotion not found',
        requestId: req.requestId,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Emotion retrieved successfully',
      data: { emotion },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

// POST /emotions
router.post('/', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, intensity, description, tags, location, weather, triggers, notes } = req.body;

    // Validations
    if (!type || !description) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Type and description are required',
        requestId: req.requestId,
      });
    }

    if (!config.allowedEmotions.includes(type.toLowerCase())) {
      return res.status(400).json({
        statusCode: 400,
        message: `Invalid emotion type. Allowed emotions: ${config.allowedEmotions.join(', ')}`,
        requestId: req.requestId,
      });
    }

    if (!intensity || intensity < 1 || intensity > 10) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Intensity must be between 1 and 10',
        requestId: req.requestId,
      });
    }

    const emotion: Omit<Emotion, 'emotionId' | 'createdAt' | 'updatedAt'> = {
      userId: req.userId!,
      type: type.toLowerCase(),
      intensity,
      description,
      tags: tags || [],
      location,
      weather,
      triggers,
      notes,
    };

    const newEmotion = emotionService.createEmotion(req.userId!, emotion);

    return res.status(201).json({
      statusCode: 201,
      message: 'Emotion registered successfully',
      data: { emotion: newEmotion },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /emotions/:emotionId
router.put('/:emotionId', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, intensity, description, tags, location, weather, triggers, notes } = req.body;

    // Optional validations
    if (type && !config.allowedEmotions.includes(type.toLowerCase())) {
      return res.status(400).json({
        statusCode: 400,
        message: `Invalid emotion type. Allowed emotions: ${config.allowedEmotions.join(', ')}`,
        requestId: req.requestId,
      });
    }

    if (intensity && (intensity < 1 || intensity > 10)) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Intensity must be between 1 and 10',
        requestId: req.requestId,
      });
    }

    const updates: Partial<Emotion> = {
      ...(type && { type: type.toLowerCase() }),
      ...(intensity && { intensity }),
      ...(description && { description }),
      ...(tags && { tags }),
      ...(location && { location }),
      ...(weather && { weather }),
      ...(triggers && { triggers }),
      ...(notes && { notes }),
    };

    const updatedEmotion = emotionService.updateEmotion(req.params.emotionId, req.userId!, updates);

    if (!updatedEmotion) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Emotion not found',
        requestId: req.requestId,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Emotion updated successfully',
      data: { emotion: updatedEmotion },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /emotions/:emotionId
router.delete('/:emotionId', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = emotionService.deleteEmotion(req.params.emotionId, req.userId!);

    if (!deleted) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Emotion not found',
        requestId: req.requestId,
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Emotion deleted successfully',
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

// GET /emotions/user/:userId
router.get('/user/:userId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const emotions = emotionService.getEmotionsByUser(req.params.userId, limit, offset);

    return res.status(200).json({
      statusCode: 200,
      message: 'User emotions retrieved',
      data: {
        emotions,
        count: emotions.length,
      },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

// GET /emotions/stats/:userId
router.get('/stats/:userId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = emotionService.getEmotionStats(req.params.userId);
    const avgIntensity = emotionService.getAverageIntensity(req.params.userId);
    const mostFrequent = emotionService.getMostFrequentEmotion(req.params.userId, 7);

    return res.status(200).json({
      statusCode: 200,
      message: 'Emotion statistics retrieved',
      data: {
        stats,
        averageIntensity: avgIntensity.toFixed(2),
        mostFrequentEmotion: mostFrequent,
        period: 'last_7_days',
      },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

// GET /emotions/range/:userId
router.get('/range/:userId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;

    if (!startDate || !endDate) {
      return res.status(400).json({
        statusCode: 400,
        message: 'startDate and endDate are required (ISO format)',
        requestId: req.requestId,
      });
    }

    const emotions = emotionService.getEmotionsByDateRange(req.params.userId, startDate, endDate);

    return res.status(200).json({
      statusCode: 200,
      message: 'Emotions in date range retrieved',
      data: {
        emotions,
        count: emotions.length,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      requestId: req.requestId,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
