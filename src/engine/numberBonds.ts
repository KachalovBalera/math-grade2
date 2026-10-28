import { MathQuestion, DifficultyLevel } from '../types/math';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateNumberBondsQuestion(difficulty: DifficultyLevel = 1): MathQuestion {
  const modes = ['house', 'equation', 'bonds_10', 'bonds_20', 'tens_and_ones'];
  const mode = modes[randInt(0, modes.length - 1)];

  if (mode === 'house') {
    // Домик состава числа
    const roof = difficulty === 1 ? randInt(5, 10) : (difficulty === 2 ? randInt(11, 20) : randInt(20, 50));
    const left = randInt(1, roof - 1);
    const right = roof - left;
    const missingSide = Math.random() > 0.5 ? 'left' : 'right';
    const correctAnswer = missingSide === 'left' ? left : right;

    return {
      id: `bond_house_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'bonds',
      difficulty,
      type: 'number_house',
      title: 'Домик состава числа',
      prompt: `Заполни окошко в домике числа ${roof}:`,
      correctAnswer,
      explanation: `Число ${roof} состоит из ${left} и ${right}. ${roof} = ${left} + ${right}.`,
      hint: `Из числа на крыше (${roof}) вычти известное число в окошке (${missingSide === 'left' ? right : left}).`,
      houseData: {
        roof,
        left: missingSide === 'left' ? 0 : left,
        right: missingSide === 'right' ? 0 : right,
        missingSide,
      },
    };
  }

  if (mode === 'bonds_10') {
    const a = randInt(1, 9);
    const b = 10 - a;
    const isFirstMissing = Math.random() > 0.5;

    return {
      id: `bond_10_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'bonds',
      difficulty,
      type: 'number_input',
      title: 'Состав числа 10',
      prompt: isFirstMissing ? `10 = □ + ${b}` : `10 = ${a} + □`,
      correctAnswer: isFirstMissing ? a : b,
      explanation: `Число 10 состоит из ${a} и ${b}. 10 = ${a} + ${b}.`,
      hint: `Сколько нужно добавить к ${isFirstMissing ? b : a}, чтобы получилось 10?`,
    };
  }

  if (mode === 'tens_and_ones') {
    const tens = randInt(2, 8);
    const ones = randInt(1, 9);
    const total = tens * 10 + ones;
    const askOnes = Math.random() > 0.5;

    return {
      id: `bond_to_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'bonds',
      difficulty,
      type: 'number_input',
      title: 'Разложение на разрядные слагаемые',
      prompt: askOnes ? `${total} = ${tens * 10} + □` : `${total} = □ + ${ones}`,
      correctAnswer: askOnes ? ones : tens * 10,
      explanation: `${total} раскладывается на десятки и единицы: ${tens * 10} + ${ones}.`,
      hint: `Разложи число на круглые десятки и оставшиеся единицы.`,
    };
  }

  // Общее разложение числа на слагаемые
  const total = randInt(6, 18);
  const left = randInt(2, total - 2);
  const right = total - left;
  return {
    id: `bond_eq_${Date.now()}_${randInt(100, 999)}`,
    topicId: 'bonds',
    difficulty,
    type: 'number_input',
    title: 'Состав числа',
    prompt: `${total} = ${left} + □`,
    correctAnswer: right,
    explanation: `${total} = ${left} + ${right}. Чтобы найти неизвестное слагаемое, вычтем: ${total} − ${left} = ${right}.`,
    hint: `Вычти из ${total} известное число ${left}.`,
  };
}
