import { Router, Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();
const reportService = new ReportService();

// Get user emotion trend
router.get('/trend/:userId', verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string || '15', 10);

    if (days !== 15 && days !== 30) {
      return res.status(400).json({ error: 'Days parameter must be 15 or 30' });
    }

    const trend = await reportService.getEmotionTrend(userId, days);
    res.json(trend);
  } catch (error) {
    console.error('Error getting emotion trend:', error);
    res.status(500).json({ error: 'Failed to get emotion trend' });
  }
});

// Get user emotion summary
router.get('/summary/:userId', verifyToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const summary = await reportService.getEmotionSummary(userId);
    res.json(summary);
  } catch (error) {
    console.error('Error getting emotion summary:', error);
    res.status(500).json({ error: 'Failed to get emotion summary' });
  }
});

export default router;
