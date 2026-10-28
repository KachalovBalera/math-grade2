import { MathQuestion, TenTarget, TenTransitionMode, DifficultyLevel } from '../types/math';

export interface TenTransitionConfig {
  ten: TenTarget | 'all';
  mode: TenTransitionMode;
  difficulty: DifficultyLevel;
  count: number;
}

// Генерация случайного целого в диапазоне [min, max]
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Создаёт пример на СЛОЖЕНИЕ с гарантированным переходом через выбранный десяток T.
 * Первое число: T - u (где u от 1 до 9, обычно 2..8).
 * Второе число: u + k (где k от 1 до 8).
 * Итог: (T - u) + (u + k) = T + k.
 * Шаги:
 * 1) Дойти до круглого десятка T: (T - u) + u = T
 * 2) Прибавить оставшиеся единицы: T + k = T + k
 */
export function generateTenAddition(ten: TenTarget, difficulty: DifficultyLevel): MathQuestion {
  // Например для ten = 40:
  // a = 38 (u = 2), b = 5 (u=2, k=3), result = 43
  const u = randInt(2, 7); // сколько не хватает до круглого десятка
  const a = ten - u;       // 40 - 2 = 38
  const k = randInt(1, 7); // сколько перейдём за круглый десяток
  const b = u + k;         // 2 + 3 = 5 (от 3 до 14, но обычно до 9 для 2 класса)
  
  // Убедимся, что b < 10 (однозначное прибавление - основа 2 класса)
  const clampedB = b >= 10 ? randInt(u + 1, 9) : b;
  const actualK = clampedB - u;
  const result = a + clampedB; // ten + actualK

  const prompt = `${a} + ${clampedB} = ?`;
  const explanation = 
    `1) Сначала дополняем до ${ten}: ${a} + ${u} = ${ten}.\n` +
    `2) Из ${clampedB} мы уже взяли ${u}, осталось ${actualK}.\n` +
    `3) Прибавляем остаток: ${ten} + ${actualK} = ${result}.\n` +
    `Ответ: ${result}.`;

  const hint = `Сколько нужно прибавить к ${a}, чтобы получилось ${ten}? Нужно ${u}. Затем прибавь остаток (${clampedB} − ${u} = ${actualK}).`;

  // Генерация вариантов для выбора
  const wrongOptions = new Set<number>();
  wrongOptions.add(result + 1);
  wrongOptions.add(result - 1);
  wrongOptions.add(result + 10);
  wrongOptions.add(result - 2);
  const options = Array.from(wrongOptions)
    .filter(n => n > 0 && n !== result)
    .slice(0, 3)
    .concat(result)
    .sort(() => Math.random() - 0.5)
    .map(String);

  return {
    id: `ten_add_${ten}_${Date.now()}_${randInt(100, 999)}`,
    topicId: 'tenTransition',
    difficulty,
    type: difficulty === 1 ? 'ten_transition' : (difficulty === 2 ? 'number_input' : 'number_input'),
    title: `Переход через ${ten}`,
    prompt,
    expression: `${a} + ${clampedB} = ?`,
    correctAnswer: result,
    options,
    explanation,
    hint,
    tenTarget: ten,
    breakdown: {
      part1: u,
      part2: actualK,
      roundTen: ten,
    },
  };
}

/**
 * Создаёт пример на ВЫЧИТАНИЕ с гарантированным переходом через выбранный десяток T.
 * Уменьшаемое: T + u (где u от 1 до 8).
 * Вычитаемое: u + k (где k от 1 до 8, так чтобы результат был < T).
 * Итог: (T + u) - (u + k) = T - k.
 * Шаги:
 * 1) Сначала вычесть u, чтобы дойти до круглого десятка T: (T + u) - u = T
 * 2) Из T вычесть оставшиеся k: T - k
 */
