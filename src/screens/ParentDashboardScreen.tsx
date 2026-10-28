import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { UserStats, TenTarget } from '../types/math';
import { Header } from '../components/Header';
import { TOPICS } from '../data/topics';
import { StorageService, DEFAULT_USER_STATS } from '../services/storage';
import { AppUpdateInfo } from '../types/update';
import { checkForUpdates } from '../utils/updateService';
import { UpdateModal } from '../components/UpdateModal';
import { CURRENT_APP_VERSION } from '../constants/updateConfig';

interface ParentDashboardScreenProps {
  onBack: () => void;
  onOpenCurriculum?: () => void;
}

export const ParentDashboardScreen: React.FC<ParentDashboardScreenProps> = ({
  onBack,
  onOpenCurriculum,
}) => {
  const [stats, setStats] = useState<UserStats>(DEFAULT_USER_STATS);
  const [availableUpdate, setAvailableUpdate] = useState<AppUpdateInfo | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);

  useEffect(() => {
    StorageService.loadStats().then(setStats);
  }, []);

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    try {
      const res = await checkForUpdates();
      setIsCheckingUpdate(false);
      if (res.hasUpdate && res.updateInfo) {
        setAvailableUpdate(res.updateInfo);
        setShowUpdateModal(true);
      } else if (res.error) {
        Alert.alert('Проверка обновлений', `Не удалось связаться с сервером: ${res.error}`);
      } else {
        Alert.alert(
          'Обновлений не найдено',
          `У вас установлена самая свежая версия Считайки (${CURRENT_APP_VERSION})! ✨`
        );
      }
    } catch (err: any) {
      setIsCheckingUpdate(false);
      Alert.alert('Ошибка', err?.message || 'Не удалось проверить обновления');
    }
  };

  const total = stats.totalSolved;
  const correct = stats.correctAnswers;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const tensList: TenTarget[] = [20, 30, 40, 50, 60, 70, 80, 90];

  // Формируем рекомендации
  const recommendations: string[] = [];
  tensList.forEach(t => {
    const p = stats.tenTransitionProgress[t];
    if (p && p.solvedCount > 0 && (p.correctCount / p.solvedCount) < 0.7) {
      recommendations.push(`Требуется внимание: переход через ${t} вызывает затруднения. Потренируйте этот десяток.`);
    }
  });

  if (stats.topicProgress.brackets?.solvedCount && (stats.topicProgress.brackets.correctCount / stats.topicProgress.brackets.solvedCount) < 0.7) {
    recommendations.push(`Рекомендуем уделить внимание промежуточным вычислениям в примерах со скобками.`);
  }

  if (recommendations.length === 0) {
    recommendations.push(`Ребёнок уверенно осваивает школьную программу! Рекомендуем поддерживать серию ежедневных занятий.`);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Раздел для родителей" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Карточка управления школьной программой */}
        {onOpenCurriculum && (
          <TouchableOpacity
            style={styles.curriculumParentCard}
            onPress={onOpenCurriculum}
            activeOpacity={0.8}
          >
            <View style={styles.curriculumParentHeader}>
              <Text style={styles.curriculumParentEmoji}>🎒</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.curriculumParentTitle}>
                  Пройденные темы в школе (учебник Моро)
                </Text>
                <Text style={styles.curriculumParentSub}>
                  Отмечайте изученный материал, чтобы тренировка дня подстраивалась под класс.
                </Text>
              </View>
              <Text style={styles.curriculumParentArrow}>➔</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Карточка общей сводки */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeader}>📊 Общие показатели успеваемости:</Text>
          <View style={styles.statsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{total}</Text>
              <Text style={styles.metricLabel}>Решено заданий</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#10B981' }]}>{accuracy}%</Text>
              <Text style={styles.metricLabel}>Точность ответов</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: '#F59E0B' }]}>{stats.totalStars}</Text>
              <Text style={styles.metricLabel}>Звёзд заработано</Text>
            </View>
          </View>
        </View>

        {/* Рекомендации родителям */}
        <View style={styles.recCard}>
          <Text style={styles.recTitle}>💡 Советы и рекомендации:</Text>
          {recommendations.map((rec, idx) => (
            <View key={idx} style={styles.recRow}>
              <Text style={styles.recBullet}>•</Text>
              <Text style={styles.recText}>{rec}</Text>
            </View>
          ))}
        </View>

        {/* Статистика по переходам через каждый десяток (20..90) */}
        <Text style={styles.sectionTitle}>🎯 Освоение перехода через каждый десяток:</Text>
        <View style={styles.tensList}>
          {tensList.map(t => {
            const p = stats.tenTransitionProgress[t];
            const tSolved = p?.solvedCount || 0;
            const tCorrect = p?.correctCount || 0;
            const tAcc = tSolved > 0 ? Math.round((tCorrect / tSolved) * 100) : 0;
            const isMastered = p?.mastered;

            return (
              <View key={t} style={styles.tenStatItem}>
                <View style={styles.tenStatHeader}>
                  <Text style={styles.tenStatTitle}>Переход через {t}</Text>
                  <Text style={[styles.tenStatBadge, isMastered && styles.tenMasteredBadge]}>
                    {isMastered ? '🏆 Освоен' : `${tCorrect} из ${tSolved}`}
                  </Text>
                </View>

                {/* Полоса прогресса */}
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${tAcc}%`,
                        backgroundColor: tAcc >= 80 ? '#10B981' : (tAcc >= 50 ? '#F59E0B' : '#CBD5E1'),
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Успеваемость по 12 темам программы */}
        <Text style={styles.sectionTitle}>📚 Результаты по темам 2-го класса:</Text>
        <View style={styles.topicsGrid}>
          {TOPICS.map(t => {
            const p = stats.topicProgress[t.id];
            const tSolved = p?.solvedCount || 0;
            const tCorrect = p?.correctCount || 0;
            const tAcc = tSolved > 0 ? Math.round((tCorrect / tSolved) * 100) : 0;

            return (
              <View key={t.id} style={styles.topicStatCard}>
                <View style={styles.topicStatHeader}>
                  <Text style={styles.topicIcon}>{t.icon}</Text>
                  <Text style={styles.topicName} numberOfLines={1}>{t.title}</Text>
                </View>
                <Text style={styles.topicLevel}>Уровень {p?.level || 1}</Text>
                <Text style={styles.topicNumbers}>
                  Решено: {tSolved} | Правильно: {tCorrect} ({tAcc}%)
                </Text>
              </View>
            );
          })}
        </View>

        {/* Блок версии и обновления приложения */}
        <Text style={styles.sectionTitle}>⚙️ О приложении и обновления:</Text>
        <View style={styles.versionCard}>
          <View style={styles.versionCardRow}>
            <Text style={styles.versionCardLabel}>Текущая версия приложения:</Text>
            <Text style={styles.versionCardValue}>v{CURRENT_APP_VERSION}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkUpdateBtn}
            onPress={handleCheckUpdate}
            disabled={isCheckingUpdate}
            activeOpacity={0.8}
          >
            {isCheckingUpdate ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.checkUpdateBtnText}>🔄 Проверить обновления</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Модальное окно обновления */}
      <UpdateModal
        visible={showUpdateModal}
        updateInfo={availableUpdate}
        onClose={() => setShowUpdateModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 16, maxWidth: 680, width: '100%', alignSelf: 'center' },
  versionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  versionCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  versionCardLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  versionCardValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  checkUpdateBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkUpdateBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  curriculumParentCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#818CF8',
    padding: 16,
    marginBottom: 16,
  },
  curriculumParentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  curriculumParentEmoji: {
    fontSize: 28,
  },
  curriculumParentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#312E81',
    marginBottom: 4,
  },
  curriculumParentSub: {
    fontSize: 12,
    color: '#4338CA',
    lineHeight: 16,
  },
  curriculumParentArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginLeft: 4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeader: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  metricItem: { alignItems: 'center' },
  metricVal: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  metricLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  metricDivider: { width: 1, backgroundColor: '#E2E8F0' },
  recCard: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  recTitle: { fontSize: 15, fontWeight: 'bold', color: '#1D4ED8', marginBottom: 6 },
  recRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  recBullet: { fontSize: 14, color: '#2563EB', fontWeight: 'bold' },
  recText: { fontSize: 13, color: '#1E3A8A', flex: 1, lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 10, marginBottom: 10 },
  tensList: { gap: 8, marginBottom: 20 },
  tenStatItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tenStatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  tenStatTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  tenStatBadge: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  tenMasteredBadge: { color: '#059669', fontWeight: 'bold' },
  barBackground: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%' },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  topicStatCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topicStatHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  topicIcon: { fontSize: 18 },
  topicName: { fontSize: 13, fontWeight: 'bold', color: '#1E293B', flex: 1 },
  topicLevel: { fontSize: 11, color: '#4F46E5', fontWeight: 'bold', marginBottom: 2 },
  topicNumbers: { fontSize: 11, color: '#64748B' },
});
