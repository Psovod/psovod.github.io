import {
  DestroyRef,
  Injectable,
  Signal,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { IngredientKey, normaliseName } from '../models/recipe.types';
import {
  DbPantryItem,
  PantryItem,
  PantryItemDraft,
  dbToPantryItem,
} from '../models/pantry.types';
import { SupabaseService } from './supabase.service';
import { RecipeCatalogService } from './recipe-catalog.service';

@Injectable({ providedIn: 'root' })
export class PantryService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly destroyRef = inject(DestroyRef);
  private readonly catalog = inject(RecipeCatalogService);

  private readonly _items: WritableSignal<PantryItem[]> = signal([]);
  private readonly _loaded: WritableSignal<boolean> = signal(false);
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private isRefreshing = false;

  public readonly items: Signal<PantryItem[]> = this._items.asReadonly();
  public readonly loaded: Signal<boolean> = this._loaded.asReadonly();

  public readonly byKey = computed<Map<IngredientKey, PantryItem>>(() => {
    const map = new Map<IngredientKey, PantryItem>();
    for (const it of this._items()) map.set(it.ingredientKey, it);
    return map;
  });

  /** All unique ingredient names across every recipe, keyed by normalised name. */
  public readonly recipeIngredientOptions = computed<Array<{ key: IngredientKey; name: string }>>(() => {
    const byKey = new Map<IngredientKey, string>();
    for (const r of this.catalog.recipes()) {
      for (const s of r.sections) {
        for (const it of s.items) {
          const key = normaliseName(it.name);
          if (!byKey.has(key)) byKey.set(key, it.name);
        }
      }
    }
    return [...byKey.entries()]
      .map(([key, name]) => ({ key, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  constructor() {
    let channel = this.supabase.channel(`pantry-${crypto.randomUUID()}`);
    channel = channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pantry_items' },
      () => this.schedule(),
    );
    channel.subscribe();

    this.destroyRef.onDestroy(() => {
      if (this.refreshTimer) clearTimeout(this.refreshTimer);
      void this.supabase.removeChannel(channel);
    });
  }

  public hydrateFromRpc(rows: DbPantryItem[]): void {
    this._items.set(rows.map(dbToPantryItem));
    this._loaded.set(true);
  }

  private schedule(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null;
      void this.refresh();
    }, 300);
  }

  public async refresh(): Promise<void> {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    try {
      const { data, error } = await this.supabase
        .from('pantry_items')
        .select('*')
        .order('created_at');
      if (error) { console.error(error); return; }
      this._items.set((data as DbPantryItem[] ?? []).map(dbToPantryItem));
      this._loaded.set(true);
    } catch (err) {
      console.error('Pantry fetch failed:', err);
    } finally {
      this.isRefreshing = false;
    }
  }

  public async add(draft: PantryItemDraft): Promise<void> {
    const { data, error } = await this.supabase
      .from('pantry_items')
      .insert({
        name: draft.name,
        ingredient_key: draft.ingredientKey,
        qty: draft.qty ?? null,
        unit: draft.unit ?? null,
        raw: draft.raw ?? null,
        price: draft.price ?? null,
        purchased_at: draft.purchasedAt ?? null,
        store: draft.store ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    const row = data as DbPantryItem;
    this._items.update((list) => [...list, dbToPantryItem(row)]);
  }

  public async update(id: number, patch: Partial<PantryItemDraft>): Promise<void> {
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row['name'] = patch.name;
    if (patch.ingredientKey !== undefined) row['ingredient_key'] = patch.ingredientKey;
    if (patch.qty !== undefined) row['qty'] = patch.qty ?? null;
    if (patch.unit !== undefined) row['unit'] = patch.unit ?? null;
    if (patch.raw !== undefined) row['raw'] = patch.raw ?? null;
    if (patch.price !== undefined) row['price'] = patch.price ?? null;
    if (patch.purchasedAt !== undefined) row['purchased_at'] = patch.purchasedAt ?? null;
    if (patch.store !== undefined) row['store'] = patch.store ?? null;

    const { error } = await this.supabase.from('pantry_items').update(row).eq('id', id);
    if (error) throw error;
    this._items.update((list) => list.map((it) => it.id === id ? { ...it, ...this.applyPatch(it, patch) } : it));
  }

  public async remove(id: number): Promise<void> {
    const { error } = await this.supabase.from('pantry_items').delete().eq('id', id);
    if (error) throw error;
    this._items.update((list) => list.filter((it) => it.id !== id));
  }

  private applyPatch(it: PantryItem, patch: Partial<PantryItemDraft>): Partial<PantryItem> {
    const out: Partial<PantryItem> = {};
    if (patch.name !== undefined) out.name = patch.name;
    if (patch.ingredientKey !== undefined) out.ingredientKey = patch.ingredientKey;
    if (patch.qty !== undefined) out.qty = patch.qty;
    if (patch.unit !== undefined) out.unit = patch.unit;
    if (patch.raw !== undefined) out.raw = patch.raw;
    if (patch.price !== undefined) out.price = patch.price;
    if (patch.purchasedAt !== undefined) out.purchasedAt = patch.purchasedAt;
    if (patch.store !== undefined) out.store = patch.store;
    return out;
  }
}
