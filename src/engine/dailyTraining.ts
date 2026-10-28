import { MathQuestion, UserStats, TenTarget, TopicId } from '../types/math';
import { StorageService } from '../services/storage';
import { generateTenAddition, generateTenSubtraction } from './tenTransition';
import { generateBracketQuestion } from './brackets';
import { generateNumberSenseQuestion } from './numberSense';
import { generateNumberBondsQuestion } from './numberBonds';
import { generateAddSubQuestion } from './additionSubtraction';
import { generateMultiplicationQuestion } from './multiplication';
import { generateEquationQuestion } from './equations';
import { generateWordProblemQuestion } from './wordProblems';
import { generateGeometryQuestion } from './geometry';
import { generateMeasurementQuestion } from './measurements';
import { generateLogicQuestion } from './logicPuzzles';
import { PRESET_QUESTION_BANK } from '../data/presetBank';
import { DEFAULT_CURRICULUM_TOPIC_IDS } from '../data/curriculum';

/**
 * Создает адаптивный индивидуальный микс заданий на день (10 вопросов),
 * основанный ИСКЛЮЧИТЕЛЬНО на материале, который ребенок уже прошел в школе (allowedTopics).
 * Задания по еще не изученным темам строго исключаются.
 */
export async function generateAdaptiveDailyWorkout(
  stats: UserStats,
  customAllowedTopics?: TopicId[]
): Promise<MathQuestion[]> {
  const allowedTopics =
    customAllowedTopics && customAllowedTopics.length > 0
      ? customAllowedTopics
      : await StorageService.getCurriculumTopics();

  const safeTopics =
    allowedTopics.length > 0 ? allowedTopics : DEFAULT_CURRICULUM_TOPIC_IDS;
  const allowedSet = new Set<TopicId>(safeTopics);
  const questions: MathQuestion[] = [];

  // Генератор вопросов для конкретной темы
  const generateQuestionForTopic = (t: TopicId): MathQuestion => {
    const level = stats.topicProgress[t]?.level || 1;
    switch (t) {
      case 'bonds':
        return generateNumberBondsQuestion(level);
      case 'numbers':
        return generateNumberSenseQuestion(level);
      case 'measurements':
        return generateMeasurementQuestion(level);
      case 'geometry':
        return generateGeometryQuestion(level);
      case 'addsub':
        return generateAddSubQuestion(level);
      case 'wordProblems':
        return generateWordProblemQuestion(level);
      case 'brackets':
        return generateBracketQuestion(level);
      case 'equations':
        return generateEquationQuestion(level);
      case 'tenTransition': {
        const tens: TenTarget[] = [20, 30, 40, 50, 60, 70, 80, 90];
        let weakestTen: TenTarget = 20;
        let minTenCorrect = 9999;
        for (const target of tens) {
          const p = stats.tenTransitionProgress[target]?.correctCount || 0;
          if (p < minTenCorrect) {
            minTenCorrect = p;
            weakestTen = target;
          }
        }
        return Math.random() > 0.5
          ? generateTenAddition(weakestTen, level)
          : generateTenSubtraction(weakestTen, level);
      }
      case 'orderOfOps': {
        const pool = PRESET_QUESTION_BANK['orderOfOps'] || [];
        if (pool.length > 0) {
          return pool[Math.floor(Math.random() * pool.length)];
        }
        return generateBracketQuestion(level);
      }
      case 'multiplication':
        return generateMultiplicationQuestion(level);
      case 'logic':
        return generateLogicQuestion(level);
      default:
        return generateNumberSenseQuestion(1);
    }
  };

  // 1. Ошибки ученика ТОЛЬКО из пройденных (разрешенных) тем
  const errors = await StorageService.getErrors();
  const relevantErrors = errors.filter(e => allowedSet.has(e.question.topicId));
  if (relevantErrors.length > 0) {
    const errorQuestions = relevantErrors.slice(0, 3).map(e => e.question);
    questions.push(...errorQuestions);
  }

  // 2. Равномерно наполняем тренировку заданиями из разрешенных тем
  const topicList = Array.from(allowedSet);
  let topicIdx = 0;
  let attempts = 0;

  while (questions.length < 10 && attempts < 50) {
    attempts++;
    const topicToPick = topicList[topicIdx % topicList.length];
    const newQ = generateQuestionForTopic(topicToPick);

    // Проверяем дубликат
    const isDuplicate = questions.some(
      q => q.prompt === newQ.prompt || (q.id && q.id === newQ.id)
    );

    if (!isDuplicate) {
      questions.push(newQ);
    } else {
      // Ищем вариант из банка проверенных заданий по этой же разрешенной теме
      const bankPool = PRESET_QUESTION_BANK[topicToPick] || [];
      const bankItems = bankPool.filter(
        q => !questions.some(eq => eq.prompt === q.prompt)
      );
      if (bankItems.length > 0) {
        questions.push(bankItems[Math.floor(Math.random() * bankItems.length)]);
      } else {
        questions.push(newQ);
      }
    }
    topicIdx++;
  }

  return questions.slice(0, 10);
}
