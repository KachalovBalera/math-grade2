export interface AppUpdateInfo {
  version: string;
  versionCode?: number;
  apkUrl: string;
  releaseNotes?: string;
  forceUpdate?: boolean;
  publishDate?: string;
}

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  updateInfo: AppUpdateInfo | null;
  error?: string;
}
