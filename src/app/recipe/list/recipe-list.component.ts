import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MaterialModule } from '../../material/material.module';
import { Recipe, normaliseName } from '../models/recipe.types';
import { RecipeCatalogService } from '../services/recipe-catalog.service';
import { RecipeStateService } from '../services/recipe-state.service';
import { PantryService } from '../services/pantry.service';

interface DisplayRecipe {
  recipe: Recipe;
  count: number;
  avg: number | null;
  stars: Array<'full' | 'half' | 'empty'>;
  matchPct: number | null;
  matchedCount: number;
  totalCount: number;
}


@Component({
  selector: 'app-recipe-list',
  imports: [CommonModule, FormsModule, RouterLink, MaterialModule, TranslatePipe],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.scss',
})
export class RecipeListComponent {
  private readonly state = inject(RecipeStateService);
  protected readonly catalog = inject(RecipeCatalogService);
  protected readonly pantry = inject(PantryService);
  protected readonly skeletonCount = [0, 1, 2, 3, 4, 5];

  public readonly query = signal('');
  /** 0 = show all, 1..5 = minimum average rating. */
  public readonly minRating = signal(0);
  public readonly similarDismissed = signal(localStorage.getItem('similar-dismissed') === '1');

  public readonly similarCount = computed<number>(() => {
    const keys = new Set<string>();
    const names = new Map<string, string>();
    for (const r of this.catalog.recipes()) {
      for (const s of r.sections) {
        for (const it of s.items) {
          const k = normaliseName(it.name);
          if (!names.has(k)) {
            names.set(k, it.name);
            keys.add(k);
          }
        }
      }
    }
    const list = [...keys];
    const seen = new Set<string>();
    let clusters = 0;
    const pairsOf = new Map<string, Set<string>>();
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (this.looksSimilar(list[i], list[j])) {
          const a = pairsOf.get(list[i]) ?? new Set();
          a.add(list[j]);
          pairsOf.set(list[i], a);
          const b = pairsOf.get(list[j]) ?? new Set();
          b.add(list[i]);
          pairsOf.set(list[j], b);
        }
      }
    }
    for (const k of list) {
      if (seen.has(k) || !pairsOf.has(k)) continue;
      const stack = [k];
      const group: string[] = [];
      while (stack.length) {
        const cur = stack.pop()!;
        if (seen.has(cur)) continue;
        seen.add(cur);
        group.push(cur);
        for (const n of pairsOf.get(cur) ?? []) stack.push(n);
      }
      if (group.length >= 2) clusters++;
    }
    return clusters;
  });

  private looksSimilar(a: string, b: string): boolean {
    if (a.length < 4 || b.length < 4) return false;
    if (a.includes(b) || b.includes(a)) return true;
    const prefixLen = Math.min(a.length, b.length, 5);
    if (a.slice(0, prefixLen) === b.slice(0, prefixLen) && prefixLen >= 5) return true;
    return false;
  }

  public dismissSimilar(): void {
    localStorage.setItem('similar-dismissed', '1');
    this.similarDismissed.set(true);
  }

  public readonly displayed = computed<DisplayRecipe[]>(() => {
    const q = this.query().trim().toLowerCase();
    const min = this.minRating();
    const blob = this.state.blob();
    const pantryKeys = this.pantry.byKey();
    const hasPantry = pantryKeys.size > 0;

    const items = this.catalog.recipes()
      .map((r) => {
        const st = blob.byRecipe[r.id];
        const list = st?.ratings ?? [];
        const avg = list.length ? Math.round((list.reduce((a, e) => a + e.rating, 0) / list.length) * 10) / 10 : null;

        let matchPct: number | null = null;
        let matchedCount = 0;
        let totalCount = 0;
        if (hasPantry) {
          const keys = r.sections.flatMap((s) => s.items).map((i) => normaliseName(i.name));
          totalCount = keys.length;
          matchedCount = keys.filter((k) => pantryKeys.has(k)).length;
          matchPct = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : null;
        }

        return { recipe: r, count: list.length, avg, stars: this.starsFor(avg), matchPct, matchedCount, totalCount };
      })
      .filter((d) => !q || d.recipe.label.toLowerCase().includes(q))
      .filter((d) => min === 0 || (d.avg != null && d.avg >= min));

    if (hasPantry) {
      items.sort((a, b) => (b.matchPct ?? -1) - (a.matchPct ?? -1));
    }
    return items;
  });

  public clearFilters(): void {
    this.query.set('');
    this.minRating.set(0);
  }

  private starsFor(avg: number | null): Array<'full' | 'half' | 'empty'> {
    if (avg == null) return [];
    const out: Array<'full' | 'half' | 'empty'> = [];
    for (let i = 1; i <= 5; i++) {
      if (avg >= i) out.push('full');
      else if (avg >= i - 0.5) out.push('half');
      else out.push('empty');
    }
    return out;
  }
}
