import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserStats, ErrorRecord, Achievement, TopicId, TenTarget, MathQuestion, DifficultyLevel } from '../types/math';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';

const STATS_KEY = '@math_app_stats_v1';
const ERRORS_KEY = '@math_app_errors_v1';
const ACHIEVEMENTS_KEY = '@math_app_achievements_v1';

const DEFAULT_TOPIC_PROGRESS = {
  numbers: { level: 1 as DifficultyLevel, solvedCount: 0, correctCount: 0, stars: 0 },
  bonds: { level: 1 as DifficultyLevel, solvedCount: 0, correctCount: 0, stars: 0 },
  addsub: { level: 1 as DifficultyLevel, solvedCount: 0, correctCount: 0, stars: 0 },
  tenTransition: { level: 1 as DifficultyLevel, solvedCount: 0, correctCount: 0, stars: 0 },
  brackets: { level: 1 as DifficultyLevel, solvedCount: 0, correctCount: 0, stars: 0 },
  multiplication: { level: 1 as DifficultyLevel, solvedCount: 0, correctCount: 0, stars: 0 },
  orderOfOps: { level: 1 as DifficultyLevel, solvedCount: 0, correctCount: 0, stars: 0 },
  equations: { level: 1 as DifficultyLevel, solvedCount: 0, correctCount: 0, stars: 0 },
  wordProblems: { level: 1 as DifficultyLevel, solvedCount: 0, correctCount: 0, stars: 0 },
  geometry: { level: 1 as DifficultyLevel, solvedCount: 0, correctCount: 0, stars: 0 },
  measurements: { level: 1 as DifficultyLevel, solvedCount: 0, correctCount: 0, stars: 0 },
  logic: { level: 1 as DifficultyLevel, solvedCount: 0, correctCount: 0, stars: 0 },
};

const DEFAULT_TEN_PROGRESS: Record<TenTarget, { solvedCount: number; correctCount: number; mastered: boolean; stars: number }> = {
  20: { solvedCount: 0, correctCount: 0, mastered: false, stars: 0 },
  30: { solvedCount: 0, correctCount: 0, mastered: false, stars: 0 },
  40: { solvedCount: 0, correctCount: 0, mastered: false, stars: 0 },
  50: { solvedCount: 0, correctCount: 0, mastered: false, stars: 0 },
  60: { solvedCount: 0, correctCount: 0, mastered: false, stars: 0 },
  70: { solvedCount: 0, correctCount: 0, mastered: false, stars: 0 },
  80: { solvedCount: 0, correctCount: 0, mastered: false, stars: 0 },
  90: { solvedCount: 0, correctCount: 0, mastered: false, stars: 0 },
};

export const DEFAULT_USER_STATS: UserStats = {
  totalSolved: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  totalStars: 0,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  lastTopicId: 'numbers',
  topicProgress: DEFAULT_TOPIC_PROGRESS,
  tenTransitionProgress: DEFAULT_TEN_PROGRESS,
  bracketsMasteredCount: 0,
  unlockedAchievements: [],
};

export class StorageService {
  private static memoryStats: UserStats = { ...DEFAULT_USER_STATS };
  private static memoryErrors: ErrorRecord[] = [];
  private static memoryAchievements: Achievement[] = [...INITIAL_ACHIEVEMENTS];

