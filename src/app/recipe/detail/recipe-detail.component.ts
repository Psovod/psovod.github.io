import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MaterialModule } from '../../material/material.module';
import { RecipeCatalogService } from '../services/recipe-catalog.service';
import {
  Ingredient,
  IngredientKey,
  Recipe,
  RecipeStep,
  StepPhase,
  normaliseName,
} from '../models/recipe.types';
import { RecipeStateService } from '../services/recipe-state.service';
import { RecipeAuthorService } from '../services/recipe-author.service';
import { PantryService } from '../services/pantry.service';
import { convertToMetric, formatConversion } from '../utils/unit-convert';
import {
  LogCookDialogComponent,
  LogCookResult,
} from '../dialogs/log-cook-dialog.component';
import {
  EditIngredientDialogComponent,
  EditIngredientDialogData,
} from '../dialogs/edit-ingredient-dialog.component';

interface EffectiveIngredient {
  key: IngredientKey;
  name: string;
  display: string;
  conversion: string | null;
  isOverridden: boolean;
  isRemoved: boolean;
  raw: { qty?: number; unit?: string; raw?: string };
}

interface StepView {
  id: number;
  text: string;
  ingredientNames: string[];
  timers: Array<{ label: string; minutes: number }>;
  index: number;
}

interface StepGroup {
  phase: StepPhase;
  items: StepView[];
}

