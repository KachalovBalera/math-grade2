import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { UserStats } from '../types/math';
import { StorageService, DEFAULT_USER_STATS } from '../services/storage';
import { TOPICS } from '../data/topics';
import { AppUpdateInfo } from '../types/update';
import { checkForUpdates } from '../utils/updateService';
import { UpdateModal } from '../components/UpdateModal';
import { CURRENT_APP_VERSION } from '../constants/updateConfig';

interface HomeScreenProps {
  onNavigate: (screen: string, params?: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<UserStats>(DEFAULT_USER_STATS);
  const [availableUpdate, setAvailableUpdate] = useState<AppUpdateInfo | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. ВЕРХНЯЯ ШАПКА ПРИЛОЖЕНИЯ (как на картинке) */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Иконка приложения (123 + -) */}
            <View style={styles.appIconBadge}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.appIconImage}
                resizeMode="cover"
              />
            </View>

            {/* Название и подписи */}
            <View style={styles.titleColumn}>
              <Text style={styles.appName}>Считайка</Text>
              <Text style={styles.appSubtitle}>Математика • 2 класс</Text>
              <Text style={styles.appMotto}>Учимся с удовольствием!</Text>
            </View>
          </View>

          {/* Кнопка «Настройки» в виде белой таблетки */}
          <TouchableOpacity
            style={styles.settingsPillBtn}
            onPress={() => onNavigate('curriculumSettings')}
            activeOpacity={0.8}
          >
            <Text style={styles.settingsPillIcon}>⚙️</Text>
            <Text style={styles.settingsPillText}>Настройки</Text>
          </TouchableOpacity>
        </View>

        {/* Баннер доступного обновления (если есть) */}
        {availableUpdate && (
          <TouchableOpacity
            style={styles.updateBanner}
            onPress={() => setShowUpdateModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.updateBannerIcon}>🚀</Text>
            <View style={styles.updateBannerTextCol}>
              <Text style={styles.updateBannerTitle}>
                Доступно обновление v{availableUpdate.version}!
              </Text>
              <Text style={styles.updateBannerSub}>
                Нажмите для быстрой установки в 1 клик
              </Text>
            </View>
            <Text style={styles.updateBannerArrow}>➔</Text>
          </TouchableOpacity>
        )}

        {/* 2. ПАНЕЛЬ ПОКАЗАТЕЛЕЙ (Звёзды, Серия, Прогресс) */}
        <View style={styles.statsCard}>
          <View style={styles.statColumn}>
            <Text style={styles.statIcon}>⭐</Text>
            <View style={styles.statTexts}>
              <Text style={styles.statValue}>{stats.totalStars}</Text>
              <Text style={styles.statLabel}>Звёзд</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statColumn}>
            <Text style={styles.statIcon}>🔥</Text>
            <View style={styles.statTexts}>
              <Text style={styles.statValue}>{stats.streakDays} дн.</Text>
              <Text style={styles.statLabel}>Серия</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statColumn}>
            <Text style={styles.statIcon}>🎯</Text>
            <View style={styles.statTexts}>
              <Text style={styles.statValue}>{overallProgressPercent}%</Text>
              <Text style={styles.statLabel}>Прогресс</Text>
            </View>
          </View>
        </View>

        {/* 3. ГЛАВНЫЙ БАННЕР «НАЧАТЬ ЗАНИМАТЬСЯ» С СОВУШКОЙ */}
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => onNavigate('daily')}
          activeOpacity={0.9}
        >
          {/* Совушка с книжкой */}
          <Image
            source={require('../../assets/ui/hero_owl.png')}
            style={styles.heroOwlImage}
            resizeMode="contain"
          />

          {/* Текст по центру */}
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>Начать заниматься</Text>
            <Text style={styles.heroSubtitle}>
              Выбери тему и переходи к заданиям
            </Text>
          </View>

          {/* Фоновые математические формулы и стрелка */}
          <View style={styles.heroRight}>
            <Text style={styles.faintMath1}>2+2</Text>
            <Text style={styles.faintMath2}>5-3</Text>
            <Text style={styles.faintStar}>★</Text>
            <View style={styles.heroArrowBtn}>
              <Text style={styles.heroArrowText}>➔</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 4. ЗАГОЛОВОК СЕКЦИИ */}
        <Text style={styles.sectionHeading}>Выбери режим занятий:</Text>

        {/* 5. СЕТКА РЕЖИМОВ ОБУЧЕНИЯ (2 колонки) */}
        <View style={styles.gridContainer}>
          {/* 1. Тренировка дня */}
          <TouchableOpacity
            style={[styles.modeCard, styles.cardYellow]}
            onPress={() => onNavigate('daily')}
            activeOpacity={0.8}
          >
            <View style={styles.cardTopRow}>
              {/* Блоки 1 2 3 */}
              <View style={styles.blockRow}>
                <View style={[styles.miniBlock, { backgroundColor: '#22C55E' }]}>
                  <Text style={styles.miniBlockText}>1</Text>
                </View>
                <View style={[styles.miniBlock, { backgroundColor: '#3B82F6' }]}>
                  <Text style={styles.miniBlockText}>2</Text>
                </View>
                <View style={[styles.miniBlock, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.miniBlockText}>3</Text>
                </View>
              </View>

              <View style={styles.badgeOrange}>
                <Text style={styles.badgeOrangeText}>Каждый день</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Тренировка дня</Text>
              <Text style={styles.cardSub}>10 индивидуальных заданий</Text>
            </View>

            <View style={styles.cardArrowRow}>
              <View style={[styles.arrowCircle, styles.arrowCircleYellow]}>
                <Text style={[styles.arrowText, styles.arrowTextYellow]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 2. Выбрать тему */}
          <TouchableOpacity
            style={[styles.modeCard, styles.cardSky]}
            onPress={() => onNavigate('topics')}
            activeOpacity={0.8}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.notebookIconBox}>
                <Text style={styles.notebookFormula}>2+3=5</Text>
                <Text style={styles.notebookPencil}>✏️</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Выбрать тему</Text>
              <Text style={styles.cardSub}>12 тем программы 2 класса</Text>
            </View>

            <View style={styles.cardArrowRow}>
              <View style={[styles.arrowCircle, styles.arrowCircleSky]}>
                <Text style={[styles.arrowText, styles.arrowTextSky]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 3. Переход через десяток */}
          <TouchableOpacity
            style={[styles.modeCard, styles.cardRose]}
            onPress={() => onNavigate('tenTransition')}
            activeOpacity={0.8}
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.cardEmoji}>🎯</Text>
              <View style={styles.badgeRed}>
                <Text style={styles.badgeRedText}>20...90</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Переход через десяток</Text>
              <Text style={styles.cardSub}>Отдельный выбор десятков</Text>
            </View>

            <View style={styles.cardArrowRow}>
              <View style={[styles.arrowCircle, styles.arrowCircleRose]}>
                <Text style={[styles.arrowText, styles.arrowTextRose]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 4. Примеры со скобками */}
          <TouchableOpacity
            style={[styles.modeCard, styles.cardPurple]}
            onPress={() => onNavigate('brackets')}
            activeOpacity={0.8}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.rulerPencilBox}>
                <Text style={styles.cardEmoji}>📐</Text>
                <Text style={styles.cardEmojiSmall}>✏️</Text>
              </View>
              <View style={styles.badgePurple}>
                <Text style={styles.badgePurpleText}>2 этапа</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Примеры со скобками</Text>
              <Text style={styles.cardSub}>Ответ над скобками</Text>
            </View>

            <View style={styles.cardArrowRow}>
              <View style={[styles.arrowCircle, styles.arrowCirclePurple]}>
                <Text style={[styles.arrowText, styles.arrowTextPurple]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 5. Устный счёт */}
          <TouchableOpacity
            style={[styles.modeCard, styles.cardGreen]}
            onPress={() => onNavigate('quiz', { topicId: 'addition' })}
            activeOpacity={0.8}
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.cardEmoji}>⚡</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Устный счёт</Text>
              <Text style={styles.cardSub}>Быстрое сложение и вычитание</Text>
            </View>

            <View style={styles.cardArrowRow}>
              <View style={[styles.arrowCircle, styles.arrowCircleGreen]}>
                <Text style={[styles.arrowText, styles.arrowTextGreen]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 6. Решаем задачи */}
          <TouchableOpacity
            style={[styles.modeCard, styles.cardSky]}
            onPress={() => onNavigate('quiz', { topicId: 'wordProblems' })}
            activeOpacity={0.8}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.rulerPencilBox}>
                <Text style={styles.cardEmoji}>📝</Text>
                <Text style={styles.cardEmojiSmall}>✏️</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Решаем задачи</Text>
              <Text style={styles.cardSub}>Текстовые задачи со схемами</Text>
            </View>

            <View style={styles.cardArrowRow}>
              <View style={[styles.arrowCircle, styles.arrowCircleSky]}>
                <Text style={[styles.arrowText, styles.arrowTextSky]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 7. Мои ошибки */}
          <TouchableOpacity
            style={[styles.modeCard, styles.cardRose]}
            onPress={() => onNavigate('errors')}
            activeOpacity={0.8}
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.cardEmoji}>🛠️</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Мои ошибки</Text>
              <Text style={styles.cardSub}>Работа над ошибками</Text>
            </View>

            <View style={styles.cardArrowRow}>
              <View style={[styles.arrowCircle, styles.arrowCircleRose]}>
                <Text style={[styles.arrowText, styles.arrowTextRose]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* 8. Мои достижения */}
          <TouchableOpacity
            style={[styles.modeCard, styles.cardPurpleSoft]}
            onPress={() => onNavigate('achievements')}
            activeOpacity={0.8}
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.cardEmoji}>🏆</Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Мои достижения</Text>
              <Text style={styles.cardSub}>Медали, кубки и награды</Text>
            </View>

            <View style={styles.cardArrowRow}>
              <View style={[styles.arrowCircle, styles.arrowCirclePurpleSoft]}>
                <Text style={[styles.arrowText, styles.arrowTextPurpleSoft]}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Запас снизу под нижний бар */}
        <View style={{ height: 20 }} />
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  // 1. Верхняя шапка
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#FEF08A',
    borderWidth: 1.5,
    borderColor: '#FDE047',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  appIconImage: {
    width: '100%',
    height: '100%',
  },
  titleColumn: {
    justifyContent: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  appSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 1,
  },
  appMotto: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  settingsPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  settingsPillIcon: {
    fontSize: 14,
  },
  settingsPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  // Баннер обновления
  updateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  updateBannerIcon: {
    fontSize: 22,
  },
  updateBannerTextCol: {
    flex: 1,
  },
  updateBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
  updateBannerSub: {
    fontSize: 12,
    color: '#047857',
  },
  updateBannerArrow: {
    fontSize: 16,
    color: '#059669',
    fontWeight: 'bold',
  },

  // 2. Карточка показателей (Звёзды, Серия, Прогресс)
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statIcon: {
    fontSize: 24,
  },
  statTexts: {
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#E2E8F0',
  },

  // 3. Баннер «Начать заниматься» с совушкой
  heroCard: {
    backgroundColor: '#4338CA',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  heroOwlImage: {
    width: 76,
    height: 76,
  },
  heroTextCol: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 6,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#E0E7FF',
    lineHeight: 17,
    fontWeight: '500',
  },
  heroRight: {
    width: 50,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faintMath1: {
    position: 'absolute',
    top: -4,
    right: 18,
    fontSize: 17,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.22)',
  },
  faintMath2: {
    position: 'absolute',
    bottom: -4,
    right: 22,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.22)',
  },
  faintStar: {
    position: 'absolute',
    top: 14,
    right: 48,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.25)',
  },
  heroArrowBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroArrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // 4. Заголовок секции
  sectionHeading: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  // 5. Сетка режимов
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  modeCard: {
    width: '48%',
    minHeight: 136,
    borderRadius: 20,
    padding: 13,
    borderWidth: 1.5,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  // Цвета карточек
  cardYellow: {
    backgroundColor: '#FEFCE8',
    borderColor: '#FEF08A',
  },
  cardSky: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  cardRose: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  cardPurple: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  cardGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  cardPurpleSoft: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },

  // Элементы карточки
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 4,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 15,
  },
  cardEmoji: {
    fontSize: 26,
  },
  cardEmojiSmall: {
    fontSize: 16,
    marginLeft: -4,
  },

  // Блоки 1 2 3
  blockRow: {
    flexDirection: 'row',
    gap: 3,
  },
  miniBlock: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBlockText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  // Тетрадь
  notebookIconBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  notebookFormula: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0284C7',
  },
  notebookPencil: {
    fontSize: 12,
  },
  rulerPencilBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Бейджи
  badgeOrange: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  badgeOrangeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  badgeRed: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  badgeRedText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  badgePurple: {
    backgroundColor: '#A855F7',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  badgePurpleText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },

  // Стрелки внутри карточек
  cardArrowRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  arrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: -2,
  },
  arrowCircleYellow: {
    backgroundColor: '#FEF08A',
  },
  arrowTextYellow: {
    color: '#B45309',
  },
  arrowCircleSky: {
    backgroundColor: '#E0F2FE',
  },
  arrowTextSky: {
    color: '#0284C7',
  },
  arrowCircleRose: {
    backgroundColor: '#FFE4E6',
  },
  arrowTextRose: {
    color: '#E11D48',
  },
  arrowCirclePurple: {
    backgroundColor: '#F3E8FF',
  },
  arrowTextPurple: {
    color: '#9333EA',
  },
  arrowCircleGreen: {
    backgroundColor: '#DCFCE7',
  },
  arrowTextGreen: {
    color: '#16A34A',
  },
  arrowCirclePurpleSoft: {
    backgroundColor: '#EDE9FE',
  },
  arrowTextPurpleSoft: {
    color: '#7C3AED',
  },
});
