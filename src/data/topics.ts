import { TopicId } from '../types/math';

export interface TopicInfo {
  id: TopicId;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  lightColor: string;
}

export const TOPICS: TopicInfo[] = [
  {
    id: 'numbers',
    title: 'Числа и нумерация',
    subtitle: '1–100, десятки и единицы',
    description: 'Разрядный состав, сравнение, числовой ряд и последовательности до 100.',
    icon: '🔢',
    color: '#3B82F6',
    lightColor: '#DBEAFE',
  },
  {
    id: 'bonds',
    title: 'Состав числа',
    subtitle: 'Домики чисел и слагаемые',
    description: 'Разложение на десятки и единицы, домики состава числа, удобные пары.',
    icon: '🏠',
    color: '#8B5CF6',
    lightColor: '#EDE9FE',
  },
  {
    id: 'addsub',
    title: 'Сложение и вычитание',
    subtitle: 'В пределах 100 по шагам',
    description: 'Круглые десятки, двузначные числа, переход через разряд с наглядными шагами.',
    icon: '➕',
    color: '#10B981',
    lightColor: '#D1FAE5',
  },
  {
    id: 'tenTransition',
    title: 'Переход через десяток',
    subtitle: 'Тренажёр от 20 до 90',
    description: 'Специальный тренажёр: выбери конкретный десяток или все сразу, с подсказками и числовой прямой.',
    icon: '🎯',
    color: '#F59E0B',
    lightColor: '#FEF3C7',
  },
  {
    id: 'brackets',
    title: 'Примеры со скобками',
    subtitle: 'Сначала ответ над скобками',
    description: 'Двухэтапный ввод: сначала промежуточный результат над скобками, затем итоговый ответ.',
    icon: '📐',
    color: '#EC4899',
    lightColor: '#FCE7F3',
  },
  {
    id: 'multiplication',
    title: 'Таблица умножения',
    subtitle: 'Умножение и деление',
    description: 'Умножение как сумма одинаковых слагаемых, деление на равные части, таблица на 2, 3, 4, 5.',
    icon: '✖️',
    color: '#6366F1',
    lightColor: '#E0E7FF',
  },
  {
    id: 'orderOfOps',
    title: 'Порядок действий',
    subtitle: 'Числовые выражения',
    description: 'Выражения в 2–3 действия, скобки, сравнение выражений и поиск пропущенных знаков.',
    icon: '⏳',
    color: '#14B8A6',
    lightColor: '#CCFBF1',
  },
  {
    id: 'equations',
    title: 'Уравнения',
    subtitle: 'Найди неизвестное x',
    description: 'Нахождение неизвестного слагаемого, уменьшаемого и вычитаемого с проверкой подстановкой.',
    icon: '🧩',
    color: '#F97316',
    lightColor: '#FFEDD5',
  },
  {
    id: 'wordProblems',
    title: 'Решаем задачи',
    subtitle: 'Текстовые задачи со схемой',
    description: 'Задачи на сумму, остаток, сравнение и в 2 действия со схемой «Было — Изменилось — Стало».',
    icon: '📖',
    color: '#06B6D4',
    lightColor: '#CFFAFE',
  },
  {
    id: 'geometry',
    title: 'Геометрия',
    subtitle: 'Фигуры, углы и периметр',
    description: 'Вершины, стороны многоугольников, нахождение периметра P = a + b + c, ломаные линии.',
    icon: '📏',
    color: '#84CC16',
    lightColor: '#ECFCCB',
  },
  {
    id: 'measurements',
    title: 'Величины и время',
    subtitle: 'Часы, рубли, см и дм',
    description: 'Интерактивные часы, монеты и купюры, дециметры и сантиметры, килограммы и литры.',
    icon: '⏰',
    color: '#EAB308',
    lightColor: '#FEF9C3',
  },
  {
    id: 'logic',
    title: 'Логика и головоломки',
    subtitle: 'Закономерности и смекалка',
    description: 'Числовые ряды, логические загадки двух чисел, магические суммы и нестандартные задачи.',
    icon: '💡',
    color: '#A855F7',
    lightColor: '#F3E8FF',
  },
];
