import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { UserStats, TopicId } from '../types/math';
import { StorageService, DEFAULT_USER_STATS } from '../services/storage';
import { TOPICS } from '../data/topics';
import { ParentGateModal } from '../components/ParentGateModal';
import { AppUpdateInfo } from '../types/update';
import { checkForUpdates } from '../utils/updateService';
import { UpdateModal } from '../components/UpdateModal';
import { CURRENT_APP_VERSION } from '../constants/updateConfig';

interface HomeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<UserStats>(DEFAULT_USER_STATS);
  const [parentModalVisible, setParentModalVisible] = useState(false);
  const [availableUpdate, setAvailableUpdate] = useState<AppUpdateInfo | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);

  useEffect(() => {
    loadUserStats();
    checkUpdateBackground();
  }, []);

  const checkUpdateBackground = async () => {
    try {
      const res = await checkForUpdates();
      if (res.hasUpdate && res.updateInfo) {
        setAvailableUpdate(res.updateInfo);
        if (res.updateInfo.forceUpdate) {
          setShowUpdateModal(true);
        }
      }
    } catch {
      // Игнорируем сетевые ошибки фоновой проверки
    }
  };

  const handleManualCheckUpdate = async () => {
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
          `У вас установлена самая свежая версия Математики (${CURRENT_APP_VERSION})! ✨`
        );
      }
    } catch (err: any) {
      setIsCheckingUpdate(false);
      Alert.alert('Ошибка', err?.message || 'Не удалось проверить обновления');
    }
  };

  const loadUserStats = async () => {
    const s = await StorageService.loadStats();
    setStats(s);
  };

  // Вычисляем процент общего прогресса
  const totalTopics = TOPICS.length;
  let masteredTopics = 0;
  for (const t of TOPICS) {
    if ((stats.topicProgress[t.id]?.correctCount || 0) >= 10) {
      masteredTopics += 1;
    }
  }
  const overallProgressPercent = Math.min(
    100,
    Math.round((masteredTopics / totalTopics) * 100)
  );

  const lastTopic = TOPICS.find(t => t.id === stats.lastTopicId) || TOPICS[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Верхняя шапка */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerIcon}>📚</Text>
            <View>
              <Text style={styles.appName}>Математика — 2 класс</Text>
              <Text style={styles.appSubtitle}>Интерактивный тренажёр v{CURRENT_APP_VERSION}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {availableUpdate && (
              <TouchableOpacity
                style={styles.updateBadgeBtn}
                onPress={() => setShowUpdateModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.updateBadgeIcon}>🚀</Text>
                <Text style={styles.updateBadgeText}>Обновить!</Text>
              </TouchableOpacity>
            )}

            {/* Кнопка раздела родителей */}
            <TouchableOpacity
              style={styles.parentBtn}
              onPress={() => setParentModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.parentBtnIcon}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.parentBtnText}>Родителям</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Баннер доступного обновления (как в Грамотейке) */}
        {availableUpdate && (
          <TouchableOpacity
            style={styles.updateBanner}
            onPress={() => setShowUpdateModal(true)}
            activeOpacity={0.85}
          >
            <View style={styles.updateBannerIconBox}>
              <Text style={styles.updateBannerIcon}>🚀</Text>
            </View>
            <View style={styles.updateBannerTextCol}>
              <Text style={styles.updateBannerTitle}>
                Доступно обновление v{availableUpdate.version}!
              </Text>
              <Text style={styles.updateBannerSub}>
                Нажмите здесь, чтобы посмотреть список улучшений и обновиться
              </Text>
            </View>
            <Text style={styles.updateBannerArrow}>➔</Text>
          </TouchableOpacity>
        )}

        {/* Индикаторы прогресса, звёзд и серии дней */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <Text style={styles.statusEmoji}>⭐</Text>
            <View>
              <Text style={styles.statusValue}>{stats.totalStars}</Text>
              <Text style={styles.statusLabel}>Звёзд</Text>
            </View>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusItem}>
            <Text style={styles.statusEmoji}>🔥</Text>
            <View>
              <Text style={styles.statusValue}>{stats.streakDays} дн.</Text>
              <Text style={styles.statusLabel}>Серия</Text>
            </View>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusItem}>
            <Text style={styles.statusEmoji}>🎯</Text>
            <View>
              <Text style={styles.statusValue}>{overallProgressPercent}%</Text>
              <Text style={styles.statusLabel}>Прогресс</Text>
            </View>
          </View>
        </View>

        {/* Главная кнопка: Начать заниматься / Продолжить обучение */}
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => onNavigate('quiz', { topicId: stats.lastTopicId || 'numbers' })}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.primaryActionIcon}>🚀</Text>
          </View>
          <View style={styles.primaryActionTexts}>
            <Text style={styles.primaryActionTitle}>
              {stats.totalSolved > 0 ? 'Продолжить обучение' : 'Начать заниматься'}
            </Text>
            <Text style={styles.primaryActionSubtitle}>
              Тема: {lastTopic.title} (Уровень {stats.topicProgress[lastTopic.id]?.level || 1})
            </Text>
          </View>
          <Text style={styles.primaryActionArrow}>➔</Text>
        </TouchableOpacity>

        {/* Сетка основных разделов */}
        <Text style={styles.sectionHeading}>Выбери режим занятий:</Text>

        <View style={styles.grid}>
          {/* 1. Тренировка дня */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
            onPress={() => onNavigate('daily')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🌟</Text>
              <View style={styles.badgeDaily}>
                <Text style={styles.badgeDailyText}>Каждый день</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Тренировка дня</Text>
            <Text style={styles.cardDesc}>10 индивидуальных заданий</Text>
          </TouchableOpacity>

          {/* 2. Выбрать тему */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
            onPress={() => onNavigate('topics')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>📖</Text>
            </View>
            <Text style={styles.cardTitle}>Выбрать тему</Text>
            <Text style={styles.cardDesc}>12 тем программы 2 класса</Text>
          </TouchableOpacity>

          {/* 3. Переход через десяток (СПЕЦИАЛЬНЫЙ ТРЕНАЖЁР) */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}
            onPress={() => onNavigate('tenTransition')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🎯</Text>
              <View style={[styles.badgeDaily, { backgroundColor: '#F97316' }]}>
                <Text style={styles.badgeDailyText}>20...90</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Переход через десяток</Text>
            <Text style={styles.cardDesc}>Отдельный выбор десятков</Text>
          </TouchableOpacity>

          {/* 4. Примеры со скобками (СПЕЦИАЛЬНЫЙ РАЗДЕЛ) */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: '#FDF2F8', borderColor: '#FCE7F3' }]}
            onPress={() => onNavigate('brackets')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>📐</Text>
              <View style={[styles.badgeDaily, { backgroundColor: '#EC4899' }]}>
                <Text style={styles.badgeDailyText}>2 этапа</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Примеры со скобками</Text>
            <Text style={styles.cardDesc}>Ответ над скобками</Text>
          </TouchableOpacity>

          {/* 5. Устный счёт */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
            onPress={() => onNavigate('quiz', { topicId: 'addsub' })}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>⚡</Text>
            </View>
            <Text style={styles.cardTitle}>Устный счёт</Text>
            <Text style={styles.cardDesc}>Быстрое сложение и вычитание</Text>
          </TouchableOpacity>

          {/* 6. Решаем задачи */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: '#ECFEFF', borderColor: '#A5F3FC' }]}
            onPress={() => onNavigate('quiz', { topicId: 'wordProblems' })}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>📝</Text>
            </View>
            <Text style={styles.cardTitle}>Решаем задачи</Text>
            <Text style={styles.cardDesc}>Текстовые задачи со схемами</Text>
          </TouchableOpacity>

          {/* 7. Мои ошибки */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
            onPress={() => onNavigate('errors')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🛠️</Text>
            </View>
            <Text style={styles.cardTitle}>Мои ошибки</Text>
            <Text style={styles.cardDesc}>Работа над ошибками</Text>
          </TouchableOpacity>

          {/* 8. Мои достижения */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}
            onPress={() => onNavigate('achievements')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🏆</Text>
            </View>
            <Text style={styles.cardTitle}>Мои достижения</Text>
            <Text style={styles.cardDesc}>Медали, кубки и награды</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Модальное окно доступа в раздел родителей */}
      <ParentGateModal
        visible={parentModalVisible}
        onSuccess={() => {
          setParentModalVisible(false);
          onNavigate('parentDashboard');
        }}
        onClose={() => setParentModalVisible(false)}
      />

      {/* Модальное окно обновления приложения */}
      <UpdateModal
        visible={showUpdateModal}
        updateInfo={availableUpdate}
        onClose={() => setShowUpdateModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 34,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  appSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
    gap: 4,
  },
  updateBadgeIcon: {
    fontSize: 14,
  },
  updateBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#065F46',
  },
  updateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  updateBannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBannerIcon: {
    fontSize: 22,
  },
  updateBannerTextCol: {
    flex: 1,
  },
  updateBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 2,
  },
  updateBannerSub: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
  updateBannerArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  parentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 4,
  },
  parentBtnIcon: {
    fontSize: 16,
  },
  parentBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statusBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'space-around',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      },
    }),
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusEmoji: {
    fontSize: 22,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statusLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  statusDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  primaryActionButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#3730A3',
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  primaryActionIcon: {
    fontSize: 26,
  },
  primaryActionTexts: {
    flex: 1,
  },
  primaryActionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  primaryActionSubtitle: {
    fontSize: 13,
    color: '#E0E7FF',
  },
  primaryActionArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    minHeight: 124,
    borderRadius: 18,
    borderWidth: 2,
    padding: 14,
    justifyContent: 'space-between',
    borderBottomWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardEmoji: {
    fontSize: 28,
  },
  badgeDaily: {
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeDailyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
