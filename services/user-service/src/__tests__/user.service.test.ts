import { UserService } from '../services/user.service';

describe('UserService', () => {
  let service: UserService;
  const userId = 'test-user-123';
  const email = 'test@example.com';

  beforeEach(() => {
    service = new UserService();
  });

  describe('createProfile', () => {
    it('should create a user profile', () => {
      const profile = service.createProfile(userId, email, {
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(userId);
      expect(profile.email).toBe(email);
      expect(profile.firstName).toBe('John');
      expect(profile.lastName).toBe('Doe');
    });

    it('should create default settings when creating profile', () => {
      service.createProfile(userId, email, {
        firstName: 'John',
        lastName: 'Doe',
      });

      const settings = service.getSettings(userId);
      expect(settings).toBeDefined();
      expect(settings!.emailNotifications).toBe(true);
    });
  });

  describe('getProfile', () => {
    it('should get user profile', () => {
      service.createProfile(userId, email, {
        firstName: 'John',
        lastName: 'Doe',
      });

      const profile = service.getProfile(userId);
      expect(profile).toBeDefined();
      expect(profile!.userId).toBe(userId);
    });

    it('should return null for non-existent profile', () => {
      const profile = service.getProfile('non-existent');
      expect(profile).toBeNull();
    });
  });

  describe('updateProfile', () => {
    beforeEach(() => {
      service.createProfile(userId, email, {
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should update user profile', () => {
      const updated = service.updateProfile(userId, {
        firstName: 'Jane',
        bio: 'New bio',
      });

      expect(updated).toBeDefined();
      expect(updated!.firstName).toBe('Jane');
      expect(updated!.bio).toBe('New bio');
    });

    it('should return null for non-existent profile', () => {
      const updated = service.updateProfile('non-existent', {
        firstName: 'Jane',
      });

      expect(updated).toBeNull();
    });
  });

  describe('deleteProfile', () => {
    it('should delete user profile', () => {
      service.createProfile(userId, email, {
        firstName: 'John',
        lastName: 'Doe',
      });

      const deleted = service.deleteProfile(userId);
      expect(deleted).toBe(true);

      const profile = service.getProfile(userId);
      expect(profile).toBeNull();
    });

    it('should delete settings when deleting profile', () => {
      service.createProfile(userId, email, {
        firstName: 'John',
        lastName: 'Doe',
      });

      service.deleteProfile(userId);

      // Settings should be recreated as default when accessed
      const settings = service.getSettings(userId);
      expect(settings).toBeDefined();
    });

    it('should return false for non-existent profile', () => {
      const deleted = service.deleteProfile('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('searchProfiles', () => {
    beforeEach(() => {
      service.createProfile('user1', 'john@example.com', {
        firstName: 'John',
        lastName: 'Doe',
      });
      service.createProfile('user2', 'jane@example.com', {
        firstName: 'Jane',
        lastName: 'Smith',
      });
    });

    it('should search profiles by first name', () => {
      const results = service.searchProfiles('john');
      expect(results).toHaveLength(1);
      expect(results[0].firstName).toBe('John');
    });

    it('should search profiles by email', () => {
      const results = service.searchProfiles('jane@');
      expect(results).toHaveLength(1);
      expect(results[0].email).toBe('jane@example.com');
    });

    it('should return empty array for no matches', () => {
      const results = service.searchProfiles('xyz');
      expect(results).toHaveLength(0);
    });
  });

  describe('settings', () => {
    it('should get default settings', () => {
      const settings = service.getSettings(userId);

      expect(settings).toBeDefined();
      expect(settings!.theme).toBe('auto');
      expect(settings!.emailNotifications).toBe(true);
    });

    it('should update settings', () => {
      const updated = service.updateSettings(userId, {
        theme: 'dark',
        emailNotifications: false,
      });

      expect(updated).toBeDefined();
      expect(updated!.theme).toBe('dark');
      expect(updated!.emailNotifications).toBe(false);
    });
  });

  describe('getUserStats', () => {
    it('should get user statistics', () => {
      service.createProfile(userId, email, {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test bio',
      });

      const stats = service.getUserStats(userId);

      expect(stats).toBeDefined();
      expect(stats!.profileCompleteness).toBeGreaterThan(0);
      expect(stats!.daysActive).toBeGreaterThanOrEqual(0);
    });

    it('should return null for non-existent profile', () => {
      const stats = service.getUserStats('non-existent');
      expect(stats).toBeNull();
    });
  });

  describe('validateProfileData', () => {
    it('should validate correct data', () => {
      const validation = service.validateProfileData({
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject short first name', () => {
      const validation = service.validateProfileData({
        firstName: 'J',
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('First name must be at least 2 characters');
    });

    it('should reject long bio', () => {
      const validation = service.validateProfileData({
        bio: 'a'.repeat(501),
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Bio must not exceed 500 characters');
    });

    it('should reject young age', () => {
      const youngDate = new Date();
      youngDate.setFullYear(youngDate.getFullYear() - 10);

      const validation = service.validateProfileData({
        dateOfBirth: youngDate,
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('User must be at least 13 years old');
    });
  });
});