export function generateTenSubtraction(ten: TenTarget, difficulty: DifficultyLevel): MathQuestion {
  // Например для ten = 40:
  // a = 43 (u = 3), b = 7 (u=3, k=4), result = 36
  const u = randInt(1, 6); // единицы сверх десятка: 41..46
  const a = ten + u;
  const k = randInt(2, 7); // единицы, которые надо забрать из десятка
  const b = u + k;         // вычитаемое: от 3 до 9 (однозначное)
  const clampedB = b >= 10 ? randInt(u + 1, 9) : b;
  const actualK = clampedB - u;
  const result = a - clampedB; // ten - actualK

  const prompt = `${a} − ${clampedB} = ?`;
  const explanation =
    `1) Сначала вычитаем единицы до ${ten}: ${a} − ${u} = ${ten}.\n` +
    `2) Из ${clampedB} мы уже вычли ${u}, осталось вычесть ${actualK}.\n` +
    `3) Вычитаем из круглого десятка: ${ten} − ${actualK} = ${result}.\n` +
    `Ответ: ${result}.`;

  const hint = `Сначала вычти ${u}, чтобы получилось ровно ${ten}. Затем из ${ten} вычти остаток (${clampedB} − ${u} = ${actualK}).`;

  const wrongOptions = new Set<number>();
  wrongOptions.add(result + 1);
  wrongOptions.add(result - 1);
  wrongOptions.add(result + 10);
  wrongOptions.add(result - 10 > 0 ? result - 10 : result + 2);
  const options = Array.from(wrongOptions)
    .filter(n => n > 0 && n !== result)
    .slice(0, 3)
    .concat(result)
    .sort(() => Math.random() - 0.5)
    .map(String);

  return {
    id: `ten_sub_${ten}_${Date.now()}_${randInt(100, 999)}`,
    topicId: 'tenTransition',
    difficulty,
    type: difficulty === 1 ? 'ten_transition' : 'number_input',
    title: `Переход через ${ten}`,
    prompt,
    expression: `${a} − ${clampedB} = ?`,
    correctAnswer: result,
    options,
    explanation,
    hint,
    tenTarget: ten,
    breakdown: {
      part1: u,
      part2: actualK,
      roundTen: ten,
    },
  };
}

/**
 * Пример с пропущенным числом через десяток T:
 * Например: 38 + _ = 43 или 43 − _ = 36 или _ + 5 = 43
 */
export function generateTenMissingNumber(ten: TenTarget, difficulty: DifficultyLevel): MathQuestion {
  const isAddition = Math.random() > 0.5;
  if (isAddition) {
    const base = generateTenAddition(ten, difficulty);
    const parts = base.expression!.replace(' = ?', '').split(' + ');
    const a = parseInt(parts[0], 10);
    const b = parseInt(parts[1], 10);
    const res = Number(base.correctAnswer);

    const missingFirst = Math.random() > 0.5;
    if (missingFirst) {
      return {
        ...base,
        id: `ten_miss_a_${Date.now()}_${randInt(100, 999)}`,
        prompt: `□ + ${b} = ${res}`,
        expression: `□ + ${b} = ${res}`,
        correctAnswer: a,
        hint: `Чтобы найти неизвестное слагаемое, нужно из суммы вычесть известное слагаемое: ${res} − ${b}.`,
        explanation: `Неизвестное слагаемое: ${res} − ${b} = ${a}.`,
      };
    } else {
      return {
        ...base,
        id: `ten_miss_b_${Date.now()}_${randInt(100, 999)}`,
        prompt: `${a} + □ = ${res}`,
        expression: `${a} + □ = ${res}`,
        correctAnswer: b,
        hint: `Чтобы найти неизвестное слагаемое, вычти ${a} из ${res}: ${res} − ${a}.`,
        explanation: `Пропущенное слагаемое: ${res} − ${a} = ${b}.`,
      };
    }
  } else {
    const base = generateTenSubtraction(ten, difficulty);
    const parts = base.expression!.replace(' = ?', '').split(' − ');
    const a = parseInt(parts[0], 10);
    const b = parseInt(parts[1], 10);
    const res = Number(base.correctAnswer);

    const missingSubtrahend = Math.random() > 0.5;
    if (missingSubtrahend) {
      return {
        ...base,
        id: `ten_miss_sub_${Date.now()}_${randInt(100, 999)}`,
        prompt: `${a} − □ = ${res}`,
        expression: `${a} − □ = ${res}`,
        correctAnswer: b,
        hint: `Чтобы найти неизвестное вычитаемое, нужно из уменьшаемого вычесть разность: ${a} − ${res}.`,
        explanation: `Пропущенное число: ${a} − ${res} = ${b}.`,
      };
    } else {
      return {
        ...base,
        id: `ten_miss_min_${Date.now()}_${randInt(100, 999)}`,
        prompt: `□ − ${b} = ${res}`,
        expression: `□ − ${b} = ${res}`,
        correctAnswer: a,
        hint: `Чтобы найти неизвестное уменьшаемое, нужно к разности прибавить вычитаемое: ${res} + ${b}.`,
        explanation: `Пропущенное уменьшаемое: ${res} + ${b} = ${a}.`,
      };
    }
  }
}

/**
 * Короткая текстовая задача с переходом через выбранный десяток
 */
