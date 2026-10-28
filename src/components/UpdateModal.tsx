import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AppUpdateInfo } from '../types/update';
import {
  downloadApk,
  installApk,
  isApkDownloaded,
  deleteCachedApk,
  openApkInBrowser,
} from '../utils/updateService';
import { CURRENT_APP_VERSION } from '../constants/updateConfig';

interface UpdateModalProps {
  visible: boolean;
  updateInfo: AppUpdateInfo | null;
  onClose: () => void;
}

type UpdateStatus = 'idle' | 'downloading' | 'ready' | 'installing' | 'error';

export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  updateInfo,
  onClose,
}) => {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cachedFileUri, setCachedFileUri] = useState<string | null>(null);

  // Проверяем, есть ли уже скачанный APK в кэше
  useEffect(() => {
    if (visible) {
      isApkDownloaded().then(result => {
        if (result.exists) {
          setCachedFileUri(result.uri);
        } else {
          setCachedFileUri(null);
        }
      });
    }
  }, [visible]);

  if (!updateInfo) return null;

  const isForce = !!updateInfo.forceUpdate;
  const currentVersion = CURRENT_APP_VERSION;
  const targetVersion = updateInfo.version;

  // Скачивание файла обновления
  const handleStartDownload = async () => {
    setStatus('downloading');
    setProgress(0);
    setErrorMessage('');

    try {
      const localUri = await downloadApk(updateInfo.apkUrl, progressFraction => {
        setProgress(progressFraction);
      });
      setCachedFileUri(localUri);
      setProgress(1.0);
      setStatus('ready');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err?.message || 'Не удалось скачать обновление. Проверьте интернет-соединение.'
      );
    }
  };

  // Запуск установки APK
  const handleInstall = async () => {
    let uriToInstall = cachedFileUri;

    // Если файл ещё не скачан, сначала скачиваем
    if (!uriToInstall) {
      await handleStartDownload();
      return;
    }

    setStatus('installing');
    setErrorMessage('');

    try {
      await installApk(uriToInstall);
      // Установщик запущен. Оставляем пользователя в режиме 'installing' с возможностью повторить
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err?.message ||
          'Не удалось запустить системный установщик Android. Воспользуйтесь скачиванием через браузер.'
      );
    }
  };

  // Удаление старого кэша и скачивание заново
  const handleRedownload = async () => {
    await deleteCachedApk();
    setCachedFileUri(null);
    await handleStartDownload();
  };

  // Открытие ссылки в браузере (надежный обход любых ограничений безопасности Android)
  const handleOpenInBrowser = async () => {
    try {
      await openApkInBrowser(updateInfo.apkUrl);
      if (!isForce) {
        onClose();
      }
    } catch {
      setErrorMessage('Не удалось открыть браузер устройства.');
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
          {/* Шапка модального окна */}
          <View style={styles.header}>
            <Text style={styles.iconBadge}>
              {status === 'error'
                ? '⚠️'
                : status === 'ready'
                ? '🎉'
                : status === 'installing'
                ? '⚙️'
                : status === 'downloading'
                ? '📦'
                : '🚀'}
            </Text>
            <Text style={styles.title}>
              {status === 'error'
                ? 'Сбой при обновлении'
                : status === 'ready'
                ? 'Обновление загружено!'
                : status === 'installing'
                ? 'Запуск установщика...'
                : status === 'downloading'
                ? 'Загрузка обновления'
                : 'Доступно обновление!'}
            </Text>
            <Text style={styles.versionTag}>
              Версия {targetVersion} • (у вас {currentVersion})
            </Text>
          </View>

          {/* Режим ожидания действия пользователя (idle) */}
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
                {cachedFileUri ? (
                  <>
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      activeOpacity={0.8}
                      onPress={handleInstall}
                    >
                      <Text style={styles.primaryBtnText}>🚀 Установить сейчас</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.outlineBtn}
                      activeOpacity={0.8}
                      onPress={handleRedownload}
                    >
                      <Text style={styles.outlineBtnText}>🔄 Скачать заново</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    activeOpacity={0.8}
                    onPress={handleStartDownload}
                  >
                    <Text style={styles.primaryBtnText}>📥 Скачать и обновить</Text>
                  </TouchableOpacity>
                )}

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
                    <Text style={styles.secondaryBtnText}>Напомнить позже</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* Режим скачивания (downloading) */}
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
                Загружаем файл приложения. Пожалуйста, не закрывайте экран...
              </Text>

              <TouchableOpacity
                style={[styles.browserBtn, { marginTop: 16 }]}
                activeOpacity={0.8}
                onPress={handleOpenInBrowser}
              >
                <Text style={styles.browserBtnText}>🌐 Скачать через браузер вместо этого</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Режим готовности к установке (ready) */}
          {status === 'ready' && (
            <View style={styles.readySection}>
              <Text style={styles.readyDescription}>
                Файл обновления успешно загружен на устройство! Нажмите кнопку ниже для запуска
                установки.
              </Text>

              <View style={styles.tipBox}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>
                  Если Android запросит: «В целях безопасности ваш телефон блокирует установку
                  неизвестных приложений», нажмите «Настройки» и включите тумблер разрешения для
                  Считайки.
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  activeOpacity={0.8}
                  onPress={handleInstall}
                >
                  <Text style={styles.primaryBtnText}>🚀 Установить обновление</Text>
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
                    <Text style={styles.secondaryBtnText}>Отложить</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Режим запуска системного установщика (installing) */}
          {status === 'installing' && (
            <View style={styles.installingSection}>
              <ActivityIndicator size="large" color="#4F46E5" style={{ marginBottom: 14 }} />
              <Text style={styles.installingTitle}>Открывается установщик Android</Text>
              <Text style={styles.installingText}>
                Подтвердите обновление во всплывающем системном окне Android.
              </Text>

              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  Если окно не появилось автоматически или случайно закрылось:
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  activeOpacity={0.8}
                  onPress={handleInstall}
                >
                  <Text style={styles.primaryBtnText}>🚀 Повторить вызов установки</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.browserBtn}
                  activeOpacity={0.8}
                  onPress={handleOpenInBrowser}
                >
                  <Text style={styles.browserBtnText}>🌐 Открыть APK через браузер</Text>
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

          {/* Режим ошибки (error) */}
          {status === 'error' && (
            <View style={styles.errorSection}>
              <Text style={styles.errorText}>{errorMessage}</Text>

              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  Вы всегда можете скачать и установить обновление напрямую через мобильный браузер:
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  activeOpacity={0.8}
                  onPress={cachedFileUri ? handleInstall : handleStartDownload}
                >
                  <Text style={styles.primaryBtnText}>
                    {cachedFileUri ? 'Повторить установку' : 'Попробовать снова'}
                  </Text>
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
    maxWidth: 440,
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
    color: '#64748B',
  },
  notesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesScroll: {
    maxHeight: 140,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
  },
  progressSection: {
    paddingVertical: 12,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 6,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressPercentText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4F46E5',
  },
  progressHint: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  readySection: {
    paddingVertical: 6,
  },
  readyDescription: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 14,
  },
  tipBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
    fontWeight: '500',
  },
  installingSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  installingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  installingText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  errorSection: {
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 14,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
  },
  actions: {
    gap: 10,
    marginTop: 6,
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  outlineBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  browserBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  browserBtnText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
});
