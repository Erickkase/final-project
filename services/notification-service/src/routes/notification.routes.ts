import { Router, Request, Response } from 'express';
import { NotificationService, NotificationType, NotificationChannel } from '../services/notification.service';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const notificationService = new NotificationService();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get user notifications
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const unreadOnly = req.query.unreadOnly === 'true';

    const notifications = notificationService.getUserNotifications(userId, unreadOnly);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
});

// Create notification
router.post('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { type, channel, title, message, data } = req.body;

    if (!type || !channel || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const notification = notificationService.createNotification(
      userId,
      type as NotificationType,
      channel as NotificationChannel,
      title,
      message,
      data
    );

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create notification',
    });
  }
});

// Get unread count
router.get('/unread/count', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const count = notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count',
    });
  }
});

// Mark notification as read
router.patch('/:id/read', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const notification = notificationService.markAsRead(userId, id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
    });
  }
});

// Mark all as read
router.patch('/read/all', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const count = notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: `Marked ${count} notifications as read`,
      count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to mark all as read',
    });
  }
});

// Delete notification
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const deleted = notificationService.deleteNotification(userId, id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
    });
  }
});

// Get preferences
router.get('/preferences', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const preferences = notificationService.getPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get preferences',
    });
  }
});

// Update preferences
router.put('/preferences', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const preferences = notificationService.setPreferences({
      userId,
      ...req.body,
    });

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
    });
  }
});

export default router;
