import { JournalService, JournalMood, JournalCategory } from '../services/journal.service';

describe('JournalService', () => {
  let service: JournalService;
  const userId = 'test-user-123';

  beforeEach(() => {
    service = new JournalService();
  });

  describe('createEntry', () => {
    it('should create a journal entry', () => {
      const entry = service.createEntry(
        userId,
        'My Day',
        'Today was a great day!',
        JournalMood.POSITIVE,
        JournalCategory.PERSONAL,
        ['happy', 'productive']
      );

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.userId).toBe(userId);
      expect(entry.title).toBe('My Day');
      expect(entry.mood).toBe(JournalMood.POSITIVE);
      expect(entry.tags).toContain('happy');
    });

    it('should create private entry by default', () => {
      const entry = service.createEntry(
        userId,
        'Private Thoughts',
        'This is private',
        JournalMood.NEUTRAL,
        JournalCategory.REFLECTION
      );

      expect(entry.isPrivate).toBe(true);
    });
  });

  describe('getUserEntries', () => {
    beforeEach(() => {
      service.createEntry(
        userId,
        'Entry 1',
        'Content 1',
        JournalMood.POSITIVE,
        JournalCategory.PERSONAL
      );
      service.createEntry(
        userId,
        'Entry 2',
        'Content 2',
        JournalMood.NEGATIVE,
        JournalCategory.WORK
      );
    });

    it('should get all user entries', () => {
      const entries = service.getUserEntries(userId);
      expect(entries).toHaveLength(2);
    });

    it('should filter by category', () => {
      const entries = service.getUserEntries(userId, {
        category: JournalCategory.PERSONAL,
      });
      expect(entries).toHaveLength(1);
      expect(entries[0].category).toBe(JournalCategory.PERSONAL);
    });

    it('should filter by mood', () => {
      const entries = service.getUserEntries(userId, {
        mood: JournalMood.POSITIVE,
      });
      expect(entries).toHaveLength(1);
      expect(entries[0].mood).toBe(JournalMood.POSITIVE);
    });

    it('should limit results', () => {
      const entries = service.getUserEntries(userId, { limit: 1 });
      expect(entries).toHaveLength(1);
    });
  });

  describe('updateEntry', () => {
    it('should update an entry', () => {
      const entry = service.createEntry(
        userId,
        'Original',
        'Original content',
        JournalMood.NEUTRAL,
        JournalCategory.PERSONAL
      );

      const updated = service.updateEntry(entry.id, userId, {
        title: 'Updated',
        content: 'Updated content',
      });

      expect(updated).toBeDefined();
      expect(updated!.title).toBe('Updated');
      expect(updated!.content).toBe('Updated content');
    });

    it('should return null for non-existent entry', () => {
      const updated = service.updateEntry('non-existent', userId, {
        title: 'Test',
      });
      expect(updated).toBeNull();
    });

    it('should not allow updating other users entries', () => {
      const entry = service.createEntry(
        userId,
        'Original',
        'Original content',
        JournalMood.NEUTRAL,
        JournalCategory.PERSONAL
      );

      const updated = service.updateEntry(entry.id, 'different-user', {
        title: 'Hacked',
      });

      expect(updated).toBeNull();
    });
  });

  describe('deleteEntry', () => {
    it('should delete an entry', () => {
      const entry = service.createEntry(
        userId,
        'To Delete',
        'This will be deleted',
        JournalMood.NEUTRAL,
        JournalCategory.PERSONAL
      );

      const deleted = service.deleteEntry(entry.id, userId);
      expect(deleted).toBe(true);

      const retrieved = service.getEntry(entry.id, userId);
      expect(retrieved).toBeNull();
    });

    it('should not delete other users entries', () => {
      const entry = service.createEntry(
        userId,
        'Protected',
        'Protected content',
        JournalMood.NEUTRAL,
        JournalCategory.PERSONAL
      );

      const deleted = service.deleteEntry(entry.id, 'different-user');
      expect(deleted).toBe(false);
    });
  });

  describe('searchEntries', () => {
    beforeEach(() => {
      service.createEntry(
        userId,
        'Happy Day',
        'I am so happy today',
        JournalMood.POSITIVE,
        JournalCategory.PERSONAL,
        ['happy', 'joy']
      );
      service.createEntry(
        userId,
        'Work Meeting',
        'Had a productive meeting',
        JournalMood.NEUTRAL,
        JournalCategory.WORK
      );
    });

    it('should search by title', () => {
      const entries = service.searchEntries(userId, 'happy');
      expect(entries).toHaveLength(1);
      expect(entries[0].title).toContain('Happy');
    });

    it('should search by content', () => {
      const entries = service.searchEntries(userId, 'productive');
      expect(entries).toHaveLength(1);
    });

    it('should search by tags', () => {
      const entries = service.searchEntries(userId, 'joy');
      expect(entries).toHaveLength(1);
    });
  });

  describe('getUserStats', () => {
    it('should calculate user statistics', () => {
      service.createEntry(
        userId,
        'Entry 1',
        'Content 1',
        JournalMood.POSITIVE,
        JournalCategory.PERSONAL,
        ['tag1', 'tag2']
      );
      service.createEntry(
        userId,
        'Entry 2',
        'Content 2',
        JournalMood.POSITIVE,
        JournalCategory.GRATITUDE,
        ['tag1']
      );

      const stats = service.getUserStats(userId);

      expect(stats.totalEntries).toBe(2);
      expect(stats.entriesByMood[JournalMood.POSITIVE]).toBe(2);
      expect(stats.entriesByCategory[JournalCategory.PERSONAL]).toBe(1);
      expect(stats.mostUsedTags).toBeDefined();
      expect(stats.mostUsedTags[0].tag).toBe('tag1');
    });

    it('should return zero stats for user with no entries', () => {
      const stats = service.getUserStats('new-user');
      expect(stats.totalEntries).toBe(0);
    });
  });

  describe('getDailyPrompts', () => {
    it('should return daily prompts', () => {
      const prompts = service.getDailyPrompts(3);
      expect(prompts.length).toBeLessThanOrEqual(3);
      expect(prompts.length).toBeGreaterThan(0);
    });

    it('should return active prompts only', () => {
      const prompts = service.getDailyPrompts(10);
      prompts.forEach(prompt => {
        expect(prompt.active).toBe(true);
      });
    });
  });

  describe('getPromptsByCategory', () => {
    it('should get prompts by category', () => {
      const prompts = service.getPromptsByCategory(JournalCategory.GRATITUDE);
      expect(prompts.length).toBeGreaterThan(0);
      prompts.forEach(prompt => {
        expect(prompt.category).toBe(JournalCategory.GRATITUDE);
      });
    });
  });

  describe('validateEntryData', () => {
    it('should validate correct data', () => {
      const validation = service.validateEntryData({
        title: 'Valid Title',
        content: 'This is valid content with enough characters',
      });

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject short title', () => {
      const validation = service.validateEntryData({
        title: 'AB',
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Title must be at least 3 characters');
    });

    it('should reject long title', () => {
      const validation = service.validateEntryData({
        title: 'a'.repeat(201),
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Title must not exceed 200 characters');
    });

    it('should reject short content', () => {
      const validation = service.validateEntryData({
        content: 'short',
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Content must be at least 10 characters');
    });

    it('should reject long content', () => {
      const validation = service.validateEntryData({
        content: 'a'.repeat(10001),
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Content must not exceed 10000 characters');
    });
  });

  describe('linkEmotion', () => {
    it('should link emotion to entry', () => {
      const entry = service.createEntry(
        userId,
        'Test',
        'Test content here',
        JournalMood.NEUTRAL,
        JournalCategory.PERSONAL
      );

      const linked = service.linkEmotion(entry.id, userId, 'emotion-123');

      expect(linked).toBeDefined();
      expect(linked!.emotionIds).toContain('emotion-123');
    });

    it('should not duplicate emotion links', () => {
      const entry = service.createEntry(
        userId,
        'Test',
        'Test content here',
        JournalMood.NEUTRAL,
        JournalCategory.PERSONAL
      );

      service.linkEmotion(entry.id, userId, 'emotion-123');
      const linked = service.linkEmotion(entry.id, userId, 'emotion-123');

      expect(linked!.emotionIds!.filter(id => id === 'emotion-123')).toHaveLength(1);
    });
  });

  describe('getEntriesByTag', () => {
    it('should get entries by tag', () => {
      service.createEntry(
        userId,
        'Entry 1',
        'Content 1',
        JournalMood.POSITIVE,
        JournalCategory.PERSONAL,
        ['test-tag', 'another']
      );
      service.createEntry(
        userId,
        'Entry 2',
        'Content 2',
        JournalMood.POSITIVE,
        JournalCategory.WORK,
        ['test-tag']
      );

      const entries = service.getEntriesByTag(userId, 'test-tag');

      expect(entries).toHaveLength(2);
      entries.forEach(entry => {
        expect(entry.tags).toContain('test-tag');
      });
    });
  });
});
