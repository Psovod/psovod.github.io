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
  Recipe,
  RecipeColorKey,
  RecipeSection,
  RecipeStep,
  StepPhase,
  StepTimer,
} from '../models/recipe.types';
import { SupabaseService } from './supabase.service';

interface DbRecipeFull {
  id: string;
  label: string;
  color: RecipeColorKey;
  thumb: string | null;
  emoji: string | null;
  external_url: string | null;
  base_servings: number;
  sort_order: number;
  recipe_sections: Array<{
    id: number;
    label: string | null;
    sort_order: number;
    recipe_ingredients: Array<{
      id: number;
      name: string;
      qty: number | null;
      unit: string | null;
      raw: string | null;
      sort_order: number;
    }>;
  }>;
  recipe_steps: Array<{
    id: number;
    phase: StepPhase;
    text: string;
    sort_order: number;
    step_ingredients: Array<{ ingredient_id: number; sort_order: number }>;
    step_timers: Array<{ id: number; label: string; minutes: number; sort_order: number }>;
  }>;
}

const CATALOG_TABLES = [
  'recipes',
  'recipe_sections',
  'recipe_ingredients',
  'recipe_steps',
  'step_ingredients',
  'step_timers',
] as const;

@Injectable({ providedIn: 'root' })
export class RecipeCatalogService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly destroyRef = inject(DestroyRef);

  private readonly _recipes: WritableSignal<Recipe[]> = signal([]);
  private readonly _loaded: WritableSignal<boolean> = signal(false);
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private isRefreshing = false;

  public readonly recipes: Signal<Recipe[]> = this._recipes.asReadonly();
  public readonly loaded: Signal<boolean> = this._loaded.asReadonly();
  public readonly byId = computed(() => {
    const map = new Map<string, Recipe>();
    for (const r of this._recipes()) map.set(r.id, r);
    return map;
  });

  constructor() {
    void this.refresh();

    let channel = this.supabase.channel(`catalog-${crypto.randomUUID()}`);
    for (const table of CATALOG_TABLES) {
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

  public async refresh(): Promise<void> {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    let data: DbRecipeFull[] | null = null;
    try {
      const res = await this.supabase
        .from('recipes')
        .select(`
          *,
          recipe_sections (
            id, label, sort_order,
            recipe_ingredients ( id, name, qty, unit, raw, sort_order )
          ),
          recipe_steps (
            id, phase, text, sort_order,
            step_ingredients ( ingredient_id, sort_order ),
            step_timers ( id, label, minutes, sort_order )
          )
        `)
        .order('sort_order');
      if (res.error) { console.error(res.error); return; }
      data = res.data as DbRecipeFull[];
    } catch (err) {
      console.error('Catalog fetch failed:', err);
      return;
    } finally {
      this.isRefreshing = false;
    }

    if (!data) return;

    const out: Recipe[] = (data as DbRecipeFull[]).map((r) => {
      const sections: RecipeSection[] = [...r.recipe_sections]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => ({
          id: s.label,
          items: [...s.recipe_ingredients]
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((i) => ({
              id: i.id,
              name: i.name,
              qty: i.qty ?? undefined,
              unit: i.unit ?? undefined,
              raw: i.raw ?? undefined,
            })),
        }));

      const steps: RecipeStep[] = [...r.recipe_steps]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => ({
          id: s.id,
          phase: s.phase,
          order: s.sort_order,
          text: s.text,
          ingredientIds: [...s.step_ingredients]
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((si) => si.ingredient_id),
          timers: [...s.step_timers]
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((t): StepTimer => ({ id: t.id, label: t.label, minutes: t.minutes })),
        }));

      return {
        id: r.id,
        label: r.label,
        color: r.color,
        thumb: r.thumb ?? undefined,
        emoji: r.emoji ?? undefined,
        externalUrl: r.external_url ?? undefined,
        baseServings: r.base_servings,
        sections,
        steps,
      };
    });

    this._recipes.set(out);
    this._loaded.set(true);
  }
}
