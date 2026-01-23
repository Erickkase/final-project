import { v4 as uuidv4 } from 'uuid';

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

export enum GoalCategory {
  EMOTIONAL_BALANCE = 'emotional_balance',
  STRESS_REDUCTION = 'stress_reduction',
  POSITIVE_MINDSET = 'positive_mindset',
  SELF_CARE = 'self_care',
  SOCIAL_CONNECTION = 'social_connection',
  PHYSICAL_WELLNESS = 'physical_wellness',
  MINDFULNESS = 'mindfulness',
  SLEEP_IMPROVEMENT = 'sleep_improvement',
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: GoalStatus;
  startDate: Date;
  targetDate: Date;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalProgress {
  goalId: string;
  date: Date;
  value: number;
  note?: string;
}

export class GoalService {
  private goals: Map<string, Goal> = new Map();
  private progress: Map<string, GoalProgress[]> = new Map();

  // Create goal
  createGoal(
    userId: string,
    title: string,
    category: GoalCategory,
    targetValue: number,
    targetDate: Date,
    description?: string,
    unit: string = 'count'
  ): Goal {
    const goal: Goal = {
      id: uuidv4(),
      userId,
      title,
      description,
      category,
      targetValue,
      currentValue: 0,
      unit,
      status: GoalStatus.ACTIVE,
      startDate: new Date(),
      targetDate: new Date(targetDate),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.goals.set(goal.id, goal);
    this.progress.set(goal.id, []);

    return goal;
  }

  // Get goal by ID
  getGoal(goalId: string): Goal | null {
    return this.goals.get(goalId) || null;
  }

  // Get user goals
  getUserGoals(userId: string, status?: GoalStatus): Goal[] {
    const userGoals = Array.from(this.goals.values()).filter(
      goal => goal.userId === userId
    );

    if (status) {
      return userGoals.filter(goal => goal.status === status);
    }

    return userGoals.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // Update goal
  updateGoal(
    goalId: string,
    updates: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>
  ): Goal | null {
    const goal = this.goals.get(goalId);

    if (!goal) {
      return null;
    }

    const updated: Goal = {
      ...goal,
      ...updates,
      updatedAt: new Date(),
    };

    this.goals.set(goalId, updated);

    return updated;
  }

  // Delete goal
  deleteGoal(goalId: string): boolean {
    const deleted = this.goals.delete(goalId);
    
    if (deleted) {
      this.progress.delete(goalId);
    }

    return deleted;
  }

  // Add progress
  addProgress(goalId: string, value: number, note?: string): GoalProgress | null {
    const goal = this.goals.get(goalId);

    if (!goal) {
      return null;
    }

    const progressEntry: GoalProgress = {
      goalId,
      date: new Date(),
      value,
      note,
    };

    const goalProgress = this.progress.get(goalId) || [];
    goalProgress.push(progressEntry);
    this.progress.set(goalId, goalProgress);

    // Update current value
    goal.currentValue += value;

    // Check if goal is completed
    if (goal.currentValue >= goal.targetValue && goal.status === GoalStatus.ACTIVE) {
      goal.status = GoalStatus.COMPLETED;
      goal.completedDate = new Date();
    }

    goal.updatedAt = new Date();
    this.goals.set(goalId, goal);

    return progressEntry;
  }

  // Get goal progress
  getGoalProgress(goalId: string): GoalProgress[] {
    return this.progress.get(goalId) || [];
  }

  // Calculate completion percentage
  getCompletionPercentage(goalId: string): number {
    const goal = this.goals.get(goalId);

    if (!goal) {
      return 0;
    }

    const percentage = (goal.currentValue / goal.targetValue) * 100;
    return Math.min(100, Math.max(0, Math.round(percentage)));
  }

  // Get goal statistics
  getGoalStats(userId: string): {
    total: number;
    active: number;
    completed: number;
    paused: number;
    cancelled: number;
    completionRate: number;
    averageProgress: number;
  } {
    const userGoals = this.getUserGoals(userId);

    const stats = {
      total: userGoals.length,
      active: userGoals.filter(g => g.status === GoalStatus.ACTIVE).length,
      completed: userGoals.filter(g => g.status === GoalStatus.COMPLETED).length,
      paused: userGoals.filter(g => g.status === GoalStatus.PAUSED).length,
      cancelled: userGoals.filter(g => g.status === GoalStatus.CANCELLED).length,
      completionRate: 0,
      averageProgress: 0,
    };

    if (stats.total > 0) {
      stats.completionRate = Math.round((stats.completed / stats.total) * 100);

      const totalProgress = userGoals.reduce((sum, goal) => {
        return sum + this.getCompletionPercentage(goal.id);
      }, 0);

      stats.averageProgress = Math.round(totalProgress / stats.total);
    }

    return stats;
  }

  // Get goals by category
  getGoalsByCategory(userId: string, category: GoalCategory): Goal[] {
    return this.getUserGoals(userId).filter(goal => goal.category === category);
  }

  // Get overdue goals
  getOverdueGoals(userId: string): Goal[] {
    const now = new Date();
    
    return this.getUserGoals(userId, GoalStatus.ACTIVE).filter(
      goal => new Date(goal.targetDate) < now
    );
  }

  // Pause goal
  pauseGoal(goalId: string): Goal | null {
    const goal = this.goals.get(goalId);

    if (!goal || goal.status !== GoalStatus.ACTIVE) {
      return null;
    }

    goal.status = GoalStatus.PAUSED;
    goal.updatedAt = new Date();

    this.goals.set(goalId, goal);

    return goal;
  }

  // Resume goal
  resumeGoal(goalId: string): Goal | null {
    const goal = this.goals.get(goalId);

    if (!goal || goal.status !== GoalStatus.PAUSED) {
      return null;
    }

    goal.status = GoalStatus.ACTIVE;
    goal.updatedAt = new Date();

    this.goals.set(goalId, goal);

    return goal;
  }

  // Complete goal manually
  completeGoal(goalId: string): Goal | null {
    const goal = this.goals.get(goalId);

    if (!goal || goal.status === GoalStatus.COMPLETED) {
      return null;
    }

    goal.status = GoalStatus.COMPLETED;
    goal.completedDate = new Date();
    goal.updatedAt = new Date();

    this.goals.set(goalId, goal);

    return goal;
  }

  // Cancel goal
  cancelGoal(goalId: string): Goal | null {
    const goal = this.goals.get(goalId);

    if (!goal || goal.status === GoalStatus.COMPLETED) {
      return null;
    }

    goal.status = GoalStatus.CANCELLED;
    goal.updatedAt = new Date();

    this.goals.set(goalId, goal);

    return goal;
  }

  // Get days remaining
  getDaysRemaining(goalId: string): number {
    const goal = this.goals.get(goalId);

    if (!goal) {
      return 0;
    }

    const now = new Date();
    const target = new Date(goal.targetDate);
    const diff = target.getTime() - now.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Validate goal data
  validateGoalData(data: {
    title?: string;
    targetValue?: number;
    targetDate?: Date;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.title !== undefined && data.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }

    if (data.targetValue !== undefined && data.targetValue <= 0) {
      errors.push('Target value must be greater than 0');
    }

    if (data.targetDate !== undefined) {
      const target = new Date(data.targetDate);
      const now = new Date();
      
      if (target <= now) {
        errors.push('Target date must be in the future');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
