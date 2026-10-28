import { Platform, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { AppUpdateInfo, UpdateCheckResult } from '../types/update';
import { CURRENT_APP_VERSION, UPDATE_MANIFEST_URL } from '../constants/updateConfig';
import { compareVersions } from './versionUtils';

export { compareVersions };

/**
 * Проверяет наличие новой версии на удаленном сервере
 */
export async function checkForUpdates(
  manifestUrl: string = UPDATE_MANIFEST_URL
): Promise<UpdateCheckResult> {
  const currentVersion = CURRENT_APP_VERSION;

  try {
    const cacheBuster = manifestUrl.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
    const response = await fetch(`${manifestUrl}${cacheBuster}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    if (!response.ok) {
      throw new Error(`Сервер обновлений вернул статус ${response.status}`);
    }

    const data: AppUpdateInfo = await response.json();

    if (!data.version || !data.apkUrl) {
      throw new Error('Некорректный формат файла version.json');
    }

    const hasUpdate = compareVersions(data.version, currentVersion) > 0;

    return {
      hasUpdate,
      currentVersion,
      updateInfo: data,
    };
  } catch (error: any) {
    return {
      hasUpdate: false,
      currentVersion,
      updateInfo: null,
      error: error?.message || 'Не удалось связаться с сервером обновлений',
    };
  }
}

/**
 * Скачивает APK с отслеживанием прогресса и запускает нативный установщик Android
 */
export async function downloadAndInstallApk(
  apkUrl: string,
  onProgress: (progressFraction: number) => void
): Promise<void> {
  // На не-Android платформах (или в веб-браузере) просто открываем прямую ссылку
  if (Platform.OS !== 'android') {
    await Linking.openURL(apkUrl);
    return;
  }

  const targetFileName = 'Math_Grade2_Update.apk';
  const localTargetUri = `${FileSystem.cacheDirectory}${targetFileName}`;

  try {
    // Удаляем старый файл, если он остался
    const fileInfo = await FileSystem.getInfoAsync(localTargetUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localTargetUri, { idempotent: true });
    }

    // Запускаем скачивание с индикацией прогресса
    const downloadResumable = FileSystem.createDownloadResumable(
      apkUrl,
      localTargetUri,
      {},
      downloadProgress => {
        const total = downloadProgress.totalBytesExpectedToWrite;
        const written = downloadProgress.totalBytesWritten;
        if (total > 0) {
          const fraction = Math.min(Math.max(written / total, 0), 1);
          onProgress(fraction);
        } else {
          onProgress(0.5);
        }
      }
    );

    const downloadResult = await downloadResumable.downloadAsync();

    if (!downloadResult || !downloadResult.uri) {
      throw new Error('Файл обновления не был загружен.');
    }

    onProgress(1.0);

    // Получаем content:// URI для системного PackageInstaller Android
    const contentUri = await FileSystem.getContentUriAsync(downloadResult.uri);

    // Запускаем установку
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      type: 'application/vnd.android.package-archive',
    });
  } catch (err: any) {
    console.warn('Ошибка автоматической установки APK, открываем ссылку в браузере:', err);
    try {
      await Linking.openURL(apkUrl);
    } catch {
      throw new Error(
        `Не удалось запустить установщик: ${err?.message || 'ошибка доступа'}`
      );
    }
  }
}
