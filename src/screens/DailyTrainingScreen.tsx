import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MathQuestion, UserStats } from '../types/math';
import { Header } from '../components/Header';
import { NumberPad } from '../components/NumberPad';
import { ResultModal } from '../components/ResultModal';
import { BracketCard } from '../components/BracketCard';
import { NumberHouse } from '../components/NumberHouse';
import { generateAdaptiveDailyWorkout } from '../engine/dailyTraining';
import { StorageService, DEFAULT_USER_STATS } from '../services/storage';

interface DailyTrainingScreenProps {
  onBack: () => void;
  onOpenCurriculum?: () => void;
}

export const DailyTrainingScreen: React.FC<DailyTrainingScreenProps> = ({
  onBack,
  onOpenCurriculum,
}) => {
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [curriculumCount, setCurriculumCount] = useState<number>(12);
  const [userInput, setUserInput] = useState<string>('');
  const [step1Input, setStep1Input] = useState<string>('');
  const [step2Input, setStep2Input] = useState<string>('');
  const [isStep1Correct, setIsStep1Correct] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; msg?: string } | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [mistakes, setMistakes] = useState<Array<{ question: MathQuestion; userAnswer: any; correctAnswer: any }>>([]);
  const [resultModalVisible, setResultModalVisible] = useState<boolean>(false);
  const [stats, setStats] = useState<UserStats>(DEFAULT_USER_STATS);

  useEffect(() => {
    Promise.all([
      StorageService.loadStats(),
      StorageService.getCurriculumTopics(),
    ]).then(([s, curTopics]) => {
      setStats(s);
      setCurriculumCount(curTopics.length);
      generateAdaptiveDailyWorkout(s, curTopics).then(qList => {
        setQuestions(qList);
      });
    });
  }, []);

  const handleDigit = (digit: string) => {
    if (feedback) return;
    const currentQ = questions[currentIndex];
    if (currentQ?.type === 'brackets_two_step') {
      if (activeStep === 1) {
        if (step1Input.length < 3) setStep1Input(prev => prev + digit);
      } else {
        if (step2Input.length < 3) setStep2Input(prev => prev + digit);
      }
    } else {
      if (userInput.length < 4) setUserInput(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (feedback) return;
    const currentQ = questions[currentIndex];
    if (currentQ?.type === 'brackets_two_step') {
      if (activeStep === 1) setStep1Input(prev => prev.slice(0, -1));
      else setStep2Input(prev => prev.slice(0, -1));
    } else {
      setUserInput(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (feedback) return;
    setUserInput('');
    setStep1Input('');
    setStep2Input('');
  };

  const checkBracketAnswer = async () => {
    const currentQ = questions[currentIndex];
    const bData = currentQ.bracketData!;

    if (activeStep === 1) {
      const val1 = parseInt(step1Input.trim(), 10);
      if (val1 === bData.step1Result) {
        setIsStep1Correct(true);
        setActiveStep(2);
        setFeedback({ isCorrect: true, msg: 'Верно в скобках! Теперь реши весь пример.' });
        setTimeout(() => setFeedback(null), 1200);
      } else {
        setFeedback({ isCorrect: false, msg: `Ошибка в скобках. ${bData.innerExpr} = ?` });
        setTimeout(() => setFeedback(null), 2000);
      }
    } else {
      const val2 = parseInt(step2Input.trim(), 10);
      const isCorrect = val2 === bData.finalResult;
      if (isCorrect) {
        setCorrectCount(prev => prev + 1);
        setFeedback({ isCorrect: true, msg: 'Правильно! Задание решено! ⭐' });
        await StorageService.recordAnswer('brackets', true, 1);
      } else {
        setMistakes(prev => [
          ...prev,
          { question: currentQ, userAnswer: step2Input, correctAnswer: bData.finalResult },
        ]);
        setFeedback({ isCorrect: false, msg: `Правильный ответ: ${bData.finalResult}` });
        await StorageService.recordAnswer('brackets', false, 0);
        await StorageService.logError(currentQ, step2Input);
      }

      setTimeout(() => {
        advanceQuestion(isCorrect);
      }, isCorrect ? 1000 : 2200);
    }
  };

  const checkAnswer = async (val: string | number) => {
    const currentQ = questions[currentIndex];
    if (currentQ.type === 'brackets_two_step') {
      await checkBracketAnswer();
      return;
    }

    const correct = String(currentQ.correctAnswer).trim();
    const entered = String(val).trim();
    const isCorrect = entered === correct;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setFeedback({ isCorrect: true, msg: 'Верно! ⭐' });
      await StorageService.recordAnswer(currentQ.topicId, true, 1, currentQ.tenTarget);
    } else {
      setMistakes(prev => [
        ...prev,
        { question: currentQ, userAnswer: entered, correctAnswer: correct },
      ]);
      setFeedback({ isCorrect: false, msg: `Ответ: ${correct}` });
      await StorageService.recordAnswer(currentQ.topicId, false, 0, currentQ.tenTarget);
      await StorageService.logError(currentQ, entered);
    }

    setTimeout(() => {
      advanceQuestion(isCorrect);
    }, isCorrect ? 1000 : 2200);
  };

  const advanceQuestion = (lastWasCorrect: boolean) => {
    setFeedback(null);
    setUserInput('');
    setStep1Input('');
    setStep2Input('');
    setIsStep1Correct(false);
    setActiveStep(1);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setResultModalVisible(true);
    }
  };

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Тренировка дня" onBack={onBack} />
        <View style={styles.centerBox}>
          <Text style={styles.loadingText}>Подбор индивидуальных заданий...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`Тренировка дня (${currentIndex + 1}/${questions.length})`}
        onBack={onBack}
        stars={stats.totalStars}
        streak={stats.streakDays}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Индикатор школьной программы */}
        <View style={styles.curriculumChipRow}>
          <View style={styles.curriculumChip}>
            <Text style={styles.curriculumChipText}>
              📚 По программе: {curriculumCount} из 12 тем
            </Text>
          </View>
          {onOpenCurriculum && (
            <TouchableOpacity
              style={styles.curriculumEditBtn}
              onPress={onOpenCurriculum}
              activeOpacity={0.7}
            >
              <Text style={styles.curriculumEditText}>⚙️ Настроить</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Индикатор прогресса */}
        <View style={styles.progressBarWrapper}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${((currentIndex + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>

        {/* Карточка */}
        <View style={styles.card}>
          <Text style={styles.topicBadge}>🌟 {currentQ.title}</Text>
          <Text style={styles.prompt}>{currentQ.prompt}</Text>

          {/* Скобки */}
          {currentQ.type === 'brackets_two_step' && currentQ.bracketData && (
            <BracketCard
              prefix={currentQ.bracketData.prefix}
              innerExpr={currentQ.bracketData.innerExpr}
              suffix={currentQ.bracketData.suffix}
              step1Value={step1Input}
              step2Value={step2Input}
              activeStep={activeStep}
              isStep1Correct={isStep1Correct}
              onFocusStep={s => setActiveStep(s)}
            />
          )}

          {/* Домик */}
          {currentQ.type === 'number_house' && currentQ.houseData && (
            <NumberHouse
              roofNumber={currentQ.houseData.roof}
              leftNumber={currentQ.houseData.left}
              rightNumber={currentQ.houseData.right}
              missingSide={currentQ.houseData.missingSide}
              currentInput={userInput}
            />
          )}

          {/* Варианты выбора */}
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

          {/* Дисплей ввода */}
          {currentQ.type !== 'choice' && currentQ.type !== 'brackets_two_step' && (
            <View style={styles.displayBox}>
              <Text style={styles.displayText}>{userInput || '?'}</Text>
            </View>
          )}

          {feedback && (
            <View
              style={[
                styles.feedbackBox,
                feedback.isCorrect ? styles.fbCorrect : styles.fbWrong,
              ]}
            >
              <Text
                style={[
                  styles.feedbackText,
                  feedback.isCorrect ? styles.fbTextCorrect : styles.fbTextWrong,
                ]}
              >
                {feedback.msg}
              </Text>
            </View>
          )}
        </View>

        {/* Клавиатура */}
        {currentQ.type !== 'choice' && (
          <NumberPad
            onDigit={handleDigit}
            onBackspace={handleBackspace}
            onSubmit={() => {
              if (currentQ.type === 'brackets_two_step') {
                checkBracketAnswer();
              } else {
                checkAnswer(userInput);
              }
            }}
            onClear={handleClear}
            currentValue={currentQ.type === 'brackets_two_step' ? (activeStep === 1 ? step1Input : step2Input) : userInput}
            submitDisabled={
              currentQ.type === 'brackets_two_step'
                ? activeStep === 1
                  ? step1Input.length === 0
                  : step2Input.length === 0
                : userInput.length === 0
            }
          />
        )}
      </ScrollView>

      <ResultModal
        visible={resultModalVisible}
        totalCount={questions.length}
        correctCount={correctCount}
        starsEarned={correctCount + 2} // Бонус +2 звезды за ежедневную тренировку!
        mistakes={mistakes}
        nextButtonLabel="Завершить"
        retryButtonLabel="Повторить тренировку"
        onRetry={() => {
          setResultModalVisible(false);
          setCurrentIndex(0);
        }}
        onNext={() => {
          setResultModalVisible(false);
          onBack();
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
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#64748B' },
  scroll: { padding: 16, alignItems: 'center', maxWidth: 540, width: '100%', alignSelf: 'center' },
  progressBarWrapper: { width: '100%', height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  curriculumChipRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  curriculumChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  curriculumChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4338CA',
  },
  curriculumEditBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  curriculumEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  progressBarFill: { height: '100%', backgroundColor: '#D97706' },
  card: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0', marginBottom: 14 },
  topicBadge: { fontSize: 13, fontWeight: 'bold', color: '#D97706', marginBottom: 8 },
  prompt: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', textAlign: 'center', marginBottom: 10, lineHeight: 28 },
  displayBox: { minWidth: 90, height: 58, backgroundColor: '#F1F5F9', borderRadius: 14, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, marginVertical: 8 },
  displayText: { fontSize: 30, fontWeight: 'bold', color: '#1E293B' },
  optionsGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginVertical: 8 },
  choiceBtn: { minWidth: '45%', height: 54, backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 2, borderColor: '#CBD5E1', borderBottomWidth: 4, borderBottomColor: '#94A3B8', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
  choiceBtnText: { fontSize: 19, fontWeight: 'bold', color: '#1E293B' },
  feedbackBox: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginVertical: 6, width: '100%' },
  fbCorrect: { backgroundColor: '#D1FAE5' },
  fbWrong: { backgroundColor: '#FEE2E2' },
  feedbackText: { fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  fbTextCorrect: { color: '#065F46' },
  fbTextWrong: { color: '#991B1B' },
});
