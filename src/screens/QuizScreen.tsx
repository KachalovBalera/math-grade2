import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { TopicId, MathQuestion, DifficultyLevel, UserStats } from '../types/math';
import { Header } from '../components/Header';
import { NumberPad } from '../components/NumberPad';
import { NumberHouse } from '../components/NumberHouse';
import { InteractiveClock } from '../components/InteractiveClock';
import { ResultModal } from '../components/ResultModal';
import { PRESET_QUESTION_BANK } from '../data/presetBank';
import { TOPICS } from '../data/topics';
import { StorageService, DEFAULT_USER_STATS } from '../services/storage';

// Генераторы для динамического добавления вопросов
import { generateNumberSenseQuestion } from '../engine/numberSense';
import { generateNumberBondsQuestion } from '../engine/numberBonds';
import { generateAddSubQuestion } from '../engine/additionSubtraction';
import { generateMultiplicationQuestion } from '../engine/multiplication';
import { generateOperationsOrderQuestion } from '../engine/operationsOrder';
import { generateEquationQuestion } from '../engine/equations';
import { generateWordProblemQuestion } from '../engine/wordProblems';
import { generateGeometryQuestion } from '../engine/geometry';
import { generateMeasurementQuestion } from '../engine/measurements';
import { generateLogicQuestion } from '../engine/logicPuzzles';

