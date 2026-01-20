import { ReportService } from '../services/report.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock isAxiosError
(mockedAxios as any).isAxiosError = jest.fn();

describe('ReportService', () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService();
    jest.clearAllMocks();
  });

  describe('getEmotionTrend', () => {
    it('should return emotion trend for user', async () => {
      const mockEmotions = [
        {
          id: '1',
          userId: 'user123',
          emotion: 'happy',
          intensity: 8,
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          userId: 'user123',
          emotion: 'happy',
          intensity: 7,
          timestamp: new Date().toISOString(),
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockEmotions });

      const result = await reportService.getEmotionTrend('user123', 15);

      expect(result.userId).toBe('user123');
      expect(result.totalEmotions).toBe(2);
      expect(result.mostFrequentEmotion).toBe('happy');
    });

    it('should handle user with no emotions', async () => {
      const error: any = new Error('Not found');
      error.response = { status: 404 };
      mockedAxios.get.mockRejectedValue(error);
      (mockedAxios as any).isAxiosError.mockReturnValue(true);

      const result = await reportService.getEmotionTrend('user456', 15);

      expect(result.totalEmotions).toBe(0);
      expect(result.mostFrequentEmotion).toBe('none');
    });
  });

  describe('getEmotionSummary', () => {
    it('should return emotion summary for user', async () => {
      const mockEmotions = [
        {
          id: '1',
          userId: 'user123',
          emotion: 'happy',
          intensity: 8,
          timestamp: '2024-01-01T10:00:00.000Z',
        },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockEmotions });

      const result = await reportService.getEmotionSummary('user123');

      expect(result.userId).toBe('user123');
      expect(result.totalEmotions).toBe(1);
    });
  });
});
