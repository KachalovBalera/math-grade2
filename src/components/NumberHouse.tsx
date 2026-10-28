import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NumberHouseProps {
  roofNumber: number;
  leftNumber: number | string;
  rightNumber: number | string;
  missingSide: 'left' | 'right';
  currentInput?: string;
  isActive?: boolean;
}

export const NumberHouse: React.FC<NumberHouseProps> = ({
  roofNumber,
  leftNumber,
  rightNumber,
  missingSide,
  currentInput,
  isActive = true,
}) => {
  return (
    <View style={styles.container}>
      {/* Крыша домика */}
      <View style={styles.roofContainer}>
        <View style={styles.roofTriangle} />
        <View style={styles.roofBadge}>
          <Text style={styles.roofText}>{roofNumber}</Text>
        </View>
      </View>

      {/* Этаж с двумя окошками */}
      <View style={styles.floor}>
        {/* Левое окошко */}
        <View
          style={[
            styles.window,
            missingSide === 'left' && styles.missingWindow,
            missingSide === 'left' && isActive && styles.activeWindow,
          ]}
        >
          <Text
            style={[
              styles.windowText,
              missingSide === 'left' && styles.missingWindowText,
            ]}
          >
            {missingSide === 'left'
              ? currentInput || '?'
              : leftNumber}
          </Text>
        </View>

        <Text style={styles.plusSign}>+</Text>

        {/* Правое окошко */}
        <View
          style={[
            styles.window,
            missingSide === 'right' && styles.missingWindow,
            missingSide === 'right' && isActive && styles.activeWindow,
          ]}
        >
          <Text
            style={[
              styles.windowText,
              missingSide === 'right' && styles.missingWindowText,
            ]}
          >
            {missingSide === 'right'
              ? currentInput || '?'
              : rightNumber}
          </Text>
        </View>
      </View>

      <Text style={styles.caption}>
        {roofNumber} = {missingSide === 'left' ? (currentInput || '□') : leftNumber} +{' '}
        {missingSide === 'right' ? (currentInput || '□') : rightNumber}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  roofContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: -4,
    zIndex: 2,
  },
  roofTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 80,
    borderRightWidth: 80,
    borderBottomWidth: 50,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#EF4444',
  },
  roofBadge: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  roofText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  floor: {
    width: 170,
    backgroundColor: '#FEF2F2',
    borderWidth: 3,
    borderColor: '#DC2626',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  window: {
    width: 52,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missingWindow: {
    borderColor: '#F97316',
    borderStyle: 'dashed',
    backgroundColor: '#FFF7ED',
  },
  activeWindow: {
    borderColor: '#4F46E5',
    borderWidth: 3,
    borderStyle: 'solid',
    backgroundColor: '#EEF2FF',
  },
  windowText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  missingWindowText: {
    color: '#4F46E5',
  },
  plusSign: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  caption: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
});
