import { v4 as uuidv4 } from 'uuid';

export enum RecommendationType {
  ACTIVITY = 'activity',
  GOAL = 'goal',
  COPING_STRATEGY = 'coping_strategy',
  JOURNAL_PROMPT = 'journal_prompt',
  LIFESTYLE = 'lifestyle',
  MINDFULNESS = 'mindfulness',
}

export enum EmotionCategory {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  MIXED = 'mixed',
}

export enum RecommendationPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface Recommendation {
  id: string;
  userId: string;
  type: RecommendationType;
  title: string;
  description: string;
  reason: string;
  priority: RecommendationPriority;
  category?: string;
  tags: string[];
  helpful?: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface RecommendationFeedback {
  recommendationId: string;
  userId: string;
  helpful: boolean;
  feedback?: string;
  createdAt: Date;
}

export interface EmotionPattern {
  dominantEmotion: string;
  emotionCategory: EmotionCategory;
  intensity: number;
  frequency: number;
  trend: 'improving' | 'declining' | 'stable';
}

class RecommendationService {
  private recommendations: Map<string, Recommendation> = new Map();
  private feedbacks: Map<string, RecommendationFeedback[]> = new Map();

  // Activity recommendations database
  private activityRecommendations = {
    [EmotionCategory.NEGATIVE]: [
      {
        title: 'Práctica de respiración profunda',
        description: 'Dedica 5-10 minutos a ejercicios de respiración consciente. Inhala profundamente por 4 segundos, mantén por 4, exhala por 6.',
        tags: ['respiración', 'mindfulness', 'relajación'],
        priority: RecommendationPriority.HIGH,
      },
      {
        title: 'Caminata en la naturaleza',
        description: 'Sal a caminar al aire libre durante 20-30 minutos. El contacto con la naturaleza puede reducir el estrés significativamente.',
        tags: ['ejercicio', 'naturaleza', 'aire libre'],
        priority: RecommendationPriority.HIGH,
      },
      {
        title: 'Escucha música relajante',
        description: 'Elige música calmada o sonidos de la naturaleza. La musicoterapia puede mejorar tu estado de ánimo.',
        tags: ['música', 'relajación', 'terapia'],
        priority: RecommendationPriority.MEDIUM,
      },
      {
        title: 'Llama a un amigo o familiar',
        description: 'Conecta con alguien cercano. El apoyo social es fundamental para el bienestar emocional.',
        tags: ['social', 'conexión', 'apoyo'],
        priority: RecommendationPriority.HIGH,
      },
      {
        title: 'Práctica de yoga suave',
        description: 'Realiza posturas de yoga restaurativas durante 15-20 minutos para liberar tensión física y mental.',
        tags: ['yoga', 'ejercicio', 'flexibilidad'],
        priority: RecommendationPriority.MEDIUM,
      },
    ],
    [EmotionCategory.POSITIVE]: [
      {
        title: 'Comparte tu alegría',
        description: 'Aprovecha este momento positivo para conectar con otros y compartir tu buena energía.',
        tags: ['social', 'gratitud', 'conexión'],
        priority: RecommendationPriority.MEDIUM,
      },
      {
        title: 'Establece una nueva meta',
        description: 'Este es un buen momento para planificar algo nuevo o desafiante que te entusiasme.',
        tags: ['metas', 'crecimiento', 'motivación'],
        priority: RecommendationPriority.MEDIUM,
      },
      {
        title: 'Practica gratitud',
        description: 'Escribe 3 cosas por las que estás agradecido hoy. Fortalece las emociones positivas.',
        tags: ['gratitud', 'journal', 'mindfulness'],
        priority: RecommendationPriority.LOW,
      },
      {
        title: 'Ayuda a alguien',
        description: 'Realiza un acto de bondad. Ayudar a otros amplifica las emociones positivas.',
        tags: ['altruismo', 'social', 'propósito'],
        priority: RecommendationPriority.LOW,
      },
    ],
    [EmotionCategory.NEUTRAL]: [
      {
        title: 'Explora algo nuevo',
        description: 'Prueba una actividad que nunca has hecho: cocina una receta nueva, aprende un hobby, lee un género diferente.',
        tags: ['creatividad', 'aprendizaje', 'exploración'],
        priority: RecommendationPriority.MEDIUM,
      },
      {
        title: 'Ejercicio cardiovascular',
        description: 'Realiza 30 minutos de actividad física moderada para energizar tu cuerpo y mente.',
        tags: ['ejercicio', 'salud', 'energía'],
        priority: RecommendationPriority.MEDIUM,
      },
      {
        title: 'Organiza tu espacio',
        description: 'Dedica tiempo a ordenar tu entorno. Un espacio organizado puede mejorar tu claridad mental.',
        tags: ['organización', 'productividad', 'ambiente'],
        priority: RecommendationPriority.LOW,
      },
    ],
    [EmotionCategory.MIXED]: [
      {
        title: 'Reflexión guiada',
        description: 'Toma tiempo para procesar tus emociones complejas. Escribe sobre lo que sientes sin juzgar.',
        tags: ['journal', 'reflexión', 'procesamiento'],
        priority: RecommendationPriority.HIGH,
      },
      {
        title: 'Meditación de aceptación',
        description: 'Practica aceptar las emociones contradictorias como parte natural de la experiencia humana.',
        tags: ['meditación', 'aceptación', 'mindfulness'],
        priority: RecommendationPriority.MEDIUM,
      },
    ],
  };

