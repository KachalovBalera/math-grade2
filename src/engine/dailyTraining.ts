import { MathQuestion, UserStats, TenTarget } from '../types/math';
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

/**
 * Создает адаптивный индивидуальный микс заданий на день (10 вопросов),
 * основанный на ошибках и слабейших темах ученика.
 */
export async function generateAdaptiveDailyWorkout(stats: UserStats): Promise<MathQuestion[]> {
  const errors = await StorageService.getErrors();
  const questions: MathQuestion[] = [];

  // 1. Если есть неисправленные ошибки, берем до 3 заданий из ошибок
  if (errors.length > 0) {
    const errorQuestions = errors.slice(0, 3).map(e => e.question);
    questions.push(...errorQuestions);
  }

  // 2. Ищем переход через десяток с наименьшим прогрессом
  const tens: TenTarget[] = [20, 30, 40, 50, 60, 70, 80, 90];
  let weakestTen: TenTarget = 20;
  let minTenCorrect = 9999;
  for (const t of tens) {
    const p = stats.tenTransitionProgress[t]?.correctCount || 0;
    if (p < minTenCorrect) {
      minTenCorrect = p;
      weakestTen = t;
    }
  }

  // Добавляем 2 задания на слабейший десяток
  questions.push(generateTenAddition(weakestTen, 1));
  questions.push(generateTenSubtraction(weakestTen, 2));

  // 3. Задание со скобками
  questions.push(generateBracketQuestion(1));

  // 4. Текстовая задача
  questions.push(generateWordProblemQuestion(stats.topicProgress.wordProblems?.level || 1));

  // 5. Уравнение
  questions.push(generateEquationQuestion(stats.topicProgress.equations?.level || 1));

  // 6. Умножение / сложение
  questions.push(generateMultiplicationQuestion(stats.topicProgress.multiplication?.level || 1));

  // 7. Геометрия или логика
  if (Math.random() > 0.5) {
    questions.push(generateGeometryQuestion(stats.topicProgress.geometry?.level || 1));
  } else {
    questions.push(generateLogicQuestion(stats.topicProgress.logic?.level || 1));
  }

  // Добиваем до 10 штук при необходимости
  while (questions.length < 10) {
    questions.push(generateAddSubQuestion(1));
  }

  return questions.slice(0, 10);
}
