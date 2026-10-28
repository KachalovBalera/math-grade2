import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TopicId } from '../types/math';
import { StorageService } from '../services/storage';
import {
  SCHOOL_CURRICULUM_TOPICS,
  CurriculumTopicItem,
  CURRICULUM_PRESETS,
  DEFAULT_CURRICULUM_TOPIC_IDS,
} from '../data/curriculum';

interface CurriculumSettingsScreenProps {
  onBack: () => void;
  onSaved?: () => void;
}

export const CurriculumSettingsScreen: React.FC<CurriculumSettingsScreenProps> = ({
  onBack,
  onSaved,
}) => {
  const [selectedTopics, setSelectedTopics] = useState<TopicId[]>(DEFAULT_CURRICULUM_TOPIC_IDS);
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);

  useEffect(() => {
    StorageService.getCurriculumTopics().then(topics => {
      setSelectedTopics(topics);
    });
  }, []);

  const toggleTopic = (id: TopicId) => {
    setSelectedTopics(prev => {
      if (prev.includes(id)) {
        // Не даем снять последнюю оставшуюся галочку
        if (prev.length === 1) {
          Alert.alert('Внимание', 'Должна быть выбрана хотя бы одна пройденная тема!');
          return prev;
        }
        return prev.filter(t => t !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Функция: «Отметить все темы до этой включительно»
  const handleSelectUpTo = (item: CurriculumTopicItem) => {
    const upToOrder = item.order;
    const newSelected = SCHOOL_CURRICULUM_TOPICS.filter(t => t.order <= upToOrder).map(t => t.id);
    setSelectedTopics(newSelected);
  };

  const handleApplyPreset = (presetTopicIds: TopicId[]) => {
    setSelectedTopics(presetTopicIds);
  };

  const handleSelectAll = () => {
    setSelectedTopics(DEFAULT_CURRICULUM_TOPIC_IDS);
  };

  const handleSave = async () => {
    await StorageService.saveCurriculumTopics(selectedTopics);
    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      if (onSaved) onSaved();
      onBack();
    }, 1200);
  };

  // Группировка тем по четвертям учебника
  const quarters: Array<{
    title: string;
    subtitle: string;
    icon: string;
    items: CurriculumTopicItem[];
  }> = [
    {
      title: 'Часть 1 учебника — 1-я четверть',
      subtitle: 'Сентябрь — Октябрь (Повторение 1 класса, числа до 100, величины)',
      icon: '📘',
      items: SCHOOL_CURRICULUM_TOPICS.filter(t => t.quarter === '1-я четверть'),
    },
    {
      title: 'Часть 1 учебника — 2-я четверть',
      subtitle: 'Ноябрь — Декабрь (Сложение/вычитание, задачи, скобки, уравнения, переходы)',
      icon: '📘',
      items: SCHOOL_CURRICULUM_TOPICS.filter(t => t.quarter === '2-я четверть'),
    },
    {
      title: 'Часть 2 учебника — 3-я и 4-я четверти',
      subtitle: 'Январь — Май (Письменные вычисления, умножение, деление и логика)',
      icon: '📙',
      items: SCHOOL_CURRICULUM_TOPICS.filter(
        t => t.quarter === '3-я четверть' || t.quarter === '4-я четверть'
      ),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Пройденный материал</Text>
          <Text style={styles.headerSub}>Учебник Моро «Школа России»</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Карточка-памятка и статус */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📖</Text>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoTitle}>
                Отмечено тем: {selectedTopics.length} из {SCHOOL_CURRICULUM_TOPICS.length}
              </Text>
              <Text style={styles.infoDesc}>
                Отметьте галочками темы, которые ребёнок уже изучил в школе.
                Задания по ещё не пройденным темам{' '}
                <Text style={{ fontWeight: 'bold' }}>не попадут</Text> в ежедневную тренировку!
              </Text>
            </View>
          </View>

          {/* Быстрые пресеты */}
          <Text style={styles.presetsTitle}>Быстрый выбор по четвертям:</Text>
          <View style={styles.presetButtonsRow}>
            {CURRICULUM_PRESETS.map(preset => {
              const isActive =
                preset.topicIds.length === selectedTopics.length &&
                preset.topicIds.every(id => selectedTopics.includes(id));
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.presetChip, isActive && styles.presetChipActive]}
                  onPress={() => handleApplyPreset(preset.topicIds)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetChipIcon}>{preset.icon}</Text>
                  <Text style={[styles.presetChipText, isActive && styles.presetChipTextActive]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.presetChip}
              onPress={handleSelectAll}
              activeOpacity={0.8}
            >
              <Text style={styles.presetChipIcon}>🔄</Text>
              <Text style={styles.presetChipText}>Все темы</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Секции по четвертям */}
        {quarters.map((group, gIdx) => (
          <View key={gIdx} style={styles.quarterGroup}>
            <View style={styles.quarterHeader}>
              <Text style={styles.quarterIcon}>{group.icon}</Text>
              <View style={styles.quarterTitleCol}>
                <Text style={styles.quarterTitle}>{group.title}</Text>
                <Text style={styles.quarterSub}>{group.subtitle}</Text>
              </View>
            </View>

            {group.items.map(item => {
              const isChecked = selectedTopics.includes(item.id);
              return (
                <View
                  key={item.id}
                  style={[styles.topicCard, isChecked && styles.topicCardChecked]}
                >
                  <TouchableOpacity
                    style={styles.topicMainClickArea}
                    onPress={() => toggleTopic(item.id)}
                    activeOpacity={0.7}
                  >
                    {/* Номер и иконка */}
                    <View style={styles.numberBadge}>
                      <Text style={styles.numberBadgeText}>{item.order}</Text>
                    </View>
                    <Text style={styles.topicEmoji}>{item.icon}</Text>

                    {/* Тексты темы */}
                    <View style={styles.topicInfoCol}>
                      <View style={styles.topicTitleRow}>
                        <Text style={styles.topicTitle}>{item.title}</Text>
                      </View>
                      <Text style={styles.topicPages}>
                        {item.bookChapter} • <Text style={{ color: '#4F46E5' }}>{item.pages}</Text>
                      </Text>
                      <Text style={styles.topicDesc}>{item.shortDescription}</Text>
                    </View>

                    {/* Чекбокс */}
                    <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                      {isChecked && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>

                  {/* Кнопка быстрого среза: Пройдено до этой темы */}
                  <View style={styles.quickBar}>
                    <TouchableOpacity
                      style={styles.quickUpToBtn}
                      onPress={() => handleSelectUpTo(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quickUpToText}>
                        📌 Прошли в школе до этой темы включительно
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Нижняя плавающая панель сохранения */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveButtonIcon}>💾</Text>
          <Text style={styles.saveButtonText}>
            {isSavedToast ? 'Сохранено! ✓' : `Применить (${selectedTopics.length} тем)`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
  },
  container: {
    padding: 16,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  infoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 28,
  },
  infoTextCol: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#312E81',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    color: '#3730A3',
    lineHeight: 18,
  },
  presetsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4338CA',
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  presetButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 6,
  },
  presetChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
  },
  presetChipIcon: {
    fontSize: 14,
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3730A3',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
  },
  quarterGroup: {
    marginBottom: 24,
  },
  quarterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  quarterIcon: {
    fontSize: 22,
  },
  quarterTitleCol: {
    flex: 1,
  },
  quarterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  quarterSub: {
    fontSize: 12,
    color: '#64748B',
  },
  topicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  topicCardChecked: {
    borderColor: '#818CF8',
    backgroundColor: '#F8FAFF',
  },
  topicMainClickArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  topicEmoji: {
    fontSize: 24,
  },
  topicInfoCol: {
    flex: 1,
  },
  topicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  topicPages: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  topicDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quickBar: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  quickUpToBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  quickUpToText: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    maxWidth: 420,
    gap: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonIcon: {
    fontSize: 18,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
