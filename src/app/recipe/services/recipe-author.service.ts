import { Injectable, inject } from '@angular/core';
import { Recipe, RecipeColorKey, StepPhase } from '../models/recipe.types';
import { SupabaseService } from './supabase.service';
import { RecipeCatalogService } from './recipe-catalog.service';

export interface RecipeDraftSectionItem {
  id?: number;
  name: string;
  qty?: number;
  unit?: string;
  raw?: string;
}

export interface RecipeDraftSection {
  id?: number;
  label: string | null;
  items: RecipeDraftSectionItem[];
}

export interface RecipeDraftStepTimer {
  id?: number;
  label: string;
  minutes: number;
}

export interface RecipeDraftStep {
  id?: number;
  phase: StepPhase;
  order: number;
  text: string;
  /** Draft step references ingredients by *draft-local* key:
   *  either the db id if it already exists, or a synthetic negative index from the draft ingredients array. */
  ingredientRefs: Array<number | string>;
  timers: RecipeDraftStepTimer[];
}

export interface RecipeDraft {
  id: string;
  label: string;
  color: RecipeColorKey;
  thumb?: string;
  emoji?: string;
  externalUrl?: string;
  baseServings: number;
  sortOrder: number;
  sections: RecipeDraftSection[];
  steps: RecipeDraftStep[];
}

@Injectable({ providedIn: 'root' })
export class RecipeAuthorService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly catalog = inject(RecipeCatalogService);

  public async save(draft: RecipeDraft): Promise<void> {
    const { error } = await this.supabase.rpc('save_recipe', { draft });
    if (error) throw error;
    await this.catalog.refresh();
  }

  public async remove(id: string): Promise<void> {
    const { error } = await this.supabase.from('recipes').delete().eq('id', id);
    if (error) throw error;
    await this.catalog.refresh();
  }

  /** Build an empty draft for the /recipes/new form. */
  public emptyDraft(): RecipeDraft {
    return {
      id: '',
      label: '',
      color: 'terracotta',
      baseServings: 2,
      sortOrder: 999,
      sections: [{ label: null, items: [] }],
      steps: [],
    };
  }

  /** Convert a loaded Recipe into a mutable draft. */
  public toDraft(r: Recipe): RecipeDraft {
    const refLookup = new Map<number, string>();
    const sections: RecipeDraftSection[] = r.sections.map((s, si) => ({
      label: s.id,
      items: s.items.map((it, ii) => {
        if (it.id != null) refLookup.set(it.id, `draft:${si}:${ii}`);
        return {
          id: it.id,
          name: it.name,
          qty: it.qty,
          unit: it.unit,
          raw: it.raw,
        };
      }),
    }));

    const steps: RecipeDraftStep[] = r.steps.map((s) => ({
      id: s.id,
      phase: s.phase,
      order: s.order,
      text: s.text,
      ingredientRefs: s.ingredientIds.map((id) => refLookup.get(id) ?? id),
      timers: s.timers.map((t) => ({ id: t.id, label: t.label, minutes: t.minutes })),
    }));

    return {
      id: r.id,
      label: r.label,
      color: r.color,
      thumb: r.thumb,
      emoji: r.emoji,
      externalUrl: r.externalUrl,
      baseServings: r.baseServings,
      sortOrder: 0,
      sections,
      steps,
    };
  }
}
