import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../material/material.module';
import { normaliseName } from '../models/recipe.types';
import { RecipeCatalogService } from '../services/recipe-catalog.service';
import { PantryService } from '../services/pantry.service';
import { SupabaseService } from '../services/supabase.service';

interface SimilarCluster {
  keys: string[];
  names: string[];
  suggested: string;
}

@Component({
  selector: 'app-recipe-settings',
  imports: [CommonModule, FormsModule, MaterialModule, TranslatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class RecipeSettingsComponent {
  private readonly catalog = inject(RecipeCatalogService);
  private readonly pantry = inject(PantryService);
  private readonly supabase = inject(SupabaseService).client;

  private readonly translate = inject(TranslateService);
  public readonly merging = signal<string | null>(null);
  public readonly showSimilar = signal(false);
  public readonly currentLang = signal<string>(this.translate.currentLang || this.translate.defaultLang || 'en');
  private readonly _deselected = signal<Map<string, Set<string>>>(new Map());

  public setLang(lang: string): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
  }

  public readonly similarClusters = computed<SimilarCluster[]>(() => {
    const names = new Map<string, string>();
    for (const r of this.catalog.recipes()) {
      for (const s of r.sections) {
        for (const it of s.items) {
          const key = normaliseName(it.name);
          if (!names.has(key)) names.set(key, it.name);
        }
      }
    }
    const keys = [...names.keys()];
    const parent = new Map<string, string>(keys.map((k) => [k, k]));
    const find = (x: string): string => {
      let r = x;
      while (parent.get(r)! !== r) r = parent.get(r)!;
      let cur = x;
      while (parent.get(cur)! !== cur) {
        const next = parent.get(cur)!;
        parent.set(cur, r);
        cur = next;
      }
      return r;
    };
    const union = (a: string, b: string): void => {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent.set(ra, rb);
    };
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        if (this.looksSimilar(keys[i], keys[j])) union(keys[i], keys[j]);
      }
    }
    const groups = new Map<string, string[]>();
    for (const k of keys) {
      const root = find(k);
      const arr = groups.get(root) ?? [];
      arr.push(k);
      groups.set(root, arr);
    }
    const out: SimilarCluster[] = [];
    for (const [, groupKeys] of groups) {
      if (groupKeys.length < 2) continue;
      const groupNames = groupKeys.map((k) => names.get(k)!);
      const suggested = [...groupNames].sort((a, b) => a.length - b.length)[0];
      out.push({ keys: groupKeys, names: groupNames, suggested });
    }
    return out;
  });

  private looksSimilar(a: string, b: string): boolean {
    if (a.length < 4 || b.length < 4) return false;
    if (a.includes(b) || b.includes(a)) return true;
    const prefixLen = Math.min(a.length, b.length, 5);
    if (a.slice(0, prefixLen) === b.slice(0, prefixLen) && prefixLen >= 5) return true;
    return false;
  }

  private clusterId(c: SimilarCluster): string {
    return c.keys.join('|');
  }

  public isSelected(c: SimilarCluster, key: string): boolean {
    return !(this._deselected().get(this.clusterId(c))?.has(key) ?? false);
  }

  public toggleSelected(c: SimilarCluster, key: string, checked: boolean): void {
    const id = this.clusterId(c);
    this._deselected.update((map) => {
      const next = new Map(map);
      const set = new Set(next.get(id) ?? []);
      if (checked) set.delete(key);
      else set.add(key);
      next.set(id, set);
      return next;
    });
  }

  public selectedFor(c: SimilarCluster): string[] {
    const off = this._deselected().get(this.clusterId(c)) ?? new Set<string>();
    return c.keys.filter((k) => !off.has(k));
  }

  public async mergeCluster(c: SimilarCluster, canonical: string, selectedKeys: string[]): Promise<void> {
    const target = canonical.trim();
    if (!target || selectedKeys.length < 2) return;
    const targetKey = normaliseName(target);

    const ids: number[] = [];
    for (const r of this.catalog.recipes()) {
      for (const s of r.sections) {
        for (const it of s.items) {
          if (it.id != null && selectedKeys.includes(normaliseName(it.name))) {
            ids.push(it.id);
          }
        }
      }
    }
    if (!ids.length) return;

    this.merging.set(this.clusterId(c));
    try {
      const { error } = await this.supabase
        .from('recipe_ingredients')
        .update({ name: target })
        .in('id', ids);
      if (error) { console.error(error); return; }

      const pantryMatches = this.pantry.items().filter((p) => selectedKeys.includes(p.ingredientKey));
      await Promise.all(
        pantryMatches.map((p) => this.pantry.update(p.id, { name: target, ingredientKey: targetKey })),
      );

      await this.catalog.refresh();
    } catch (err) {
      console.error('Merge failed:', err);
    } finally {
      this.merging.set(null);
    }
  }

  public resetSimilarDismiss(): void {
    localStorage.removeItem('similar-dismissed');
  }
}
