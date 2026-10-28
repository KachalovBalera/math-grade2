import { MathQuestion, DifficultyLevel } from '../types/math';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateOperationsOrderQuestion(difficulty: DifficultyLevel = 1): MathQuestion {
  const types = ['three_terms', 'compare_expr', 'missing_operation'];
  const type = types[randInt(0, types.length - 1)];

  if (type === 'three_terms') {
    // 20 + 15 - 8 = 27
    const a = randInt(15, 40);
    const b = randInt(10, 25);
    const c = randInt(5, 15);
    const isAddFirst = Math.random() > 0.5;

    if (isAddFirst) {
      const step1 = a + b;
      const res = step1 - c;
      return {
        id: `ord_3t1_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'orderOfOps',
        difficulty,
        type: 'number_input',
        title: 'Порядок действий слева направо',
        prompt: `Вычисли по действиям слева направо:\n${a} + ${b} − ${c} = ?`,
        expression: `${a} + ${b} − ${c} = ?`,
        correctAnswer: res,
        explanation:
          `По правилу: сложение и вычитание выполняются по порядку слева направо.\n` +
          `1-е действие: ${a} + ${b} = ${step1}\n` +
          `2-е действие: ${step1} − ${c} = ${res}\n` +
          `Ответ: ${res}.`,
        hint: `Сначала сложи первые два числа (${a} + ${b}), а затем вычти ${c}.`,
      };
    } else {
      const step1 = a - c;
      const res = step1 + b;
      return {
        id: `ord_3t2_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'orderOfOps',
        difficulty,
        type: 'number_input',
        title: 'Порядок действий слева направо',
        prompt: `Вычисли по действиям слева направо:\n${a} − ${c} + ${b} = ?`,
        expression: `${a} − ${c} + ${b} = ?`,
        correctAnswer: res,
        explanation:
          `Сложение и вычитание равноправны и выполняются слева направо:\n` +
          `1-е действие: ${a} − ${c} = ${step1}\n` +
          `2-е действие: ${step1} + ${b} = ${res}\n` +
          `Ответ: ${res}.`,
        hint: `Сначала вычти (${a} − ${c}), затем прибавь ${b}.`,
      };
    }
  }

  if (type === 'compare_expr') {
    // 15 + 7 ○ 12 + 10
    const a = randInt(10, 30), b = randInt(5, 20);
    const sumA = a + b;
    const diff = randInt(-3, 3);
    const sumB = sumA + diff;
    const c = randInt(10, sumB - 1);
    const d = sumB - c;

    const correctSign = sumA < sumB ? '<' : (sumA > sumB ? '>' : '=');

    return {
      id: `ord_cmp_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'orderOfOps',
      difficulty,
      type: 'choice',
      title: 'Сравнение выражений',
      prompt: `Сравни значения двух выражений:\n${a} + ${b} ○ ${c} + ${d}`,
      options: ['<', '>', '='],
      correctAnswer: correctSign,
      explanation:
        `Вычислим значение каждой стороны:\n` +
        `Слева: ${a} + ${b} = ${sumA}\n` +
        `Справа: ${c} + ${d} = ${sumB}\n` +
        `Сравниваем: ${sumA} ${correctSign} ${sumB}.`,
      hint: `Сначала посчитай сумму слева (${a} + ${b}) и сумму справа (${c} + ${d}), затем сравни их.`,
    };
  }

  // missing_operation: Какой знак действия пропущен?
  const a = randInt(15, 40);
  const b = randInt(5, 14);
  const isAdd = Math.random() > 0.5;
  const res = isAdd ? a + b : a - b;
  const correctSign = isAdd ? '+' : '−';

  return {
    id: `ord_sign_${Date.now()}_${randInt(100, 999)}`,
    topicId: 'orderOfOps',
    difficulty: 1,
    type: 'choice',
    title: 'Выбор знака действия',
    prompt: `Какой знак действия пропущен?\n${a} ○ ${b} = ${res}`,
    options: ['+', '−'],
    correctAnswer: correctSign,
    explanation: `${a} ${correctSign} ${b} = ${res}, потому что результат ${isAdd ? 'увеличился' : 'уменьшился'}.`,
    hint: `Результат ${res} больше или меньше ${a}? Если больше — это сложение (+), если меньше — вычитание (−).`,
  };
}
