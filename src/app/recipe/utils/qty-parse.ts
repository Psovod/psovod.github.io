import { CountableUnit, COUNTABLE_UNITS, isCountableUnit } from '../models/recipe.types';

const VULGAR_FRACTIONS: Record<string, number> = {
  '½': 0.5,
  '¼': 0.25,
  '¾': 0.75,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
};

const UNIT_SYNONYMS: Record<string, CountableUnit> = {
  g: 'g',
  gram: 'g',
  grams: 'g',
  kg: 'kg',
  kilogram: 'kg',
  kilograms: 'kg',
  mg: 'mg',
  ml: 'ml',
  l: 'l',
  liter: 'l',
  liters: 'l',
  litre: 'l',
  litres: 'l',
  dl: 'dl',
  tsp: 'tsp',
  teaspoon: 'tsp',
  teaspoons: 'tsp',
  tbsp: 'tbsp',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp',
  pc: 'pcs',
  pcs: 'pcs',
  piece: 'pcs',
  pieces: 'pcs',
  ks: 'pcs',
  cup: 'cup',
  cups: 'cup',
};

export interface ParsedQty {
  qty?: number;
  unit?: CountableUnit | string;
  raw?: string;
}

/** Parse an amount string, returning normalised qty+unit when countable,
 *  else just { raw }. */
export function parseQty(input: string): ParsedQty {
  if (!input) return { raw: '' };

  const original = input;
  let s = input.trim();
  s = s.replace(/^~\s*/, '').replace(/^approx\.?\s*/i, '');

  const multMatch = s.match(/^×\s*(\d+(?:[.,]\d+)?)$/);
  if (multMatch) {
    return { qty: parseFloat(multMatch[1].replace(',', '.')), unit: 'pcs' };
  }

  let qty: number | undefined;
  let rest = s;

  const mixed = s.match(/^(\d+)\s*([½¼¾⅓⅔⅛⅜⅝⅞])\s*(.*)$/u);
  if (mixed) {
    qty = parseInt(mixed[1], 10) + VULGAR_FRACTIONS[mixed[2]];
    rest = mixed[3];
  } else {
    const vulgar = s.match(/^([½¼¾⅓⅔⅛⅜⅝⅞])\s*(.*)$/u);
    if (vulgar) {
      qty = VULGAR_FRACTIONS[vulgar[1]];
      rest = vulgar[2];
    } else {
      const num = s.match(/^(\d[\d\s ]*(?:[.,]\d+)?)\s*(.*)$/);
      if (num) {
        const digits = num[1].replace(/[\s ]/g, '').replace(',', '.');
        qty = parseFloat(digits);
        rest = num[2];
      }
    }
  }

  if (qty == null || Number.isNaN(qty)) {
    return { raw: original };
  }

  const token = rest.trim().toLowerCase();
  if (!token) {
    return { qty, raw: original };
  }

  const mapped = UNIT_SYNONYMS[token] ?? UNIT_SYNONYMS[token.replace(/\.$/, '')];
  if (mapped) {
    return { qty, unit: mapped };
  }

  return { qty, unit: token, raw: original };
}

export function formatQty(qty: number, unit: CountableUnit | string): string {
  const rounded = Math.round(qty * 100) / 100;
  return `${rounded} ${unit}`;
}

export { isCountableUnit, COUNTABLE_UNITS };