interface QuizScreenProps {
  topicId: TopicId;
  onBack: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ topicId, onBack }) => {
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; msg?: string } | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [mistakes, setMistakes] = useState<Array<{ question: MathQuestion; userAnswer: any; correctAnswer: any }>>([]);
  const [resultModalVisible, setResultModalVisible] = useState<boolean>(false);
  const [stats, setStats] = useState<UserStats>(DEFAULT_USER_STATS);

  const topicInfo = TOPICS.find(t => t.id === topicId) || TOPICS[0];
  const userLevel: DifficultyLevel = stats.topicProgress[topicId]?.level || 1;

  useEffect(() => {
    StorageService.loadStats().then(s => {
      setStats(s);
      loadQuestions(s.topicProgress[topicId]?.level || 1);
    });
  }, [topicId]);

  const loadQuestions = (lvl: DifficultyLevel) => {
    // Берем проверенные пресеты из банка, подходящие по уровню
    const presets = PRESET_QUESTION_BANK[topicId] || [];
    const filteredPresets = presets.filter(q => q.difficulty === lvl);

    // Добираем динамическими генераторами до 10 штук
    const list: MathQuestion[] = [...filteredPresets];
    while (list.length < 10) {
      list.push(generateQuestionForTopic(topicId, lvl));
    }

    // Перемешиваем и берем 10
    const shuffled = list.sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setUserInput('');
    setShowHint(false);
    setFeedback(null);
    setCorrectCount(0);
    setMistakes([]);
  };

  const generateQuestionForTopic = (tId: TopicId, lvl: DifficultyLevel): MathQuestion => {
    switch (tId) {
      case 'numbers': return generateNumberSenseQuestion(lvl);
      case 'bonds': return generateNumberBondsQuestion(lvl);
      case 'addsub': return generateAddSubQuestion(lvl);
      case 'multiplication': return generateMultiplicationQuestion(lvl);
      case 'orderOfOps': return generateOperationsOrderQuestion(lvl);
      case 'equations': return generateEquationQuestion(lvl);
      case 'wordProblems': return generateWordProblemQuestion(lvl);
      case 'geometry': return generateGeometryQuestion(lvl);
      case 'measurements': return generateMeasurementQuestion(lvl);
      case 'logic': return generateLogicQuestion(lvl);
      default: return generateNumberSenseQuestion(lvl);
    }
  };

  const handleDigit = (digit: string) => {
    if (feedback) return;
    if (userInput.length < 4) {
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

  const checkAnswer = async (answerToCheck: string | number) => {
    if (feedback) return;
    const currentQ = questions[currentIndex];
    const correctVal = String(currentQ.correctAnswer).trim();
    const userVal = String(answerToCheck).trim();
    const isCorrect = userVal === correctVal;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setFeedback({ isCorrect: true, msg: 'Верно! Отличная работа! ⭐' });
      await StorageService.recordAnswer(topicId, true, 1);
    } else {
      setMistakes(prev => [
        ...prev,
        { question: currentQ, userAnswer: userVal, correctAnswer: correctVal },
      ]);
      setFeedback({
        isCorrect: false,
        msg: `Неверно. Правильный ответ: ${correctVal}`,
      });
      await StorageService.recordAnswer(topicId, false, 0);
      await StorageService.logError(currentQ, userVal);
    }

    setTimeout(() => {
      setFeedback(null);
      setUserInput('');
      setShowHint(false);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setResultModalVisible(true);
      }
    }, isCorrect ? 1000 : 2500);
  };

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={topicInfo.title} onBack={onBack} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Подготовка заданий...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`${topicInfo.title} (${currentIndex + 1}/${questions.length})`}
        onBack={onBack}
        stars={stats.totalStars}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Индикатор прогресса */}
        <View style={styles.progressBarWrapper}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
                backgroundColor: topicInfo.color,
              },
            ]}
          />
        </View>

        {/* Карточка задания */}
        <View style={styles.questionCard}>
          <Text style={styles.qTopicTag}>
            {topicInfo.icon} {currentQ.title} • Уровень {userLevel}
          </Text>

          <Text style={styles.qPrompt}>{currentQ.prompt}</Text>

          {/* Специальные интерактивные элементы в зависимости от типа задания */}

          {/* Домик состава числа */}
          {currentQ.type === 'number_house' && currentQ.houseData && (
            <NumberHouse
              roofNumber={currentQ.houseData.roof}
              leftNumber={currentQ.houseData.left}
              rightNumber={currentQ.houseData.right}
              missingSide={currentQ.houseData.missingSide}
              currentInput={userInput}
            />
          )}

          {/* Текстовая задача с разбором схемы «Было — Изменилось — Стало» */}
          {currentQ.type === 'word_problem' && currentQ.wordProblemData && (
            <View style={styles.wordProblemCard}>
              <Text style={styles.wpHeading}>Краткая запись:</Text>
              <View style={styles.wpSchemeRow}>
                <View style={styles.wpBadge}>
                  <Text style={styles.wpBadgeText}>{currentQ.wordProblemData.was}</Text>
                </View>
                <View style={styles.wpBadge}>
                  <Text style={styles.wpBadgeText}>{currentQ.wordProblemData.changed}</Text>
                </View>
                <View style={[styles.wpBadge, styles.wpBadgeTarget]}>
                  <Text style={styles.wpBadgeTextTarget}>{currentQ.wordProblemData.became}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Часы */}
          {currentQ.clockData && (
            <InteractiveClock
              hours={currentQ.clockData.targetHours}
              minutes={currentQ.clockData.targetMinutes}
              interactive={currentQ.clockData.interactive}
            />
          )}

          {/* Варианты с кнопками выбора (choice) */}
          {currentQ.type === 'choice' && currentQ.options && (
            <View style={styles.optionsGrid}>
              {currentQ.options.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={styles.choiceBtn}
                  onPress={() => checkAnswer(opt)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.choiceBtnText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Поле ввода для цифровых заданий */}
          {currentQ.type !== 'choice' && (
            <View style={styles.inputDisplayBox}>
              <Text style={styles.inputDisplayText}>{userInput || '?'}</Text>
            </View>
          )}

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

          {/* Кнопка подсказки */}
          {!showHint && currentQ.hint && (
            <TouchableOpacity
              style={styles.hintButton}
              onPress={() => setShowHint(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.hintButtonText}>💡 Подсказка</Text>
            </TouchableOpacity>
          )}

          {showHint && currentQ.hint && (
            <View style={styles.hintCard}>
              <Text style={styles.hintCardLabel}>Подсказка:</Text>
              <Text style={styles.hintCardText}>{currentQ.hint}</Text>
            </View>
          )}
        </View>

        {/* Цифровая клавиатура (если не режим с вариантами ответа) */}
        {currentQ.type !== 'choice' && (
          <NumberPad
            onDigit={handleDigit}
            onBackspace={handleBackspace}
            onSubmit={() => checkAnswer(userInput)}
            onClear={handleClear}
            currentValue={userInput}
            submitDisabled={userInput.length === 0}
          />
        )}
      </ScrollView>

      {/* Модальное окно результатов */}
      <ResultModal
        visible={resultModalVisible}
        totalCount={questions.length}
        correctCount={correctCount}
        starsEarned={correctCount}
        mistakes={mistakes}
        onRetry={() => {
          setResultModalVisible(false);
          loadQuestions(userLevel);
        }}
        onNext={() => {
          setResultModalVisible(false);
          loadQuestions(userLevel);
        }}
        onHome={() => {
          setResultModalVisible(false);
          onBack();
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  scroll: {
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
  },
  questionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  qTopicTag: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 10,
  },
  qPrompt: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  inputDisplayBox: {
    minWidth: 90,
    height: 60,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  inputDisplayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  optionsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginVertical: 10,
  },
  choiceBtn: {
    minWidth: '45%',
    height: 56,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderBottomWidth: 4,
    borderBottomColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  choiceBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  feedbackBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginVertical: 8,
    width: '100%',
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
    textAlign: 'center',
  },
  feedbackTextCorrect: {
    color: '#065F46',
  },
  feedbackTextWrong: {
    color: '#991B1B',
  },
  hintButton: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
  },
  hintButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
  },
  hintCard: {
    marginTop: 10,
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  hintCardLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#B45309',
    marginBottom: 2,
  },
  hintCardText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  wordProblemCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  wpHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 6,
  },
  wpSchemeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  wpBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  wpBadgeText: {
    fontSize: 12,
    color: '#334155',
  },
  wpBadgeTarget: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  wpBadgeTextTarget: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
});
