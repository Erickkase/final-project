import { AnalyticsService } from '../services/analytics.service';

// Mock axios
jest.mock('axios');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  const userId = 'test-user-123';

  beforeEach(() => {
    service = new AnalyticsService();
    jest.clearAllMocks();
  });

  const mockEmotions = [
    {
      id: '1',
      userId,
      emotion: 'happy',
      intensity: 8,
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      userId,
      emotion: 'sad',
      intensity: 4,
      timestamp: new Date().toISOString(),
    },
  ];

  describe('analyzePatterns', () => {
    it('should analyze emotion patterns', async () => {
      axios.get.mockResolvedValue({ data: mockEmotions });

      const patterns = await service.analyzePatterns(userId, 30);

      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('calculateTrends', () => {
    it('should calculate mood trends', async () => {
      axios.get.mockResolvedValue({ data: mockEmotions });

      const trends = await service.calculateTrends(userId, 30);

      expect(trends).toBeDefined();
      expect(Array.isArray(trends)).toBe(true);
    });
  });

  describe('calculatePositivityScore', () => {
    it('should calculate positivity score', async () => {
      axios.get.mockResolvedValue({ data: mockEmotions });

      const score = await service.calculatePositivityScore(userId, 30);

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 50 for no emotions', async () => {
      axios.get.mockResolvedValue({ data: [] });

      const score = await service.calculatePositivityScore(userId, 30);

      expect(score).toBe(50);
    });
  });

  describe('assessRiskLevel', () => {
    it('should assess risk level', async () => {
      axios.get.mockResolvedValue({ data: mockEmotions });

      const risk = await service.assessRiskLevel(userId);

      expect(risk).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(risk);
    });

    it('should return low for few emotions', async () => {
      axios.get.mockResolvedValue({ data: mockEmotions.slice(0, 1) });

      const risk = await service.assessRiskLevel(userId);

      expect(risk).toBe('low');
    });
  });

  describe('generateInsights', () => {
    it('should generate comprehensive insights', async () => {
      axios.get.mockResolvedValue({ data: mockEmotions });

      const insights = await service.generateInsights(userId, 30);

      expect(insights).toBeDefined();
      expect(insights.userId).toBe(userId);
      expect(insights.patterns).toBeDefined();
      expect(insights.trends).toBeDefined();
      expect(insights.recommendations).toBeDefined();
      expect(insights.riskLevel).toBeDefined();
      expect(insights.positivityScore).toBeDefined();
    });
  });

  describe('comparePeriods', () => {
    it('should compare two periods', async () => {
      axios.get.mockResolvedValue({ data: mockEmotions });

      const comparison = await service.comparePeriods(userId, 7, 14);

      expect(comparison).toBeDefined();
      expect(comparison.period1).toBeDefined();
      expect(comparison.period2).toBeDefined();
      expect(typeof comparison.improvement).toBe('number');
    });
  });
});
