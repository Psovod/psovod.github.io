export const COUNTABLE_UNITS = [
  'g',
  'kg',
  'mg',
  'ml',
  'l',
  'dl',
  'tsp',
  'tbsp',
  'pcs',
  'cup',
] as const;
export type CountableUnit = (typeof COUNTABLE_UNITS)[number];

export function isCountableUnit(u: string | undefined | null): u is CountableUnit {
  return !!u && (COUNTABLE_UNITS as readonly string[]).includes(u);
}

export interface Ingredient {
  /** DB id. May be undefined for drafts not yet persisted. */
  id?: number;
  name: string;
  qty?: number;
  unit?: CountableUnit | string;
  raw?: string;
}

export interface RecipeSection {
  id: string | null;
  i18nLabel?: string;
  items: Ingredient[];
}

export type StepPhase = 'prep' | 'cook';

export interface StepTimer {
  id?: number;
  label: string;
  minutes: number;
}

export interface RecipeStep {
  id?: number;
  phase: StepPhase;
  order: number;
  text: string;
  ingredientIds: number[];
  timers: StepTimer[];
}

export type RecipeColorKey = 'mustard' | 'terracotta' | 'burgundy' | 'sage' | 'slate' | 'plum';

export interface Recipe {
  id: string;
  label: string;
  color: RecipeColorKey;
  thumb?: string;
  emoji?: string;
  externalUrl?: string;
  baseServings: number;
  sections: RecipeSection[];
  steps: RecipeStep[];
}

export interface CookEntry {
  date: string;
  rating: number;
  note?: string;
}

export type IngredientKey = string;

export interface IngredientOverride {
  qty?: number;
  unit?: string;
  raw?: string;
}

export interface RecipeUserState {
  ratings: CookEntry[];
  ingredientOverrides?: Record<IngredientKey, IngredientOverride>;
  removedIngredientKeys?: IngredientKey[];
  servingMultiplier?: number;
}

export interface RecipeUserDataBlob {
  version: 1;
  byRecipe: Record<string, RecipeUserState>;
  shopping: {
    activeRecipeIds: string[];
    checkedItemKeys: string[];
  };
}

export const EMPTY_USER_STATE: RecipeUserState = { ratings: [] };

export function emptyBlob(): RecipeUserDataBlob {
  return {
    version: 1,
    byRecipe: {},
    shopping: { activeRecipeIds: [], checkedItemKeys: [] },
  };
}

export function normaliseName(name: string): IngredientKey {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}
