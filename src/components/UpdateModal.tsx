import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { AppUpdateInfo } from '../types/update';
import { downloadAndInstallApk } from '../utils/updateService';
import { CURRENT_APP_VERSION } from '../constants/updateConfig';

interface UpdateModalProps {
  visible: boolean;
  updateInfo: AppUpdateInfo | null;
  onClose: () => void;
}

type UpdateStatus = 'idle' | 'downloading' | 'installing' | 'error';

export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  updateInfo,
  onClose,
}) => {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!updateInfo) return null;

  const isForce = !!updateInfo.forceUpdate;
  const currentVersion = CURRENT_APP_VERSION;
  const targetVersion = updateInfo.version;

  const handleStartUpdate = async () => {
    setStatus('downloading');
    setProgress(0);
    setErrorMessage('');

    try {
      await downloadAndInstallApk(updateInfo.apkUrl, progressFraction => {
        setProgress(progressFraction);
        if (progressFraction >= 1) {
          setStatus('installing');
        }
      });
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'Не удалось загрузить или запустить установку.');
    }
  };

  const handleOpenInBrowser = async () => {
    try {
      await Linking.openURL(updateInfo.apkUrl);
      onClose();
    } catch {
      setErrorMessage('Не удалось открыть ссылку в браузере.');
    }
  };

  const handleClose = () => {
    if (status === 'downloading') return;
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isForce ? () => {} : handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Шапка */}
          <View style={styles.header}>
            <Text style={styles.iconBadge}>
              {status === 'error'
                ? '⚠️'
                : status === 'downloading' || status === 'installing'
                ? '📦'
                : '🚀'}
            </Text>
            <Text style={styles.title}>
              {status === 'error'
                ? 'Сбой обновления'
                : status === 'installing'
                ? 'Запуск установки...'
                : status === 'downloading'
                ? 'Загрузка обновления'
                : 'Доступно обновление!'}
            </Text>
            <Text style={styles.versionTag}>
              Версия {targetVersion} • (у вас {currentVersion})
            </Text>
          </View>

          {/* Режим ожидания действия пользователя */}
          {status === 'idle' && (
            <>
              {updateInfo.releaseNotes ? (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesHeading}>Что нового:</Text>
                  <ScrollView style={styles.notesScroll} nestedScrollEnabled>
                    <Text style={styles.notesText}>{updateInfo.releaseNotes}</Text>
                  </ScrollView>
                </View>
              ) : null}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  activeOpacity={0.8}
                  onPress={handleStartUpdate}
                >
                  <Text style={styles.primaryBtnText}>Обновить сейчас ➔</Text>
                </TouchableOpacity>

                {!isForce && (
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    activeOpacity={0.7}
                    onPress={handleClose}
                  >
                    <Text style={styles.secondaryBtnText}>Напомнить позже</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Режим скачивания */}
          {status === 'downloading' && (
            <View style={styles.progressSection}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.round(progress * 100)}%` },
                  ]}
                />
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressPercentText}>
                  {Math.round(progress * 100)}%
                </Text>
                <ActivityIndicator size="small" color="#4F46E5" />
              </View>

              <Text style={styles.progressHint}>
                Скачиваем установочный файл APK. Пожалуйста, не закрывайте экран...
              </Text>
            </View>
          )}

          {/* Режим запуска системного инсталлятора */}
          {status === 'installing' && (
            <View style={styles.installingSection}>
              <ActivityIndicator size="large" color="#4F46E5" style={{ marginBottom: 12 }} />
              <Text style={styles.installingText}>
                Сейчас откроется системное окно Android для подтверждения установки. Нажмите
                «Установить».
              </Text>
            </View>
          )}

          {/* Ошибка */}
          {status === 'error' && (
            <View style={styles.errorSection}>
              <Text style={styles.errorText}>{errorMessage}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  activeOpacity={0.8}
                  onPress={handleStartUpdate}
                >
                  <Text style={styles.primaryBtnText}>Повторить попытку</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.browserBtn}
                  activeOpacity={0.8}
                  onPress={handleOpenInBrowser}
                >
                  <Text style={styles.browserBtnText}>🌐 Скачать через браузер</Text>
                </TouchableOpacity>

                {!isForce && (
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    activeOpacity={0.7}
                    onPress={handleClose}
                  >
                    <Text style={styles.secondaryBtnText}>Закрыть</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    fontSize: 44,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  versionTag: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  notesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  notesScroll: {
    maxHeight: 140,
  },
  notesText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  actions: {
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  browserBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  browserBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  progressSection: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 7,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressPercentText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  progressHint: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  installingSection: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  installingText: {
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorSection: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
});
