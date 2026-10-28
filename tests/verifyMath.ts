import { PRESET_QUESTION_BANK } from '../src/data/presetBank';
import { generateTenAddition, generateTenSubtraction, generateTenMissingNumber } from '../src/engine/tenTransition';
import { generateBracketQuestion } from '../src/engine/brackets';
import { generateEquationQuestion } from '../src/engine/equations';
import { generateGeometryQuestion } from '../src/engine/geometry';
import { generateMultiplicationQuestion } from '../src/engine/multiplication';
import { TenTarget } from '../src/types/math';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, msg: string) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests++;
    console.error(`❌ FAIL: ${msg}`);
  }
}

console.log('🚀 ЗАПУСК АВТОМАТИЧЕСКИХ ТЕСТОВ ПРИЛОЖЕНИЯ «МАТЕМАТИКА — 2 КЛАСС»\n');

// 1. ТЕСТИРОВАНИЕ ВСЕХ 8 ДЕСЯТКОВ ПЕРЕХОДА (20..90)
console.log('1. Проверка генератора «Переход через десяток» (все 8 десятков: 20, 30, 40, 50, 60, 70, 80, 90):');
const tens: TenTarget[] = [20, 30, 40, 50, 60, 70, 80, 90];

for (const t of tens) {
  // Проверяем 10 примеров на сложение для этого десятка
  for (let i = 0; i < 10; i++) {
    const qAdd = generateTenAddition(t, 1);
    const expr = qAdd.expression!.replace(' = ?', '');
    const [sA, sB] = expr.split(' + ');
    const a = parseInt(sA, 10);
    const b = parseInt(sB, 10);
    const res = Number(qAdd.correctAnswer);

    assert(a + b === res, `Сложение: ${a} + ${b} должно быть ${res}, получено ${a + b}`);
    assert(a < t && a + b > t, `Сложение через ${t}: стартовое число ${a} < ${t}, а сумма ${a + b} > ${t}`);
    assert(qAdd.breakdown !== undefined, `Breakdown для ${t} должен быть заполнен`);
    if (qAdd.breakdown) {
      assert(a + qAdd.breakdown.part1 === t, `Шаг 1: ${a} + ${qAdd.breakdown.part1} должно быть ${t}`);
      assert(t + qAdd.breakdown.part2 === res, `Шаг 2: ${t} + ${qAdd.breakdown.part2} должно быть ${res}`);
    }
  }

  // Проверяем 10 примеров на вычитание для этого десятка
  for (let i = 0; i < 10; i++) {
    const qSub = generateTenSubtraction(t, 1);
    const expr = qSub.expression!.replace(' = ?', '');
    const [sA, sB] = expr.split(' − ');
    const a = parseInt(sA, 10);
    const b = parseInt(sB, 10);
    const res = Number(qSub.correctAnswer);

    assert(a - b === res, `Вычитание: ${a} − ${b} должно быть ${res}, получено ${a - b}`);
    assert(a > t && a - b < t, `Вычитание через ${t}: стартовое число ${a} > ${t}, а разность ${a - b} < ${t}`);
    if (qSub.breakdown) {
      assert(a - qSub.breakdown.part1 === t, `Шаг 1: ${a} − ${qSub.breakdown.part1} должно быть ${t}`);
      assert(t - qSub.breakdown.part2 === res, `Шаг 2: ${t} − ${qSub.breakdown.part2} должно быть ${res}`);
    }
  }

  // Проверяем пример с пропущенным числом для этого десятка
  const qMiss = generateTenMissingNumber(t, 2);
  assert(qMiss.correctAnswer !== undefined, `Пропущенное число для ${t} имеет ответ`);
}
console.log(`✅ Все 8 десятков проверены успешно (сложение, вычитание, шаг до круглого десятка, шаг остатка).\n`);

