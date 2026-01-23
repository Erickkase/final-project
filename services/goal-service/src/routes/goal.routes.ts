import { Router, Request, Response } from 'express';
import { GoalService, GoalStatus } from '../services/goal.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const goalService = new GoalService();

router.use(authMiddleware);

// Get user goals
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const status = req.query.status as GoalStatus;

    const goals = goalService.getUserGoals(userId, status);

    res.json({
      success: true,
      data: goals,
      count: goals.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goals',
    });
  }
});

// Create goal
router.post('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, description, category, targetValue, targetDate, unit } = req.body;

    if (!title || !category || !targetValue || !targetDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const validation = goalService.validateGoalData({ title, targetValue, targetDate });
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    const goal = goalService.createGoal(
      userId,
      title,
      category,
      targetValue,
      targetDate,
      description,
      unit
    );

    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create goal',
    });
  }
});

// Get single goal
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const goal = goalService.getGoal(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    const percentage = goalService.getCompletionPercentage(id);
    const daysRemaining = goalService.getDaysRemaining(id);

    res.json({
      success: true,
      data: {
        ...goal,
        completionPercentage: percentage,
        daysRemaining,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goal',
    });
  }
});

// Update goal
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const validation = goalService.validateGoalData(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    const goal = goalService.updateGoal(id, req.body);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update goal',
    });
  }
});

// Delete goal
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = goalService.deleteGoal(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    res.json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete goal',
    });
  }
});

// Add progress
router.post('/:id/progress', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { value, note } = req.body;

    if (!value || typeof value !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Valid progress value is required',
      });
    }

    const progress = goalService.addProgress(id, value, note);

    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    const goal = goalService.getGoal(id);

    res.json({
      success: true,
      data: {
        progress,
        goal,
        completionPercentage: goalService.getCompletionPercentage(id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add progress',
    });
  }
});

// Get goal progress
router.get('/:id/progress', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const progress = goalService.getGoalProgress(id);

    res.json({
      success: true,
      data: progress,
      count: progress.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress',
    });
  }
});

// Get user statistics
router.get('/stats/summary', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const stats = goalService.getGoalStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
});

// Get overdue goals
router.get('/overdue/list', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const overdue = goalService.getOverdueGoals(userId);

    res.json({
      success: true,
      data: overdue,
      count: overdue.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overdue goals',
    });
  }
});

// Pause goal
router.patch('/:id/pause', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const goal = goalService.pauseGoal(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found or cannot be paused',
      });
    }

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to pause goal',
    });
  }
});

// Resume goal
router.patch('/:id/resume', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const goal = goalService.resumeGoal(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found or cannot be resumed',
      });
    }

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to resume goal',
    });
  }
});

// Complete goal
router.patch('/:id/complete', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const goal = goalService.completeGoal(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found or already completed',
      });
    }

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to complete goal',
    });
  }
});

// Cancel goal
router.patch('/:id/cancel', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const goal = goalService.cancelGoal(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found or already completed',
      });
    }

    res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel goal',
    });
  }
});

export default router;
