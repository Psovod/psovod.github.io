/**
 * Volume → metric conversions.
 * ml is exact. grams uses water density (≈1 g/ml) as a rough estimate.
 */

const ML_PER_UNIT: Record<string, number> = {
  tsp: 5,
  tbsp: 15,
  cup: 240,
};

export interface VolumeConversion {
  ml: number;
  grams: number;
}

export function convertToMetric(qty: number, unit: string | undefined | null): VolumeConversion | null {
  if (!unit) return null;
  const ml = ML_PER_UNIT[unit];
  if (ml == null) return null;
  const total = qty * ml;
  return { ml: round1(total), grams: round1(total) };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Format like "≈ 1.3 ml / ~1 g". */
export function formatConversion(c: VolumeConversion): string {
  return `≈ ${c.ml} ml / ~${c.grams} g`;
}
