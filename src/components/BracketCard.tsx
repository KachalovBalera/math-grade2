import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

interface BracketCardProps {
  prefix?: string;          // e.g. "18 − "
  innerExpr: string;        // e.g. "16 − 7"
  suffix?: string;          // e.g. "" or " − 5"
  step1Value: string;       // Значение над скобками
  step2Value: string;       // Итоговое значение
  activeStep: 1 | 2;        // Текущий шаг ввода
  isStep1Correct: boolean;
  onFocusStep: (step: 1 | 2) => void;
}

export const BracketCard: React.FC<BracketCardProps> = ({
  prefix = '',
  innerExpr,
  suffix = '',
  step1Value,
  step2Value,
  activeStep,
  isStep1Correct,
  onFocusStep,
}) => {
  return (
    <View style={styles.cardContainer}>
      <Text style={styles.instruction}>
        {activeStep === 1
          ? 'Шаг 1: Вычисли выражение в скобках и запиши ответ НАД скобками:'
          : 'Шаг 2: Теперь реши получившийся пример и запиши итоговый ответ:'}
      </Text>

      {/* Верхний уровень: поле промежуточного ответа НАД скобками */}
      <View style={styles.topRow}>
        {/* Пустое пространство под префикс, чтобы поле ответа центрировалось ровно над скобками */}
        {prefix ? <Text style={styles.ghostText}>{prefix}</Text> : null}

        <View style={styles.bracketAnswerWrapper}>
          <TouchableOpacity
            style={[
              styles.step1Box,
              activeStep === 1 && styles.activeBox,
              isStep1Correct && styles.correctBox,
            ]}
            onPress={() => onFocusStep(1)}
            activeOpacity={0.8}
          >
            <Text style={[styles.step1Text, isStep1Correct && styles.correctText]}>
              {step1Value || (activeStep === 1 ? '?' : ' ')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.step1Label}>действие 1</Text>
          <Text style={styles.arrowDown}>↓</Text>
        </View>

        {suffix ? <Text style={styles.ghostText}>{suffix}</Text> : null}
        <Text style={styles.ghostText}> = ?</Text>
      </View>

      {/* Нижний уровень: основное выражение со скобками и итоговым полем */}
      <View style={styles.expressionRow}>
        {prefix ? <Text style={styles.mathText}>{prefix}</Text> : null}

        {/* Выражение в скобках */}
        <View
          style={[
            styles.bracketGroup,
            isStep1Correct && styles.bracketGroupSolved,
            activeStep === 1 && styles.bracketGroupActive,
          ]}
        >
          <Text style={styles.bracketSymbol}>(</Text>
          <Text style={[styles.mathText, isStep1Correct && styles.struckText]}>
            {innerExpr}
          </Text>
          <Text style={styles.bracketSymbol}>)</Text>
        </View>

        {suffix ? <Text style={styles.mathText}>{suffix}</Text> : null}

        <Text style={styles.mathText}> = </Text>

        {/* Поле окончательного ответа */}
        <TouchableOpacity
          style={[
            styles.step2Box,
            activeStep === 2 && styles.activeBox,
            !isStep1Correct && styles.disabledBox,
          ]}
          onPress={() => {
            if (isStep1Correct) onFocusStep(2);
          }}
          disabled={!isStep1Correct}
          activeOpacity={0.8}
        >
          <Text style={styles.step2Text}>
            {step2Value || (activeStep === 2 ? '?' : '🔒')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Преобразованный шаг (показывается после правильного шага 1) */}
      {isStep1Correct && (
        <View style={styles.transformedContainer}>
          <Text style={styles.transformedLabel}>Преобразованное выражение:</Text>
          <View style={styles.transformedBadge}>
            <Text style={styles.transformedExpr}>
              {prefix}
              <Text style={styles.highlightNumber}>{step1Value}</Text>
              {suffix} = {step2Value ? step2Value : '?'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  ghostText: {
    fontSize: 26,
    fontWeight: 'bold',
    opacity: 0,
  },
  bracketAnswerWrapper: {
    alignItems: 'center',
  },
  step1Box: {
    minWidth: 54,
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  activeBox: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
    borderWidth: 3,
  },
  correctBox: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  disabledBox: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.6,
  },
  step1Text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  correctText: {
    color: '#065F46',
  },
  step1Label: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  arrowDown: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: 'bold',
    lineHeight: 14,
  },
  expressionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  bracketGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  bracketGroupActive: {
    borderColor: '#818CF8',
    backgroundColor: '#F5F3FF',
  },
  bracketGroupSolved: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  bracketSymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  mathText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginHorizontal: 2,
  },
  struckText: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  step2Box: {
    minWidth: 58,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginLeft: 6,
  },
  step2Text: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  transformedContainer: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 14,
    width: '100%',
  },
  transformedLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  transformedBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  transformedExpr: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3730A3',
  },
  highlightNumber: {
    color: '#059669',
    textDecorationLine: 'underline',
  },
});
