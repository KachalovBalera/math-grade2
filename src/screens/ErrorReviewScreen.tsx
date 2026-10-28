import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { ErrorRecord, UserStats } from '../types/math';
import { Header } from '../components/Header';
import { StorageService, DEFAULT_USER_STATS } from '../services/storage';

interface ErrorReviewScreenProps {
  onBack: () => void;
}

export const ErrorReviewScreen: React.FC<ErrorReviewScreenProps> = ({ onBack }) => {
  const [errors, setErrors] = useState<ErrorRecord[]>([]);
  const [selectedError, setSelectedError] = useState<ErrorRecord | null>(null);
  const [retryInput, setRetryInput] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [stats, setStats] = useState<UserStats>(DEFAULT_USER_STATS);

  useEffect(() => {
    loadErrors();
  }, []);

  const loadErrors = async () => {
    const errList = await StorageService.getErrors();
    setErrors(errList);
    const s = await StorageService.loadStats();
    setStats(s);
  };

  const handleRetrySubmit = async () => {
    if (!selectedError || !retryInput) return;
    const correct = String(selectedError.correctAnswer).trim();
    const entered = retryInput.trim();

    if (entered === correct) {
      setFeedback('🎉 Отлично! Ошибка исправлена! Заработана +1 звезда!');
      await StorageService.removeError(selectedError.id);
      await StorageService.recordAnswer(selectedError.question.topicId, true, 1);
      setTimeout(() => {
        setFeedback('');
        setRetryInput('');
        setSelectedError(null);
        loadErrors();
      }, 1500);
    } else {
      setFeedback(`Пока неверно. Посмотри объяснение ниже.`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`Мои ошибки (${errors.length})`}
        onBack={onBack}
        stars={stats.totalStars}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {errors.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>В копилке ошибок пусто!</Text>
            <Text style={styles.emptySubtitle}>
              Ты отлично справляешься со всеми заданиями! Если где-то ошибёшься, пример появится здесь для тренировки.
            </Text>
          </View>
        ) : selectedError ? (
          // Экран отработки одной выбранной ошибки
          <View style={styles.reviewCard}>
            <TouchableOpacity
              style={styles.backToErrorsBtn}
              onPress={() => {
                setSelectedError(null);
                setFeedback('');
                setRetryInput('');
              }}
            >
              <Text style={styles.backToErrorsText}>← Вернуться ко всем ошибкам</Text>
            </TouchableOpacity>

            <Text style={styles.reviewTopic}>{selectedError.question.title}</Text>
            <Text style={styles.reviewPrompt}>{selectedError.question.prompt}</Text>

            <View style={styles.historyRow}>
              <Text style={styles.historyText}>
                Твой прошлый ответ:{' '}
                <Text style={styles.strikethrough}>{selectedError.userAnswer}</Text>
              </Text>
            </View>

            {/* Поле повторного ввода */}
            <View style={styles.retryInputRow}>
              <TextInput
                style={styles.retryInput}
                value={retryInput}
                onChangeText={setRetryInput}
                placeholder="Введи правильный ответ"
                keyboardType="number-pad"
              />
              <TouchableOpacity
                style={styles.retrySubmitBtn}
                onPress={handleRetrySubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.retrySubmitText}>Проверить</Text>
              </TouchableOpacity>
            </View>

            {feedback ? (
              <View style={styles.feedbackBadge}>
                <Text style={styles.feedbackText}>{feedback}</Text>
              </View>
            ) : null}

            {/* Подробное пошаговое объяснение */}
            <View style={styles.explanationBox}>
              <Text style={styles.explanationHeader}>💡 Как правильно решить:</Text>
              <Text style={styles.explanationBody}>{selectedError.question.explanation}</Text>
            </View>
          </View>
        ) : (
          // Список всех сохраненных ошибок
          <View style={styles.errorsList}>
            <Text style={styles.listHeader}>
              Нажми на пример, чтобы разобрать его и исправить:
            </Text>

            {errors.map((err, idx) => (
              <TouchableOpacity
                key={err.id || idx}
                style={styles.errorItemCard}
                onPress={() => setSelectedError(err)}
                activeOpacity={0.7}
              >
                <View style={styles.errorItemHeader}>
                  <Text style={styles.errorTopic}>{err.question.title}</Text>
                  <Text style={styles.errorDate}>{err.date}</Text>
                </View>

                <Text style={styles.errorPrompt}>{err.question.prompt}</Text>

                <View style={styles.errorFooter}>
                  <Text style={styles.errorWasAnswer}>
                    Был ответ: <Text style={styles.strikethrough}>{err.userAnswer}</Text>
                  </Text>
                  <View style={styles.fixPill}>
                    <Text style={styles.fixPillText}>Исправить ➔</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 16, maxWidth: 640, width: '100%', alignSelf: 'center' },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginTop: 40,
  },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  errorsList: { gap: 12 },
  listHeader: { fontSize: 15, color: '#64748B', marginBottom: 6 },
  errorItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderLeftWidth: 5,
    borderLeftColor: '#EF4444',
  },
  errorItemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  errorTopic: { fontSize: 12, fontWeight: 'bold', color: '#DC2626' },
  errorDate: { fontSize: 11, color: '#94A3B8' },
  errorPrompt: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  errorFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorWasAnswer: { fontSize: 13, color: '#64748B' },
  strikethrough: { textDecorationLine: 'line-through', color: '#EF4444', fontWeight: 'bold' },
  fixPill: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  fixPillText: { fontSize: 12, fontWeight: 'bold', color: '#4F46E5' },
  reviewCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 2, borderColor: '#E2E8F0' },
  backToErrorsBtn: { marginBottom: 12 },
  backToErrorsText: { fontSize: 14, fontWeight: 'bold', color: '#4F46E5' },
  reviewTopic: { fontSize: 13, fontWeight: 'bold', color: '#64748B', marginBottom: 4 },
  reviewPrompt: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
  historyRow: { backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, marginBottom: 14 },
  historyText: { fontSize: 13, color: '#991B1B' },
  retryInputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  retryInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: 'bold',
  },
  retrySubmitBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retrySubmitText: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  feedbackBadge: { backgroundColor: '#ECFDF5', padding: 10, borderRadius: 10, marginBottom: 12 },
  feedbackText: { fontSize: 14, fontWeight: 'bold', color: '#065F46', textAlign: 'center' },
  explanationBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
  },
  explanationHeader: { fontSize: 13, fontWeight: 'bold', color: '#0369A1', marginBottom: 4 },
  explanationBody: { fontSize: 14, color: '#334155', lineHeight: 20 },
});
