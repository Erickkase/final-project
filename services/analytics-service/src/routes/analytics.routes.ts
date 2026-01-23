import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const analyticsService = new AnalyticsService();

router.use(authMiddleware);

// Get emotion patterns
router.get('/patterns', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const days = parseInt(req.query.days as string) || 30;

    const patterns = await analyticsService.analyzePatterns(userId, days);

    res.json({
      success: true,
      data: patterns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to analyze patterns',
    });
  }
});

// Get mood trends
router.get('/trends', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const days = parseInt(req.query.days as string) || 30;

    const trends = await analyticsService.calculateTrends(userId, days);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to calculate trends',
    });
  }
});

// Get positivity score
router.get('/positivity', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const days = parseInt(req.query.days as string) || 30;

    const score = await analyticsService.calculatePositivityScore(userId, days);

    res.json({
      success: true,
      data: { score },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to calculate positivity score',
    });
  }
});

// Get risk assessment
router.get('/risk', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const riskLevel = await analyticsService.assessRiskLevel(userId);

    res.json({
      success: true,
      data: { riskLevel },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to assess risk',
    });
  }
});

// Get comprehensive insights
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const days = parseInt(req.query.days as string) || 30;

    const insights = await analyticsService.generateInsights(userId, days);

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
    });
  }
});

// Compare periods
router.get('/compare', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const period1 = parseInt(req.query.period1 as string) || 7;
    const period2 = parseInt(req.query.period2 as string) || 14;

    const comparison = await analyticsService.comparePeriods(userId, period1, period2);

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to compare periods',
    });
  }
});

export default router;