  // Coping strategies database
  private copingStrategies = {
    anxiety: [
      {
        title: 'Técnica 5-4-3-2-1',
        description: 'Identifica 5 cosas que ves, 4 que tocas, 3 que escuchas, 2 que hueles, 1 que saboreas. Ayuda a conectar con el presente.',
        tags: ['ansiedad', 'grounding', 'mindfulness'],
      },
      {
        title: 'Escritura expresiva',
        description: 'Escribe durante 15 minutos sobre tus preocupaciones sin filtros. Libera la tensión mental.',
        tags: ['ansiedad', 'journal', 'expresión'],
      },
    ],
    stress: [
      {
        title: 'Relajación muscular progresiva',
        description: 'Tensa y relaja cada grupo muscular del cuerpo, empezando por los pies hasta la cabeza.',
        tags: ['estrés', 'relajación', 'cuerpo'],
      },
      {
        title: 'Time-boxing',
        description: 'Divide tareas grandes en bloques de 25 minutos con descansos de 5 minutos (Técnica Pomodoro).',
        tags: ['estrés', 'productividad', 'gestión del tiempo'],
      },
    ],
    sadness: [
      {
        title: 'Activación conductual',
        description: 'Realiza una actividad placentera aunque no tengas ganas. El movimiento puede cambiar el estado de ánimo.',
        tags: ['tristeza', 'activación', 'motivación'],
      },
      {
        title: 'Conexión social',
        description: 'Contacta con alguien de confianza. No necesitas hablar del problema, solo estar acompañado.',
        tags: ['tristeza', 'social', 'apoyo'],
      },
    ],
    anger: [
      {
        title: 'Ejercicio físico intenso',
        description: 'Libera la energía del enojo con ejercicio: corre, boxea un cojín, o haz burpees.',
        tags: ['ira', 'ejercicio', 'liberación'],
      },
      {
        title: 'Técnica de pausa',
        description: 'Antes de reaccionar, cuenta hasta 10. Respira profundamente y evalúa la situación con calma.',
        tags: ['ira', 'autorregulación', 'pausa'],
      },
    ],
  };

  // Journal prompts database
  private journalPrompts = [
    {
      title: '¿Qué necesito en este momento?',
      description: 'Reflexiona sobre tus necesidades emocionales, físicas y mentales actuales.',
      tags: ['autoconocimiento', 'necesidades', 'presente'],
    },
    {
      title: 'Carta a tu yo del pasado',
      description: 'Escribe una carta de comprensión y consejo a tu yo de hace un año.',
      tags: ['reflexión', 'crecimiento', 'perspectiva'],
    },
    {
      title: 'Tres cosas que controlasagradezco',
      description: 'Identifica aspectos de tu vida que están bajo tu control y cómo puedes ejercerlo.',
      tags: ['control', 'empoderamiento', 'acción'],
    },
    {
      title: 'Mi mejor versión',
      description: 'Describe cómo sería tu mejor versión de ti mismo. ¿Qué pequeño paso puedes dar hoy hacia eso?',
      tags: ['visión', 'metas', 'crecimiento'],
    },
  ];

