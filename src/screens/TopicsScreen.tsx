import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { TopicId, UserStats } from '../types/math';
import { TOPICS, TopicInfo } from '../data/topics';
import { Header } from '../components/Header';
import { StorageService, DEFAULT_USER_STATS } from '../services/storage';

interface TopicsScreenProps {
  onBack: () => void;
  onSelectTopic: (topicId: TopicId) => void;
}

export const TopicsScreen: React.FC<TopicsScreenProps> = ({ onBack, onSelectTopic }) => {
  const [stats, setStats] = useState<UserStats>(DEFAULT_USER_STATS);

  useEffect(() => {
    StorageService.loadStats().then(setStats);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Выбор темы обучения" onBack={onBack} stars={stats.totalStars} streak={stats.streakDays} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>
          Программа 2-го класса: выбери тему для тренировки
        </Text>

        <View style={styles.list}>
          {TOPICS.map(topic => {
            const tp = stats.topicProgress[topic.id];
            const currentLevel = tp?.level || 1;
            const solvedCount = tp?.solvedCount || 0;
            const stars = tp?.stars || 0;

            return (
              <TouchableOpacity
                key={topic.id}
                style={[styles.topicCard, { borderLeftColor: topic.color }]}
                onPress={() => onSelectTopic(topic.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: topic.lightColor }]}>
                  <Text style={styles.icon}>{topic.icon}</Text>
                </View>

                <View style={styles.content}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{topic.title}</Text>
                  </View>
                  <Text style={styles.description}>{topic.description}</Text>

                  <View style={styles.footerRow}>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelText}>
                        Уровень {currentLevel}
                      </Text>
                    </View>
                    <View style={styles.statsBadge}>
                      <Text style={styles.statsText}>
                        ⭐ {stars} • решено {solvedCount}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.arrow}>➔</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderLeftWidth: 6,
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 26,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  statsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statsText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#92400E',
  },
  arrow: {
    fontSize: 18,
    color: '#94A3B8',
    marginLeft: 8,
  },
});
