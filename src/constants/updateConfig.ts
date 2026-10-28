import Constants from 'expo-constants';

/**
 * Текущая версия приложения.
 * Считывается из app.json (expo.version) или используется резервное значение.
 */
export const CURRENT_APP_VERSION: string =
  Constants.expoConfig?.version || '1.0.0';

/**
 * Ссылка на JSON-файл проверки обновлений на удалённом сервере или GitHub.
 *
 * Если репозиторий находится на GitHub:
 * https://raw.githubusercontent.com/KachalovBalera/math-grade2/main/version.json
 */
export const UPDATE_MANIFEST_URL: string =
  'https://raw.githubusercontent.com/KachalovBalera/math-grade2/main/version.json';
