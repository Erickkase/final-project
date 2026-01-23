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

export interface EmotionPattern {
  pattern: string;
  frequency: number;
  averageIntensity: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
}

export interface MoodTrend {
  date: string;
  averageIntensity: number;
  dominantEmotion: string;
  emotionCount: number;
}

export interface InsightData {
  userId: string;
  totalEmotions: number;
  patterns: EmotionPattern[];
  trends: MoodTrend[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  positivityScore: number;
}

export class AnalyticsService {
  private emotionServiceUrl: string;

  constructor() {
    this.emotionServiceUrl = config.emotionServiceUrl;
  }

  // Get user emotions from emotion service
  private async getUserEmotions(userId: string): Promise<Emotion[]> {
    try {
      const response = await axios.get(`${this.emotionServiceUrl}/emotions/user/${userId}`);
      return response.data || [];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch emotions:', error);
      return [];
    }
  }

  // Analyze emotion patterns
  async analyzePatterns(userId: string, days: number = 30): Promise<EmotionPattern[]> {
    const emotions = await this.getUserEmotions(userId);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentEmotions = emotions.filter(e => 
      new Date(e.timestamp) >= cutoffDate
    );

    const patterns = new Map<string, { count: number; totalIntensity: number; times: Date[] }>();

    recentEmotions.forEach(emotion => {
      const key = emotion.emotion;
      const existing = patterns.get(key) || { count: 0, totalIntensity: 0, times: [] };
      
      existing.count++;
      existing.totalIntensity += emotion.intensity;
      existing.times.push(new Date(emotion.timestamp));
      
      patterns.set(key, existing);
    });

    const result: EmotionPattern[] = [];

    patterns.forEach((data, emotion) => {
      const avgHour = data.times.reduce((sum, time) => sum + time.getHours(), 0) / data.times.length;
      const avgDay = data.times.reduce((sum, time) => sum + time.getDay(), 0) / data.times.length;

      let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
      if (avgHour < 12) timeOfDay = 'morning';
      else if (avgHour < 17) timeOfDay = 'afternoon';
      else if (avgHour < 21) timeOfDay = 'evening';
      else timeOfDay = 'night';

      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      result.push({
        pattern: emotion,
        frequency: data.count,
        averageIntensity: data.totalIntensity / data.count,
        timeOfDay,
        dayOfWeek: daysOfWeek[Math.round(avgDay)],
      });
    });

    return result.sort((a, b) => b.frequency - a.frequency);
  }

  // Calculate mood trends
  async calculateTrends(userId: string, days: number = 30): Promise<MoodTrend[]> {
    const emotions = await this.getUserEmotions(userId);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentEmotions = emotions.filter(e => 
      new Date(e.timestamp) >= cutoffDate
    );

    const dailyData = new Map<string, { emotions: Emotion[]; intensities: number[] }>();

    recentEmotions.forEach(emotion => {
      const date = new Date(emotion.timestamp).toISOString().split('T')[0];
      const existing = dailyData.get(date) || { emotions: [], intensities: [] };
      
      existing.emotions.push(emotion);
      existing.intensities.push(emotion.intensity);
      
      dailyData.set(date, existing);
    });

    const trends: MoodTrend[] = [];

    dailyData.forEach((data, date) => {
      const avgIntensity = data.intensities.reduce((a, b) => a + b, 0) / data.intensities.length;
      
      const emotionCounts = new Map<string, number>();
      data.emotions.forEach(e => {
        emotionCounts.set(e.emotion, (emotionCounts.get(e.emotion) || 0) + 1);
      });

      const dominantEmotion = Array.from(emotionCounts.entries())
        .sort((a, b) => b[1] - a[1])[0][0];

      trends.push({
        date,
        averageIntensity: Math.round(avgIntensity * 10) / 10,
        dominantEmotion,
        emotionCount: data.emotions.length,
      });
    });

    return trends.sort((a, b) => a.date.localeCompare(b.date));
  }

