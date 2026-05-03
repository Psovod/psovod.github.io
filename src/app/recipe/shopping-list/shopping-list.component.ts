import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MaterialModule } from '../../material/material.module';
import { RecipeColorKey } from '../models/recipe.types';
import { RecipeCatalogService } from '../services/recipe-catalog.service';
import { RecipeStateService } from '../services/recipe-state.service';
import {
  MergedShopItem,
  mergeShoppingList,
} from '../services/shopping-merge.util';

const COLOR_HEX: Record<RecipeColorKey, string> = {
  mustard: '#b8840a',
  terracotta: '#c4512a',
  burgundy: '#7a2040',
  sage: '#4a6741',
  slate: '#2c5f6e',
  plum: '#8b4f9e',
};

interface ActiveRecipe {
  id: string;
  label: string;
  thumb?: string;
  emoji?: string;
  color: string;
}

interface GroupedSection {
  kind: 'shared' | 'recipe';
  label: string;
  color?: string;
  items: MergedShopItem[];
}

@Component({
  selector: 'app-shopping-list',
  imports: [CommonModule, FormsModule, MaterialModule, MatAutocompleteModule, TranslatePipe],
  templateUrl: './shopping-list.component.html',
  styleUrl: './shopping-list.component.scss',
})
export class ShoppingListComponent {
  protected readonly state = inject(RecipeStateService);
  protected readonly catalog = inject(RecipeCatalogService);
  protected readonly skeletonRows = [0, 1, 2, 3, 4, 5];
  private readonly translate = inject(TranslateService);
  private readonly lang = toSignal(this.translate.onLangChange, { initialValue: null });

  public readonly addQuery = signal('');

  public readonly availableRecipes = computed<ActiveRecipe[]>(() => {
    const active = this.state.activeRecipeIds();
    const q = this.addQuery().trim().toLowerCase();
    return this.catalog.recipes()
      .filter((r) => !active.has(r.id))
      .filter((r) => !q || r.label.toLowerCase().includes(q))
      .map((r) => ({
        id: r.id,
        label: r.label,
        thumb: r.thumb,
        emoji: r.emoji,
        color: COLOR_HEX[r.color],
      }))
      .slice(0, 30);
  });

  public pickRecipe(event: MatAutocompleteSelectedEvent): void {
    const id = event.option.value as string;
    this.state.toggleShoppingRecipe(id);
    this.addQuery.set('');
  }

  public readonly activeRecipes = computed<ActiveRecipe[]>(() => {
    const active = this.state.activeRecipeIds();
    return this.catalog.recipes()
      .filter((r) => active.has(r.id))
      .map((r) => ({
        id: r.id,
        label: r.label,
        thumb: r.thumb,
        emoji: r.emoji,
        color: COLOR_HEX[r.color],
      }));
  });

  public readonly merged = computed(() => {
    const blob = this.state.blob();
    return mergeShoppingList(this.catalog.recipes(), blob.shopping.activeRecipeIds, blob.byRecipe);
  });

  public readonly recipeLabel = (id: string): string =>
    this.catalog.byId().get(id)?.label ?? id;
  public readonly recipeColor = (id: string): string => {
    const r = this.catalog.byId().get(id);
    return r ? COLOR_HEX[r.color] : '#888';
  };

  public readonly uncheckedSections = computed<GroupedSection[]>(() => {
    const checked = this.state.checkedItemKeys();
    const m = this.merged();
    const sections: GroupedSection[] = [];

    const sharedUnchecked = m.shared.filter((it) => !checked.has(it.key));
    if (sharedUnchecked.length) {
      sections.push({ kind: 'shared', label: 'app.recipes.shopping.shared', items: sharedUnchecked });
    }

    for (const rid of this.state.activeRecipeIds()) {
      const list = (m.byRecipe[rid] ?? []).filter((it) => !checked.has(it.key));
      if (list.length) {
        sections.push({
          kind: 'recipe',
          label: this.recipeLabel(rid),
          color: this.recipeColor(rid),
          items: list,
        });
      }
    }
    return sections;
  });

  public readonly checkedItems = computed<MergedShopItem[]>(() => {
    const checked = this.state.checkedItemKeys();
    const m = this.merged();
    const all: MergedShopItem[] = [
      ...m.shared,
      ...Object.values(m.byRecipe).flat(),
    ];
    return all.filter((it) => checked.has(it.key));
  });

  public readonly totalCount = computed(() => {
    const m = this.merged();
    return m.shared.length + Object.values(m.byRecipe).flat().length;
  });

  public readonly doneCount = computed(() => this.checkedItems().length);

  public readonly hasActive = computed(() => this.state.activeRecipeIds().size > 0);

  public readonly countLabel = computed(() => {
    this.lang();
    return this.translate.instant('app.recipes.shopping.count', {
      done: this.doneCount(),
      total: this.totalCount(),
    });
  });

  public isChecked(key: string): boolean {
    return this.state.checkedItemKeys().has(key);
  }

  public toggleRecipe(id: string): void {
    this.state.toggleShoppingRecipe(id);
  }

  public toggleItem(key: string): void {
    this.state.toggleShoppingItem(key);
  }

  public clearChecks(): void {
    this.state.clearShoppingChecks();
  }

  public formatAmounts(item: MergedShopItem): string {
    return item.amounts.map((a) => `${Math.round(a.qty * 100) / 100} ${a.unit}`).join(' + ');
  }
}