  static async loadStats(): Promise<UserStats> {
    try {
      const json = await AsyncStorage.getItem(STATS_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        // Проверка серии дней
        const today = new Date().toISOString().split('T')[0];
        const lastDate = parsed.lastActiveDate;
        if (lastDate && lastDate !== today) {
          const diffMs = new Date(today).getTime() - new Date(lastDate).getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            parsed.streakDays = (parsed.streakDays || 1) + 1;
          } else if (diffDays > 1) {
            parsed.streakDays = 1;
          }
          parsed.lastActiveDate = today;
        }

        // Объединение с дефолтными значениями
        this.memoryStats = {
          ...DEFAULT_USER_STATS,
          ...parsed,
          topicProgress: { ...DEFAULT_TOPIC_PROGRESS, ...(parsed.topicProgress || {}) },
          tenTransitionProgress: { ...DEFAULT_TEN_PROGRESS, ...(parsed.tenTransitionProgress || {}) },
        };
        return this.memoryStats;
      }
    } catch (e) {
      console.warn('StorageService loadStats error:', e);
    }
    return this.memoryStats;
  }

  static async saveStats(stats: UserStats): Promise<void> {
    try {
      this.memoryStats = stats;
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('StorageService saveStats error:', e);
    }
  }

  static async recordAnswer(
    topicId: TopicId,
    isCorrect: boolean,
    earnedStars: number = 0,
    tenTarget?: TenTarget
  ): Promise<UserStats> {
    const stats = await this.loadStats();
    stats.totalSolved += 1;
    if (isCorrect) {
      stats.correctAnswers += 1;
      stats.totalStars += earnedStars;
    } else {
      stats.wrongAnswers += 1;
    }

    stats.lastTopicId = topicId;

    // Прогресс по теме
    const tp = stats.topicProgress[topicId] || {
      level: 1,
      solvedCount: 0,
      correctCount: 0,
      stars: 0,
    };
    tp.solvedCount += 1;
    if (isCorrect) {
      tp.correctCount += 1;
      tp.stars += earnedStars;
      // Авто-повышение уровня при достижении мастерства
      if (tp.correctCount >= 10 && tp.level === 1) tp.level = 2;
      if (tp.correctCount >= 25 && tp.level === 2) tp.level = 3;
    }
    stats.topicProgress[topicId] = tp;

    // Прогресс по переходу через десяток
    if (tenTarget && stats.tenTransitionProgress[tenTarget]) {
      const ttp = stats.tenTransitionProgress[tenTarget];
      ttp.solvedCount += 1;
      if (isCorrect) {
        ttp.correctCount += 1;
        ttp.stars += earnedStars;
        if (ttp.correctCount >= 5 && !ttp.mastered) {
          ttp.mastered = true;
        }
      }
      stats.lastTenTarget = tenTarget;
    }

    if (topicId === 'brackets' && isCorrect) {
      stats.bracketsMasteredCount = (stats.bracketsMasteredCount || 0) + 1;
    }

    await this.saveStats(stats);
    await this.checkAchievements(stats);
    return stats;
  }

  static async logError(question: MathQuestion, userAnswer: string | number, stepFailed?: string): Promise<void> {
    try {
      const errors = await this.getErrors();
      const newErr: ErrorRecord = {
        id: `err_${Date.now()}_${Math.random()}`,
        date: new Date().toLocaleDateString('ru-RU'),
        question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        stepFailed,
      };
      // Храним последние 50 ошибок
      const updated = [newErr, ...errors.filter(e => e.question.prompt !== question.prompt)].slice(0, 50);
      this.memoryErrors = updated;
      await AsyncStorage.setItem(ERRORS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('StorageService logError error:', e);
    }
  }

  static async getErrors(): Promise<ErrorRecord[]> {
    try {
      const json = await AsyncStorage.getItem(ERRORS_KEY);
      if (json) {
        this.memoryErrors = JSON.parse(json);
        return this.memoryErrors;
      }
    } catch (e) {
      console.warn('StorageService getErrors error:', e);
    }
    return this.memoryErrors;
  }

  static async removeError(id: string): Promise<void> {
    try {
      const errors = await this.getErrors();
      const updated = errors.filter(e => e.id !== id);
      this.memoryErrors = updated;
      await AsyncStorage.setItem(ERRORS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('StorageService removeError error:', e);
    }
  }

  static async getAchievements(): Promise<Achievement[]> {
    try {
      const json = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
      if (json) {
        this.memoryAchievements = JSON.parse(json);
        return this.memoryAchievements;
      }
    } catch (e) {
      console.warn('StorageService getAchievements error:', e);
    }
    return this.memoryAchievements;
  }

  static async checkAchievements(stats: UserStats): Promise<Achievement[]> {
    const list = await this.getAchievements();
    let updated = false;

    for (const ach of list) {
      if (ach.isUnlocked) continue;

      let unlock = false;
      // Десятки
      if (ach.id.startsWith('ten_') && ach.id !== 'ten_master_all') {
        const target = parseInt(ach.id.replace('ten_', ''), 10) as TenTarget;
        if (stats.tenTransitionProgress[target]?.mastered) {
          unlock = true;
        }
      } else if (ach.id === 'tens_master_all') {
        const allMastered = ([20, 30, 40, 50, 60, 70, 80, 90] as TenTarget[]).every(
          t => stats.tenTransitionProgress[t]?.mastered
        );
        if (allMastered) unlock = true;
      } else if (ach.id === 'first_step' && stats.totalSolved >= 1) {
        unlock = true;
      } else if (ach.id === 'streak_3' && stats.streakDays >= 3) {
        unlock = true;
      } else if (ach.id === 'streak_7' && stats.streakDays >= 7) {
        unlock = true;
      } else if (ach.id === 'star_collector_50' && stats.totalStars >= 50) {
        unlock = true;
      } else if (ach.id === 'star_collector_100' && stats.totalStars >= 100) {
        unlock = true;
      } else if (ach.id === 'bracket_first' && stats.bracketsMasteredCount >= 1) {
        unlock = true;
      } else if (ach.id === 'bracket_master' && stats.bracketsMasteredCount >= 10) {
        unlock = true;
      } else if (ach.id === 'mult_champion' && (stats.topicProgress.multiplication?.correctCount || 0) >= 20) {
        unlock = true;
      } else if (ach.id === 'word_problem_pro' && (stats.topicProgress.wordProblems?.correctCount || 0) >= 15) {
        unlock = true;
      } else if (ach.id === 'geometry_expert' && (stats.topicProgress.geometry?.correctCount || 0) >= 10) {
        unlock = true;
      }

      if (unlock) {
        ach.isUnlocked = true;
        ach.unlockedAt = new Date().toLocaleDateString('ru-RU');
        updated = true;
      }
    }

    if (updated) {
      this.memoryAchievements = list;
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(list));
    }
    return list;
  }
}
