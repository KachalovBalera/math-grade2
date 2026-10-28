import { MathQuestion, DifficultyLevel } from '../types/math';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMeasurementQuestion(difficulty: DifficultyLevel = 1): MathQuestion {
  const categories = ['length', 'time', 'money', 'mass_capacity'];
  const cat = categories[randInt(0, categories.length - 1)];

  if (cat === 'length') {
    const isDm = Math.random() > 0.5;
    if (isDm) {
      const dm = randInt(1, 9);
      return {
        id: `meas_dm_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'measurements',
        difficulty,
        type: 'number_input',
        title: 'Перевод дециметров в сантиметры',
        prompt: `1 дециметр = 10 см.\nСколько сантиметров в ${dm} дм?\n${dm} дм = □ см`,
        correctAnswer: dm * 10,
        explanation: `В одном дециметре ровно 10 сантиметров. Значит, в ${dm} дм: ${dm} × 10 = ${dm * 10} см.`,
        hint: `Умножь количество дециметров на 10.`,
      };
    } else {
      const tens = randInt(1, 8);
      const ones = randInt(1, 9);
      const totalCm = tens * 10 + ones;
      return {
        id: `meas_cm_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'measurements',
        difficulty,
        type: 'number_input',
        title: 'Выделение дециметров',
        prompt: `${totalCm} см = □ дм ${ones} см. Сколько дм?`,
        correctAnswer: tens,
        explanation: `${totalCm} см = ${tens * 10} см + ${ones} см = ${tens} дм ${ones} см.`,
        hint: `Вспомни: каждые 10 см — это 1 дециметр.`,
      };
    }
  }

  if (cat === 'time') {
    const isHours = Math.random() > 0.5;
    if (isHours) {
      return {
        id: `meas_time_h_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'measurements',
        difficulty: 1,
        type: 'number_input',
        title: 'Единицы времени',
        prompt: `Сколько минут в одном часе?\n1 час = □ мин`,
        correctAnswer: 60,
        explanation: `В одном часе ровно 60 минут. Полчаса — это 30 минут.`,
        hint: `Полный оборот минутной стрелки по часам — это 60 минут.`,
      };
    } else {
      const h = randInt(1, 11);
      const m = [0, 15, 30, 45][randInt(0, 3)];
      const mStr = m === 0 ? '00' : `${m}`;
      return {
        id: `meas_clock_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'measurements',
        difficulty: 2,
        type: 'number_input',
        title: 'Время на часах',
        prompt: `Короткая стрелка показывает на ${h}, а длинная на 12 (0 минут). Который сейчас час?`,
        correctAnswer: h,
        explanation: `Короткая стрелка указывает часы, а длинная — минуты. Если минутная на 12, то сейчас ровно ${h} часов.`,
        hint: `Короткая стрелка показывает часы.`,
        clockData: {
          targetHours: h,
          targetMinutes: m,
          interactive: false,
        },
      };
    }
  }

  if (cat === 'money') {
    const isChange = Math.random() > 0.5;
    if (isChange) {
      const cost = randInt(20, 45);
      const banknote = 50;
      const change = banknote - cost;
      return {
        id: `meas_money_chg_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'measurements',
        difficulty: 2,
        type: 'number_input',
        title: 'Покупки и сдача',
        prompt: `Тетрадь стоит ${cost} руб. Покупатель дал купюру ${banknote} руб. Сколько рублей сдачи он должен получить?`,
        correctAnswer: change,
        explanation: `Сдача = получено денег − стоимость покупки:\n${banknote} − ${cost} = ${change} руб.`,
        hint: `Вычти стоимость (${cost}) из ${banknote}.`,
        moneyData: {
          coins: [],
          banknotes: [50],
          targetSum: cost,
          changeFrom: banknote,
        },
      };
    } else {
      const r1 = 20, r2 = randInt(1, 5) * 5;
      const total = r1 + r2;
      return {
        id: `meas_money_sum_${Date.now()}_${randInt(100, 999)}`,
        topicId: 'measurements',
        difficulty: 1,
        type: 'number_input',
        title: 'Счёт денег',
        prompt: `Сколько рублей вместе составляют монеты ${r1} руб. и ${r2} руб.?`,
        correctAnswer: total,
        explanation: `${r1} руб. + ${r2} руб. = ${total} руб.`,
        hint: `Сложи достоинства монет: ${r1} + ${r2}.`,
        moneyData: {
          coins: [r1, r2],
          banknotes: [],
          targetSum: total,
        },
      };
    }
  }

  // mass_capacity
  return {
    id: `meas_mc_${Date.now()}_${randInt(100, 999)}`,
    topicId: 'measurements',
    difficulty: 1,
    type: 'choice',
    title: 'Сравнение массы',
    prompt: `Что тяжелее: 1 килограмм или 500 граммов?`,
    options: ['1 килограмм', '500 граммов', 'Они равны'],
    correctAnswer: '1 килограмм',
    explanation: `В 1 килограмме ровно 1000 граммов! 1000 г больше, чем 500 г, поэтому 1 кг тяжелее.`,
    hint: `Вспомни: 1 кг = 1000 г. 1000 больше 500!`,
  };
}
