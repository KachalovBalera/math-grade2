import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Achievement, UserStats } from '../types/math';
import { Header } from '../components/Header';
import { StorageService, DEFAULT_USER_STATS } from '../services/storage';

interface AchievementsScreenProps {
  onBack: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ onBack }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<UserStats>(DEFAULT_USER_STATS);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await StorageService.loadStats();
    setStats(s);
    const list = await StorageService.checkAchievements(s);
    setAchievements(list);
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={`Мои достижения (${unlockedCount}/${achievements.length})`}
        onBack={onBack}
        stars={stats.totalStars}
        streak={stats.streakDays}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Баннер успехов */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>🏆</Text>
          <View style={styles.bannerTexts}>
            <Text style={styles.bannerTitle}>
              Открыто {unlockedCount} из {achievements.length} наград
            </Text>
            <Text style={styles.bannerSubtitle}>
              Решай примеры, тренируй переходы и собирай золотые кубки!
            </Text>
          </View>
        </View>

        {/* Категория: Переходы через десятки 20..90 */}
        <Text style={styles.categoryTitle}>🎯 Награды за переходы через десятки (20–90):</Text>
        <View style={styles.grid}>
          {achievements
            .filter(a => a.category === 'tens')
            .map(ach => (
              <View
                key={ach.id}
                style={[
                  styles.badgeCard,
                  ach.isUnlocked ? styles.badgeUnlocked : styles.badgeLocked,
                ]}
              >
                <Text style={styles.badgeIcon}>
                  {ach.isUnlocked ? ach.icon : '🔒'}
                </Text>
                <Text
                  style={[
                    styles.badgeTitle,
                    ach.isUnlocked && styles.badgeTitleUnlocked,
                  ]}
                >
                  {ach.title}
                </Text>
                <Text style={styles.badgeDesc}>{ach.description}</Text>
                {ach.isUnlocked && ach.unlockedAt && (
                  <Text style={styles.unlockedDate}>Получено: {ach.unlockedAt}</Text>
                )}
              </View>
            ))}
        </View>

        {/* Категория: Скобки и вычисления */}
        <Text style={styles.categoryTitle}>📐 Скобки и правила:</Text>
        <View style={styles.grid}>
          {achievements
            .filter(a => a.category === 'brackets')
            .map(ach => (
              <View
                key={ach.id}
                style={[
                  styles.badgeCard,
                  ach.isUnlocked ? styles.badgeUnlocked : styles.badgeLocked,
                ]}
              >
                <Text style={styles.badgeIcon}>
                  {ach.isUnlocked ? ach.icon : '🔒'}
                </Text>
                <Text
                  style={[
                    styles.badgeTitle,
                    ach.isUnlocked && styles.badgeTitleUnlocked,
                  ]}
                >
                  {ach.title}
                </Text>
                <Text style={styles.badgeDesc}>{ach.description}</Text>
              </View>
            ))}
        </View>

        {/* Категория: Задачи, умножение, серии */}
        <Text style={styles.categoryTitle}>🌟 Задачи, таблица и регулярность:</Text>
        <View style={styles.grid}>
          {achievements
            .filter(a => a.category === 'tasks' || a.category === 'streak' || a.category === 'general')
            .map(ach => (
              <View
                key={ach.id}
                style={[
                  styles.badgeCard,
                  ach.isUnlocked ? styles.badgeUnlocked : styles.badgeLocked,
                ]}
              >
                <Text style={styles.badgeIcon}>
                  {ach.isUnlocked ? ach.icon : '🔒'}
                </Text>
                <Text
                  style={[
                    styles.badgeTitle,
                    ach.isUnlocked && styles.badgeTitleUnlocked,
                  ]}
                >
                  {ach.title}
                </Text>
                <Text style={styles.badgeDesc}>{ach.description}</Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 16, maxWidth: 680, width: '100%', alignSelf: 'center' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#FDE68A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  bannerEmoji: { fontSize: 40, marginRight: 14 },
  bannerTexts: { flex: 1 },
  bannerTitle: { fontSize: 17, fontWeight: 'bold', color: '#92400E', marginBottom: 2 },
  bannerSubtitle: { fontSize: 13, color: '#B45309' },
  categoryTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 10, marginBottom: 10 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  badgeCard: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 2,
    padding: 14,
    alignItems: 'center',
    borderBottomWidth: 4,
  },
  badgeUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FCD34D',
    borderBottomColor: '#F59E0B',
  },
  badgeLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
    opacity: 0.7,
  },
  badgeIcon: { fontSize: 36, marginBottom: 6 },
  badgeTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748B', textAlign: 'center', marginBottom: 4 },
  badgeTitleUnlocked: { color: '#B45309' },
  badgeDesc: { fontSize: 11, color: '#64748B', textAlign: 'center', lineHeight: 14 },
  unlockedDate: { fontSize: 10, color: '#10B981', fontWeight: 'bold', marginTop: 6 },
});
