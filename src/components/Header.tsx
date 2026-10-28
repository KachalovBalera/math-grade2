import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  stars?: number;
  streak?: number;
  rightAction?: {
    icon: string;
    onPress: () => void;
    label?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  stars,
  streak,
  rightAction,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Назад"
          >
            <Text style={styles.backIcon}>⬅️</Text>
            <Text style={styles.backText}>Назад</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.appIconBadge}>
            <Text style={styles.appIconText}>📐</Text>
          </View>
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        {stars !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>⭐</Text>
            <Text style={styles.badgeText}>{stars}</Text>
          </View>
        )}
        {streak !== undefined && streak > 0 && (
          <View style={[styles.badge, styles.streakBadge]}>
            <Text style={styles.badgeIcon}>🔥</Text>
            <Text style={styles.badgeText}>{streak}</Text>
          </View>
        )}
        {rightAction && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={rightAction.onPress}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>{rightAction.icon}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      },
    }),
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 90,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  backIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
  },
  appIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconText: {
    fontSize: 22,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 90,
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  streakBadge: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FED7AA',
  },
  badgeIcon: {
    fontSize: 14,
    marginRight: 3,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
  },
  actionBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  actionIcon: {
    fontSize: 18,
  },
});
