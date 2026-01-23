import { NotificationService, NotificationType, NotificationChannel } from '../services/notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  const userId = 'test-user-123';

  beforeEach(() => {
    service = new NotificationService();
  });

  describe('createNotification', () => {
    it('should create a notification', () => {
      const notification = service.createNotification(
        userId,
        NotificationType.INFO,
        NotificationChannel.IN_APP,
        'Test Title',
        'Test Message'
      );

      expect(notification).toBeDefined();
      expect(notification.id).toBeDefined();
      expect(notification.userId).toBe(userId);
      expect(notification.type).toBe(NotificationType.INFO);
      expect(notification.title).toBe('Test Title');
      expect(notification.read).toBe(false);
    });

    it('should create notification with data', () => {
      const data = { emotionId: '123', intensity: 5 };
      const notification = service.createNotification(
        userId,
        NotificationType.EMOTION_INSIGHT,
        NotificationChannel.IN_APP,
        'Emotion Update',
        'Your emotion was logged',
        data
      );

      expect(notification.data).toEqual(data);
    });
  });

  describe('getUserNotifications', () => {
    beforeEach(() => {
      service.createNotification(
        userId,
        NotificationType.INFO,
        NotificationChannel.IN_APP,
        'Test 1',
        'Message 1'
      );
      service.createNotification(
        userId,
        NotificationType.SUCCESS,
        NotificationChannel.EMAIL,
        'Test 2',
        'Message 2'
      );
    });

    it('should get all user notifications', () => {
      const notifications = service.getUserNotifications(userId);
      expect(notifications).toHaveLength(2);
    });

    it('should filter unread notifications', () => {
      const allNotifications = service.getUserNotifications(userId);
      service.markAsRead(userId, allNotifications[0].id);

      const unread = service.getUserNotifications(userId, true);
      expect(unread).toHaveLength(1);
    });

    it('should return empty array for non-existent user', () => {
      const notifications = service.getUserNotifications('non-existent');
      expect(notifications).toHaveLength(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const notification = service.createNotification(
        userId,
        NotificationType.INFO,
        NotificationChannel.IN_APP,
        'Test',
        'Message'
      );

      const updated = service.markAsRead(userId, notification.id);

      expect(updated).toBeDefined();
      expect(updated!.read).toBe(true);
      expect(updated!.readAt).toBeDefined();
    });

    it('should return null for non-existent notification', () => {
      const result = service.markAsRead(userId, 'non-existent');
      expect(result).toBeNull();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', () => {
      service.createNotification(userId, NotificationType.INFO, NotificationChannel.IN_APP, 'T1', 'M1');
      service.createNotification(userId, NotificationType.INFO, NotificationChannel.IN_APP, 'T2', 'M2');
      service.createNotification(userId, NotificationType.INFO, NotificationChannel.IN_APP, 'T3', 'M3');

      const count = service.markAllAsRead(userId);

      expect(count).toBe(3);
      const unread = service.getUserNotifications(userId, true);
      expect(unread).toHaveLength(0);
    });

    it('should return 0 for non-existent user', () => {
      const count = service.markAllAsRead('non-existent');
      expect(count).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', () => {
      const notification = service.createNotification(
        userId,
        NotificationType.INFO,
        NotificationChannel.IN_APP,
        'Test',
        'Message'
      );

      const deleted = service.deleteNotification(userId, notification.id);

      expect(deleted).toBe(true);
      const notifications = service.getUserNotifications(userId);
      expect(notifications).toHaveLength(0);
    });

    it('should return false for non-existent notification', () => {
      const deleted = service.deleteNotification(userId, 'non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('getUnreadCount', () => {
    it('should return correct unread count', () => {
      service.createNotification(userId, NotificationType.INFO, NotificationChannel.IN_APP, 'T1', 'M1');
      service.createNotification(userId, NotificationType.INFO, NotificationChannel.IN_APP, 'T2', 'M2');

      let count = service.getUnreadCount(userId);
      expect(count).toBe(2);

      const notifications = service.getUserNotifications(userId);
      service.markAsRead(userId, notifications[0].id);

      count = service.getUnreadCount(userId);
      expect(count).toBe(1);
    });

    it('should return 0 for user with no notifications', () => {
      const count = service.getUnreadCount('non-existent');
      expect(count).toBe(0);
    });
  });

  describe('preferences', () => {
    it('should set and get preferences', () => {
      const preferences = {
        userId,
        emailEnabled: true,
        pushEnabled: false,
        smsEnabled: false,
        frequency: 'daily' as const,
      };

      const saved = service.setPreferences(preferences);
      expect(saved).toEqual(preferences);

      const retrieved = service.getPreferences(userId);
      expect(retrieved).toEqual(preferences);
    });

    it('should return default preferences for new user', () => {
      const preferences = service.getPreferences('new-user');

      expect(preferences.userId).toBe('new-user');
      expect(preferences.emailEnabled).toBe(true);
      expect(preferences.pushEnabled).toBe(true);
      expect(preferences.frequency).toBe('realtime');
    });
  });

  describe('sendNotification', () => {
    it('should mark notification as sent', async () => {
      const notification = service.createNotification(
        userId,
        NotificationType.INFO,
        NotificationChannel.EMAIL,
        'Test',
        'Message'
      );

      const sent = await service.sendNotification(userId, notification.id);

      expect(sent).toBe(true);

      const notifications = service.getUserNotifications(userId);
      const sentNotification = notifications.find(n => n.id === notification.id);
      expect(sentNotification!.sent).toBe(true);
      expect(sentNotification!.sentAt).toBeDefined();
    });

    it('should return false for non-existent notification', async () => {
      const sent = await service.sendNotification(userId, 'non-existent');
      expect(sent).toBe(false);
    });
  });

  describe('clearOldNotifications', () => {
    it('should clear notifications older than specified days', () => {
      const notification = service.createNotification(
        userId,
        NotificationType.INFO,
        NotificationChannel.IN_APP,
        'Test',
        'Message'
      );

      // Manually set old date
      notification.createdAt = new Date('2020-01-01');

      const cleared = service.clearOldNotifications(userId, 30);

      expect(cleared).toBe(1);
      const notifications = service.getUserNotifications(userId);
      expect(notifications).toHaveLength(0);
    });
  });
});
