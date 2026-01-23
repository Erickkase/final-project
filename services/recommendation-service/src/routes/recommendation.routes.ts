import { Router, Request, Response } from 'express';
import {
  recommendationService,
  RecommendationType,
  EmotionCategory,
  EmotionPattern,
} from '../services/recommendation.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Generate recommendations
router.post('/generate', async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user.userId;
    const { emotionPattern, limit } = req.body;

    if (!emotionPattern) {
      return res.status(400).json({ error: 'Emotion pattern is required' });
    }

    // Validate emotion pattern
    if (!emotionPattern.dominantEmotion || !emotionPattern.emotionCategory) {
      return res.status(400).json({
        error: 'Emotion pattern must include dominantEmotion and emotionCategory',
      });
    }

    if (!Object.values(EmotionCategory).includes(emotionPattern.emotionCategory)) {
      return res.status(400).json({
        error: 'Invalid emotion category',
      });
    }

    const pattern: EmotionPattern = {
      dominantEmotion: emotionPattern.dominantEmotion,
      emotionCategory: emotionPattern.emotionCategory,
      intensity: emotionPattern.intensity || 5,
      frequency: emotionPattern.frequency || 1,
      trend: emotionPattern.trend || 'stable',
    };

    const recommendations = recommendationService.generateRecommendations(
      userId,
      pattern,
      limit || 5
    );

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Get user recommendations
router.get('/', async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user.userId;
    const { type, includeExpired, limit } = req.query;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {};

    if (type && Object.values(RecommendationType).includes(type as RecommendationType)) {
      options.type = type as RecommendationType;
    }

    if (includeExpired === 'true') {
      options.includeExpired = true;
    }

    if (limit) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options.limit = parseInt(limit as string);
    }

    const recommendations = recommendationService.getUserRecommendations(userId, options);

    res.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get specific recommendation
router.get('/:id', async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const recommendation = recommendationService.getRecommendation(id);

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    if (recommendation.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      recommendation,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error getting recommendation:', error);
    res.status(500).json({ error: 'Failed to get recommendation' });
  }
});

// Submit feedback
router.post('/:id/feedback', async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { helpful, feedback } = req.body;

    if (typeof helpful !== 'boolean') {
      return res.status(400).json({ error: 'Helpful field is required and must be a boolean' });
    }

    const feedbackEntry = recommendationService.submitFeedback(
      id,
      userId,
      helpful,
      feedback
    );

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: feedbackEntry,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    if (error.message === 'Recommendation not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get recommendation statistics
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (req as any).user.userId;

    const stats = recommendationService.getRecommendationStats(userId);

    res.json({
      success: true,
      stats,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error getting recommendation stats:', error);
    res.status(500).json({ error: 'Failed to get recommendation stats' });
  }
});

// Clear expired recommendations (admin only - in real app would check admin role)
router.post('/admin/clear-expired', async (req: Request, res: Response) => {
  try {
    const cleared = recommendationService.clearExpiredRecommendations();

    res.json({
      success: true,
      message: `Cleared ${cleared} expired recommendations`,
      cleared,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error clearing expired recommendations:', error);
    res.status(500).json({ error: 'Failed to clear expired recommendations' });
  }
});

export default router;