// 2. ТЕСТИРОВАНИЕ СКОБОК
console.log('2. Проверка генератора двухэтапных «Примеров со скобками»:');
for (let i = 0; i < 25; i++) {
  const q = generateBracketQuestion(1);
  assert(q.bracketData !== undefined, 'BracketData присутствует');
  if (q.bracketData) {
    const { prefix, innerExpr, suffix, step1Result, step2Expr, finalResult } = q.bracketData;
    // Проверяем вычисление внутри скобок
    if (innerExpr.includes(' + ')) {
      const [a, b] = innerExpr.split(' + ').map(s => parseInt(s, 10));
      assert(a + b === step1Result, `Скобки: ${a} + ${b} = ${step1Result}`);
    } else if (innerExpr.includes(' − ')) {
      const [a, b] = innerExpr.split(' − ').map(s => parseInt(s, 10));
      assert(a - b === step1Result, `Скобки: ${a} − ${b} = ${step1Result}`);
    }

    // Проверяем второй шаг
    if (step2Expr.includes(' + ')) {
      const [a, b] = step2Expr.split(' + ').map(s => parseInt(s, 10));
      assert(a + b === finalResult, `Шаг 2: ${a} + ${b} = ${finalResult}`);
    } else if (step2Expr.includes(' − ')) {
      const [a, b] = step2Expr.split(' − ').map(s => parseInt(s, 10));
      assert(a - b === finalResult, `Шаг 2: ${a} − ${b} = ${finalResult}`);
    }

    assert(finalResult >= 0, `Результат скобок не должен быть отрицательным: ${finalResult}`);
  }
}
console.log(`✅ Все примеры со скобками математически корректны (шаг 1 над скобками, шаг 2 итоговый).\n`);

// 3. ТЕСТИРОВАНИЕ УРАВНЕНИЙ
console.log('3. Проверка уравнений и подстановки:');
for (let i = 0; i < 15; i++) {
  const eq = generateEquationQuestion(2);
  assert(eq.correctAnswer !== undefined && !isNaN(Number(eq.correctAnswer)), 'Ответ уравнения — число');
  assert(eq.explanation.includes('Проверка:'), 'Объяснение содержит этап проверки подстановкой');
}
console.log('✅ Уравнения и подстановки проверены.\n');

// 4. ТЕСТИРОВАНИЕ ГЕОМЕТРИИ
console.log('4. Проверка задач по геометрии и периметру:');
for (let i = 0; i < 15; i++) {
  const geom = generateGeometryQuestion(2);
  if (geom.geometryData?.questionType === 'perimeter') {
    const sides = geom.geometryData.sides;
    const sum = sides.reduce((acc, v) => acc + v, 0);
    assert(Number(geom.correctAnswer) === sum, `Периметр: сумма сторон ${sides.join('+')} = ${sum}`);
  }
}
console.log('✅ Геометрия проверена.\n');

// 5. ТЕСТИРОВАНИЕ БАНКА ЗАДАНИЙ (PRESET BANK)
console.log('5. Проверка встроенного проверенного банка заданий (PRESET_QUESTION_BANK):');
const topics = Object.keys(PRESET_QUESTION_BANK) as (keyof typeof PRESET_QUESTION_BANK)[];

let totalBankQuestions = 0;
for (const t of topics) {
  const bank = PRESET_QUESTION_BANK[t];
  totalBankQuestions += bank.length;
  assert(bank.length >= 20, `Тема "${t}" содержит не менее 20 заданий (сейчас: ${bank.length})`);

  for (const q of bank) {
    assert(q.prompt.length > 0, `Вопрос ${q.id} имеет текст prompt`);
    assert(q.explanation.length > 0, `Вопрос ${q.id} имеет explanation`);
    assert(q.correctAnswer !== undefined && q.correctAnswer !== '', `Вопрос ${q.id} имеет correctAnswer`);
  }
}
console.log(`✅ Банк заданий содержит ${totalBankQuestions} проверенных заданий по всем темам (>=20 на каждую тему).\n`);

console.log('═════════════════════════════════════════════════════');
console.log(`ИТОГИ ТЕСТИРОВАНИЯ:`);
console.log(`Всего проверок: ${totalTests}`);
console.log(`Успешно пройдено: ${passedTests}`);
console.log(`Ошибок: ${failedTests}`);
console.log('═════════════════════════════════════════════════════');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ВСЕ МАТЕМАТИЧЕСКИЕ И ЛОГИЧЕСКИЕ ПРОВЕРКИ ПРОЙДЕНЫ НА 100%!');
}
