import axios from 'axios';
import { config } from '../config/config';

interface Emotion {
  id: string;
  userId: string;
  emotion: string;
  intensity: number;
  note?: string;
  timestamp: string;
}

interface EmotionTrend {
  userId: string;
  period: string;
  totalEmotions: number;
  emotionCounts: Record<string, number>;
  averageIntensity: number;
  mostFrequentEmotion: string;
  emotionPercentages: Record<string, number>;
  dailyAverage: number;
}

interface EmotionSummary {
  userId: string;
  totalEmotions: number;
  emotionDistribution: Record<string, number>;
  lastEmotion?: Emotion;
  firstEmotion?: Emotion;
}

export class ReportService {
  private emotionServiceUrl: string;

  constructor() {
    this.emotionServiceUrl = config.emotionServiceUrl;
  }

  // Get user emotion trend
  async getEmotionTrend(userId: string, days: number = 15): Promise<EmotionTrend> {
    try {
      // Fetch user emotions from emotion service
      const response = await axios.get(`${this.emotionServiceUrl}/emotions/user/${userId}`);
      const emotions: Emotion[] = response.data;

      // Filter emotions by time period
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const filteredEmotions = emotions.filter(emotion => {
        const emotionDate = new Date(emotion.timestamp);
        return emotionDate >= cutoffDate;
      });

      // Calculate statistics
      const emotionCounts: Record<string, number> = {};
      let totalIntensity = 0;

      filteredEmotions.forEach(emotion => {
        emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + 1;
        totalIntensity += emotion.intensity;
      });

      // Find most frequent emotion
      let mostFrequentEmotion = '';
      let maxCount = 0;
      Object.entries(emotionCounts).forEach(([emotion, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostFrequentEmotion = emotion;
        }
      });

      // Calculate percentages
      const emotionPercentages: Record<string, number> = {};
      Object.entries(emotionCounts).forEach(([emotion, count]) => {
        emotionPercentages[emotion] = (count / filteredEmotions.length) * 100;
      });

      return {
        userId,
        period: `${days} days`,
        totalEmotions: filteredEmotions.length,
        emotionCounts,
        averageIntensity: filteredEmotions.length > 0 ? totalIntensity / filteredEmotions.length : 0,
        mostFrequentEmotion,
        emotionPercentages,
        dailyAverage: filteredEmotions.length / days,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // User has no registered emotions
        return {
          userId,
          period: `${days} days`,
          totalEmotions: 0,
          emotionCounts: {},
          averageIntensity: 0,
          mostFrequentEmotion: 'none',
          emotionPercentages: {},
          dailyAverage: 0,
        };
      }
      throw error;
    }
  }

  // Get user emotion summary
  async getEmotionSummary(userId: string): Promise<EmotionSummary> {
    try {
      const response = await axios.get(`${this.emotionServiceUrl}/emotions/user/${userId}`);
      const emotions: Emotion[] = response.data;

      // Calculate emotion distribution
      const emotionDistribution: Record<string, number> = {};
      emotions.forEach(emotion => {
        emotionDistribution[emotion.emotion] = (emotionDistribution[emotion.emotion] || 0) + 1;
      });

      // Sort emotions by timestamp
      const sortedEmotions = [...emotions].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      return {
        userId,
        totalEmotions: emotions.length,
        emotionDistribution,
        firstEmotion: sortedEmotions[0],
        lastEmotion: sortedEmotions[sortedEmotions.length - 1],
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          userId,
          totalEmotions: 0,
          emotionDistribution: {},
        };
      }
      throw error;
    }
  }
}
