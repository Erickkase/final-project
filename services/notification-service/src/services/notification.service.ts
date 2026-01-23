import { v4 as uuidv4 } from 'uuid';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  REMINDER = 'reminder',
  EMOTION_INSIGHT = 'emotion_insight',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  sent: boolean;
  createdAt: Date;
  readAt?: Date;
  sentAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  frequency: 'realtime' | 'daily' | 'weekly';
}

export class NotificationService {
  private notifications: Map<string, Notification[]> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();

  // Create notification
  createNotification(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Notification {
    const notification: Notification = {
      id: uuidv4(),
      userId,
      type,
      channel,
      title,
      message,
      data,
      read: false,
      sent: false,
      createdAt: new Date(),
    };

    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.push(notification);
    this.notifications.set(userId, userNotifications);

    return notification;
  }

  // Get user notifications
  getUserNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    const userNotifications = this.notifications.get(userId) || [];
    
    if (unreadOnly) {
      return userNotifications.filter(n => !n.read);
    }
    
    return userNotifications.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Mark notification as read
  markAsRead(userId: string, notificationId: string): Notification | null {
    const userNotifications = this.notifications.get(userId);
    
    if (!userNotifications) {
      return null;
    }

    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return null;
    }

    notification.read = true;
    notification.readAt = new Date();

    return notification;
  }

  // Mark all as read
  markAllAsRead(userId: string): number {
    const userNotifications = this.notifications.get(userId);
    
    if (!userNotifications) {
      return 0;
    }

    let count = 0;
    const now = new Date();

    userNotifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        notification.readAt = now;
        count++;
      }
    });

    return count;
  }

  // Delete notification
  deleteNotification(userId: string, notificationId: string): boolean {
    const userNotifications = this.notifications.get(userId);
    
    if (!userNotifications) {
      return false;
    }

    const index = userNotifications.findIndex(n => n.id === notificationId);
    
    if (index === -1) {
      return false;
    }

    userNotifications.splice(index, 1);
    return true;
  }

  // Get unread count
  getUnreadCount(userId: string): number {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter(n => !n.read).length;
  }

  // Set user preferences
  setPreferences(preferences: NotificationPreferences): NotificationPreferences {
    this.preferences.set(preferences.userId, preferences);
    return preferences;
  }

  // Get user preferences
  getPreferences(userId: string): NotificationPreferences {
    return this.preferences.get(userId) || {
      userId,
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false,
      frequency: 'realtime',
    };
  }

  // Send notification (marks as sent)
  async sendNotification(userId: string, notificationId: string): Promise<boolean> {
    const userNotifications = this.notifications.get(userId);
    
    if (!userNotifications) {
      return false;
    }

    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return false;
    }

    // Simulate sending (in real implementation, call email/push service)
    notification.sent = true;
    notification.sentAt = new Date();

    return true;
  }

  // Batch send notifications
  async sendBatchNotifications(userId: string): Promise<number> {
    const userNotifications = this.notifications.get(userId);
    
    if (!userNotifications) {
      return 0;
    }

    const unsent = userNotifications.filter(n => !n.sent);
    const now = new Date();

    unsent.forEach(notification => {
      notification.sent = true;
      notification.sentAt = now;
    });

    return unsent.length;
  }

  // Clear old notifications
  clearOldNotifications(userId: string, daysOld: number = 30): number {
    const userNotifications = this.notifications.get(userId);
    
    if (!userNotifications) {
      return 0;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const initialLength = userNotifications.length;
    const filtered = userNotifications.filter(
      n => n.createdAt.getTime() > cutoffDate.getTime()
    );

    this.notifications.set(userId, filtered);

    return initialLength - filtered.length;
  }
}