@Component({
  selector: 'app-recipe-detail',
  imports: [CommonModule, RouterLink, MaterialModule, TranslatePipe],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.scss',
})
export class RecipeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly state = inject(RecipeStateService);
  private readonly author = inject(RecipeAuthorService);
  protected readonly catalog = inject(RecipeCatalogService);
  private readonly pantry = inject(PantryService);
  private readonly dialog = inject(MatDialog);

  private readonly paramMap = toSignal(this.route.paramMap);

  public readonly recipe = computed<Recipe | undefined>(() => {
    const id = this.paramMap()?.get('id');
    if (!id) return undefined;
    return this.catalog.byId().get(id);
  });

  public readonly userState = computed(() => {
    const r = this.recipe();
    return r ? this.state.userStateFor(r.id)() : { ratings: [] };
  });

  public readonly servingMultiplier = computed(() => this.userState().servingMultiplier ?? 1);

  public readonly effectiveSections = computed(() => {
    const r = this.recipe();
    if (!r) return [];
    const mult = this.servingMultiplier();
    const us = this.userState();
    const ingOverrides = us.ingredientOverrides ?? {};
    const removed = new Set(us.removedIngredientKeys ?? []);
    return r.sections.map((section) => ({
      id: section.id,
      items: section.items.map((it) => this.toEffective(it, mult, ingOverrides, removed)),
    }));
  });

  public readonly stepGroups = computed<StepGroup[]>(() => {
    const r = this.recipe();
    if (!r) return [];
    const nameById = new Map<number, string>();
    for (const section of r.sections) {
      for (const item of section.items) {
        if (item.id != null) nameById.set(item.id, item.name);
      }
    }
    const prep: StepView[] = [];
    const cook: StepView[] = [];
    let prepIdx = 0;
    let cookIdx = 0;
    for (const s of r.steps) {
      const view: StepView = {
        id: s.id ?? 0,
        text: s.text,
        ingredientNames: s.ingredientIds.map((id) => nameById.get(id)).filter((x): x is string => !!x),
        timers: s.timers.map((t) => ({ label: t.label, minutes: t.minutes })),
        index: s.phase === 'prep' ? ++prepIdx : ++cookIdx,
      };
      (s.phase === 'prep' ? prep : cook).push(view);
    }
    return [
      ...(prep.length ? [{ phase: 'prep' as const, items: prep }] : []),
      ...(cook.length ? [{ phase: 'cook' as const, items: cook }] : []),
    ];
  });

  public readonly cookCount = computed(() => this.userState().ratings.length);
  public readonly avgRating = computed(() => {
    const list = this.userState().ratings;
    if (!list.length) return null;
    const sum = list.reduce((a, e) => a + e.rating, 0);
    return Math.round((sum / list.length) * 10) / 10;
  });

  public readonly currentServings = computed(() => {
    const r = this.recipe();
    if (!r) return 0;
    return Math.round(r.baseServings * this.servingMultiplier());
  });

  public readonly isInShopping = computed(() => {
    const r = this.recipe();
    return r ? this.state.activeRecipeIds().has(r.id) : false;
  });

  public readonly hasPantryItems = computed(() => this.pantry.items().length > 0);

  public readonly missingIngredients = computed<string[]>(() => {
    if (!this.hasPantryItems()) return [];
    const keys = this.pantry.byKey();
    const out: string[] = [];
    for (const section of this.effectiveSections()) {
      for (const it of section.items) {
        if (!it.isRemoved && !keys.has(it.key)) out.push(it.name);
      }
    }
    return out;
  });

  public toggleShopping(): void {
    const r = this.recipe();
    if (r) void this.state.toggleShoppingRecipe(r.id);
  }

  public incServings(): void {
    this.setServings(this.currentServings() + 1);
  }

  public decServings(): void {
    this.setServings(Math.max(1, this.currentServings() - 1));
  }

  private setServings(target: number): void {
    const r = this.recipe();
    if (!r) return;
    this.state.setServingMultiplier(r.id, target / r.baseServings);
  }

  public logCook(): void {
    const r = this.recipe();
    if (!r) return;
    this.dialog
      .open(LogCookDialogComponent, { data: { recipeLabel: r.label } })
      .afterClosed()
      .subscribe((result: LogCookResult | undefined) => {
        if (result) this.state.logCook(r.id, result.rating, result.note);
      });
  }

  public deleteCook(index: number): void {
    const r = this.recipe();
    if (r) this.state.deleteCookEntry(r.id, index);
  }

  public editIngredient(it: EffectiveIngredient): void {
    const r = this.recipe();
    if (!r) return;
    const data: EditIngredientDialogData = { name: it.name, current: it.raw };
    this.dialog
      .open(EditIngredientDialogComponent, { data })
      .afterClosed()
      .subscribe((result) => {
        if (result === undefined) return;
        if (result === null) this.state.clearIngredientOverride(r.id, it.key);
        else this.state.overrideIngredient(r.id, it.key, result);
      });
  }

  public resetIngredient(key: IngredientKey): void {
    const r = this.recipe();
    if (r) this.state.clearIngredientOverride(r.id, key);
  }

  public toggleIngredientRemoved(key: IngredientKey): void {
    const r = this.recipe();
    if (r) this.state.toggleIngredientRemoved(r.id, key);
  }

  public async deleteRecipe(): Promise<void> {
    const r = this.recipe();
    if (!r) return;
    if (!confirm(`Delete "${r.label}"? This cannot be undone.`)) return;
    await this.author.remove(r.id);
    this.router.navigate(['/recipes']);
  }

  public backToList(): void {
    this.router.navigate(['/recipes']);
  }

  private toEffective(
    it: Ingredient,
    mult: number,
    overrides: Record<string, { qty?: number; unit?: string; raw?: string }>,
    removed: Set<string>,
  ): EffectiveIngredient {
    const key = normaliseName(it.name);
    const ovr = overrides[key];
    const qty = ovr?.qty ?? it.qty;
    const unit = ovr?.unit ?? it.unit;
    const raw = ovr?.raw ?? it.raw;
    let display: string;
    let conversion: string | null = null;
    if (qty != null && unit) {
      const scaled = Math.round(qty * mult * 100) / 100;
      display = `${scaled} ${unit}`;
      const conv = convertToMetric(scaled, unit);
      if (conv) conversion = formatConversion(conv);
    } else if (qty != null) {
      display = `${Math.round(qty * mult * 100) / 100}`;
    } else if (raw) {
      display = raw;
    } else {
      display = '';
    }
    return {
      key,
      name: it.name,
      display,
      conversion,
      isOverridden: !!ovr,
      isRemoved: removed.has(key),
      raw: { qty, unit, raw },
    };
  }
}
