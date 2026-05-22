const RAIN_WINDOW_MINUTES = 5;
const RAIN_PROBABILITY_PERCENT = 30;

export function isCurrentlyRaining(): boolean {
  const now = Date.now();
  const windowIndex = Math.floor(now / (RAIN_WINDOW_MINUTES * 60 * 1000));
  return simpleHash(windowIndex) % 100 < RAIN_PROBABILITY_PERCENT;
}

function simpleHash(n: number): number {
  let h = Math.imul(n, 2654435761);
  h = Math.imul((h >>> 16) ^ h, 0x45d9f3b);
  h = Math.imul((h >>> 16) ^ h, 0x45d9f3b);
  h = (h >>> 16) ^ h;
  return Math.abs(h);
}