  // Calculate positivity score
  async calculatePositivityScore(userId: string, days: number = 30): Promise<number> {
    const emotions = await this.getUserEmotions(userId);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentEmotions = emotions.filter(e => 
      new Date(e.timestamp) >= cutoffDate
    );

    if (recentEmotions.length === 0) return 50;

    const positiveEmotions = ['happy', 'excited', 'grateful', 'peaceful', 'confident'];
    const negativeEmotions = ['sad', 'angry', 'anxious', 'frustrated', 'stressed'];

    let score = 0;

    recentEmotions.forEach(emotion => {
      if (positiveEmotions.includes(emotion.emotion.toLowerCase())) {
        score += emotion.intensity;
      } else if (negativeEmotions.includes(emotion.emotion.toLowerCase())) {
        score -= emotion.intensity;
      }
    });

    // Normalize to 0-100
    const normalized = ((score / recentEmotions.length) + 10) * 5;
    return Math.max(0, Math.min(100, Math.round(normalized)));
  }

  // Assess risk level
  async assessRiskLevel(userId: string): Promise<'low' | 'medium' | 'high'> {
    const emotions = await this.getUserEmotions(userId);
    
    const recent = emotions.slice(-14); // Last 14 emotions
    
    if (recent.length < 5) return 'low';

    const negativeCount = recent.filter(e => 
      ['sad', 'angry', 'anxious', 'frustrated', 'stressed'].includes(e.emotion.toLowerCase())
    ).length;

    const negativeRatio = negativeCount / recent.length;

    if (negativeRatio > 0.7) return 'high';
    if (negativeRatio > 0.4) return 'medium';
    return 'low';
  }

  // Generate insights
  async generateInsights(userId: string, days: number = 30): Promise<InsightData> {
    const [emotions, patterns, trends, positivityScore, riskLevel] = await Promise.all([
      this.getUserEmotions(userId),
      this.analyzePatterns(userId, days),
      this.calculateTrends(userId, days),
      this.calculatePositivityScore(userId, days),
      this.assessRiskLevel(userId),
    ]);

    const recommendations: string[] = [];

    if (positivityScore < 40) {
      recommendations.push('Consider engaging in activities that bring you joy');
      recommendations.push('Connect with friends or family members');
    }

    if (riskLevel === 'high') {
      recommendations.push('Consider speaking with a mental health professional');
      recommendations.push('Practice daily mindfulness or meditation');
    }

    if (patterns.length > 0 && patterns[0].timeOfDay === 'night') {
      recommendations.push('Focus on improving sleep hygiene');
    }

    return {
      userId,
      totalEmotions: emotions.length,
      patterns,
      trends,
      recommendations,
      riskLevel,
      positivityScore,
    };
  }

  // Compare periods
  async comparePeriods(userId: string, period1Days: number, period2Days: number): Promise<{
    period1: { avgIntensity: number; dominantEmotion: string };
    period2: { avgIntensity: number; dominantEmotion: string };
    improvement: number;
  }> {
    const emotions = await this.getUserEmotions(userId);

    const now = new Date();
    const period1Start = new Date(now);
    period1Start.setDate(now.getDate() - period1Days);
    const period2Start = new Date(now);
    period2Start.setDate(now.getDate() - period2Days);
    const period2End = new Date(now);
    period2End.setDate(now.getDate() - period1Days);

    const period1Emotions = emotions.filter(e => {
      const date = new Date(e.timestamp);
      return date >= period1Start;
    });

    const period2Emotions = emotions.filter(e => {
      const date = new Date(e.timestamp);
      return date >= period2Start && date < period2End;
    });

    const calcStats = (emotionsList: Emotion[]) => {
      if (emotionsList.length === 0) {
        return { avgIntensity: 0, dominantEmotion: 'none' };
      }

      const avgIntensity = emotionsList.reduce((sum, e) => sum + e.intensity, 0) / emotionsList.length;
      
      const counts = new Map<string, number>();
      emotionsList.forEach(e => {
        counts.set(e.emotion, (counts.get(e.emotion) || 0) + 1);
      });

      const dominantEmotion = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

      return { avgIntensity: Math.round(avgIntensity * 10) / 10, dominantEmotion };
    };

    const p1Stats = calcStats(period1Emotions);
    const p2Stats = calcStats(period2Emotions);

    const improvement = p2Stats.avgIntensity > 0 
      ? Math.round(((p1Stats.avgIntensity - p2Stats.avgIntensity) / p2Stats.avgIntensity) * 100)
      : 0;

    return {
      period1: p1Stats,
      period2: p2Stats,
      improvement,
    };
  }
}
