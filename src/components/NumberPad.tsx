import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

interface NumberPadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  onClear?: () => void;
  currentValue?: string;
  submitDisabled?: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  onDigit,
  onBackspace,
  onSubmit,
  onClear,
  currentValue,
  submitDisabled,
}) => {
  const digits = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '⌫'],
  ];

  const handlePress = (key: string) => {
    if (key === '⌫') {
      onBackspace();
    } else if (key === 'C') {
      if (onClear) onClear();
      else onBackspace();
    } else {
      onDigit(key);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {digits.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map(key => {
              const isSpecial = key === '⌫' || key === 'C';
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.button, isSpecial && styles.specialButton]}
                  onPress={() => handlePress(key)}
                  activeOpacity={0.6}
                  accessibilityLabel={`Кнопка ${key}`}
                >
                  <Text style={[styles.buttonText, isSpecial && styles.specialButtonText]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, submitDisabled && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={submitDisabled}
        activeOpacity={0.7}
      >
        <Text style={styles.submitIcon}>✓</Text>
        <Text style={styles.submitText}>Проверить ответ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
  },
  specialButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderBottomColor: '#94A3B8',
  },
  buttonText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  specialButtonText: {
    fontSize: 22,
    color: '#64748B',
  },
  submitButton: {
    marginTop: 12,
    height: 58,
    backgroundColor: '#22C55E',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#16A34A',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E1',
    borderBottomColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
  },
  submitText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
