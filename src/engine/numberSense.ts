import { MathQuestion, DifficultyLevel } from '../types/math';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateNumberSenseQuestion(difficulty: DifficultyLevel = 1): MathQuestion {
  const types = ['tens_ones', 'between', 'compare', 'place_value', 'description', 'sequence'];
  const chosenType = types[randInt(0, types.length - 1)];

  if (chosenType === 'tens_ones') {
    const tens = randInt(1, 9);
    const ones = randInt(1, 9);
    const num = tens * 10 + ones;
    const isAskTens = Math.random() > 0.5;

    if (isAskTens) {
      return {
        id: `ns_to_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'numbers',
        difficulty,
        type: 'number_input',
        title: 'Десятки и единицы',
        prompt: `Сколько ДЕСЯТКОВ в числе ${num}?`,
        correctAnswer: tens,
        explanation: `В числе ${num}: ${tens} десятков и ${ones} единиц. Первая цифра слева (${tens}) показывает число десятков.`,
        hint: `Посмотри на первую цифру двузначного числа: она указывает на десятки.`,
      };
    } else {
      return {
        id: `ns_to_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'numbers',
        difficulty,
        type: 'number_input',
        title: 'Десятки и единицы',
        prompt: `Сколько ЕДИНИЦ в числе ${num}?`,
        correctAnswer: ones,
        explanation: `В числе ${num}: ${tens} десятков и ${ones} единиц. Вторая цифра (${ones}) показывает число единиц.`,
        hint: `Посмотри на вторую цифру двузначного числа: она указывает на единицы.`,
      };
    }
  }

  if (chosenType === 'between') {
    const mid = randInt(11, 98);
    const prev = mid - 1;
    const next = mid + 1;
    return {
      id: `ns_btw_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'numbers',
      difficulty,
      type: 'number_input',
      title: 'Предыдущее и следующее',
      prompt: `Какое число стоит между ${prev} и ${next}?`,
      correctAnswer: mid,
      explanation: `Числа идут по порядку: ${prev}, ${mid}, ${next}. Значит, между ними стоит ${mid}.`,
      hint: `Прибавь 1 к предыдущему числу: ${prev} + 1 = ?`,
    };
  }

  if (chosenType === 'compare') {
    const a = randInt(10, 99);
    let b = randInt(10, 99);
    while (b === a) b = randInt(10, 99);
    const correctSign = a < b ? '<' : '>';
    return {
      id: `ns_cmp_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'numbers',
      difficulty,
      type: 'choice',
      title: 'Сравнение чисел',
      prompt: `Сравни числа: ${a} ○ ${b}`,
      options: ['<', '>', '='],
      correctAnswer: correctSign,
      explanation: `${a} ${correctSign === '<' ? 'меньше' : 'больше'}, чем ${b}, поэтому верный знак: ${correctSign}.`,
      hint: `Сравни сначала десятки. Если десятки равны, сравни единицы.`,
    };
  }

  if (chosenType === 'place_value') {
    const tens = randInt(2, 9);
    const ones = randInt(1, 9);
    const num = tens * 10 + ones;
    return {
      id: `ns_pv_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'numbers',
      difficulty,
      type: 'number_input',
      title: 'Разрядный состав числа',
      prompt: `${num} = ${tens * 10} + □`,
      correctAnswer: ones,
      explanation: `${num} состоит из ${tens} десятков (${tens * 10}) и ${ones} единиц. Значит, ${num} = ${tens * 10} + ${ones}.`,
      hint: `Сколько единиц останется, если убрать круглые десятки?`,
    };
  }

  if (chosenType === 'description') {
    const tens = randInt(2, 9);
    const ones = randInt(1, 9);
    const num = tens * 10 + ones;
    return {
      id: `ns_desc_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'numbers',
      difficulty,
      type: 'number_input',
      title: 'Число по описанию',
      prompt: `Запиши число, в котором ${tens} десятков и ${ones} единиц:`,
      correctAnswer: num,
      explanation: `${tens} десятков — это ${tens * 10}, да ещё ${ones} единиц — получается число ${num}.`,
      hint: `Десятки записываются на первом месте, единицы на втором.`,
    };
  }

  // sequence
  const start = randInt(10, 60);
  const step = randInt(2, 5);
  const seq = [start, start + step, start + step * 2, start + step * 3];
  const ans = start + step * 4;
  return {
    id: `ns_seq_${Date.now()}_${randInt(100, 999)}`,
    topicId: 'numbers',
    difficulty,
    type: 'number_input',
    title: 'Числовой ряд',
    prompt: `Продолжи числовой ряд: ${seq.join(', ')}, □`,
    correctAnswer: ans,
    explanation: `Каждое следующее число увеличивается на ${step}. Значит, ${seq[3]} + ${step} = ${ans}.`,
    hint: `Найди разницу между соседними числами: на сколько каждое следующее больше предыдущего?`,
  };
}