  // Lifestyle recommendations
  private lifestyleRecommendations = [
    {
      title: 'Establece una rutina de sueño',
      description: 'Acuéstate y levántate a la misma hora cada día. El sueño consistente mejora el estado de ánimo.',
      tags: ['sueño', 'rutina', 'salud'],
      priority: RecommendationPriority.HIGH,
    },
    {
      title: 'Reduce el consumo de cafeína',
      description: 'Limita el café después de las 2 PM. La cafeína puede aumentar la ansiedad y afectar el sueño.',
      tags: ['alimentación', 'sueño', 'ansiedad'],
      priority: RecommendationPriority.MEDIUM,
    },
    {
      title: 'Desconexión digital antes de dormir',
      description: 'Evita pantallas 1 hora antes de dormir. La luz azul afecta la producción de melatonina.',
      tags: ['sueño', 'tecnología', 'higiene del sueño'],
      priority: RecommendationPriority.MEDIUM,
    },
    {
      title: 'Hidratación consciente',
      description: 'Bebe al menos 8 vasos de agua al día. La deshidratación puede afectar el estado de ánimo y la energía.',
      tags: ['salud', 'hidratación', 'energía'],
      priority: RecommendationPriority.LOW,
    },
  ];

  generateRecommendations(
    userId: string,
    emotionPattern: EmotionPattern,
    limit: number = 5
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const now = new Date();

    // Generate activity recommendations based on emotion category
    const activities = this.activityRecommendations[emotionPattern.emotionCategory] || [];
    const selectedActivities = this.selectRandomItems(activities, 2);

    selectedActivities.forEach((activity) => {
      const recommendation: Recommendation = {
        id: uuidv4(),
        userId,
        type: RecommendationType.ACTIVITY,
        title: activity.title,
        description: activity.description,
        reason: this.generateReason(emotionPattern, RecommendationType.ACTIVITY),
        priority: activity.priority,
        tags: activity.tags,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
      };
      recommendations.push(recommendation);
      this.recommendations.set(recommendation.id, recommendation);
    });

    // Generate coping strategy if negative emotions
    if (emotionPattern.emotionCategory === EmotionCategory.NEGATIVE) {
      const emotionType = emotionPattern.dominantEmotion.toLowerCase();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let strategies: any[] = [];

      if (emotionType.includes('anx') || emotionType.includes('worry')) {
        strategies = this.copingStrategies.anxiety;
      } else if (emotionType.includes('stress')) {
        strategies = this.copingStrategies.stress;
      } else if (emotionType.includes('sad') || emotionType.includes('depress')) {
        strategies = this.copingStrategies.sadness;
      } else if (emotionType.includes('ang') || emotionType.includes('frust')) {
        strategies = this.copingStrategies.anger;
      }

      if (strategies.length > 0) {
        const strategy = this.selectRandomItems(strategies, 1)[0];
        const recommendation: Recommendation = {
          id: uuidv4(),
          userId,
          type: RecommendationType.COPING_STRATEGY,
          title: strategy.title,
          description: strategy.description,
          reason: this.generateReason(emotionPattern, RecommendationType.COPING_STRATEGY),
          priority: RecommendationPriority.HIGH,
          tags: strategy.tags,
          createdAt: now,
          expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 48 hours
        };
        recommendations.push(recommendation);
        this.recommendations.set(recommendation.id, recommendation);
      }
    }

    // Generate journal prompt
    const prompt = this.selectRandomItems(this.journalPrompts, 1)[0];
    const journalRecommendation: Recommendation = {
      id: uuidv4(),
      userId,
      type: RecommendationType.JOURNAL_PROMPT,
      title: prompt.title,
      description: prompt.description,
      reason: 'La reflexión escrita puede ayudarte a procesar y entender mejor tus emociones.',
      priority: RecommendationPriority.MEDIUM,
      tags: prompt.tags,
      createdAt: now,
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
    recommendations.push(journalRecommendation);
    this.recommendations.set(journalRecommendation.id, journalRecommendation);

    // Generate lifestyle recommendation
    if (emotionPattern.trend === 'declining') {
      const lifestyle = this.selectRandomItems(this.lifestyleRecommendations, 1)[0];
      const lifestyleRecommendation: Recommendation = {
        id: uuidv4(),
        userId,
        type: RecommendationType.LIFESTYLE,
        title: lifestyle.title,
        description: lifestyle.description,
        reason: 'Mejorar tus hábitos de vida puede tener un impacto positivo en tu bienestar emocional.',
        priority: lifestyle.priority,
        tags: lifestyle.tags,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };
      recommendations.push(lifestyleRecommendation);
      this.recommendations.set(lifestyleRecommendation.id, lifestyleRecommendation);
    }

    // Sort by priority and limit
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, limit);
  }

  getRecommendation(recommendationId: string): Recommendation | undefined {
    return this.recommendations.get(recommendationId);
  }

