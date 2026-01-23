import api from './api';
import { config } from '@/config/config';

export interface Emotion {
  emotionId: string;
  userId: string;
  type: string;
  intensity: number;
  description: string;
  tags: string[];
  location?: string;
  weather?: string;
  triggers?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmotionRequest {
  type: string;
  intensity: number;
  description: string;
  tags?: string[];
  location?: string;
  weather?: string;
  triggers?: string[];
  notes?: string;
}

export interface EmotionStats {
  stats: { [key: string]: number };
  averageIntensity: string;
  mostFrequentEmotion: string | null;
  period: string;
}

export const emotionService = {
  async getEmotions(limit = 100, offset = 0): Promise<Emotion[]> {
    const response = await api.get(`${config.emotionServiceUrl}`, {
      params: { limit, offset },
      headers: {
        'x-user-id': authService.getCurrentUser()?.userId,
      },
    });
    return response.data.data.emotions;
  },

  async getEmotionById(emotionId: string): Promise<Emotion> {
    const response = await api.get(`${config.emotionServiceUrl}/${emotionId}`, {
      headers: {
        'x-user-id': authService.getCurrentUser()?.userId,
      },
    });
    return response.data.data.emotion;
  },

  async createEmotion(emotion: CreateEmotionRequest): Promise<Emotion> {
    const response = await api.post(`${config.emotionServiceUrl}`, emotion, {
      headers: {
        'x-user-id': authService.getCurrentUser()?.userId,
      },
    });
    return response.data.data.emotion;
  },

  async updateEmotion(emotionId: string, updates: Partial<CreateEmotionRequest>): Promise<Emotion> {
    const response = await api.put(`${config.emotionServiceUrl}/${emotionId}`, updates, {
      headers: {
        'x-user-id': authService.getCurrentUser()?.userId,
      },
    });
    return response.data.data.emotion;
  },

  async deleteEmotion(emotionId: string): Promise<void> {
    await api.delete(`${config.emotionServiceUrl}/${emotionId}`, {
      headers: {
        'x-user-id': authService.getCurrentUser()?.userId,
      },
    });
  },

  async getStats(userId: string): Promise<EmotionStats> {
    const response = await api.get(`${config.emotionServiceUrl}/stats/${userId}`);
    return response.data.data;
  },

  async getEmotionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Emotion[]> {
    const response = await api.get(`${config.emotionServiceUrl}/range/${userId}`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });
    return response.data.data.emotions;
  },
};

import { authService } from './authService';
