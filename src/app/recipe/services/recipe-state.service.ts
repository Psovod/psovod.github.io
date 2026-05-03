import {
  DestroyRef,
  Injectable,
  Signal,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  CookEntry,
  EMPTY_USER_STATE,
  IngredientKey,
  IngredientOverride,
  RecipeUserDataBlob,
  RecipeUserState,
  emptyBlob,
} from '../models/recipe.types';
import { SupabaseService } from './supabase.service';
import { PantryService } from './pantry.service';
import { DbPantryItem } from '../models/pantry.types';

interface DbCookEntry {
  id: number;
  recipe_id: string;
  cooked_at: string;
  rating: number;
  note: string | null;
}

interface DbIngredientOverride {
  recipe_id: string;
  ingredient_key: string;
  qty: number | null;
  unit: string | null;
  raw: string | null;
}

interface DbIngredientRemoved {
  recipe_id: string;
  ingredient_key: string;
}

interface DbServingMultiplier {
  recipe_id: string;
  multiplier: number;
}

interface DbShoppingState {
  id: number;
  active_recipe_ids: string[];
  checked_item_keys: string[];
}

interface UserStateRpc {
  cook_entries: DbCookEntry[] | null;
  ingredient_overrides: DbIngredientOverride[] | null;
  ingredient_removed: DbIngredientRemoved[] | null;
  serving_multipliers: DbServingMultiplier[] | null;
  shopping_state: DbShoppingState | null;
  pantry_items: DbPantryItem[] | null;
}

const STATE_TABLES = [
  'cook_entries',
  'ingredient_overrides',
  'ingredient_removed',
  'serving_multipliers',
  'shopping_state',
] as const;

