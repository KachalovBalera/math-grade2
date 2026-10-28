import { compareVersions } from '../src/utils/versionUtils';

console.log('🚀 ТЕСТИРОВАНИЕ СИСТЕМЫ ОБНОВЛЕНИЙ:');

function assertEqual(actual: any, expected: any, desc: string) {
  if (actual === expected) {
    console.log(`✅ ${desc}: OK`);
  } else {
    console.error(`❌ ${desc}: Ожидалось ${expected}, получено ${actual}`);
    process.exit(1);
  }
}

assertEqual(compareVersions('1.0.1', '1.0.0'), 1, '1.0.1 > 1.0.0 (есть обновление)');
assertEqual(compareVersions('1.0.0', '1.0.1'), -1, '1.0.0 < 1.0.1 (версия старее)');
assertEqual(compareVersions('1.0.0', '1.0.0'), 0, '1.0.0 == 1.0.0 (версии равны)');
assertEqual(compareVersions('2.0.0', '1.9.9'), 1, '2.0.0 > 1.9.9 (мажорное обновление)');
assertEqual(compareVersions('1.10.0', '1.9.0'), 1, '1.10.0 > 1.9.0 (двузначные номера)');
assertEqual(compareVersions('v1.0.2', '1.0.1'), 1, 'v1.0.2 > 1.0.1 (префикс v)');

console.log('\n🎉 ВСЕ ТЕСТЫ СИСТЕМЫ ОБНОВЛЕНИЙ УСПЕШНО ПРОЙДЕНЫ!');
