import { GoalService, GoalStatus, GoalCategory } from '../services/goal.service';

describe('GoalService', () => {
  let service: GoalService;
  const userId = 'test-user-123';

  beforeEach(() => {
    service = new GoalService();
  });

  describe('createGoal', () => {
    it('should create a goal', () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      const goal = service.createGoal(
        userId,
        'Meditate daily',
        GoalCategory.MINDFULNESS,
        30,
        targetDate,
        'Practice meditation every day'
      );

      expect(goal).toBeDefined();
      expect(goal.id).toBeDefined();
      expect(goal.userId).toBe(userId);
      expect(goal.title).toBe('Meditate daily');
      expect(goal.status).toBe(GoalStatus.ACTIVE);
      expect(goal.currentValue).toBe(0);
    });
  });

  describe('getUserGoals', () => {
    beforeEach(() => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      service.createGoal(userId, 'Goal 1', GoalCategory.MINDFULNESS, 10, targetDate);
      service.createGoal(userId, 'Goal 2', GoalCategory.SELF_CARE, 20, targetDate);
    });

    it('should get all user goals', () => {
      const goals = service.getUserGoals(userId);
      expect(goals).toHaveLength(2);
    });

    it('should filter by status', () => {
      const activeGoals = service.getUserGoals(userId, GoalStatus.ACTIVE);
      expect(activeGoals).toHaveLength(2);
    });
  });

  describe('updateGoal', () => {
    it('should update a goal', () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      const goal = service.createGoal(
        userId,
        'Original Title',
        GoalCategory.MINDFULNESS,
        10,
        targetDate
      );

      const updated = service.updateGoal(goal.id, {
        title: 'Updated Title',
        description: 'New description',
      });

      expect(updated).toBeDefined();
      expect(updated!.title).toBe('Updated Title');
      expect(updated!.description).toBe('New description');
    });

    it('should return null for non-existent goal', () => {
      const updated = service.updateGoal('non-existent', { title: 'Test' });
      expect(updated).toBeNull();
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal', () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      const goal = service.createGoal(userId, 'Test', GoalCategory.MINDFULNESS, 10, targetDate);

      const deleted = service.deleteGoal(goal.id);
      expect(deleted).toBe(true);

      const retrieved = service.getGoal(goal.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('addProgress', () => {
    it('should add progress to a goal', () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      const goal = service.createGoal(userId, 'Test', GoalCategory.MINDFULNESS, 10, targetDate);

      const progress = service.addProgress(goal.id, 5, 'Made progress');

      expect(progress).toBeDefined();
      expect(progress!.value).toBe(5);

      const updated = service.getGoal(goal.id);
      expect(updated!.currentValue).toBe(5);
    });

    it('should auto-complete goal when target reached', () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      const goal = service.createGoal(userId, 'Test', GoalCategory.MINDFULNESS, 10, targetDate);

      service.addProgress(goal.id, 10);

      const updated = service.getGoal(goal.id);
      expect(updated!.status).toBe(GoalStatus.COMPLETED);
      expect(updated!.completedDate).toBeDefined();
    });
  });

  describe('getCompletionPercentage', () => {
    it('should calculate completion percentage', () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      const goal = service.createGoal(userId, 'Test', GoalCategory.MINDFULNESS, 100, targetDate);

      service.addProgress(goal.id, 25);

      const percentage = service.getCompletionPercentage(goal.id);
      expect(percentage).toBe(25);
    });

    it('should cap at 100%', () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      const goal = service.createGoal(userId, 'Test', GoalCategory.MINDFULNESS, 10, targetDate);

      service.addProgress(goal.id, 15);

      const percentage = service.getCompletionPercentage(goal.id);
      expect(percentage).toBe(100);
    });
  });

  describe('getGoalStats', () => {
    it('should calculate user statistics', () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      service.createGoal(userId, 'Goal 1', GoalCategory.MINDFULNESS, 10, targetDate);
      service.createGoal(userId, 'Goal 2', GoalCategory.SELF_CARE, 20, targetDate);

      const stats = service.getGoalStats(userId);

      expect(stats.total).toBe(2);
      expect(stats.active).toBe(2);
      expect(stats.completed).toBe(0);
    });
  });

  describe('pauseGoal', () => {
    it('should pause an active goal', () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      const goal = service.createGoal(userId, 'Test', GoalCategory.MINDFULNESS, 10, targetDate);

      const paused = service.pauseGoal(goal.id);

      expect(paused).toBeDefined();
      expect(paused!.status).toBe(GoalStatus.PAUSED);
    });
  });

  describe('resumeGoal', () => {
    it('should resume a paused goal', () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      const goal = service.createGoal(userId, 'Test', GoalCategory.MINDFULNESS, 10, targetDate);

      service.pauseGoal(goal.id);
      const resumed = service.resumeGoal(goal.id);

      expect(resumed).toBeDefined();
      expect(resumed!.status).toBe(GoalStatus.ACTIVE);
    });
  });

  describe('validateGoalData', () => {
    it('should validate correct data', () => {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 30);

      const validation = service.validateGoalData({
        title: 'Valid Title',
        targetValue: 10,
        targetDate,
      });

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject short title', () => {
      const validation = service.validateGoalData({
        title: 'AB',
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Title must be at least 3 characters');
    });

    it('should reject negative target value', () => {
      const validation = service.validateGoalData({
        targetValue: -5,
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Target value must be greater than 0');
    });

    it('should reject past target date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const validation = service.validateGoalData({
        targetDate: pastDate,
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Target date must be in the future');
    });
  });
});
