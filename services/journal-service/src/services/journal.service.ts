import { v4 as uuidv4 } from 'uuid';

export enum JournalMood {
  VERY_NEGATIVE = 'very_negative',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  POSITIVE = 'positive',
  VERY_POSITIVE = 'very_positive',
}

export enum JournalCategory {
  PERSONAL = 'personal',
  WORK = 'work',
  RELATIONSHIPS = 'relationships',
  HEALTH = 'health',
  GRATITUDE = 'gratitude',
  REFLECTION = 'reflection',
  GOALS = 'goals',
  CHALLENGES = 'challenges',
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: JournalMood;
  category: JournalCategory;
  tags: string[];
  isPrivate: boolean;
  emotionIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalPrompt {
  id: string;
  prompt: string;
  category: JournalCategory;
  active: boolean;
}

export class JournalService {
  private entries: Map<string, JournalEntry> = new Map();
  private prompts: JournalPrompt[] = [
    {
      id: '1',
      prompt: '¿Qué te hizo sentir agradecido hoy?',
      category: JournalCategory.GRATITUDE,
      active: true,
    },
    {
      id: '2',
      prompt: '¿Cuál fue tu mayor desafío hoy y cómo lo manejaste?',
      category: JournalCategory.CHALLENGES,
      active: true,
    },
    {
      id: '3',
      prompt: '¿Qué aprendiste sobre ti mismo esta semana?',
      category: JournalCategory.REFLECTION,
      active: true,
    },
    {
      id: '4',
      prompt: '¿Cómo te sientes acerca de tus relaciones actuales?',
      category: JournalCategory.RELATIONSHIPS,
      active: true,
    },
    {
      id: '5',
      prompt: '¿Qué progreso hiciste hacia tus objetivos?',
      category: JournalCategory.GOALS,
      active: true,
    },
  ];

