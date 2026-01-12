import emotionService from '../services/emotion.service';

describe('Emotion Service', () => {
  const testUserId = 'test-user-123';
  const testEmotion = {
    userId: testUserId,
    type: 'alegria',
    intensity: 8,
    description: 'Test emotion',
    tags: ['test'],
  };

  it('should create an emotion', () => {
    const emotion = emotionService.createEmotion(testUserId, testEmotion);
    expect(emotion).toBeDefined();
    expect(emotion.emotionId).toBeDefined();
    expect(emotion.type).toBe('alegria');
    expect(emotion.intensity).toBe(8);
  });

  it('should get emotion by ID', () => {
    const created = emotionService.createEmotion(testUserId, testEmotion);
    const retrieved = emotionService.getEmotionById(created.emotionId);
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.emotionId).toBe(created.emotionId);
    expect(retrieved?.userId).toBe(testUserId);
  });

  it('should return null for non-existent emotion', () => {
    const emotion = emotionService.getEmotionById('non-existent-id');
    expect(emotion).toBeNull();
  });

  it('should get emotions by user', () => {
    const emotion1 = emotionService.createEmotion(testUserId, testEmotion);
    const emotion2 = emotionService.createEmotion(testUserId, {
      ...testEmotion,
      type: 'tristeza',
    });

    const emotions = emotionService.getEmotionsByUser(testUserId);
    expect(emotions.length).toBeGreaterThanOrEqual(2);
    expect(emotions.some((e: any) => e.emotionId === emotion1.emotionId)).toBe(true);
  });

  it('should update an emotion', () => {
    const created = emotionService.createEmotion(testUserId, testEmotion);
    const updated = emotionService.updateEmotion(created.emotionId, testUserId, {
      intensity: 5,
      description: 'Updated emotion',
    });

    expect(updated).toBeDefined();
    expect(updated?.intensity).toBe(5);
    expect(updated?.description).toBe('Updated emotion');
  });

  it('should delete an emotion', () => {
    const created = emotionService.createEmotion(testUserId, testEmotion);
    const deleted = emotionService.deleteEmotion(created.emotionId, testUserId);
    
    expect(deleted).toBe(true);
    const retrieved = emotionService.getEmotionById(created.emotionId);
    expect(retrieved).toBeNull();
  });

  it('should get emotion stats', () => {
    emotionService.createEmotion(testUserId, { ...testEmotion, type: 'alegria' });
    emotionService.createEmotion(testUserId, { ...testEmotion, type: 'alegria' });
    emotionService.createEmotion(testUserId, { ...testEmotion, type: 'tristeza' });

    const stats = emotionService.getEmotionStats(testUserId);
    expect(stats['alegria']).toBeGreaterThanOrEqual(2);
    expect(stats['tristeza']).toBeGreaterThanOrEqual(1);
  });

  it('should calculate average intensity', () => {
    emotionService.createEmotion(testUserId, { ...testEmotion, intensity: 10 });
    emotionService.createEmotion(testUserId, { ...testEmotion, intensity: 5 });

    const avg = emotionService.getAverageIntensity(testUserId);
    expect(avg).toBeGreaterThan(0);
  });

  it('should return 0 for user with no emotions', () => {
    const avg = emotionService.getAverageIntensity('user-no-emotions');
    expect(avg).toBe(0);
  });

  it('should get most frequent emotion', () => {
    const userId = 'freq-test-user';
    emotionService.createEmotion(userId, { ...testEmotion, type: 'alegria' });
    emotionService.createEmotion(userId, { ...testEmotion, type: 'alegria' });
    emotionService.createEmotion(userId, { ...testEmotion, type: 'tristeza' });

    const most = emotionService.getMostFrequentEmotion(userId, 7);
    expect(most).toBe('alegria');
  });

  it('should get emotions by date range', () => {
    const userId = 'range-test-user';
    const emotion = emotionService.createEmotion(userId, testEmotion);

    const now = new Date();
    const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const emotions = emotionService.getEmotionsByDateRange(userId, past, now);
    expect(emotions.length).toBeGreaterThan(0);
  });
});
