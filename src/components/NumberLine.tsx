import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NumberLineProps {
  start: number;
  step1: number;
  roundTen: number;
  step2: number;
  finalVal: number;
  isAddition: boolean;
}

export const NumberLine: React.FC<NumberLineProps> = ({
  start,
  step1,
  roundTen,
  step2,
  finalVal,
  isAddition,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Числовая прямая и шаги вычисления:</Text>

      {/* Верхние дуги прыжков */}
      <View style={styles.jumpsRow}>
        <View style={styles.jumpBadge}>
          <Text style={styles.jumpText}>
            {isAddition ? `+${step1}` : `−${step1}`} до {roundTen}
          </Text>
          <Text style={styles.jumpArrow}>⮧</Text>
        </View>

        <View style={styles.jumpBadge}>
          <Text style={styles.jumpText}>
            {isAddition ? `+${step2}` : `−${step2}`} остаток
          </Text>
          <Text style={styles.jumpArrow}>⮧</Text>
        </View>
      </View>

      {/* Линейка с ключевыми точками */}
      <View style={styles.lineTrack}>
        <View style={styles.lineHorizontal} />

        <View style={styles.pointsRow}>
          {/* Точка 1: старт */}
          <View style={styles.pointWrapper}>
            <View style={[styles.dot, styles.startDot]} />
            <Text style={styles.pointLabel}>{start}</Text>
          </View>

          {/* Точка 2: круглый десяток */}
          <View style={styles.pointWrapper}>
            <View style={[styles.dot, styles.roundTenDot]} />
            <Text style={[styles.pointLabel, styles.roundTenLabel]}>{roundTen}</Text>
          </View>

          {/* Точка 3: итог */}
          <View style={styles.pointWrapper}>
            <View style={[styles.dot, styles.finalDot]} />
            <Text style={[styles.pointLabel, styles.finalLabel]}>{finalVal}</Text>
          </View>
        </View>
      </View>

      {/* Схема разложения числа */}
      <View style={styles.decompositionContainer}>
        <Text style={styles.decompositionTitle}>
          Разложили второе число ({step1 + step2}):
        </Text>
        <View style={styles.treeRoot}>
          <View style={styles.treeNumber}>
            <Text style={styles.treeMainVal}>{step1 + step2}</Text>
          </View>
          <View style={styles.branchesRow}>
            <Text style={styles.branchLine}>↙    ↘</Text>
          </View>
          <View style={styles.partsRow}>
            <View style={styles.partBadge}>
              <Text style={styles.partVal}>{step1}</Text>
              <Text style={styles.partDesc}>до {roundTen}</Text>
            </View>
            <View style={styles.partBadge}>
              <Text style={styles.partVal}>{step2}</Text>
              <Text style={styles.partDesc}>остаток</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 8,
  },
  jumpsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  jumpBadge: {
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  jumpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  jumpArrow: {
    fontSize: 14,
    color: '#4F46E5',
  },
  lineTrack: {
    position: 'relative',
    height: 44,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  lineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#94A3B8',
    borderRadius: 2,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointWrapper: {
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 2,
  },
  startDot: {
    backgroundColor: '#64748B',
  },
  roundTenDot: {
    backgroundColor: '#F59E0B',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  finalDot: {
    backgroundColor: '#10B981',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  pointLabel: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  roundTenLabel: {
    color: '#D97706',
    fontSize: 16,
  },
  finalLabel: {
    color: '#059669',
    fontSize: 16,
  },
  decompositionContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  decompositionTitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  treeRoot: {
    alignItems: 'center',
  },
  treeNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  treeMainVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6D28D9',
  },
  branchesRow: {
    height: 16,
    justifyContent: 'center',
  },
  branchLine: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  partsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  partBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  partVal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  partDesc: {
    fontSize: 10,
    color: '#6B7280',
  },
});
