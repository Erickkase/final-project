import { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userService = new UserService();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get current user profile
router.get('/me', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const profile = userService.getProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
    });
  }
});

// Create user profile
router.post('/profile', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const email = (req as any).email;

    // Check if profile already exists
    const existing = userService.getProfile(userId);
    
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Profile already exists',
      });
    }

    // Validate data
    const validation = userService.validateProfileData(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    const profile = userService.createProfile(userId, email, req.body);

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create profile',
    });
  }
});

// Update user profile
router.put('/profile', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Validate data
    const validation = userService.validateProfileData(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors,
      });
    }

    const profile = userService.updateProfile(userId, req.body);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
});

// Delete user profile
router.delete('/profile', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const deleted = userService.deleteProfile(userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete profile',
    });
  }
});

// Get user settings
router.get('/settings', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const settings = userService.getSettings(userId);

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
    });
  }
});

// Update user settings
router.put('/settings', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const settings = userService.updateSettings(userId, req.body);

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update settings',
    });
  }
});

// Get user statistics
router.get('/stats', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const stats = userService.getUserStats(userId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

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

// Search users (public profiles only)
router.get('/search', (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query must be at least 2 characters',
      });
    }

    const profiles = userService.searchProfiles(query);

    res.json({
      success: true,
      data: profiles,
      count: profiles.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search profiles',
    });
  }
});

export default router;
