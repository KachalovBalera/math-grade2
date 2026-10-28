import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MathQuestion } from '../types/math';

interface MistakeItem {
  question: MathQuestion;
  userAnswer: string | number;
  correctAnswer: string | number;
}

interface ResultModalProps {
  visible: boolean;
  totalCount: number;
  correctCount: number;
  starsEarned: number;
  mistakes: MistakeItem[];
  onRetry: () => void;
  onNext?: () => void;
  onHome: () => void;
  nextButtonLabel?: string;
  retryButtonLabel?: string;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  visible,
  totalCount,
  correctCount,
  starsEarned,
  mistakes,
  onRetry,
  onNext,
  onHome,
  nextButtonLabel = 'Следующее задание',
  retryButtonLabel = 'Повторить тренировку',
}) => {
  const percent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const isPerfect = mistakes.length === 0 && totalCount > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Заголовок и поздравление */}
            <View style={styles.celebrationHeader}>
              <Text style={styles.celebrationIcon}>
                {isPerfect ? '🏆' : percent >= 70 ? '🌟' : '💪'}
              </Text>
              <Text style={styles.title}>
                {isPerfect
                  ? 'Великолепно! Без единой ошибки!'
                  : percent >= 70
                  ? 'Отличный результат!'
                  : 'Хорошая тренировка!'}
              </Text>
              <Text style={styles.subtitle}>
                {isPerfect
                  ? 'Ты настоящий мастер математики!'
                  : 'Продолжай заниматься, и всё получится!'}
              </Text>
            </View>

            {/* Статистика тренировки */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statNumberGreen}>{correctCount}</Text>
                <Text style={styles.statLabel}>Правильно</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statNumberRed}>{mistakes.length}</Text>
                <Text style={styles.statLabel}>Ошибок</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.starRow}>
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text style={styles.statNumberGold}>+{starsEarned}</Text>
                </View>
                <Text style={styles.statLabel}>Звёзд</Text>
              </View>
            </View>

            {/* Разбор ошибок с пошаговыми решениями */}
            {mistakes.length > 0 && (
              <View style={styles.mistakesSection}>
                <Text style={styles.mistakesTitle}>
                  Разбор заданий, где были ошибки ({mistakes.length}):
                </Text>

                {mistakes.map((m, idx) => (
                  <View key={idx} style={styles.mistakeCard}>
                    <Text style={styles.mistakePrompt}>{m.question.prompt}</Text>
                    <View style={styles.mistakeAnswersRow}>
                      <Text style={styles.userAnswerText}>
                        Твой ответ: <Text style={styles.strikethrough}>{m.userAnswer}</Text>
                      </Text>
                      <Text style={styles.correctAnswerText}>
                        Правильно: <Text style={styles.boldGreen}>{m.correctAnswer}</Text>
                      </Text>
                    </View>
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationLabel}>Объяснение:</Text>
                      <Text style={styles.explanationText}>{m.question.explanation}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Кнопки действий */}
            <View style={styles.buttonsContainer}>
              {onNext && (
                <TouchableOpacity
                  style={[styles.actionBtn, styles.nextBtn]}
                  onPress={onNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextBtnText}>{nextButtonLabel} ➔</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionBtn, styles.retryBtn]}
                onPress={onRetry}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>🔄 {retryButtonLabel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.homeBtn]}
                onPress={onHome}
                activeOpacity={0.8}
              >
                <Text style={styles.homeBtnText}>🏠 В главное меню</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  celebrationIcon: {
    fontSize: 54,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  statNumberGreen: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statNumberRed: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 18,
    marginRight: 2,
  },
  statNumberGold: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D97706',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  mistakesSection: {
    width: '100%',
    marginBottom: 16,
  },
  mistakesTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  mistakeCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  mistakePrompt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  mistakeAnswersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  userAnswerText: {
    fontSize: 13,
    color: '#DC2626',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    fontWeight: 'bold',
  },
  correctAnswerText: {
    fontSize: 13,
    color: '#059669',
  },
  boldGreen: {
    fontWeight: 'bold',
  },
  explanationBox: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  explanationLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 2,
  },
  explanationText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  buttonsContainer: {
    width: '100%',
    gap: 10,
    marginTop: 6,
  },
  actionBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtn: {
    backgroundColor: '#4F46E5',
    borderBottomWidth: 4,
    borderBottomColor: '#3730A3',
  },
  nextBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  retryBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderBottomWidth: 4,
    borderBottomColor: '#94A3B8',
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
  },
  homeBtn: {
    backgroundColor: 'transparent',
  },
  homeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
});
