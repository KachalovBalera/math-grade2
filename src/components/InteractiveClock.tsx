import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface InteractiveClockProps {
  hours: number;
  minutes: number;
  interactive?: boolean;
  onChangeTime?: (hours: number, minutes: number) => void;
}

export const InteractiveClock: React.FC<InteractiveClockProps> = ({
  hours,
  minutes,
  interactive = false,
  onChangeTime,
}) => {
  // Вычисляем углы стрелок
  // Минутная стрелка: 360 / 60 = 6 градусов на минуту
  const minuteAngle = (minutes % 60) * 6;
  // Часовая стрелка: 360 / 12 = 30 градусов на час + 0.5 градуса на минуту
  const hourAngle = ((hours % 12) + minutes / 60) * 30;

  const clockNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const adjustHours = (delta: number) => {
    if (!onChangeTime) return;
    let newH = (hours + delta) % 12;
    if (newH <= 0) newH += 12;
    onChangeTime(newH, minutes);
  };

  const adjustMinutes = (delta: number) => {
    if (!onChangeTime) return;
    let newM = (minutes + delta) % 60;
    if (newM < 0) newM += 60;
    onChangeTime(hours, newM);
  };

  return (
    <View style={styles.container}>
      {/* Циферблат часов */}
      <View style={styles.clockFace}>
        {/* Числа по кругу */}
        {clockNumbers.map((num, idx) => {
          const angle = (idx * 30 * Math.PI) / 180;
          const radius = 64;
          const x = radius * Math.sin(angle);
          const y = -radius * Math.cos(angle);
          return (
            <View
              key={num}
              style={[
                styles.numberWrap,
                {
                  transform: [{ translateX: x }, { translateY: y }],
                },
              ]}
            >
              <Text style={styles.clockNumberText}>{num}</Text>
            </View>
          );
        })}

        {/* Часовая стрелка (короткая, толстая) */}
        <View
          style={[
            styles.handHour,
            {
              transform: [
                { rotate: `${hourAngle}deg` },
                { translateY: -18 },
              ],
            },
          ]}
        />

        {/* Минутная стрелка (длинная, синяя) */}
        <View
          style={[
            styles.handMinute,
            {
              transform: [
                { rotate: `${minuteAngle}deg` },
                { translateY: -28 },
              ],
            },
          ]}
        />

        {/* Центр циферблата */}
        <View style={styles.clockCenter} />
      </View>

      {/* Обозначение времени */}
      <View style={styles.digitalBadge}>
        <Text style={styles.digitalText}>
          {hours}:{minutes < 10 ? `0${minutes}` : minutes}
        </Text>
      </View>

      {/* Интерактивное управление стрелками, если включен интерактивный режим */}
      {interactive && (
        <View style={styles.controlsRow}>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Часы (короткая):</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => adjustHours(-1)}
              >
                <Text style={styles.btnText}>−1 ч</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => adjustHours(1)}
              >
                <Text style={styles.btnText}>+1 ч</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Минуты (длинная):</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => adjustMinutes(-15)}
              >
                <Text style={styles.btnText}>−15 м</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => adjustMinutes(15)}
              >
                <Text style={styles.btnText}>+15 м</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  clockFace: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FFFFFF',
    borderWidth: 6,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  numberWrap: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockNumberText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  handHour: {
    position: 'absolute',
    width: 6,
    height: 38,
    backgroundColor: '#DC2626',
    borderRadius: 3,
    top: 48,
  },
  handMinute: {
    position: 'absolute',
    width: 4,
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 2,
    top: 30,
  },
  clockCenter: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    zIndex: 5,
  },
  digitalBadge: {
    marginTop: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  digitalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3730A3',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  controlGroup: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  controlBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
});
