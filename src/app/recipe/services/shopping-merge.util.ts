import {
  CountableUnit,
  IngredientKey,
  Recipe,
  RecipeUserState,
  normaliseName,
} from '../models/recipe.types';
import { isCountableUnit } from '../utils/qty-parse';

export interface MergedAmount {
  qty: number;
  unit: CountableUnit;
}

export interface MergedShopItem {
  key: IngredientKey;
  name: string;
  recipeIds: string[];
  amounts: MergedAmount[];
}

export interface MergedShoppingList {
  shared: MergedShopItem[];
  byRecipe: Record<string, MergedShopItem[]>;
}

export function mergeShoppingList(
  recipes: Recipe[],
  activeIds: Iterable<string>,
  userState: Record<string, RecipeUserState>,
): MergedShoppingList {
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const merged = new Map<IngredientKey, MergedShopItem>();
  const order: string[] = [];

  for (const rid of activeIds) {
    const r = byId.get(rid);
    if (!r) continue;
    order.push(rid);
    const us = userState[rid];
    const mult = us?.servingMultiplier ?? 1;
    const ingOverrides = us?.ingredientOverrides ?? {};
    const removed = new Set(us?.removedIngredientKeys ?? []);

    for (const section of r.sections) {
      for (const item of section.items) {
        const key = normaliseName(item.name);
        if (removed.has(key)) continue;
        const ovr = ingOverrides[key];
        const qty = ovr?.qty ?? item.qty;
        const unit = ovr?.unit ?? item.unit;

        let entry = merged.get(key);
        if (!entry) {
          entry = { key, name: item.name, recipeIds: [], amounts: [] };
          merged.set(key, entry);
        }
        if (!entry.recipeIds.includes(rid)) entry.recipeIds.push(rid);

        if (qty != null && isCountableUnit(unit)) {
          const scaled = qty * mult;
          const bucket = entry.amounts.find((a) => a.unit === unit);
          if (bucket) bucket.qty += scaled;
          else entry.amounts.push({ qty: scaled, unit });
        }
      }
    }
  }

  const shared: MergedShopItem[] = [];
  const byRecipe: Record<string, MergedShopItem[]> = {};
  for (const v of merged.values()) {
    if (v.recipeIds.length > 1) {
      shared.push(v);
    } else {
      const rid = v.recipeIds[0];
      (byRecipe[rid] ??= []).push(v);
    }
  }

  for (const rid of order) byRecipe[rid] ??= [];

  return { shared, byRecipe };
}