  // Create journal entry
  createEntry(
    userId: string,
    title: string,
    content: string,
    mood: JournalMood,
    category: JournalCategory,
    tags: string[] = [],
    isPrivate: boolean = true
  ): JournalEntry {
    const entry: JournalEntry = {
      id: uuidv4(),
      userId,
      title,
      content,
      mood,
      category,
      tags,
      isPrivate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.entries.set(entry.id, entry);

    return entry;
  }

  // Get entry by ID
  getEntry(entryId: string, userId: string): JournalEntry | null {
    const entry = this.entries.get(entryId);

    if (!entry || entry.userId !== userId) {
      return null;
    }

    return entry;
  }

  // Get user entries
  getUserEntries(
    userId: string,
    options?: {
      category?: JournalCategory;
      mood?: JournalMood;
      tags?: string[];
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): JournalEntry[] {
    let entries = Array.from(this.entries.values()).filter(
      entry => entry.userId === userId
    );

    if (options?.category) {
      entries = entries.filter(entry => entry.category === options.category);
    }

    if (options?.mood) {
      entries = entries.filter(entry => entry.mood === options.mood);
    }

    if (options?.tags && options.tags.length > 0) {
      entries = entries.filter(entry =>
        options.tags!.some(tag => entry.tags.includes(tag))
      );
    }

    if (options?.startDate) {
      entries = entries.filter(
        entry => entry.createdAt >= options.startDate!
      );
    }

    if (options?.endDate) {
      entries = entries.filter(
        entry => entry.createdAt <= options.endDate!
      );
    }

    entries = entries.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    if (options?.limit) {
      entries = entries.slice(0, options.limit);
    }

    return entries;
  }

  // Update entry
  updateEntry(
    entryId: string,
    userId: string,
    updates: Partial<Omit<JournalEntry, 'id' | 'userId' | 'createdAt'>>
  ): JournalEntry | null {
    const entry = this.entries.get(entryId);

    if (!entry || entry.userId !== userId) {
      return null;
    }

    const updated: JournalEntry = {
      ...entry,
      ...updates,
      updatedAt: new Date(),
    };

    this.entries.set(entryId, updated);

    return updated;
  }

  // Delete entry
  deleteEntry(entryId: string, userId: string): boolean {
    const entry = this.entries.get(entryId);

    if (!entry || entry.userId !== userId) {
      return false;
    }

    return this.entries.delete(entryId);
  }

  // Search entries
  searchEntries(userId: string, query: string): JournalEntry[] {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.entries.values())
      .filter(entry => entry.userId === userId)
      .filter(
        entry =>
          entry.title.toLowerCase().includes(lowerQuery) ||
          entry.content.toLowerCase().includes(lowerQuery) ||
          entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get entries by date range
  getEntriesByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): JournalEntry[] {
    return this.getUserEntries(userId, { startDate, endDate });
  }

  // Get user statistics
  getUserStats(userId: string): {
    totalEntries: number;
    entriesByMood: Record<JournalMood, number>;
    entriesByCategory: Record<JournalCategory, number>;
    averageEntriesPerWeek: number;
    longestStreak: number;
    currentStreak: number;
    mostUsedTags: { tag: string; count: number }[];
  } {
    const entries = this.getUserEntries(userId);

    const stats = {
      totalEntries: entries.length,
      entriesByMood: {} as Record<JournalMood, number>,
      entriesByCategory: {} as Record<JournalCategory, number>,
      averageEntriesPerWeek: 0,
      longestStreak: 0,
      currentStreak: 0,
      mostUsedTags: [] as { tag: string; count: number }[],
    };

    // Initialize counters
    Object.values(JournalMood).forEach(mood => {
      stats.entriesByMood[mood] = 0;
    });

    Object.values(JournalCategory).forEach(category => {
      stats.entriesByCategory[category] = 0;
    });

    // Count by mood and category
    entries.forEach(entry => {
      stats.entriesByMood[entry.mood]++;
      stats.entriesByCategory[entry.category]++;
    });

    // Calculate streaks
    if (entries.length > 0) {
      const sortedEntries = entries.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );

      let currentStreak = 1;
      let longestStreak = 1;
      let tempStreak = 1;

      for (let i = 1; i < sortedEntries.length; i++) {
        const prevDate = new Date(sortedEntries[i - 1].createdAt);
        const currDate = new Date(sortedEntries[i].createdAt);

        prevDate.setHours(0, 0, 0, 0);
        currDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }

      // Calculate current streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastEntry = new Date(sortedEntries[sortedEntries.length - 1].createdAt);
      lastEntry.setHours(0, 0, 0, 0);

      const daysSinceLastEntry = Math.floor(
        (today.getTime() - lastEntry.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastEntry <= 1) {
        currentStreak = tempStreak;
      }

      stats.longestStreak = longestStreak;
      stats.currentStreak = currentStreak;

      // Calculate average entries per week
      const firstEntry = sortedEntries[0].createdAt;
      const lastEntryDate = sortedEntries[sortedEntries.length - 1].createdAt;
      const weeksDiff = Math.max(
        1,
        (lastEntryDate.getTime() - firstEntry.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      stats.averageEntriesPerWeek = Math.round(
        (entries.length / weeksDiff) * 10
      ) / 10;
    }

    // Count tags
    const tagCounts = new Map<string, number>();
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    stats.mostUsedTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  // Get daily prompts
  getDailyPrompts(count: number = 3): JournalPrompt[] {
    const activePrompts = this.prompts.filter(p => p.active);
    
    // Shuffle and return requested count
    const shuffled = activePrompts.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Get prompt by category
  getPromptsByCategory(category: JournalCategory): JournalPrompt[] {
    return this.prompts.filter(
      p => p.active && p.category === category
    );
  }

  // Validate entry data
  validateEntryData(data: {
    title?: string;
    content?: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.title !== undefined && data.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }

    if (data.title !== undefined && data.title.length > 200) {
      errors.push('Title must not exceed 200 characters');
    }

    if (data.content !== undefined && data.content.length < 10) {
      errors.push('Content must be at least 10 characters');
    }

    if (data.content !== undefined && data.content.length > 10000) {
      errors.push('Content must not exceed 10000 characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Link emotion to entry
  linkEmotion(entryId: string, userId: string, emotionId: string): JournalEntry | null {
    const entry = this.entries.get(entryId);

    if (!entry || entry.userId !== userId) {
      return null;
    }

    if (!entry.emotionIds) {
      entry.emotionIds = [];
    }

    if (!entry.emotionIds.includes(emotionId)) {
      entry.emotionIds.push(emotionId);
      entry.updatedAt = new Date();
      this.entries.set(entryId, entry);
    }

    return entry;
  }

  // Get entries by tag
  getEntriesByTag(userId: string, tag: string): JournalEntry[] {
    return Array.from(this.entries.values())
      .filter(entry => entry.userId === userId && entry.tags.includes(tag))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
