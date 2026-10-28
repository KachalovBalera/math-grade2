import { MathQuestion, DifficultyLevel } from '../types/math';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateLogicQuestion(difficulty: DifficultyLevel = 1): MathQuestion {
  const types = ['pattern', 'two_numbers_riddle', 'odd_one_out', 'magic_sum'];
  const type = types[randInt(0, types.length - 1)];

  if (type === 'pattern') {
    const step = [2, 3, 5, 10][randInt(0, 3)];
    const start = randInt(1, 4) * step;
    const s1 = start;
    const s2 = s1 + step;
    const s3 = s2 + step;
    const s4 = s3 + step;
    const ans = s4 + step;
    return {
      id: `logic_pat_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'logic',
      difficulty,
      type: 'number_input',
      title: 'Числовая закономерность',
      prompt: `Найди закономерность и продолжи ряд:\n${s1}, ${s2}, ${s3}, ${s4}, □`,
      correctAnswer: ans,
      explanation: `Каждое следующее число получается прибавлением ${step}:\n${s4} + ${step} = ${ans}.`,
      hint: `Сравни соседние числа: ${s2} − ${s1} = ${step}. Значит, к ${s4} нужно прибавить ${step}.`,
    };
  }

  if (type === 'two_numbers_riddle') {
    // x + y = sum, x - y = diff
    // x = (sum + diff)/2, y = (sum - diff)/2
    const y = randInt(2, 8);
    const diff = randInt(2, 6);
    const x = y + diff;
    const sum = x + y;
    return {
      id: `logic_riddle_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'logic',
      difficulty: 2,
      type: 'number_input',
      title: 'Загадка двух чисел',
      prompt: `Сумма двух чисел равна ${sum}, а их разность равна ${diff}. Найди БОЛЬШЕЕ число:`,
      correctAnswer: x,
      explanation:
        `Большее число — ${x}, меньшее — ${y}.\n` +
        `Проверим:\n` +
        `Сумма: ${x} + ${y} = ${sum}\n` +
        `Разность: ${x} − ${y} = ${diff}\n` +
        `Ответ: ${x}.`,
      hint: `Если сложить сумму и разность (${sum} + ${diff} = ${sum + diff}), то получится удвоенное большее число.`,
    };
  }

  if (type === 'odd_one_out') {
    const isEven = Math.random() > 0.5;
    if (isEven) {
      // 3 чётных, 1 нечётное
      const evens = [12, 24, 38];
      const odd = 17;
      const opts = [...evens, odd].sort(() => Math.random() - 0.5);
      return {
        id: `logic_odd_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'logic',
        difficulty: 1,
        type: 'choice',
        title: 'Найди лишнее число',
        prompt: `Какое число здесь лишнее: ${opts.join(', ')}?`,
        options: opts.map(String),
        correctAnswer: String(odd),
        explanation: `Лишнее число — ${odd}, потому что оно нечётное (оканчивается на 7), а остальные числа чётные (делятся на 2).`,
        hint: `Посмотри на последнюю цифру каждого числа. Чётные оканчиваются на 0, 2, 4, 6, 8.`,
      };
    } else {
      // 3 круглых десятка, 1 некруглое
      const rounds = [20, 50, 70];
      const notRound = 45;
      const opts = [...rounds, notRound].sort(() => Math.random() - 0.5);
      return {
        id: `logic_round_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'logic',
        difficulty: 1,
        type: 'choice',
        title: 'Найди лишнее число',
        prompt: `Какое число здесь лишнее: ${opts.join(', ')}?`,
        options: opts.map(String),
        correctAnswer: String(notRound),
        explanation: `Лишнее число — ${notRound}, так как у него есть единицы, а числа 20, 50, 70 — круглые десятки (оканчиваются на 0).`,
        hint: `Все ли числа оканчиваются на ноль?`,
      };
    }
  }

  // magic_sum
  const target = 15;
  const a = 4, b = 6;
  const c = target - a - b;
  return {
    id: `logic_msum_${Date.now()}_${randInt(100, 999)}`,
    topicId: 'logic',
    difficulty: 2,
    type: 'number_input',
    title: 'Магическая тройка',
    prompt: `Сумма трёх чисел в цепочке равна ${target}: ${a} + ${b} + □ = ${target}. Какое число пропущено?`,
    correctAnswer: c,
    explanation: `${a} + ${b} = ${a + b}. Чтобы получилось ${target}, нужно прибавить ${c} (${target} − ${a + b} = ${c}).`,
    hint: `Сначала сложи первые два числа (${a} + ${b} = ${a + b}), затем вычти их сумму из ${target}.`,
  };
}
