import { Platform, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { AppUpdateInfo, UpdateCheckResult } from '../types/update';
import { CURRENT_APP_VERSION, UPDATE_MANIFEST_URL } from '../constants/updateConfig';
import { compareVersions } from './versionUtils';

export { compareVersions };

const DEFAULT_APK_FILENAME = 'Schitayka_update.apk';

/**
 * Возвращает локальный путь к кэшированному APK-файлу обновления
 */
export function getLocalApkUri(fileName: string = DEFAULT_APK_FILENAME): string {
  return `${FileSystem.cacheDirectory}${fileName}`;
}

/**
 * Проверяет наличие уже скачанного файла APK
 */
export async function isApkDownloaded(
  fileName: string = DEFAULT_APK_FILENAME
): Promise<{ exists: boolean; uri: string; size?: number }> {
  try {
    const uri = getLocalApkUri(fileName);
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists && !info.isDirectory && info.size && info.size > 5 * 1024 * 1024) {
      return { exists: true, uri, size: info.size };
    }
    return { exists: false, uri };
  } catch {
    return { exists: false, uri: getLocalApkUri(fileName) };
  }
}

/**
 * Удаляет кэшированный файл APK
 */
export async function deleteCachedApk(fileName: string = DEFAULT_APK_FILENAME): Promise<void> {
  try {
    const uri = getLocalApkUri(fileName);
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (e) {
    console.warn('Не удалось удалить кэшированный APK:', e);
  }
}

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
 * Скачивает установочный APK файл во временный кэш приложения
 */
export async function downloadApk(
  apkUrl: string,
  onProgress: (progressFraction: number) => void,
  fileName: string = DEFAULT_APK_FILENAME
): Promise<string> {
  const localTargetUri = getLocalApkUri(fileName);

  // Очищаем предыдущий временный файл, если он был неполным
  await FileSystem.deleteAsync(localTargetUri, { idempotent: true });

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
  return downloadResult.uri;
}

/**
 * Запускает системный установщик Android (PackageInstaller) для локального APK файла
 */
export async function installApk(localFileUri: string): Promise<void> {
  if (Platform.OS !== 'android') {
    throw new Error('Установка APK поддерживается только на Android');
  }

  // Преобразуем локальный file:// URI в content:// URI через Expo FileProvider
  const contentUri = await FileSystem.getContentUriAsync(localFileUri);

  // Флаги: FLAG_GRANT_READ_URI_PERMISSION (1) | FLAG_ACTIVITY_NEW_TASK (268435456) = 268435457
  const flags = 1 | 268435456;

  try {
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      flags,
      type: 'application/vnd.android.package-archive',
    });
  } catch (err: any) {
    throw new Error(
      `Система Android отклонила запуск установщика (${err?.message || 'ошибка доступа'}). ` +
      `Пожалуйста, разрешите установку приложений в настройках или скачайте файл через браузер.`
    );
  }
}

/**
 * Открывает прямую ссылку на APK в мобильном браузере
 */
export async function openApkInBrowser(apkUrl: string): Promise<void> {
  const canOpen = await Linking.canOpenURL(apkUrl);
  if (!canOpen) {
    throw new Error('Не удалось открыть ссылку в браузере устройства.');
  }
  await Linking.openURL(apkUrl);
}

/**
 * Комплексный метод: скачивание и запуск установки (для обратной совместимости)
 */
export async function downloadAndInstallApk(
  apkUrl: string,
  onProgress: (progressFraction: number) => void
): Promise<void> {
  if (Platform.OS !== 'android') {
    await openApkInBrowser(apkUrl);
    return;
  }

  const localUri = await downloadApk(apkUrl, onProgress);
  await installApk(localUri);
}
