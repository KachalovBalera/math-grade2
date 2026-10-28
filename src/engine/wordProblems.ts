import { MathQuestion, DifficultyLevel } from '../types/math';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateWordProblemQuestion(difficulty: DifficultyLevel = 1): MathQuestion {
  const types = ['sum', 'remainder', 'increase', 'difference', 'two_steps', 'multiplication_task'];
  const chosen = difficulty === 1
    ? (Math.random() > 0.5 ? 'sum' : 'remainder')
    : (difficulty === 2 ? ['increase', 'difference', 'sum'][randInt(0, 2)] : types[randInt(0, types.length - 1)]);

  if (chosen === 'sum') {
    const a = randInt(12, difficulty === 1 ? 25 : 45);
    const b = randInt(11, difficulty === 1 ? 20 : 35);
    const sum = a + b;
    return {
      id: `wp_sum_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'wordProblems',
      difficulty,
      type: 'word_problem',
      title: 'Задача на сложение',
      prompt: `У Маши было ${a} наклеек. Подруга подарила ей ещё ${b} наклеек. Сколько наклеек стало у Маши?`,
      correctAnswer: sum,
      explanation:
        `Краткая запись:\nБыло — ${a} накл.\nПодарили — ${b} накл.\nСтало — ?\n\n` +
        `Решение: ${a} + ${b} = ${sum} (накл.)\nОтвет: ${sum} наклеек.`,
      hint: `Раз подруга подарила наклейки, их стало больше. Нужно сложить: ${a} + ${b}.`,
      wordProblemData: {
        was: `Было: ${a} накл.`,
        changed: `Подарили: ${b} накл.`,
        became: `Стало: ?`,
        question: `Сколько наклеек стало?`,
        operation: '+',
        unit: 'накл.',
      },
    };
  }

  if (chosen === 'remainder') {
    const total = randInt(25, difficulty === 1 ? 40 : 80);
    const spent = randInt(8, total - 10);
    const remainder = total - spent;
    return {
      id: `wp_rem_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'wordProblems',
      difficulty,
      type: 'word_problem',
      title: 'Задача на остаток',
      prompt: `В корзине было ${total} яблок. На пирог взяли ${spent} яблок. Сколько яблок осталось в корзине?`,
      correctAnswer: remainder,
      explanation:
        `Краткая запись:\nБыло — ${total} ябл.\nВзяли — ${spent} ябл.\nОсталось — ?\n\n` +
        `Решение: ${total} − ${spent} = ${remainder} (ябл.)\nОтвет: ${remainder} яблок.`,
      hint: `Яблоки забрали, значит их стало меньше. Нужно вычесть: ${total} − ${spent}.`,
      wordProblemData: {
        was: `Было: ${total} ябл.`,
        changed: `Взяли: ${spent} ябл.`,
        became: `Осталось: ?`,
        question: `Сколько яблок осталось?`,
        operation: '-',
        unit: 'ябл.',
      },
    };
  }

  if (chosen === 'difference') {
    const a = randInt(24, 60);
    const diff = randInt(5, 18);
    const b = a - diff;
    return {
      id: `wp_diff_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'wordProblems',
      difficulty,
      type: 'word_problem',
      title: 'Разностное сравнение',
      prompt: `В первом классе ${a} учеников, а во втором — ${b} учеников. На сколько учеников в первом классе больше, чем во втором?`,
      correctAnswer: diff,
      explanation:
        `Правило: Чтобы узнать, на сколько одно число больше или меньше другого, надо из большего вычесть меньшее.\n` +
        `Решение: ${a} − ${b} = ${diff} (уч.)\nОтвет: на ${diff} учеников больше.`,
      hint: `Чтобы сравнить два числа, вычти меньшее из большего: ${a} − ${b}.`,
      wordProblemData: {
        was: `1-й класс: ${a} уч.`,
        changed: `2-й класс: ${b} уч.`,
        became: `Разница: ?`,
        question: `На сколько учеников больше?`,
        operation: '-',
        unit: 'уч.',
      },
    };
  }

  if (chosen === 'two_steps') {
    // В 2 действия: Было 50, сначала взяли 15, потом 10
    const total = randInt(50, 90);
    const part1 = randInt(10, 25);
    const part2 = randInt(5, 20);
    const ans = total - part1 - part2;
    return {
      id: `wp_2s_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'wordProblems',
      difficulty: 3,
      type: 'word_problem',
      title: 'Задача в 2 действия',
      prompt: `В мотке было ${total} м тесьмы. Сначала отрезали ${part1} м, а затем ещё ${part2} м. Сколько метров тесьмы осталось в мотке?`,
      correctAnswer: ans,
      explanation:
        `Решение по действиям:\n` +
        `1) Сколько всего метров отрезали: ${part1} + ${part2} = ${part1 + part2} (м)\n` +
        `2) Сколько метров осталось: ${total} − ${part1 + part2} = ${ans} (м)\n` +
        `Выражением: ${total} − (${part1} + ${part2}) = ${ans} (м)\nОтвет: ${ans} метров.`,
      hint: `Сначала найди, сколько всего отрезали (${part1} + ${part2}), затем вычти из ${total}.`,
      wordProblemData: {
        was: `Было: ${total} м`,
        changed: `Отрезали: ${part1} м и ${part2} м`,
        became: `Осталось: ?`,
        question: `Сколько метров тесьмы осталось?`,
        operation: '-',
        unit: 'м',
      },
    };
  }

  // multiplication_task
  const groups = randInt(2, 5);
  const perGroup = randInt(3, 5);
  const totalItems = groups * perGroup;
  return {
    id: `wp_mult_${Date.now()}_${randInt(100, 999)}`,
    topicId: 'wordProblems',
    difficulty: 3,
    type: 'word_problem',
    title: 'Задача на умножение',
    prompt: `Купили ${groups} одинаковые коробки с карандашами, по ${perGroup} карандашей в каждой. Сколько всего карандашей купили?`,
    correctAnswer: totalItems,
    explanation:
      `Краткая запись:\n1 коробка — ${perGroup} кар.\n${groups} коробок — ?\n\n` +
      `Решение: ${perGroup} × ${groups} = ${totalItems} (кар.)\nОтвет: ${totalItems} карандашей.`,
    hint: `По ${perGroup} взяли ${groups} раз: умножь ${perGroup} на ${groups}.`,
    wordProblemData: {
      was: `В 1 коробке: ${perGroup} кар.`,
      changed: `Коробок: ${groups} шт.`,
      became: `Всего: ?`,
      question: `Сколько всего карандашей?`,
      operation: '*',
      unit: 'кар.',
    },
  };
}
