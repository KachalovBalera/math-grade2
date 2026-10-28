import { MathQuestion, DifficultyLevel } from '../types/math';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateEquationQuestion(difficulty: DifficultyLevel = 1): MathQuestion {
  const types = ['add_x_first', 'add_x_second', 'sub_x_subtrahend', 'sub_x_minuend', 'mult_x'];
  const type = difficulty === 3 && Math.random() > 0.6 ? 'mult_x' : types[randInt(0, 3)];

  if (type === 'add_x_first') {
    // x + b = sum
    const x = randInt(3, difficulty === 1 ? 10 : 35);
    const b = randInt(4, difficulty === 1 ? 10 : 25);
    const sum = x + b;
    return {
      id: `eq_add1_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'equations',
      difficulty,
      type: 'equation',
      title: 'Уравнение на сложение',
      prompt: `Реши уравнение:\nx + ${b} = ${sum}`,
      expression: `x + ${b} = ${sum}`,
      correctAnswer: x,
      explanation:
        `Правило: Чтобы найти неизвестное слагаемое, нужно из суммы вычесть известное слагаемое.\n` +
        `x = ${sum} − ${b}\n` +
        `x = ${x}\n\n` +
        `Проверка: ${x} + ${b} = ${sum} (Верно!)`,
      hint: `x — это слагаемое. Вычти ${b} из ${sum}.`,
    };
  }

  if (type === 'add_x_second') {
    // a + x = sum
    const a = randInt(4, difficulty === 1 ? 10 : 30);
    const x = randInt(3, difficulty === 1 ? 10 : 30);
    const sum = a + x;
    return {
      id: `eq_add2_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'equations',
      difficulty,
      type: 'equation',
      title: 'Уравнение на сложение',
      prompt: `Реши уравнение:\n${a} + x = ${sum}`,
      expression: `${a} + x = ${sum}`,
      correctAnswer: x,
      explanation:
        `Правило: Чтобы найти неизвестное слагаемое, нужно из суммы вычесть известное слагаемое.\n` +
        `x = ${sum} − ${a}\n` +
        `x = ${x}\n\n` +
        `Проверка: ${a} + ${x} = ${sum} (Верно!)`,
      hint: `Из суммы ${sum} вычти первое слагаемое ${a}.`,
    };
  }

  if (type === 'sub_x_subtrahend') {
    // a - x = diff (неизвестное вычитаемое)
    const a = randInt(12, difficulty === 1 ? 20 : 60);
    const diff = randInt(5, a - 3);
    const x = a - diff;
    return {
      id: `eq_sub1_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'equations',
      difficulty,
      type: 'equation',
      title: 'Неизвестное вычитаемое',
      prompt: `Реши уравнение:\n${a} − x = ${diff}`,
      expression: `${a} − x = ${diff}`,
      correctAnswer: x,
      explanation:
        `Правило: Чтобы найти неизвестное вычитаемое, нужно из уменьшаемого вычесть разность.\n` +
        `x = ${a} − ${diff}\n` +
        `x = ${x}\n\n` +
        `Проверка: ${a} − ${x} = ${diff} (Верно!)`,
      hint: `Чтобы найти x, вычти ${diff} из ${a}.`,
    };
  }

  if (type === 'sub_x_minuend') {
    // x - b = diff (неизвестное уменьшаемое)
    const b = randInt(4, difficulty === 1 ? 10 : 25);
    const diff = randInt(5, difficulty === 1 ? 10 : 35);
    const x = b + diff;
    return {
      id: `eq_sub2_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'equations',
      difficulty,
      type: 'equation',
      title: 'Неизвестное уменьшаемое',
      prompt: `Реши уравнение:\nx − ${b} = ${diff}`,
      expression: `x − ${b} = ${diff}`,
      correctAnswer: x,
      explanation:
        `Правило: Чтобы найти неизвестное уменьшаемое, нужно к разности прибавить вычитаемое.\n` +
        `x = ${diff} + ${b}\n` +
        `x = ${x}\n\n` +
        `Проверка: ${x} − ${b} = ${diff} (Верно!)`,
      hint: `Уменьшаемое — самое большое число. Сложи ${diff} и ${b}.`,
    };
  }

  // mult_x: x * b = product
  const b = randInt(2, 5);
  const x = randInt(2, 8);
  const product = b * x;
  return {
    id: `eq_mult_${Date.now()}_${randInt(100, 999)}`,
    topicId: 'equations',
    difficulty: 3,
    type: 'equation',
    title: 'Уравнение с умножением',
    prompt: `Реши уравнение:\nx × ${b} = ${product}`,
    expression: `x × ${b} = ${product}`,
    correctAnswer: x,
    explanation:
      `Правило: Чтобы найти неизвестный множитель, нужно произведение разделить на известный множитель.\n` +
      `x = ${product} : ${b}\n` +
      `x = ${x}\n\n` +
      `Проверка: ${x} × ${b} = ${product} (Верно!)`,
    hint: `Раздели ${product} на ${b}.`,
  };
}
