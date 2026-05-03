import { IngredientKey } from './recipe.types';

export interface PantryItem {
  id: number;
  name: string;
  ingredientKey: IngredientKey;
  qty?: number;
  unit?: string;
  raw?: string;
  price?: number;
  purchasedAt?: string;
  store?: string;
  createdAt: string;
}

export interface PantryItemDraft {
  name: string;
  ingredientKey: IngredientKey;
  qty?: number;
  unit?: string;
  raw?: string;
  price?: number;
  purchasedAt?: string;
  store?: string;
}

export interface DbPantryItem {
  id: number;
  name: string;
  ingredient_key: string;
  qty: number | null;
  unit: string | null;
  raw: string | null;
  price: number | null;
  purchased_at: string | null;
  store: string | null;
  created_at: string;
}

export function dbToPantryItem(r: DbPantryItem): PantryItem {
  return {
    id: r.id,
    name: r.name,
    ingredientKey: r.ingredient_key,
    qty: r.qty ?? undefined,
    unit: r.unit ?? undefined,
    raw: r.raw ?? undefined,
    price: r.price ?? undefined,
    purchasedAt: r.purchased_at ?? undefined,
    store: r.store ?? undefined,
    createdAt: r.created_at,
  };
}
