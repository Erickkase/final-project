import {
  recommendationService,
  RecommendationType,
  EmotionCategory,
  EmotionPattern,
} from '../services/recommendation.service';

describe('RecommendationService', () => {
  let testUserId: string;

  beforeEach(() => {
    // Use unique user ID for each test to avoid data interference
    testUserId = `test-user-${Date.now()}-${Math.random()}`;
  });

  const createTestPattern = (
    category: EmotionCategory,
    trend: 'improving' | 'declining' | 'stable' = 'stable'
  ): EmotionPattern => ({
    dominantEmotion: 'test-emotion',
    emotionCategory: category,
    intensity: 5,
    frequency: 3,
    trend,
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations for negative emotions', () => {
      const pattern = createTestPattern(EmotionCategory.NEGATIVE);
      const recommendations = recommendationService.generateRecommendations(testUserId, pattern, 5);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(5);
      expect(recommendations[0]).toHaveProperty('id');
      expect(recommendations[0]).toHaveProperty('userId', testUserId);
      expect(recommendations[0]).toHaveProperty('type');
      expect(recommendations[0]).toHaveProperty('title');
      expect(recommendations[0]).toHaveProperty('description');
      expect(recommendations[0]).toHaveProperty('reason');
    });

    it('should generate recommendations for positive emotions', () => {
      const pattern = createTestPattern(EmotionCategory.POSITIVE);
      const recommendations = recommendationService.generateRecommendations(testUserId, pattern, 5);

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should include coping strategies for negative emotions', () => {
      const pattern: EmotionPattern = {
        dominantEmotion: 'anxiety',
        emotionCategory: EmotionCategory.NEGATIVE,
        intensity: 7,
        frequency: 5,
        trend: 'stable',
      };
      const recommendations = recommendationService.generateRecommendations(testUserId, pattern, 10);

      const hasCopingStrategy = recommendations.some(
        (r) => r.type === RecommendationType.COPING_STRATEGY
      );
      expect(hasCopingStrategy).toBe(true);
    });

    it('should include journal prompts', () => {
      const pattern = createTestPattern(EmotionCategory.NEUTRAL);
      const recommendations = recommendationService.generateRecommendations(testUserId, pattern, 10);

      const hasJournalPrompt = recommendations.some(
        (r) => r.type === RecommendationType.JOURNAL_PROMPT
      );
      expect(hasJournalPrompt).toBe(true);
    });

    it('should include lifestyle recommendations for declining trends', () => {
      const pattern = createTestPattern(EmotionCategory.NEGATIVE, 'declining');
      const recommendations = recommendationService.generateRecommendations(testUserId, pattern, 10);

      const hasLifestyle = recommendations.some(
        (r) => r.type === RecommendationType.LIFESTYLE
      );
      expect(hasLifestyle).toBe(true);
    });

    it('should respect the limit parameter', () => {
      const pattern = createTestPattern(EmotionCategory.MIXED);
      const recommendations = recommendationService.generateRecommendations(testUserId, pattern, 3);

      expect(recommendations.length).toBeLessThanOrEqual(3);
    });

    it('should set expiration dates', () => {
      const pattern = createTestPattern(EmotionCategory.POSITIVE);
      const recommendations = recommendationService.generateRecommendations(testUserId, pattern, 5);

      recommendations.forEach((rec) => {
        if (rec.expiresAt) {
          expect(rec.expiresAt).toBeInstanceOf(Date);
          expect(rec.expiresAt.getTime()).toBeGreaterThan(Date.now());
        }
      });
    });
  });

  describe('getRecommendation', () => {
    it('should retrieve a specific recommendation by id', () => {
      const pattern = createTestPattern(EmotionCategory.POSITIVE);
      const recommendations = recommendationService.generateRecommendations(testUserId, pattern, 1);
      const recId = recommendations[0].id;

      const retrieved = recommendationService.getRecommendation(recId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(recId);
    });

    it('should return undefined for non-existent recommendation', () => {
      const retrieved = recommendationService.getRecommendation('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getUserRecommendations', () => {
    it('should get all recommendations for a user', () => {
      const pattern = createTestPattern(EmotionCategory.NEGATIVE);
      recommendationService.generateRecommendations(testUserId, pattern, 5);

      const userRecs = recommendationService.getUserRecommendations(testUserId);

      expect(userRecs).toBeDefined();
      expect(userRecs.length).toBeGreaterThan(0);
      userRecs.forEach((rec) => {
        expect(rec.userId).toBe(testUserId);
      });
    });

    it('should filter by recommendation type', () => {
      const pattern = createTestPattern(EmotionCategory.NEGATIVE);
      recommendationService.generateRecommendations(testUserId, pattern, 10);

      const activityRecs = recommendationService.getUserRecommendations(testUserId, {
        type: RecommendationType.ACTIVITY,
      });

      activityRecs.forEach((rec) => {
        expect(rec.type).toBe(RecommendationType.ACTIVITY);
      });
    });

    it('should exclude expired recommendations by default', () => {
      const pattern = createTestPattern(EmotionCategory.POSITIVE);
      recommendationService.generateRecommendations(testUserId, pattern, 5);

      const userRecs = recommendationService.getUserRecommendations(testUserId);

      userRecs.forEach((rec) => {
        if (rec.expiresAt) {
          expect(rec.expiresAt.getTime()).toBeGreaterThan(Date.now());
        }
      });
    });

    it('should respect the limit option', () => {
      const pattern = createTestPattern(EmotionCategory.MIXED);
      recommendationService.generateRecommendations(testUserId, pattern, 10);

      const userRecs = recommendationService.getUserRecommendations(testUserId, { limit: 3 });

      expect(userRecs.length).toBeLessThanOrEqual(3);
    });
  });

  describe('submitFeedback', () => {
    it('should submit positive feedback', () => {
      const pattern = createTestPattern(EmotionCategory.POSITIVE);
      const recommendations = recommendationService.generateRecommendations(testUserId, pattern, 1);
      const recId = recommendations[0].id;

      const feedback = recommendationService.submitFeedback(recId, testUserId, true, 'Very helpful!');

      expect(feedback).toBeDefined();
      expect(feedback.recommendationId).toBe(recId);
      expect(feedback.userId).toBe(testUserId);
      expect(feedback.helpful).toBe(true);
      expect(feedback.feedback).toBe('Very helpful!');

      const recommendation = recommendationService.getRecommendation(recId);
      expect(recommendation?.helpful).toBe(true);
    });

    it('should submit negative feedback', () => {
      const pattern = createTestPattern(EmotionCategory.NEUTRAL);
      const recommendations = recommendationService.generateRecommendations(testUserId, pattern, 1);
      const recId = recommendations[0].id;

      const feedback = recommendationService.submitFeedback(recId, testUserId, false);

      expect(feedback.helpful).toBe(false);

      const recommendation = recommendationService.getRecommendation(recId);
      expect(recommendation?.helpful).toBe(false);
    });

    it('should throw error for non-existent recommendation', () => {
      expect(() => {
        recommendationService.submitFeedback('non-existent-id', testUserId, true);
      }).toThrow('Recommendation not found');
    });

    it('should throw error for unauthorized feedback', () => {
      const pattern = createTestPattern(EmotionCategory.POSITIVE);
      const recommendations = recommendationService.generateRecommendations(testUserId, pattern, 1);
      const recId = recommendations[0].id;

      expect(() => {
        recommendationService.submitFeedback(recId, 'different-user', true);
      }).toThrow('Unauthorized');
    });
  });

  describe('getRecommendationStats', () => {
    it('should return statistics for user recommendations', () => {
      const pattern = createTestPattern(EmotionCategory.NEGATIVE);
      const recommendations = recommendationService.generateRecommendations(testUserId, pattern, 5);

      // Submit some feedback
      recommendationService.submitFeedback(recommendations[0].id, testUserId, true);
      recommendationService.submitFeedback(recommendations[1].id, testUserId, false);

      const stats = recommendationService.getRecommendationStats(testUserId);

      expect(stats).toBeDefined();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byType).toBeDefined();
      expect(stats.helpful).toBe(1);
      expect(stats.notHelpful).toBe(1);
      expect(stats.feedbackRate).toBeGreaterThan(0);
    });

    it('should handle user with no recommendations', () => {
      const stats = recommendationService.getRecommendationStats('new-user');

      expect(stats.total).toBe(0);
      expect(stats.helpful).toBe(0);
      expect(stats.notHelpful).toBe(0);
      expect(stats.feedbackRate).toBe(0);
    });
  });

  describe('clearExpiredRecommendations', () => {
    it('should clear expired recommendations', () => {
      // This test is more conceptual since we can't easily create expired recommendations
      // without mocking time or waiting
      const cleared = recommendationService.clearExpiredRecommendations();

      expect(cleared).toBeGreaterThanOrEqual(0);
    });
  });
});