@Injectable({ providedIn: 'root' })
export class RecipeStateService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly destroyRef = inject(DestroyRef);
  private readonly pantry = inject(PantryService);

  private readonly _blob: WritableSignal<RecipeUserDataBlob> = signal(emptyBlob());
  private readonly _loaded: WritableSignal<boolean> = signal(false);
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private isRefreshing = false;

  public readonly blob: Signal<RecipeUserDataBlob> = this._blob.asReadonly();
  public readonly loaded: Signal<boolean> = this._loaded.asReadonly();

  public readonly activeRecipeIds = computed(() => new Set(this._blob().shopping.activeRecipeIds));
  public readonly checkedItemKeys = computed(() => new Set(this._blob().shopping.checkedItemKeys));

  constructor() {
    void this.refresh();

    let channel = this.supabase.channel(`state-${crypto.randomUUID()}`);
    for (const table of STATE_TABLES) {
      channel = channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => this.schedule(),
      );
    }
    channel.subscribe();

    this.destroyRef.onDestroy(() => {
      if (this.refreshTimer) clearTimeout(this.refreshTimer);
      void this.supabase.removeChannel(channel);
    });
  }

  private schedule(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null;
      void this.refresh();
    }, 300);
  }

  private readonly _userStateCache = new Map<string, Signal<RecipeUserState>>();

  public userStateFor(id: string): Signal<RecipeUserState> {
    let sig = this._userStateCache.get(id);
    if (!sig) {
      sig = computed(() => this._blob().byRecipe[id] ?? EMPTY_USER_STATE);
      this._userStateCache.set(id, sig);
    }
    return sig;
  }

  public async refresh(): Promise<void> {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    let state: UserStateRpc | null = null;
    try {
      const { data, error } = await this.supabase.rpc('get_user_state');
      if (error) { console.error(error); return; }
      state = data as UserStateRpc;
    } catch (err) {
      console.error('State fetch failed:', err);
      return;
    } finally {
      this.isRefreshing = false;
    }

    if (!state) return;

    const blob = emptyBlob();
    const byRecipe = blob.byRecipe;
    const ensure = (rid: string): RecipeUserState => {
      if (!byRecipe[rid]) byRecipe[rid] = { ratings: [] };
      return byRecipe[rid];
    };

    for (const row of state.cook_entries ?? []) {
      const s = ensure(row.recipe_id);
      const entry: CookEntry = { date: row.cooked_at, rating: row.rating };
      if (row.note) entry.note = row.note;
      s.ratings.push(entry);
    }

    for (const row of state.ingredient_overrides ?? []) {
      const s = ensure(row.recipe_id);
      s.ingredientOverrides ??= {};
      const patch: IngredientOverride = {};
      if (row.qty != null) patch.qty = row.qty;
      if (row.unit != null) patch.unit = row.unit;
      if (row.raw != null) patch.raw = row.raw;
      s.ingredientOverrides[row.ingredient_key] = patch;
    }

    for (const row of state.ingredient_removed ?? []) {
      const s = ensure(row.recipe_id);
      s.removedIngredientKeys ??= [];
      s.removedIngredientKeys.push(row.ingredient_key);
    }

    for (const row of state.serving_multipliers ?? []) {
      const s = ensure(row.recipe_id);
      s.servingMultiplier = row.multiplier;
    }

    if (state.shopping_state) {
      blob.shopping.activeRecipeIds = state.shopping_state.active_recipe_ids ?? [];
      blob.shopping.checkedItemKeys = state.shopping_state.checked_item_keys ?? [];
    }

    this.pantry.hydrateFromRpc(state.pantry_items ?? []);

    this._blob.set(blob);
    this._loaded.set(true);
  }

  public async logCook(id: string, rating: number, note?: string): Promise<void> {
    const cooked_at = new Date().toISOString();
    const { error } = await this.supabase.from('cook_entries').insert({
      recipe_id: id,
      cooked_at,
      rating,
      note: note ?? null,
    });
    if (error) throw error;
    this.mutateRecipe(id, (s) => ({
      ...s,
      ratings: [...s.ratings, note ? { date: cooked_at, rating, note } : { date: cooked_at, rating }],
    }));
  }

  public async deleteCookEntry(id: string, index: number): Promise<void> {
    const entry = this._blob().byRecipe[id]?.ratings[index];
    if (!entry) return;
    const { error } = await this.supabase
      .from('cook_entries')
      .delete()
      .eq('recipe_id', id)
      .eq('cooked_at', entry.date);
    if (error) throw error;
    this.mutateRecipe(id, (s) => ({
      ...s,
      ratings: s.ratings.filter((_, i) => i !== index),
    }));
  }

  public async setServingMultiplier(id: string, x: number): Promise<void> {
    const multiplier = Math.max(0.1, x);
    const { error } = await this.supabase
      .from('serving_multipliers')
      .upsert({ recipe_id: id, multiplier, updated_at: new Date().toISOString() });
    if (error) throw error;
    this.mutateRecipe(id, (s) => ({ ...s, servingMultiplier: multiplier }));
  }

  public async overrideIngredient(
    id: string,
    key: IngredientKey,
    patch: IngredientOverride,
  ): Promise<void> {
    const { error } = await this.supabase.from('ingredient_overrides').upsert({
      recipe_id: id,
      ingredient_key: key,
      qty: patch.qty ?? null,
      unit: patch.unit ?? null,
      raw: patch.raw ?? null,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    this.mutateRecipe(id, (s) => ({
      ...s,
      ingredientOverrides: { ...(s.ingredientOverrides ?? {}), [key]: patch },
    }));
  }

  public async clearIngredientOverride(id: string, key: IngredientKey): Promise<void> {
    const { error } = await this.supabase
      .from('ingredient_overrides')
      .delete()
      .eq('recipe_id', id)
      .eq('ingredient_key', key);
    if (error) throw error;
    this.mutateRecipe(id, (s) => {
      const copy = { ...(s.ingredientOverrides ?? {}) };
      delete copy[key];
      return { ...s, ingredientOverrides: copy };
    });
  }

  public async toggleIngredientRemoved(id: string, key: IngredientKey): Promise<void> {
    const list = this._blob().byRecipe[id]?.removedIngredientKeys ?? [];
    const isRemoved = list.includes(key);
    if (isRemoved) {
      const { error } = await this.supabase
        .from('ingredient_removed')
        .delete()
        .eq('recipe_id', id)
        .eq('ingredient_key', key);
      if (error) throw error;
    } else {
      const { error } = await this.supabase.from('ingredient_removed').insert({
        recipe_id: id,
        ingredient_key: key,
      });
      if (error) throw error;
    }
    this.mutateRecipe(id, (s) => {
      const curr = s.removedIngredientKeys ?? [];
      return {
        ...s,
        removedIngredientKeys: isRemoved ? curr.filter((k) => k !== key) : [...curr, key],
      };
    });
  }

  public async resetRecipe(id: string): Promise<void> {
    await Promise.all([
      this.supabase.from('ingredient_overrides').delete().eq('recipe_id', id),
      this.supabase.from('ingredient_removed').delete().eq('recipe_id', id),
      this.supabase.from('serving_multipliers').delete().eq('recipe_id', id),
    ]);
    this._blob.update((b) => {
      const copy = { ...b.byRecipe };
      if (copy[id]) copy[id] = { ratings: copy[id].ratings };
      return { ...b, byRecipe: copy };
    });
  }

  public async toggleShoppingRecipe(id: string): Promise<void> {
    const curr = this._blob().shopping.activeRecipeIds;
    const next = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id];
    this._blob.update((b) => ({
      ...b,
      shopping: { activeRecipeIds: next, checkedItemKeys: [] },
    }));
    await this.persistShopping({ activeRecipeIds: next, checkedItemKeys: [] });
  }

  public async toggleShoppingItem(key: IngredientKey): Promise<void> {
    const curr = this._blob().shopping.checkedItemKeys;
    const next = curr.includes(key) ? curr.filter((x) => x !== key) : [...curr, key];
    this._blob.update((b) => ({ ...b, shopping: { ...b.shopping, checkedItemKeys: next } }));
    await this.persistShopping({ checkedItemKeys: next });
  }

  public async clearShoppingChecks(): Promise<void> {
    this._blob.update((b) => ({ ...b, shopping: { ...b.shopping, checkedItemKeys: [] } }));
    await this.persistShopping({ checkedItemKeys: [] });
  }

  public exportUserData(): string {
    return JSON.stringify(this._blob(), null, 2);
  }

  private async persistShopping(patch: {
    activeRecipeIds?: string[];
    checkedItemKeys?: string[];
  }): Promise<void> {
    const row: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString() };
    if (patch.activeRecipeIds !== undefined) row['active_recipe_ids'] = patch.activeRecipeIds;
    if (patch.checkedItemKeys !== undefined) row['checked_item_keys'] = patch.checkedItemKeys;
    const { error } = await this.supabase.from('shopping_state').upsert(row);
    if (error) throw error;
  }

  private mutateRecipe(id: string, fn: (s: RecipeUserState) => RecipeUserState): void {
    this._blob.update((b) => {
      const current = b.byRecipe[id] ?? { ratings: [] };
      return { ...b, byRecipe: { ...b.byRecipe, [id]: fn(current) } };
    });
  }
}
