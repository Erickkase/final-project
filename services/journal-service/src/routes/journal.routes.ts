import { Router, Request, Response } from 'express';
import { JournalService, JournalMood, JournalCategory } from '../services/journal.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const journalService = new JournalService();

router.use(authMiddleware);

// Get user entries
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { category, mood, tags, startDate, endDate, limit } = req.query;

    const options: any = {};

    if (category) options.category = category as JournalCategory;
    if (mood) options.mood = mood as JournalMood;
    if (tags) options.tags = (tags as string).split(',');
    if (startDate) options.startDate = new Date(startDate as string);
    if (endDate) options.endDate = new Date(endDate as string);
    if (limit) options.limit = parseInt(limit as string, 10);

    const entries = journalService.getUserEntries(userId, options);

    res.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entries',
    });
  }
});

// Create entry
router.post('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, content, mood, category, tags, isPrivate } = req.body;

    if (!title || !content || !mood || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const validation = journalService.validateEntryData({ title, content });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    const entry = journalService.createEntry(
      userId,
      title,
      content,
      mood,
      category,
      tags || [],
      isPrivate !== undefined ? isPrivate : true
    );

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create entry',
    });
  }
});

// Get single entry
router.get('/:id', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const entry = journalService.getEntry(id, userId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found',
      });
    }

    res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entry',
    });
  }
});

// Update entry
router.put('/:id', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const validation = journalService.validateEntryData(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    const entry = journalService.updateEntry(id, userId, req.body);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found',
      });
    }

    res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update entry',
    });
  }
});

// Delete entry
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const deleted = journalService.deleteEntry(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found',
      });
    }

    res.json({
      success: true,
      message: 'Entry deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete entry',
    });
  }
});

// Search entries
router.get('/search/query', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query must be at least 2 characters',
      });
    }

    const entries = journalService.searchEntries(userId, query);

    res.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search entries',
    });
  }
});

// Get user statistics
router.get('/stats/summary', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const stats = journalService.getUserStats(userId);

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

// Get daily prompts
router.get('/prompts/daily', (req: Request, res: Response) => {
  try {
    const count = parseInt(req.query.count as string) || 3;
    const prompts = journalService.getDailyPrompts(count);

    res.json({
      success: true,
      data: prompts,
      count: prompts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prompts',
    });
  }
});

// Get prompts by category
router.get('/prompts/category/:category', (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const prompts = journalService.getPromptsByCategory(category as JournalCategory);

    res.json({
      success: true,
      data: prompts,
      count: prompts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prompts',
    });
  }
});

// Link emotion to entry
router.post('/:id/emotions', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { emotionId } = req.body;

    if (!emotionId) {
      return res.status(400).json({
        success: false,
        error: 'Emotion ID is required',
      });
    }

    const entry = journalService.linkEmotion(id, userId, emotionId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found',
      });
    }

    res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to link emotion',
    });
  }
});

// Get entries by tag
router.get('/tags/:tag', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { tag } = req.params;

    const entries = journalService.getEntriesByTag(userId, tag);

    res.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch entries by tag',
    });
  }
});

export default router;
