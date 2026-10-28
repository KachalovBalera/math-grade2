import { MathQuestion, DifficultyLevel } from '../types/math';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateGeometryQuestion(difficulty: DifficultyLevel = 1): MathQuestion {
  const types = ['identify', 'count_elements', 'perimeter_rect', 'perimeter_square', 'perimeter_triangle'];
  const chosen = difficulty === 1
    ? ['identify', 'count_elements'][randInt(0, 1)]
    : types[randInt(2, types.length - 1)];

  if (chosen === 'identify') {
    const shapes = [
      { name: 'треугольник', sides: 3, vertices: 3 },
      { name: 'четырёхугольник', sides: 4, vertices: 4 },
      { name: 'прямоугольник', sides: 4, vertices: 4 },
      { name: 'квадрат', sides: 4, vertices: 4 },
      { name: 'пятиугольник', sides: 5, vertices: 5 },
    ];
    const s = shapes[randInt(0, shapes.length - 1)];
    return {
      id: `geom_id_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'geometry',
      difficulty: 1,
      type: 'choice',
      title: 'Геометрические фигуры',
      prompt: `Какая фигура имеет ровно ${s.sides} стороны и ${s.vertices} вершины?`,
      options: ['треугольник', 'прямоугольник', 'круг', 'пятиугольник'],
      correctAnswer: s.name === 'квадрат' ? 'прямоугольник' : s.name,
      explanation: `У фигуры с ${s.sides} сторонами и ${s.vertices} вершинами это — ${s.name === 'квадрат' ? 'прямоугольник' : s.name}. Круг не имеет углов и сторон.`,
      hint: `Вспомни: у треугольника 3 стороны, у четырёхугольника 4, у пятиугольника 5.`,
    };
  }

  if (chosen === 'count_elements') {
    const isVertices = Math.random() > 0.5;
    return {
      id: `geom_cnt_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'geometry',
      difficulty: 1,
      type: 'number_input',
      title: 'Элементы многоугольника',
      prompt: isVertices
        ? `Сколько ВЕРШИН у четырёхугольника?`
        : `Сколько СТОРОН у треугольника?`,
      correctAnswer: isVertices ? 4 : 3,
      explanation: isVertices
        ? `У любого четырёхугольника 4 вершины (угла) и 4 стороны.`
        : `У треугольника ровно 3 стороны и 3 вершины.`,
      hint: isVertices ? `Посчитай углы у четырёхугольника.` : `Слово «треугольник» подсказывает количество сторон.`,
    };
  }

  if (chosen === 'perimeter_rect') {
    const a = randInt(3, 8);
    const b = randInt(2, a - 1);
    const p = (a + b) * 2;
    return {
      id: `geom_prect_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'geometry',
      difficulty: 2,
      type: 'number_input',
      title: 'Периметр прямоугольника',
      prompt: `У прямоугольника стороны ${a} см и ${b} см. Найди его периметр (в см):`,
      correctAnswer: p,
      explanation:
        `Периметр — это сумма длин всех сторон фигуры.\n` +
        `У прямоугольника противоположные стороны равны:\n` +
        `P = ${a} + ${b} + ${a} + ${b} = ${p} см.\n` +
        `Или: (${a} + ${b}) × 2 = ${p} см.\n` +
        `Ответ: ${p} см.`,
      hint: `Сложи все 4 стороны прямоугольника: ${a} + ${b} + ${a} + ${b}.`,
      geometryData: {
        shapeType: 'rectangle',
        sides: [a, b, a, b],
        unit: 'см',
        questionType: 'perimeter',
      },
    };
  }

  if (chosen === 'perimeter_square') {
    const a = randInt(2, 9);
    const p = a * 4;
    return {
      id: `geom_psq_${Date.now()}_${randInt(100, 999)}`,
      topicId: 'geometry',
      difficulty: 2,
      type: 'number_input',
      title: 'Периметр квадрата',
      prompt: `Длина стороны квадрата ${a} см. Найди его периметр (в см):`,
      correctAnswer: p,
      explanation:
        `У квадрата все 4 стороны равны между собой.\n` +
        `P = ${a} + ${a} + ${a} + ${a} = ${p} см.\n` +
        `Или действием умножения: ${a} × 4 = ${p} см.\n` +
        `Ответ: ${p} см.`,
      hint: `Сложи 4 одинаковые стороны квадрата: ${a} + ${a} + ${a} + ${a}.`,
      geometryData: {
        shapeType: 'square',
        sides: [a, a, a, a],
        unit: 'см',
        questionType: 'perimeter',
      },
    };
  }

  // perimeter_triangle
  const a = randInt(3, 7);
  const b = randInt(3, 7);
  const c = randInt(3, 7);
  const p = a + b + c;
  return {
    id: `geom_ptri_${Date.now()}_${randInt(100, 999)}`,
    topicId: 'geometry',
    difficulty: 2,
    type: 'number_input',
    title: 'Периметр треугольника',
    prompt: `Стороны треугольника равны ${a} см, ${b} см и ${c} см. Найди периметр (в см):`,
    correctAnswer: p,
    explanation:
      `Периметр треугольника равен сумме длин трёх его сторон:\n` +
      `P = ${a} + ${b} + ${c} = ${p} см.\n` +
      `Ответ: ${p} см.`,
    hint: `Сложи длины всех трёх сторон: ${a} + ${b} + ${c}.`,
    geometryData: {
      shapeType: 'triangle',
      sides: [a, b, c],
      unit: 'см',
      questionType: 'perimeter',
    },
  };
}
