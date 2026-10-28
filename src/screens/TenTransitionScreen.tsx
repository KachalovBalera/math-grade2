import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { TenTarget, TenTransitionMode, DifficultyLevel, MathQuestion, UserStats } from '../types/math';
import { Header } from '../components/Header';
import { NumberPad } from '../components/NumberPad';
import { NumberLine } from '../components/NumberLine';
import { ResultModal } from '../components/ResultModal';
import { generateTenTransitionSet } from '../engine/tenTransition';
import { StorageService, DEFAULT_USER_STATS } from '../services/storage';

interface TenTransitionScreenProps {
  onBack: () => void;
}

export const TenTransitionScreen: React.FC<TenTransitionScreenProps> = ({ onBack }) => {
  // Состояние меню выбора
  const [selectedTen, setSelectedTen] = useState<TenTarget | 'all' | null>(null);
  const [selectedMode, setSelectedMode] = useState<TenTransitionMode>('mixed_add_sub');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(1);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);

  // Состояние теста
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; msg?: string } | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [mistakes, setMistakes] = useState<Array<{ question: MathQuestion; userAnswer: any; correctAnswer: any }>>([]);
  const [resultModalVisible, setResultModalVisible] = useState<boolean>(false);
  const [stats, setStats] = useState<UserStats>(DEFAULT_USER_STATS);

  const tensList: TenTarget[] = [20, 30, 40, 50, 60, 70, 80, 90];

  useEffect(() => {
    StorageService.loadStats().then(setStats);
  }, []);

  const startTraining = () => {
    if (selectedTen === null) return;
    const set = generateTenTransitionSet({
      ten: selectedTen,
      mode: selectedMode,
      difficulty: selectedDifficulty,
      count: questionCount,
    });
    setQuestions(set);
    setCurrentIndex(0);
    setUserInput('');
    setShowHint(selectedDifficulty === 1); // на 1 уровне подсказка включена сразу
    setFeedback(null);
    setCorrectCount(0);
    setMistakes([]);
    setIsQuizActive(true);
  };

  const handleDigit = (digit: string) => {
    if (feedback) return;
    if (userInput.length < 3) {
      setUserInput(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (feedback) return;
    setUserInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (feedback) return;
    setUserInput('');
  };

  const handleSubmit = async () => {
    if (!userInput || feedback) return;
    const currentQ = questions[currentIndex];
    const userVal = parseInt(userInput.trim(), 10);
    const correctVal = Number(currentQ.correctAnswer);
    const isCorrect = userVal === correctVal;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setFeedback({ isCorrect: true, msg: 'Правильно! Молодец! ⭐' });
      await StorageService.recordAnswer('tenTransition', true, 1, currentQ.tenTarget);
    } else {
      setMistakes(prev => [...prev, { question: currentQ, userAnswer: userInput, correctAnswer: correctVal }]);
      setFeedback({
        isCorrect: false,
        msg: `Не совсем так. Правильный ответ: ${correctVal}`,
      });
      await StorageService.recordAnswer('tenTransition', false, 0, currentQ.tenTarget);
      await StorageService.logError(currentQ, userInput);
    }

    // Задержка перед следующим вопросом
    setTimeout(() => {
      setFeedback(null);
      setUserInput('');
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        setShowHint(selectedDifficulty === 1);
      } else {
        setResultModalVisible(true);
      }
    }, isCorrect ? 1000 : 2200);
  };

  // ЭКРАН ВЫБОРА ДЕСЯТКА И НАСТРОЕК
  if (!isQuizActive) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Переход через десяток" onBack={onBack} stars={stats.totalStars} streak={stats.streakDays} />
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* 1. Выбор конкретного десятка от 20 до 90 */}
          <Text style={styles.sectionTitle}>1. Выбери десяток для тренировки:</Text>
          <View style={styles.tensGrid}>
            {tensList.map(t => {
              const p = stats.tenTransitionProgress[t];
              const isMastered = p?.mastered;
              const isSelected = selectedTen === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.tenButton,
                    isSelected && styles.tenButtonSelected,
                    isMastered && styles.tenButtonMastered,
                  ]}
                  onPress={() => setSelectedTen(t)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tenButtonText, isSelected && styles.tenButtonTextSelected]}>
                    {t}
                  </Text>
                  <Text style={styles.tenProgressLabel}>
                    {isMastered ? '🏆 Освоен' : `${p?.correctCount || 0} решено`}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Кнопка "Все десятки" */}
            <TouchableOpacity
              style={[
                styles.tenButtonAll,
                selectedTen === 'all' && styles.tenButtonSelected,
              ]}
              onPress={() => setSelectedTen('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tenButtonText, selectedTen === 'all' && styles.tenButtonTextSelected]}>
                Все десятки
              </Text>
              <Text style={styles.tenProgressLabel}>Смешанные переходы 20–90</Text>
            </TouchableOpacity>
          </View>

          {/* 2. Выбор действия */}
          <Text style={styles.sectionTitle}>2. Выбери тип тренировки:</Text>
          <View style={styles.modeList}>
            {[
              { id: 'addition', title: '➕ Сложение с переходом', desc: 'Дополнение до десятка и сложение' },
              { id: 'subtraction', title: '➖ Вычитание с переходом', desc: 'Уменьшение до десятка и вычитание' },
              { id: 'mixed_add_sub', title: '🔀 Сложение и вычитание', desc: 'Смешанные примеры вперемешку' },
              { id: 'missing_numbers', title: '❓ Примеры с пропущенными числами', desc: '38 + □ = 43 или 43 − □ = 36' },
              { id: 'mixed_training', title: '⭐ Смешанная тренировка', desc: 'Примеры + короткие текстовые задачи' },
              { id: 'test', title: '📝 Контрольная работа', desc: 'Проверка знаний без подсказок' },
            ].map(m => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.modeCard,
                  selectedMode === m.id && styles.modeCardSelected,
                ]}
                onPress={() => setSelectedMode(m.id as TenTransitionMode)}
                activeOpacity={0.7}
              >
                <View style={styles.modeCardContent}>
                  <Text style={[styles.modeCardTitle, selectedMode === m.id && styles.modeCardTitleSelected]}>
                    {m.title}
                  </Text>
                  <Text style={styles.modeCardDesc}>{m.desc}</Text>
                </View>
                <View style={[styles.radioDot, selectedMode === m.id && styles.radioDotSelected]} />
              </TouchableOpacity>
            ))}
          </View>

          {/* 3. Уровень сложности */}
          <Text style={styles.sectionTitle}>3. Уровень подсказок:</Text>
          <View style={styles.levelRow}>
            {[
              { lvl: 1, title: 'С подсказкой', desc: 'Числовая прямая и разложение' },
              { lvl: 2, title: 'Решаю сам', desc: 'Пример + подсказка по кнопке' },
              { lvl: 3, title: 'Без подсказок', desc: 'Сложные примеры без помощи' },
            ].map(l => (
              <TouchableOpacity
                key={l.lvl}
                style={[
                  styles.levelCard,
                  selectedDifficulty === l.lvl && styles.levelCardSelected,
                ]}
                onPress={() => setSelectedDifficulty(l.lvl as DifficultyLevel)}
                activeOpacity={0.7}
              >
                <Text style={[styles.levelCardTitle, selectedDifficulty === l.lvl && styles.levelCardTitleSelected]}>
                  {l.title}
                </Text>
                <Text style={styles.levelCardDesc}>{l.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 4. Количество заданий */}
          <Text style={styles.sectionTitle}>4. Количество заданий:</Text>
          <View style={styles.countRow}>
            {[5, 10, 15, 20].map(cnt => (
              <TouchableOpacity
                key={cnt}
                style={[
                  styles.countBtn,
                  questionCount === cnt && styles.countBtnSelected,
                ]}
                onPress={() => setQuestionCount(cnt)}
                activeOpacity={0.7}
              >
                <Text style={[styles.countBtnText, questionCount === cnt && styles.countBtnTextSelected]}>
                  {cnt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Большая кнопка старта */}
          <TouchableOpacity
            style={[styles.startBtn, selectedTen === null && styles.startBtnDisabled]}
            disabled={selectedTen === null}
            onPress={startTraining}
            activeOpacity={0.8}
          >
            <Text style={styles.startBtnText}>
              {selectedTen === null ? 'Сначала выбери десяток выше' : 'Начать тренировку ➔'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ЭКРАН АКТИВНОГО ТРЕНАЖЕРА
  const currentQ = questions[currentIndex];
  const isAddition = currentQ.expression?.includes('+');
  const targetTen = currentQ.tenTarget || 20;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`Переход через ${targetTen} (${currentIndex + 1}/${questions.length})`}
        onBack={() => setIsQuizActive(false)}
        stars={stats.totalStars}
      />
      <ScrollView contentContainerStyle={styles.quizScroll}>
        {/* Индикатор прогресса в серии */}
        <View style={styles.progressBarWrapper}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${((currentIndex + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>

        {/* Заголовок примера */}
        <View style={styles.questionCard}>
          <Text style={styles.qTitle}>{currentQ.title}</Text>
          <Text style={styles.qPrompt}>{currentQ.prompt}</Text>

          {/* Поле ответа */}
          <View style={styles.answerDisplayBox}>
            <Text style={styles.answerDisplayText}>{userInput || '?'}</Text>
          </View>

          {/* Обратная связь */}
          {feedback && (
            <View
              style={[
                styles.feedbackBox,
                feedback.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
              ]}
            >
              <Text
                style={[
                  styles.feedbackText,
                  feedback.isCorrect ? styles.feedbackTextCorrect : styles.feedbackTextWrong,
                ]}
              >
                {feedback.msg}
              </Text>
            </View>
          )}

          {/* Кнопка показа подсказки на 2 уровне */}
          {selectedDifficulty === 2 && !showHint && (
            <TouchableOpacity
              style={styles.hintToggleBtn}
              onPress={() => setShowHint(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.hintToggleText}>💡 Показать разложение и прямую</Text>
            </TouchableOpacity>
          )}

          {/* Наглядная числовая прямая и схема шагов */}
          {showHint && currentQ.breakdown && (
            <NumberLine
              start={
                isAddition
                  ? targetTen - currentQ.breakdown.part1
                  : targetTen + currentQ.breakdown.part1
              }
              step1={currentQ.breakdown.part1}
              roundTen={targetTen}
              step2={currentQ.breakdown.part2}
              finalVal={Number(currentQ.correctAnswer)}
              isAddition={!!isAddition}
            />
          )}
        </View>

        {/* Цифровая экранная клавиатура */}
        <NumberPad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onSubmit={handleSubmit}
          onClear={handleClear}
          currentValue={userInput}
          submitDisabled={userInput.length === 0}
        />
      </ScrollView>

      {/* Модальное окно итогов серии */}
      <ResultModal
        visible={resultModalVisible}
        totalCount={questions.length}
        correctCount={correctCount}
        starsEarned={correctCount}
        mistakes={mistakes}
        retryButtonLabel={`Повторить переход через ${targetTen}`}
        nextButtonLabel="Следующий десяток"
        onRetry={() => {
          setResultModalVisible(false);
          startTraining();
        }}
        onNext={() => {
          setResultModalVisible(false);
          if (typeof selectedTen === 'number' && selectedTen < 90) {
            setSelectedTen((selectedTen + 10) as TenTarget);
          }
          setIsQuizActive(false);
        }}
        onHome={() => {
          setResultModalVisible(false);
          setIsQuizActive(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 14,
    marginBottom: 8,
  },
  tensGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  tenButton: {
    width: '23%',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tenButtonSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
    borderBottomColor: '#3730A3',
  },
  tenButtonMastered: {
    borderColor: '#F59E0B',
  },
  tenButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  tenButtonTextSelected: {
    color: '#4F46E5',
  },
  tenProgressLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  tenButtonAll: {
    width: '100%',
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  modeList: {
    gap: 8,
  },
  modeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  modeCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  modeCardContent: {
    flex: 1,
  },
  modeCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modeCardTitleSelected: {
    color: '#4F46E5',
  },
  modeCardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginLeft: 8,
  },
  radioDotSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#4F46E5',
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  levelCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 10,
    alignItems: 'center',
  },
  levelCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  levelCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  levelCardTitleSelected: {
    color: '#059669',
  },
  levelCardDesc: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  countRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBtnSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  countBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
  },
  countBtnTextSelected: {
    color: '#2563EB',
  },
  startBtn: {
    marginTop: 20,
    height: 56,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#3730A3',
  },
  startBtnDisabled: {
    backgroundColor: '#CBD5E1',
    borderBottomColor: '#94A3B8',
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quizScroll: {
    padding: 16,
    alignItems: 'center',
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  progressBarWrapper: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
  },
  questionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  qTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 6,
  },
  qPrompt: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  answerDisplayBox: {
    minWidth: 90,
    height: 60,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  answerDisplayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  feedbackBox: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginVertical: 6,
  },
  feedbackCorrect: {
    backgroundColor: '#D1FAE5',
  },
  feedbackWrong: {
    backgroundColor: '#FEE2E2',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  feedbackTextCorrect: {
    color: '#065F46',
  },
  feedbackTextWrong: {
    color: '#991B1B',
  },
  hintToggleBtn: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
  },
  hintToggleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
  },
});
