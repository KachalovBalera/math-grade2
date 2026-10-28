import { MathQuestion, DifficultyLevel } from '../types/math';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateAddSubQuestion(difficulty: DifficultyLevel = 1): MathQuestion {
  if (difficulty === 1) {
    // В пределах 20 или круглые десятки
    const isRound = Math.random() > 0.5;
    if (isRound) {
      const tensA = randInt(1, 5) * 10;
      const tensB = randInt(1, 4) * 10;
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        const sum = tensA + tensB;
        return {
          id: `as_radd_${Date.now()}_${randInt(100, 999)}`,
          topicId: 'addsub',
          difficulty: 1,
          type: 'number_input',
          title: 'Сложение круглых десятков',
          prompt: `${tensA} + ${tensB} = ?`,
          expression: `${tensA} + ${tensB} = ?`,
          correctAnswer: sum,
          explanation: `${tensA / 10} дес. + ${tensB / 10} дес. = ${sum / 10} дес. (${sum}).\nОтвет: ${sum}.`,
          hint: `Складывай как простые числа: ${tensA / 10} десятков + ${tensB / 10} десятков.`,
        };
      } else {
        const big = Math.max(tensA, tensB) + 10;
        const small = Math.min(tensA, tensB);
        const diff = big - small;
        return {
          id: `as_rsub_${Date.now()}_${randInt(100, 999)}`,
          topicId: 'addsub',
          difficulty: 1,
          type: 'number_input',
          title: 'Вычитание круглых десятков',
          prompt: `${big} − ${small} = ?`,
          expression: `${big} − ${small} = ?`,
          correctAnswer: diff,
          explanation: `${big / 10} дес. − ${small / 10} дес. = ${diff / 10} дес. (${diff}).\nОтвет: ${diff}.`,
          hint: `Вычитай как десятки: ${big / 10} десятков − ${small / 10} десятков.`,
        };
      }
    } else {
      // Сложение/вычитание в пределах 20
      const a = randInt(6, 12);
      const b = randInt(3, 8);
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        const sum = a + b;
        return {
          id: `as_20add_${Date.now()}_${randInt(100, 999)}`,
          topicId: 'addsub',
          difficulty: 1,
          type: 'number_input',
          title: 'Сложение в пределах 20',
          prompt: `${a} + ${b} = ?`,
          expression: `${a} + ${b} = ?`,
          correctAnswer: sum,
          explanation: `${a} + ${b} = ${sum}.\nУдобно дополнить ${a} до 10, а потом прибавить остаток.`,
          hint: `Сколько нужно добавить до 10?`,
        };
      } else {
        const sum = a + b;
        return {
          id: `as_20sub_${Date.now()}_${randInt(100, 999)}`,
          topicId: 'addsub',
          difficulty: 1,
          type: 'number_input',
          title: 'Вычитание в пределах 20',
          prompt: `${sum} − ${b} = ?`,
          expression: `${sum} − ${b} = ?`,
          correctAnswer: a,
          explanation: `${sum} − ${b} = ${a}.\nПроверка сложением: ${a} + ${b} = ${sum}.`,
          hint: `Вспомни состав числа ${sum}.`,
        };
      }
    }
  }

  if (difficulty === 2) {
    // Двузначные без перехода через разряд (например 34 + 23 = 57 или 68 - 25 = 43)
    const isAdd = Math.random() > 0.5;
    if (isAdd) {
      const t1 = randInt(2, 5), u1 = randInt(1, 5);
      const t2 = randInt(1, 4), u2 = randInt(1, 4);
      const a = t1 * 10 + u1;
      const b = t2 * 10 + u2;
      const sum = a + b;
      return {
        id: `as_dadd_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'addsub',
        difficulty: 2,
        type: 'number_input',
        title: 'Сложение двузначных чисел',
        prompt: `${a} + ${b} = ?`,
        expression: `${a} + ${b} = ?`,
        correctAnswer: sum,
        explanation:
          `Складываем по разрядам:\n` +
          `1) Десятки: ${t1 * 10} + ${t2 * 10} = ${(t1 + t2) * 10}\n` +
          `2) Единицы: ${u1} + ${u2} = ${u1 + u2}\n` +
          `3) Итог: ${(t1 + t2) * 10} + ${u1 + u2} = ${sum}.`,
        hint: `Сложи отдельно десятки (${t1 * 10} + ${t2 * 10}) и отдельно единицы (${u1} + ${u2}).`,
      };
    } else {
      const t1 = randInt(4, 8), u1 = randInt(4, 9);
      const t2 = randInt(1, t1 - 1), u2 = randInt(1, u1);
      const a = t1 * 10 + u1;
      const b = t2 * 10 + u2;
      const diff = a - b;
      return {
        id: `as_dsub_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'addsub',
        difficulty: 2,
        type: 'number_input',
        title: 'Вычитание двузначных чисел',
        prompt: `${a} − ${b} = ?`,
        expression: `${a} − ${b} = ?`,
        correctAnswer: diff,
        explanation:
          `Вычитаем по разрядам:\n` +
          `1) Десятки: ${t1 * 10} − ${t2 * 10} = ${(t1 - t2) * 10}\n` +
          `2) Единицы: ${u1} − ${u2} = ${u1 - u2}\n` +
          `3) Итог: ${(t1 - t2) * 10} + ${u1 - u2} = ${diff}.`,
        hint: `Вычти десятки из десятков, а единицы из единиц.`,
      };
    }
  }

  // difficulty === 3: Двузначные С переходом через разряд (например 38 + 24 = 62, 72 - 35 = 37)
  const isAdd = Math.random() > 0.5;
  if (isAdd) {
    const t1 = randInt(2, 4), u1 = randInt(6, 9);
    const t2 = randInt(1, 3), u2 = randInt(5, 9);
    const a = t1 * 10 + u1;
    const b = t2 * 10 + u2;
    const sum = a + b;
    return {
      id: `as_regroup_add_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'addsub',
      difficulty: 3,
      type: 'number_input',
      title: 'Сложение с переходом через разряд',
      prompt: `${a} + ${b} = ?`,
      expression: `${a} + ${b} = ?`,
      correctAnswer: sum,
      explanation:
        `Пошаговое разложение:\n` +
        `${a} = ${t1 * 10} + ${u1}\n` +
        `${b} = ${t2 * 10} + ${u2}\n` +
        `1) Складываем десятки: ${t1 * 10} + ${t2 * 10} = ${(t1 + t2) * 10}\n` +
        `2) Складываем единицы: ${u1} + ${u2} = ${u1 + u2}\n` +
        `3) Складываем результаты: ${(t1 + t2) * 10} + ${u1 + u2} = ${sum}.\n` +
        `Ответ: ${sum}.`,
      hint: `Разложи оба числа на десятки и единицы: (${t1 * 10} + ${u1}) + (${t2 * 10} + ${u2}).`,
    };
  } else {
    // 72 - 35: u1 < u2
    const t1 = randInt(4, 8), u1 = randInt(1, 4);
    const t2 = randInt(1, t1 - 2), u2 = randInt(u1 + 2, 9);
    const a = t1 * 10 + u1;
    const b = t2 * 10 + u2;
    const diff = a - b;
    return {
      id: `as_regroup_sub_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'addsub',
      difficulty: 3,
      type: 'number_input',
      title: 'Вычитание с переходом через разряд',
      prompt: `${a} − ${b} = ?`,
      expression: `${a} − ${b} = ?`,
      correctAnswer: diff,
      explanation:
        `Удобный способ решения:\n` +
        `1) Вычтем сначала десятки: ${a} − ${t2 * 10} = ${a - t2 * 10}\n` +
        `2) Теперь вычтем единицы (${u2}):\n` +
        `   Сначала до круглого десятка: ${a - t2 * 10} − ${u1} = ${(t1 - t2) * 10}\n` +
        `   Затем остаток единиц: ${(t1 - t2) * 10} − ${u2 - u1} = ${diff}.\n` +
        `Ответ: ${diff}.`,
      hint: `Вычти сначала ${t2 * 10}, а затем оставшиеся ${u2}.`,
    };
  }
}
