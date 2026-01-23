import api from './api';
import { config } from '@/config/config';
import { authService } from './authService';

export interface EmotionTrend {
  date: string;
  emotions: { [key: string]: number };
  totalEmotions: number;
}

export interface EmotionSummary {
  userId: string;
  totalEmotions: number;
  emotionDistribution: { [key: string]: number };
  averageIntensity: number;
  mostFrequentEmotion: string | null;
  trends: EmotionTrend[];
}

export const reportService = {
  async getTrend(days: number = 15): Promise<EmotionTrend[]> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const response = await api.get(`${config.reportServiceUrl}/trend/${user.userId}`, {
      params: { days },
    });
    return response.data.data.trends;
  },

  async getSummary(): Promise<EmotionSummary> {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const response = await api.get(`${config.reportServiceUrl}/summary/${user.userId}`);
    return response.data.data.summary;
  },
};
