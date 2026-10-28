const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withApkInstaller(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Ensure uses-permission array
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }
    const hasPermission = androidManifest['uses-permission'].some(
      (p) => p.$?.['android:name'] === 'android.permission.REQUEST_INSTALL_PACKAGES'
    );
    if (!hasPermission) {
      androidManifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.REQUEST_INSTALL_PACKAGES' },
      });
    }

    // Ensure queries array
    if (!androidManifest.queries) {
      androidManifest.queries = [];
    }
    const queries = androidManifest.queries;
    const hasApkQuery = queries.some((q) =>
      q.intent?.some((i) =>
        i.data?.some(
          (d) => d.$?.['android:mimeType'] === 'application/vnd.android.package-archive'
        )
      )
    );
    if (!hasApkQuery) {
      queries.push({
        intent: [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            data: [
              {
                $: {
                  'android:mimeType': 'application/vnd.android.package-archive',
                },
              },
            ],
          },
        ],
      });
    }

    return config;
  });
};
