import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';

interface ParentGateModalProps {
  visible: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const ParentGateModal: React.FC<ParentGateModalProps> = ({
  visible,
  onSuccess,
  onClose,
}) => {
  const [factor1] = useState(7);
  const [factor2] = useState(8);
  const [answerInput, setAnswerInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const checkAnswer = () => {
    const parsed = parseInt(answerInput.trim(), 10);
    if (parsed === factor1 * factor2) {
      setErrorMsg('');
      setAnswerInput('');
      onSuccess();
    } else {
      setErrorMsg('Неверно. Попробуйте ещё раз.');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>🔒</Text>
          <Text style={styles.title}>Раздел для родителей</Text>
          <Text style={styles.description}>
            Чтобы открыть статистику занятий, решите проверочный пример:
          </Text>

          <View style={styles.mathBox}>
            <Text style={styles.mathText}>
              {factor1} × {factor2} = ?
            </Text>
          </View>

          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={answerInput}
            onChangeText={t => {
              setAnswerInput(t);
              setErrorMsg('');
            }}
            placeholder="Введите ответ"
            maxLength={3}
            autoFocus
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.submitBtn]}
              onPress={checkAnswer}
              activeOpacity={0.7}
            >
              <Text style={styles.submitText}>Войти</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  mathBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  mathText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#334155',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
  },
  submitText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
