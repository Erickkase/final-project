import { v4 as uuidv4 } from 'uuid';

export interface Emotion {
  emotionId: string;
  userId: string;
  type: string;
  intensity: number; // 1-10
  description: string;
  tags: string[];
  location?: string;
  weather?: string;
  triggers?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Base de datos en memoria (simulada)
const emotionsDatabase: Map<string, Emotion> = new Map();

class EmotionService {
  /**
   * Crea una nueva emoción
   */
  createEmotion(userId: string, emotionData: Omit<Emotion, 'emotionId' | 'userId' | 'createdAt' | 'updatedAt'>): Emotion {
    const emotion: Emotion = {
      emotionId: uuidv4(),
      userId,
      ...emotionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    emotionsDatabase.set(emotion.emotionId, emotion);
    return emotion;
  }

  /**
   * Obtiene una emoción por ID
   */
  getEmotionById(emotionId: string): Emotion | null {
    return emotionsDatabase.get(emotionId) || null;
  }

  /**
   * Obtiene todas las emociones de un usuario
   */
  getEmotionsByUser(userId: string, limit: number = 100, offset: number = 0): Emotion[] {
    const userEmotions = Array.from(emotionsDatabase.values())
      .filter((e) => e.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);

    return userEmotions;
  }

  /**
   * Obtiene emociones de un usuario por rango de fechas
   */
  getEmotionsByDateRange(userId: string, startDate: Date, endDate: Date): Emotion[] {
    return Array.from(emotionsDatabase.values())
      .filter((e) => e.userId === userId && e.createdAt >= startDate && e.createdAt <= endDate)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Obtiene estadísticas de emociones de un usuario
   */
  getEmotionStats(userId: string): { [key: string]: number } {
    const userEmotions = Array.from(emotionsDatabase.values())
      .filter((e) => e.userId === userId);

    const stats: { [key: string]: number } = {};

    userEmotions.forEach((emotion) => {
      stats[emotion.type] = (stats[emotion.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Obtiene la emoción promedio de un usuario
   */
  getAverageIntensity(userId: string): number {
    const userEmotions = Array.from(emotionsDatabase.values())
      .filter((e) => e.userId === userId);

    if (userEmotions.length === 0) return 0;

    const sum = userEmotions.reduce((acc, e) => acc + e.intensity, 0);
    return sum / userEmotions.length;
  }

  /**
   * Actualiza una emoción
   */
  updateEmotion(emotionId: string, userId: string, updates: Partial<Emotion>): Emotion | null {
    const emotion = emotionsDatabase.get(emotionId);

    if (!emotion || emotion.userId !== userId) {
      return null;
    }

    const updated: Emotion = {
      ...emotion,
      ...updates,
      emotionId: emotion.emotionId, // No cambiar el ID
      userId: emotion.userId, // No cambiar el usuario
      createdAt: emotion.createdAt, // No cambiar la fecha de creación
      updatedAt: new Date(),
    };

    emotionsDatabase.set(emotionId, updated);
    return updated;
  }

  /**
   * Elimina una emoción
   */
  deleteEmotion(emotionId: string, userId: string): boolean {
    const emotion = emotionsDatabase.get(emotionId);

    if (!emotion || emotion.userId !== userId) {
      return false;
    }

    return emotionsDatabase.delete(emotionId);
  }

  /**
   * Obtiene todas las emociones (solo para análisis)
   */
  getAllEmotions(): Emotion[] {
    return Array.from(emotionsDatabase.values());
  }

  /**
   * Obtiene la emoción más frecuente de un usuario en los últimos N días
   */
  getMostFrequentEmotion(userId: string, days: number = 7): string | null {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const emotionsInRange = this.getEmotionsByDateRange(userId, startDate, new Date());

    if (emotionsInRange.length === 0) return null;

    const counts: { [key: string]: number } = {};
    let maxCount = 0;
    let mostFrequent = null;

    emotionsInRange.forEach((emotion) => {
      counts[emotion.type] = (counts[emotion.type] || 0) + 1;
      if (counts[emotion.type] > maxCount) {
        maxCount = counts[emotion.type];
        mostFrequent = emotion.type;
      }
    });

    return mostFrequent;
  }
}

export default new EmotionService();
