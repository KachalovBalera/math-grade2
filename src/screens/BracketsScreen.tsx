import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MathQuestion, DifficultyLevel, UserStats } from '../types/math';
import { Header } from '../components/Header';
import { BracketCard } from '../components/BracketCard';
import { NumberPad } from '../components/NumberPad';
import { ResultModal } from '../components/ResultModal';
import { generateBracketSet } from '../engine/brackets';
import { StorageService, DEFAULT_USER_STATS } from '../services/storage';

interface BracketsScreenProps {
  onBack: () => void;
}

export const BracketsScreen: React.FC<BracketsScreenProps> = ({ onBack }) => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);

  // Двухэтапное состояние
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [step1Input, setStep1Input] = useState<string>('');
  const [step2Input, setStep2Input] = useState<string>('');
  const [isStep1Correct, setIsStep1Correct] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{ isCorrect?: boolean; msg?: string } | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [mistakes, setMistakes] = useState<Array<{ question: MathQuestion; userAnswer: any; correctAnswer: any }>>([]);
  const [resultModalVisible, setResultModalVisible] = useState<boolean>(false);
  const [stats, setStats] = useState<UserStats>(DEFAULT_USER_STATS);

  useEffect(() => {
    StorageService.loadStats().then(setStats);
  }, []);

  const startTraining = (diff: DifficultyLevel) => {
    setDifficulty(diff);
    const set = generateBracketSet(10, diff);
    setQuestions(set);
    setCurrentIndex(0);
    resetQuestionState();
    setCorrectCount(0);
    setMistakes([]);
    setIsQuizActive(true);
  };

  const resetQuestionState = () => {
    setActiveStep(1);
    setStep1Input('');
    setStep2Input('');
    setIsStep1Correct(false);
    setFeedback(null);
  };

  const handleDigit = (digit: string) => {
    if (feedback) return;
    if (activeStep === 1) {
      if (step1Input.length < 3) setStep1Input(prev => prev + digit);
    } else {
      if (step2Input.length < 3) setStep2Input(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (feedback) return;
    if (activeStep === 1) {
      setStep1Input(prev => prev.slice(0, -1));
    } else {
      setStep2Input(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (feedback) return;
    if (activeStep === 1) setStep1Input('');
    else setStep2Input('');
  };

  const handleSubmit = async () => {
    const currentQ = questions[currentIndex];
    const bData = currentQ.bracketData!;

    if (activeStep === 1) {
      // Проверка промежуточного ответа над скобками
      const entered = parseInt(step1Input.trim(), 10);
      if (entered === bData.step1Result) {
        setIsStep1Correct(true);
        setActiveStep(2);
        setFeedback({
          isCorrect: true,
          msg: `Верно! В скобках получилось ${bData.step1Result}. Теперь реши всё выражение!`,
        });
        setTimeout(() => setFeedback(null), 1500);
      } else {
        setFeedback({
          isCorrect: false,
          msg: `В скобках ошибка! Сколько будет ${bData.innerExpr}? Попробуй ещё раз.`,
        });
        await StorageService.logError(
          currentQ,
          step1Input,
          `Ошибка в скобках: ${bData.innerExpr} = ${step1Input} (верно: ${bData.step1Result})`
        );
        setTimeout(() => setFeedback(null), 2500);
      }
    } else {
      // Проверка окончательного ответа
      const enteredFinal = parseInt(step2Input.trim(), 10);
      const isCorrect = enteredFinal === bData.finalResult;

      if (isCorrect) {
        setCorrectCount(prev => prev + 1);
        setFeedback({
          isCorrect: true,
          msg: `Отлично! Ответ ${bData.finalResult} верный! ⭐`,
        });
        await StorageService.recordAnswer('brackets', true, 1);
      } else {
        setMistakes(prev => [
          ...prev,
          {
            question: currentQ,
            userAnswer: `${bData.step2Expr} = ${step2Input}`,
            correctAnswer: bData.finalResult,
          },
        ]);
        setFeedback({
          isCorrect: false,
          msg: `Ошибка во 2 действии: ${bData.step2Expr} = ${bData.finalResult}`,
        });
        await StorageService.recordAnswer('brackets', false, 0);
        await StorageService.logError(currentQ, step2Input);
      }

      setTimeout(() => {
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex(prev => prev + 1);
          resetQuestionState();
        } else {
          setResultModalVisible(true);
        }
      }, isCorrect ? 1200 : 2500);
    }
  };

  // ЭКРАН ВЫБОРА УРОВНЯ
  if (!isQuizActive) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Примеры со скобками" onBack={onBack} stars={stats.totalStars} />
        <ScrollView contentContainerStyle={styles.menuScroll}>
          <View style={styles.introCard}>
            <Text style={styles.introIcon}>📐</Text>
            <Text style={styles.introTitle}>Главное правило скобок:</Text>
            <Text style={styles.introRule}>
              Действие в скобках ВСЕГДА выполняется первым!
            </Text>
            <Text style={styles.introDesc}>
              Сначала запиши промежуточный результат прямо НАД скобками, а затем вычисли итоговый ответ.
            </Text>
          </View>

          <Text style={styles.selectLevelTitle}>Выбери уровень сложности:</Text>

          {[
            {
              lvl: 1,
              title: 'Уровень 1 — Новичок',
              desc: 'Простые скобки в пределах 20 и круглых десятков',
              icon: '🌱',
              color: '#3B82F6',
            },
            {
              lvl: 2,
              title: 'Уровень 2 — Знаток',
              desc: 'Двузначные числа, сложение и вычитание',
              icon: '🌿',
              color: '#10B981',
            },
            {
              lvl: 3,
              title: 'Уровень 3 — Мастер',
              desc: 'Сложные выражения до 100 и скобки на 1-м месте',
              icon: '👑',
              color: '#8B5CF6',
            },
          ].map(item => (
            <TouchableOpacity
              key={item.lvl}
              style={[styles.levelBtn, { borderColor: item.color }]}
              onPress={() => startTraining(item.lvl as DifficultyLevel)}
              activeOpacity={0.8}
            >
              <Text style={styles.levelBtnIcon}>{item.icon}</Text>
              <View style={styles.levelBtnContent}>
                <Text style={[styles.levelBtnTitle, { color: item.color }]}>
                  {item.title}
                </Text>
                <Text style={styles.levelBtnDesc}>{item.desc}</Text>
              </View>
              <Text style={styles.levelBtnArrow}>➔</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ЭКРАН ТРЕНАЖЕРА
  const currentQ = questions[currentIndex];
  const bData = currentQ.bracketData!;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`Скобки (${currentIndex + 1}/${questions.length})`}
        onBack={() => setIsQuizActive(false)}
        stars={stats.totalStars}
      />
      <ScrollView contentContainerStyle={styles.quizScroll}>
        {/* Прогресс */}
        <View style={styles.progressBarWrapper}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${((currentIndex + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>

        {/* Интерактивная карточка со скобками и ответом НАД ними */}
        <BracketCard
          prefix={bData.prefix}
          innerExpr={bData.innerExpr}
          suffix={bData.suffix}
          step1Value={step1Input}
          step2Value={step2Input}
          activeStep={activeStep}
          isStep1Correct={isStep1Correct}
          onFocusStep={step => setActiveStep(step)}
        />

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

        {/* Цифровая экранная клавиатура */}
        <NumberPad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onSubmit={handleSubmit}
          onClear={handleClear}
          currentValue={activeStep === 1 ? step1Input : step2Input}
          submitDisabled={activeStep === 1 ? step1Input.length === 0 : step2Input.length === 0}
        />
      </ScrollView>

      {/* Модальное окно итогов */}
      <ResultModal
        visible={resultModalVisible}
        totalCount={questions.length}
        correctCount={correctCount}
        starsEarned={correctCount}
        mistakes={mistakes}
        retryButtonLabel="Повторить этот уровень"
        nextButtonLabel="Следующий уровень"
        onRetry={() => {
          setResultModalVisible(false);
          startTraining(difficulty);
        }}
        onNext={() => {
          setResultModalVisible(false);
          if (difficulty < 3) {
            startTraining((difficulty + 1) as DifficultyLevel);
          } else {
            setIsQuizActive(false);
          }
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
  menuScroll: {
    padding: 16,
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center',
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 20,
  },
  introIcon: {
    fontSize: 44,
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  introRule: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EC4899',
    textAlign: 'center',
    marginBottom: 6,
  },
  introDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  selectLevelTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  levelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 4,
    padding: 16,
    marginBottom: 12,
  },
  levelBtnIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  levelBtnContent: {
    flex: 1,
  },
  levelBtnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  levelBtnDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  levelBtnArrow: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: 'bold',
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
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EC4899',
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
});
