/**
 * Сравнивает две семантические версии (например, '1.0.1' и '1.0.0').
 * Возвращает:
 *   1  если remote > current (есть обновление)
 *  -1  если remote < current
 *   0  если версии равны
 */
export function compareVersions(remote: string, current: string): number {
  const clean = (v: string) =>
    v
      .trim()
      .replace(/^v/i, '')
      .split('-')[0]
      .split('.')
      .map(part => parseInt(part, 10) || 0);

  const rParts = clean(remote);
  const cParts = clean(current);
  const maxLength = Math.max(rParts.length, cParts.length);

  for (let i = 0; i < maxLength; i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return 1;
    if (r < c) return -1;
  }

  return 0;
}
