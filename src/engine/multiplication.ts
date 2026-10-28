import { MathQuestion, DifficultyLevel } from '../types/math';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMultiplicationQuestion(difficulty: DifficultyLevel = 1): MathQuestion {
  // Для 2 класса основа — умножение и деление на 2, 3, 4, 5 (и до 9 на уровне Мастер)
  const maxFactor = difficulty === 1 ? 3 : (difficulty === 2 ? 5 : 9);
  const factor1 = randInt(2, maxFactor);
  const factor2 = randInt(2, 9);
  const product = factor1 * factor2;

  const types = ['repeated_addition', 'multiplication', 'division', 'missing_factor', 'missing_dividend'];
  const type = types[randInt(0, types.length - 1)];

  if (type === 'repeated_addition') {
    const arr = Array(factor2).fill(factor1);
    const sumStr = arr.join(' + ');
    return {
      id: `mult_rep_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'multiplication',
      difficulty,
      type: 'number_input',
      title: 'Умножение как сложение',
      prompt: `Замени сложение умножением и найди ответ:\n${sumStr} = ?`,
      expression: `${factor1} × ${factor2} = ?`,
      correctAnswer: product,
      explanation: `Число ${factor1} взяли слагаемым ${factor2} раза: ${factor1} × ${factor2} = ${product}.`,
      hint: `Посчитай, сколько раз повторяется число ${factor1}. Это ${factor1} × ${factor2}.`,
    };
  }

  if (type === 'division') {
    return {
      id: `mult_div_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'multiplication',
      difficulty,
      type: 'number_input',
      title: 'Деление',
      prompt: `${product} : ${factor1} = ?`,
      expression: `${product} : ${factor1} = ?`,
      correctAnswer: factor2,
      explanation: `Деление связано с умножением: так как ${factor1} × ${factor2} = ${product}, то ${product} : ${factor1} = ${factor2}.`,
      hint: `Какое число нужно умножить на ${factor1}, чтобы получилось ${product}?`,
    };
  }

  if (type === 'missing_factor') {
    return {
      id: `mult_missf_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'multiplication',
      difficulty,
      type: 'number_input',
      title: 'Неизвестный множитель',
      prompt: `${factor1} × □ = ${product}`,
      correctAnswer: factor2,
      explanation: `Чтобы найти неизвестный множитель, разделим произведение на известный множитель: ${product} : ${factor1} = ${factor2}.`,
      hint: `Вспомни таблицу умножения на ${factor1} или раздели ${product} на ${factor1}.`,
    };
  }

  if (type === 'missing_dividend') {
    return {
      id: `mult_missd_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'multiplication',
      difficulty,
      type: 'number_input',
      title: 'Неизвестное делимое',
      prompt: `□ : ${factor1} = ${factor2}`,
      correctAnswer: product,
      explanation: `Чтобы найти неизвестное делимое, нужно частное умножить на делитель: ${factor2} × ${factor1} = ${product}.`,
      hint: `Умножь ${factor2} на ${factor1}.`,
    };
  }

  // Простое умножение
  return {
    id: `mult_std_${Date.now()}_${randInt(100, 999)}`,
    topicId: 'multiplication',
    difficulty,
    type: 'number_input',
    title: 'Таблица умножения',
    prompt: `${factor1} × ${factor2} = ?`,
    expression: `${factor1} × ${factor2} = ?`,
    correctAnswer: product,
    explanation: `${factor1} умножить на ${factor2} получится ${product}.`,
    hint: `Вспомни таблицу умножения на ${factor1}.`,
  };
}
