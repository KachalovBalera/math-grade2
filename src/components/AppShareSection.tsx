import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Linking,
  Platform,
} from 'react-native';

const SCHITAYKA_LATEST_URL =
  'https://github.com/KachalovBalera/math-grade2/releases/latest';
const SCHITAYKA_APK_URL =
  'https://github.com/KachalovBalera/math-grade2/releases/download/v1.0.5/Schitayka_v1.0.5.apk';

const GRAMOTEYKA_LATEST_URL =
  'https://github.com/KachalovBalera/russian-app/releases/latest';
const GRAMOTEYKA_APK_URL =
  'https://github.com/KachalovBalera/russian-app/releases/download/v1.0.5/Gramoteyka_v1.0.5.apk';

interface AppShareSectionProps {
  style?: any;
}

export const AppShareSection: React.FC<AppShareSectionProps> = ({ style }) => {
  // Поделиться приложением Считайка
  const handleShareSchitayka = async () => {
    try {
      await Share.share({
        title: 'Считайка — Математика 2 класс',
        message:
          'Рекомендую отличное обучающее приложение «Считайка» для 2 класса начальной школы (программа «Школа России», учебник М.И. Моро)!\n' +
          '• Примеры со скобками и переход через десяток\n' +
          '• Устный счёт, текстовые задачи и уравнения\n' +
          '• Настройка пройденного в классе материала\n' +
          '• Без рекламы, подписок и платных функций!\n\n' +
          `Скачать для Android: ${SCHITAYKA_LATEST_URL}`,
        url: SCHITAYKA_LATEST_URL,
      });
    } catch (error) {
      console.warn('Ошибка при отправке ссылки:', error);
    }
  };

  // Поделиться приложением Грамотейка
  const handleShareGramoteyka = async () => {
    try {
      await Share.share({
        title: 'Грамотейка — Русский язык 2 класс',
        message:
          'Рекомендую развивающее приложение «Грамотейка» для 2 класса (Русский язык, программа «Школа России», учебник В.П. Канакиной)!\n' +
          '• Интерактивные словарные слова и орфограммы\n' +
          '• Умная Совушка-помощник\n' +
          '• Настройка пройденного материала по четвертям\n' +
          '• Без рекламы и подписок!\n\n' +
          `Скачать для Android: ${GRAMOTEYKA_LATEST_URL}`,
        url: GRAMOTEYKA_LATEST_URL,
      });
    } catch (error) {
      console.warn('Ошибка при отправке ссылки на Грамотейку:', error);
    }
  };

  // Скачать и установить Грамотейку
  const handleInstallGramoteyka = async () => {
    try {
      const canOpen = await Linking.canOpenURL(GRAMOTEYKA_APK_URL);
      if (canOpen) {
        await Linking.openURL(GRAMOTEYKA_APK_URL);
      } else {
        await Linking.openURL(GRAMOTEYKA_LATEST_URL);
      }
    } catch {
      await Linking.openURL(GRAMOTEYKA_LATEST_URL);
    }
  };

  const handleOpenSchitaykaWeb = async () => {
    await Linking.openURL(SCHITAYKA_LATEST_URL);
  };

  const handleOpenGramoteykaWeb = async () => {
    await Linking.openURL(GRAMOTEYKA_LATEST_URL);
  };

  return (
    <View style={[styles.container, style]}>
      {/* 1. Блок Считайки */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardEmoji}>🧮</Text>
          <View style={styles.cardTitleCol}>
            <Text style={styles.cardTitle}>Поделиться «Считайкой»</Text>
            <Text style={styles.cardSub}>Математика — 2 класс (учебник Моро)</Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          Посоветуйте приложение друзьям и одноклассникам! Обучающая игра без рекламы
          поможет легко освоить счёт, переход через десяток, скобки и задачи.
        </Text>

        <View style={styles.buttonsGroup}>
          <TouchableOpacity
            style={styles.shareBtnPrimary}
            onPress={handleShareSchitayka}
            activeOpacity={0.8}
          >
            <Text style={styles.shareBtnIcon}>📤</Text>
            <Text style={styles.shareBtnPrimaryText}>Поделиться ссылкой на приложение</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={handleOpenSchitaykaWeb}
            activeOpacity={0.7}
          >
            <Text style={styles.linkBtnText}>🌐 Страница загрузки на GitHub ➔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Блок Грамотейки */}
      <View style={[styles.card, styles.gramoteykaCard]}>
        <View style={styles.badgeRow}>
          <View style={styles.companionBadge}>
            <Text style={styles.companionBadgeText}>⭐ КОМПЛЕКТНОЕ ПРИЛОЖЕНИЕ</Text>
          </View>
        </View>

        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardEmoji}>🦉</Text>
          <View style={styles.cardTitleCol}>
            <Text style={styles.cardTitle}>Приложение «Грамотейка»</Text>
            <Text style={styles.cardSub}>Русский язык — 2 класс (учебник Канакиной)</Text>
          </View>
        </View>

        <Text style={styles.cardDescription}>
          Установите второе приложение из нашей серии для 2-го класса! «Грамотейка»
          поможет ребёнку выучить словарные слова, разобрать правила русского языка
          и писать без ошибок вместе с дружелюбной Совушкой.
        </Text>

        <View style={styles.buttonsGroup}>
          <TouchableOpacity
            style={styles.installGramoteykaBtn}
            onPress={handleInstallGramoteyka}
            activeOpacity={0.8}
          >
            <Text style={styles.shareBtnIcon}>📥</Text>
            <Text style={styles.installGramoteykaText}>
              Установить «Грамотейку» (скачать APK)
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity
              style={styles.shareGramoteykaBtn}
              onPress={handleShareGramoteyka}
              activeOpacity={0.8}
            >
              <Text style={styles.shareBtnIconSmall}>📤</Text>
              <Text style={styles.shareGramoteykaText}>Поделиться</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.browserGramoteykaBtn}
              onPress={handleOpenGramoteykaWeb}
              activeOpacity={0.8}
            >
              <Text style={styles.shareBtnIconSmall}>🌐</Text>
              <Text style={styles.browserGramoteykaText}>На GitHub</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  gramoteykaCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F0F9FF',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  companionBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  companionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  cardEmoji: {
    fontSize: 34,
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 14,
  },
  buttonsGroup: {
    gap: 10,
  },
  shareBtnPrimary: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  shareBtnIcon: {
    fontSize: 18,
  },
  shareBtnIconSmall: {
    fontSize: 15,
  },
  shareBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  installGramoteykaBtn: {
    backgroundColor: '#0284C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  installGramoteykaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shareGramoteykaBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  shareGramoteykaText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '700',
  },
  browserGramoteykaBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  browserGramoteykaText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  linkBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});