export function generateTenWordProblem(ten: TenTarget, difficulty: DifficultyLevel): MathQuestion {
  const isAdd = Math.random() > 0.5;
  if (isAdd) {
    const u = randInt(2, 6);
    const a = ten - u;
    const k = randInt(2, 6);
    const b = u + k;
    const res = a + b;
    const subjects = [
      { name: 'У Ани', item: 'наклеек', verb: 'подарили ещё' },
      { name: 'На полке', item: 'книг', verb: 'поставили ещё' },
      { name: 'В коробке', item: 'карандашей', verb: 'добавили ещё' },
      { name: 'В корзине', item: 'яблок', verb: 'положили ещё' },
    ];
    const s = subjects[randInt(0, subjects.length - 1)];
    const text = `${s.name} было ${a} ${s.item}. Ей ${s.verb} ${b} ${s.item}. Сколько ${s.item} стало?`;
    return {
      id: `ten_wp_add_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'tenTransition',
      difficulty,
      type: 'word_problem',
      title: `Задача на переход через ${ten}`,
      prompt: text,
      correctAnswer: res,
      explanation: `Было ${a}, добавили ${b}.\nРешение: ${a} + ${b} = ${a} + ${u} + ${k} = ${ten} + ${k} = ${res}.\nОтвет: ${res} ${s.item}.`,
      hint: `Сложи ${a} и ${b}. Сначала прибавь ${u} до ${ten}, затем остаток.`,
      tenTarget: ten,
      wordProblemData: {
        was: `Было: ${a} ${s.item}`,
        changed: `Добавили: ${b} ${s.item}`,
        became: `Стало: ?`,
        question: `Сколько ${s.item} стало?`,
        operation: '+',
        unit: s.item,
      },
    };
  } else {
    const u = randInt(2, 5);
    const a = ten + u;
    const k = randInt(2, 5);
    const b = u + k;
    const res = a - b;
    const subjects = [
      { name: 'В вазе', item: 'конфет', verb: 'съели' },
      { name: 'В гараже', item: 'машин', verb: 'уехало' },
      { name: 'На ветке', item: 'птиц', verb: 'улетело' },
      { name: 'В альбоме', item: 'рисунков', verb: 'подарили' },
    ];
    const s = subjects[randInt(0, subjects.length - 1)];
    const text = `${s.name} было ${a} ${s.item}. Потом ${s.verb} ${b} ${s.item}. Сколько ${s.item} осталось?`;
    return {
      id: `ten_wp_sub_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'tenTransition',
      difficulty,
      type: 'word_problem',
      title: `Задача на переход через ${ten}`,
      prompt: text,
      correctAnswer: res,
      explanation: `Было ${a}, убрали ${b}.\nРешение: ${a} − ${b} = ${a} − ${u} − ${k} = ${ten} − ${k} = ${res}.\nОтвет: ${res} ${s.item}.`,
      hint: `Вычти ${b} из ${a}. Сначала вычти ${u} до ${ten}, затем вычти ещё ${k}.`,
      tenTarget: ten,
      wordProblemData: {
        was: `Было: ${a} ${s.item}`,
        changed: `Убрали: ${b} ${s.item}`,
        became: `Осталось: ?`,
        question: `Сколько ${s.item} осталось?`,
        operation: '-',
        unit: s.item,
      },
    };
  }
}

/**
 * Главный генератор набора заданий для тренажёра «Переход через десяток».
 * Гарантирует правильный выбранный десяток или равномерное распределение для 'all'.
 */
export function generateTenTransitionSet(config: TenTransitionConfig): MathQuestion[] {
  const tensList: TenTarget[] = [20, 30, 40, 50, 60, 70, 80, 90];
  const questions: MathQuestion[] = [];

  for (let i = 0; i < config.count; i++) {
    const targetTen: TenTarget = config.ten === 'all'
      ? tensList[i % tensList.length]
      : config.ten;

    let q: MathQuestion;
    switch (config.mode) {
      case 'addition':
        q = generateTenAddition(targetTen, config.difficulty);
        break;
      case 'subtraction':
        q = generateTenSubtraction(targetTen, config.difficulty);
        break;
      case 'mixed_add_sub':
        q = Math.random() > 0.5
          ? generateTenAddition(targetTen, config.difficulty)
          : generateTenSubtraction(targetTen, config.difficulty);
        break;
      case 'missing_numbers':
        q = generateTenMissingNumber(targetTen, config.difficulty);
        break;
      case 'mixed_training': {
        const r = Math.random();
        if (r < 0.4) q = generateTenAddition(targetTen, config.difficulty);
        else if (r < 0.8) q = generateTenSubtraction(targetTen, config.difficulty);
        else q = generateTenWordProblem(targetTen, config.difficulty);
        break;
      }
      case 'test': {
        const r = Math.random();
        if (r < 0.45) q = generateTenAddition(targetTen, 3);
        else if (r < 0.9) q = generateTenSubtraction(targetTen, 3);
        else q = generateTenMissingNumber(targetTen, 3);
        break;
      }
      default:
        q = generateTenAddition(targetTen, config.difficulty);
    }
    questions.push(q);
  }

  return questions;
}
