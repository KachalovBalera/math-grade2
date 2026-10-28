import { MathQuestion, DifficultyLevel } from '../types/math';

export interface BracketProblemConfig {
  difficulty: DifficultyLevel;
  type?: 'standard' | 'addition_inside' | 'subtraction_inside' | 'first_pos' | 'missing_inside';
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Создаёт двухэтапное задание со скобками
 */
export function generateBracketQuestion(difficulty: DifficultyLevel = 1): MathQuestion {
  // Наборы шаблонов для 2 класса
  // Вариант 1: A - (B - C), например 18 - (16 - 7) = 18 - 9 = 9
  // Вариант 2: A - (B + C), например 30 - (14 + 6) = 30 - 20 = 10
  // Вариант 3: A + (B - C), например 15 + (12 - 5) = 15 + 7 = 22
  // Вариант 4: (A + B) - C, например (25 + 15) - 8 = 40 - 8 = 32

  const patterns = ['sub_sub', 'sub_add', 'add_sub', 'first_add'];
  const pattern = patterns[randInt(0, patterns.length - 1)];

  let rawExpr = '';
  let prefix = '';
  let innerExpr = '';
  let suffix = '';
  let step1Result = 0;
  let step2Expr = '';
  let finalResult = 0;
  let explanation = '';
  let hint = '';

  if (pattern === 'sub_sub') {
    // A - (B - C)
    const c = randInt(4, 9);
    const step1 = randInt(5, 9);
    const b = step1 + c; // e.g. 16, c = 7, step1 = 9
    const finalVal = randInt(4, 15);
    const a = finalVal + step1; // e.g. 9 + 9 = 18

    prefix = `${a} − `;
    innerExpr = `${b} − ${c}`;
    suffix = '';
    rawExpr = `${a} − (${b} − ${c})`;
    step1Result = step1;
    step2Expr = `${a} − ${step1}`;
    finalResult = finalVal;
    hint = `Сначала реши выражение в скобках: сколько будет ${b} − ${c}?`;
    explanation =
      `1-е действие (в скобках): ${b} − ${c} = ${step1}.\n` +
      `2-е действие: ${a} − ${step1} = ${finalResult}.\n` +
      `Итог: ${finalResult}.`;
  } else if (pattern === 'sub_add') {
    // A - (B + C)
    const b = randInt(4, 15);
    const c = randInt(4, 15);
    step1Result = b + c; // e.g. 14 + 6 = 20
    const finalVal = randInt(5, 20);
    const a = step1Result + finalVal; // e.g. 20 + 10 = 30

    prefix = `${a} − `;
    innerExpr = `${b} + ${c}`;
    suffix = '';
    rawExpr = `${a} − (${b} + ${c})`;
    step2Expr = `${a} − ${step1Result}`;
    finalResult = finalVal;
    hint = `Сначала вычисли то, что в скобках: сколько будет ${b} + ${c}?`;
    explanation =
      `1-е действие (в скобках): ${b} + ${c} = ${step1Result}.\n` +
      `2-е действие: ${a} − ${step1Result} = ${finalResult}.\n` +
      `Итог: ${finalResult}.`;
  } else if (pattern === 'add_sub') {
    // A + (B - C)
    const c = randInt(5, 9);
    const step1 = randInt(4, 9);
    const b = step1 + c;
    const a = randInt(10, 30);

    prefix = `${a} + `;
    innerExpr = `${b} − ${c}`;
    suffix = '';
    rawExpr = `${a} + (${b} − ${c})`;
    step1Result = step1;
    step2Expr = `${a} + ${step1}`;
    finalResult = a + step1;
    hint = `Первое действие всегда в скобках: ${b} − ${c}. Сколько получится?`;
    explanation =
      `1-е действие (в скобках): ${b} − ${c} = ${step1}.\n` +
      `2-е действие: ${a} + ${step1} = ${finalResult}.\n` +
      `Итог: ${finalResult}.`;
  } else {
    // (A + B) - C
    const a = randInt(10, 25);
    const b = randInt(5, 20);
    step1Result = a + b;
    const c = randInt(4, 9);
    finalResult = step1Result - c;

    prefix = '';
    innerExpr = `${a} + ${b}`;
    suffix = ` − ${c}`;
    rawExpr = `(${a} + ${b}) − ${c}`;
    step2Expr = `${step1Result} − ${c}`;
    hint = `Сначала выполняем действие в скобках: ${a} + ${b}.`;
    explanation =
      `1-е действие (в скобках): ${a} + ${b} = ${step1Result}.\n` +
      `2-е действие: ${step1Result} − ${c} = ${finalResult}.\n` +
      `Итог: ${finalResult}.`;
  }

  // Генерация вариантов ответа для финального шага
  const wrongOptions = new Set<number>();
  wrongOptions.add(finalResult + 1);
  wrongOptions.add(finalResult - 1);
  wrongOptions.add(finalResult + 10);
  wrongOptions.add(finalResult - 10 > 0 ? finalResult - 10 : finalResult + 2);
  const options = Array.from(wrongOptions)
    .filter(n => n > 0 && n !== finalResult)
    .slice(0, 3)
    .concat(finalResult)
    .sort(() => Math.random() - 0.5)
    .map(String);

  return {
    id: `bracket_${Date.now()}_${randInt(100, 999)}`,
    topicId: 'brackets',
    difficulty,
    type: 'brackets_two_step',
    title: 'Примеры со скобками',
    prompt: `${rawExpr} = ?`,
    expression: rawExpr,
    correctAnswer: finalResult,
    options,
    explanation,
    hint,
    bracketData: {
      rawExpr,
      prefix,
      innerExpr,
      suffix,
      step1Result,
      step2Expr,
      finalResult,
    },
  };
}

/**
 * Генерирует набор заданий со скобками
 */
export function generateBracketSet(count: number = 10, difficulty: DifficultyLevel = 1): MathQuestion[] {
  const list: MathQuestion[] = [];
  for (let i = 0; i < count; i++) {
    list.push(generateBracketQuestion(difficulty));
  }
  return list;
}
