export type TopicId =
  | 'numbers'           // Числа и нумерация
  | 'bonds'             // Состав числа
  | 'addsub'            // Сложение и вычитание
  | 'tenTransition'     // Переход через десяток
  | 'brackets'          // Примеры со скобками
  | 'multiplication'    // Умножение и деление
  | 'orderOfOps'        // Порядок действий
  | 'equations'         // Уравнения
  | 'wordProblems'      // Текстовые задачи
  | 'geometry'          // Геометрия
  | 'measurements'      // Величины и измерения
  | 'logic';            // Логика и головоломки

export type DifficultyLevel = 1 | 2 | 3; // 1 = Новичок, 2 = Знаток, 3 = Мастер

export type TenTarget = 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90;

export type TenTransitionMode =
  | 'addition'
  | 'subtraction'
  | 'mixed_add_sub'
  | 'missing_numbers'
  | 'mixed_training'
  | 'test';

export interface QuestionStep {
  title: string;
  explanation: string;
}

export type QuestionType =
  | 'choice'             // 4 варианта ответа
  | 'number_input'       // Ввод числа через клавиатуру
  | 'brackets_two_step'  // Шаг 1: ввод над скобками, Шаг 2: итоговый ответ
  | 'ten_transition'     // Тренажер перехода через десяток (с числовой прямой/разложением)
  | 'equation'           // Пошаговое уравнение
  | 'number_house'       // Домик состава числа
  | 'word_problem'       // Текстовая задача со схемой
  | 'geometry'           // Геометрическая фигура с подсчетом/периметром
  | 'clock'              // Интерактивные часы со стрелками
  | 'money'              // Монеты и банкноты
  | 'ruler';             // Измерение отрезка линейкой

export interface MathQuestion {
  id: string;
  topicId: TopicId;
  difficulty: DifficultyLevel;
  type: QuestionType;
  title: string;
  prompt: string;
  expression?: string;
  // Для выбора:
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  hint?: string;
  
  // Дополнительные данные по типам заданий:
  tenTarget?: TenTarget;
  breakdown?: {
    part1: number;
    part2: number;
    roundTen: number;
  };
  
  // Для скобок:
  bracketData?: {
    rawExpr: string;          // e.g. "18 - (16 - 7)"
    prefix?: string;          // e.g. "18 - "
    innerExpr: string;        // e.g. "16 - 7"
    suffix?: string;          // e.g. ""
    step1Result: number;      // 9
    step2Expr: string;        // "18 - 9"
    finalResult: number;      // 9
  };

  // Для домика состава числа:
  houseData?: {
    roof: number;
    left: number;
    right: number;
    missingSide: 'left' | 'right';
  };

  // Для текстовых задач:
  wordProblemData?: {
    was: string;
    changed: string;
    became: string;
    question: string;
    operation: '+' | '-' | '*' | '/';
    unit: string;
  };

  // Для геометрии:
  geometryData?: {
    shapeType: 'rectangle' | 'square' | 'triangle' | 'polygon';
    sides: number[];
    unit: string;
    questionType: 'perimeter' | 'count_sides' | 'count_vertices' | 'identify';
  };

  // Для часов:
  clockData?: {
    targetHours: number;
    targetMinutes: number;
    interactive: boolean; // пользователь выставляет стрелки или считывает время
  };

  // Для денег:
  moneyData?: {
    coins: number[];
    banknotes: number[];
    targetSum?: number;
    changeFrom?: number;
  };
}

export interface UserStats {
  totalSolved: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalStars: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  lastTopicId?: TopicId;
  lastTenTarget?: TenTarget;
  topicProgress: Record<TopicId, {
    level: DifficultyLevel;
    solvedCount: number;
    correctCount: number;
    stars: number;
  }>;
  tenTransitionProgress: Record<TenTarget, {
    solvedCount: number;
    correctCount: number;
    mastered: boolean;
    stars: number;
  }>;
  bracketsMasteredCount: number;
  unlockedAchievements: string[];
}

export interface ErrorRecord {
  id: string;
  date: string;
  question: MathQuestion;
  userAnswer: string | number;
  correctAnswer: string | number;
  stepFailed?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  category: 'general' | 'tens' | 'brackets' | 'tasks' | 'streak';
}