  getUserRecommendations(
    userId: string,
    options: {
      type?: RecommendationType;
      includeExpired?: boolean;
      limit?: number;
    } = {}
  ): Recommendation[] {
    const { type, includeExpired = false, limit } = options;
    const now = new Date();

    let userRecommendations = Array.from(this.recommendations.values()).filter(
      (rec) => rec.userId === userId
    );

    if (type) {
      userRecommendations = userRecommendations.filter((rec) => rec.type === type);
    }

    if (!includeExpired) {
      userRecommendations = userRecommendations.filter(
        (rec) => !rec.expiresAt || rec.expiresAt > now
      );
    }

    // Sort by creation date (newest first)
    userRecommendations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return limit ? userRecommendations.slice(0, limit) : userRecommendations;
  }

  submitFeedback(
    recommendationId: string,
    userId: string,
    helpful: boolean,
    feedback?: string
  ): RecommendationFeedback {
    const recommendation = this.recommendations.get(recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found');
    }

    if (recommendation.userId !== userId) {
      throw new Error('Unauthorized to provide feedback for this recommendation');
    }

    // Update recommendation helpful status
    recommendation.helpful = helpful;

    const feedbackEntry: RecommendationFeedback = {
      recommendationId,
      userId,
      helpful,
      feedback,
      createdAt: new Date(),
    };

    const userFeedbacks = this.feedbacks.get(userId) || [];
    userFeedbacks.push(feedbackEntry);
    this.feedbacks.set(userId, userFeedbacks);

    return feedbackEntry;
  }

  getRecommendationStats(userId: string): {
    total: number;
    byType: Record<string, number>;
    helpful: number;
    notHelpful: number;
    feedbackRate: number;
  } {
    const userRecommendations = this.getUserRecommendations(userId, {
      includeExpired: true,
    });

    const byType: Record<string, number> = {};
    let helpful = 0;
    let notHelpful = 0;
    let withFeedback = 0;

    userRecommendations.forEach((rec) => {
      byType[rec.type] = (byType[rec.type] || 0) + 1;

      if (rec.helpful !== undefined) {
        withFeedback++;
        if (rec.helpful) {
          helpful++;
        } else {
          notHelpful++;
        }
      }
    });

    return {
      total: userRecommendations.length,
      byType,
      helpful,
      notHelpful,
      feedbackRate: userRecommendations.length > 0 ? withFeedback / userRecommendations.length : 0,
    };
  }

  // Helper methods
  private selectRandomItems<T>(items: T[], count: number): T[] {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private generateReason(pattern: EmotionPattern, type: RecommendationType): string {
    const reasons: Record<string, Record<string, string>> = {
      [RecommendationType.ACTIVITY]: {
        [EmotionCategory.NEGATIVE]: `He notado que has estado experimentando ${pattern.dominantEmotion}. Esta actividad puede ayudarte a mejorar tu estado emocional.`,
        [EmotionCategory.POSITIVE]: `Tu estado emocional es positivo. Esta actividad puede ayudarte a mantener y fortalecer este bienestar.`,
        [EmotionCategory.NEUTRAL]: `Esta actividad puede ayudarte a explorar nuevas formas de bienestar.`,
        [EmotionCategory.MIXED]: `Reconozco que tus emociones son complejas. Esta actividad puede ayudarte a encontrar equilibrio.`,
      },
      [RecommendationType.COPING_STRATEGY]: {
        [EmotionCategory.NEGATIVE]: `Esta estrategia ha demostrado ser efectiva para manejar ${pattern.dominantEmotion}.`,
        [EmotionCategory.POSITIVE]: `Mantener estrategias saludables es importante incluso en momentos positivos.`,
        [EmotionCategory.NEUTRAL]: `Esta estrategia puede ser útil para tu bienestar general.`,
        [EmotionCategory.MIXED]: `Esta estrategia puede ayudarte a navegar emociones complejas.`,
      },
    };

    return reasons[type]?.[pattern.emotionCategory] || 'Esta recomendación puede beneficiar tu bienestar emocional.';
  }

  // Clear expired recommendations
  clearExpiredRecommendations(): number {
    const now = new Date();
    let cleared = 0;

    this.recommendations.forEach((rec, id) => {
      if (rec.expiresAt && rec.expiresAt < now) {
        this.recommendations.delete(id);
        cleared++;
      }
    });

    return cleared;
  }
}

export const recommendationService = new RecommendationService();
