import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../material/material.module';
import { RecipeCatalogService } from '../services/recipe-catalog.service';
import {
  RecipeAuthorService,
  RecipeDraft,
  RecipeDraftStep,
  RecipeDraftStepTimer,
} from '../services/recipe-author.service';
import { ImageUploadService } from '../services/image-upload.service';
import { COUNTABLE_UNITS, RecipeColorKey, StepPhase } from '../models/recipe.types';
import { ImportRecipeDialogComponent } from '../dialogs/import-recipe-dialog.component';

const COLORS: RecipeColorKey[] = ['mustard', 'terracotta', 'burgundy', 'sage', 'slate', 'plum'];

const COLOR_HEX: Record<RecipeColorKey, string> = {
  mustard:   '#b8840a',
  terracotta:'#c4512a',
  burgundy:  '#7a2040',
  sage:      '#4a6741',
  slate:     '#2c5f6e',
  plum:      '#8b4f9e',
};

interface IngredientRefOption {
  ref: string;
  label: string;
}

@Component({
  selector: 'app-recipe-edit',
  imports: [CommonModule, FormsModule, MaterialModule, TranslatePipe],
  templateUrl: './recipe-edit.component.html',
  styleUrl: './recipe-edit.component.scss',
})
export class RecipeEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  protected readonly catalog = inject(RecipeCatalogService);
  private readonly author = inject(RecipeAuthorService);
  private readonly images = inject(ImageUploadService);

  protected readonly colors = COLORS;
  protected readonly units = COUNTABLE_UNITS;

  private readonly paramMap = toSignal(this.route.paramMap);

  public readonly isEditing = computed(() => !!this.paramMap()?.get('id'));

  public readonly draft = signal<RecipeDraft>(this.author.emptyDraft());
  public readonly saving = signal(false);
  public readonly uploading = signal(false);
  public readonly error = signal<string | null>(null);

  /** Flat list of ingredient reference options for step pickers. */
  public readonly ingredientOptions = computed<IngredientRefOption[]>(() => {
    const d = this.draft();
    const out: IngredientRefOption[] = [];
    d.sections.forEach((section, si) => {
      section.items.forEach((item, ii) => {
        const name = item.name.trim();
        if (!name) return;
        out.push({
          ref: `draft:${si}:${ii}`,
          label: section.label ? `${section.label} — ${name}` : name,
        });
      });
    });
    return out;
  });

  constructor() {
    // When route id or catalog changes, load the target recipe into a draft.
    let loadedId: string | null = null;
    const sync = (): void => {
      const id = this.paramMap()?.get('id');
      if (!id) return;
      if (!this.catalog.loaded()) return;
      if (id === loadedId) return;
      const r = this.catalog.byId().get(id);
      if (r) {
        this.draft.set(this.author.toDraft(r));
        loadedId = id;
      }
    };
    // Using effect would be cleaner; simple approach: subscribe to route paramMap + catalog.loaded via watchers.
    queueMicrotask(sync);
    // Re-run when catalog loads.
    const timer = setInterval(() => {
      if (this.catalog.loaded()) {
        sync();
        clearInterval(timer);
      }
    }, 100);
  }

  public genId(label: string): string {
    const base = label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 32);
    if (!base) return `r-${Date.now()}`;
    // Ensure uniqueness by appending short hash if id already exists.
    const existing = new Set(this.catalog.recipes().map((r) => r.id));
    if (!existing.has(base)) return base;
    return `${base}-${Date.now().toString(36).slice(-4)}`;
  }

  public addSection(): void {
    this.draft.update((d) => ({
      ...d,
      sections: [...d.sections, { label: null, items: [] }],
    }));
  }

  public removeSection(si: number): void {
    this.draft.update((d) => ({
      ...d,
      sections: d.sections.filter((_, i) => i !== si),
    }));
  }

  public addIngredient(si: number): void {
    this.draft.update((d) => {
      const sections = d.sections.map((s, i) =>
        i === si ? { ...s, items: [...s.items, { name: '' }] } : s,
      );
      return { ...d, sections };
    });
  }

  public removeIngredient(si: number, ii: number): void {
    this.draft.update((d) => {
      const sections = d.sections.map((s, i) =>
        i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s,
      );
      return { ...d, sections };
    });
  }

  public addStep(phase: StepPhase): void {
    this.draft.update((d) => {
      const step: RecipeDraftStep = {
        phase,
        order: d.steps.length,
        text: '',
        ingredientRefs: [],
        timers: [],
      };
      return { ...d, steps: [...d.steps, step] };
    });
  }

  public removeStep(idx: number): void {
    this.draft.update((d) => ({
      ...d,
      steps: d.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i })),
    }));
  }

  public moveStep(idx: number, dir: -1 | 1): void {
    this.draft.update((d) => {
      const steps = [...d.steps];
      const target = idx + dir;
      if (target < 0 || target >= steps.length) return d;
      [steps[idx], steps[target]] = [steps[target], steps[idx]];
      return { ...d, steps: steps.map((s, i) => ({ ...s, order: i })) };
    });
  }

  public toggleStepIngredient(idx: number, ref: string): void {
    this.draft.update((d) => {
      const steps = d.steps.map((s, i) => {
        if (i !== idx) return s;
        const has = s.ingredientRefs.includes(ref);
        return {
          ...s,
          ingredientRefs: has ? s.ingredientRefs.filter((r) => r !== ref) : [...s.ingredientRefs, ref],
        };
      });
      return { ...d, steps };
    });
  }

  public addTimer(stepIdx: number): void {
    this.draft.update((d) => {
      const steps = d.steps.map((s, i) =>
        i === stepIdx
          ? { ...s, timers: [...s.timers, { label: '', minutes: 5 } as RecipeDraftStepTimer] }
          : s,
      );
      return { ...d, steps };
    });
  }

  public removeTimer(stepIdx: number, timerIdx: number): void {
    this.draft.update((d) => {
      const steps = d.steps.map((s, i) =>
        i === stepIdx
          ? { ...s, timers: s.timers.filter((_, j) => j !== timerIdx) }
          : s,
      );
      return { ...d, steps };
    });
  }

  public stepsForPhase(phase: StepPhase): { step: RecipeDraftStep; idx: number }[] {
    const out: { step: RecipeDraftStep; idx: number }[] = [];
    this.draft().steps.forEach((step, idx) => {
      if (step.phase === phase) out.push({ step, idx });
    });
    return out;
  }

  public async onImagePicked(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      this.uploading.set(true);
      this.error.set(null);
      const id = this.draft().id || this.genId(this.draft().label || 'recipe');
      const url = await this.images.uploadRecipeImage(file, id);
      this.draft.update((d) => ({ ...d, id, thumb: url }));
    } catch (e) {
      this.error.set(toMsg(e));
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  public removeImage(): void {
    this.draft.update((d) => ({ ...d, thumb: undefined }));
  }

  public async save(): Promise<void> {
    const d = this.draft();
    if (!d.label.trim()) {
      this.error.set('Please enter a name.');
      return;
    }
    try {
      this.saving.set(true);
      this.error.set(null);
      const id = d.id || this.genId(d.label);
      const finalDraft: RecipeDraft = {
        ...d,
        id,
        steps: d.steps.map((s, i) => ({ ...s, order: i })),
      };
      await this.author.save(finalDraft);
      this.router.navigate(['/recipes', id]);
    } catch (e) {
      this.error.set(toMsg(e));
    } finally {
      this.saving.set(false);
    }
  }

  public cancel(): void {
    const id = this.paramMap()?.get('id');
    if (id) this.router.navigate(['/recipes', id]);
    else this.router.navigate(['/recipes']);
  }

  public updateLabel(v: string): void {
    this.draft.update((d) => ({ ...d, label: v }));
  }
  public updateColor(v: RecipeColorKey): void {
    this.draft.update((d) => ({ ...d, color: v }));
  }
  public updateEmoji(v: string): void {
    this.draft.update((d) => ({ ...d, emoji: v || undefined }));
  }
  public updateExternalUrl(v: string): void {
    this.draft.update((d) => ({ ...d, externalUrl: v || undefined }));
  }
  public updateBaseServings(v: number): void {
    this.draft.update((d) => ({ ...d, baseServings: Math.max(1, Math.round(v || 1)) }));
  }
  public updateSectionLabel(si: number, v: string): void {
    this.draft.update((d) => ({
      ...d,
      sections: d.sections.map((s, i) => (i === si ? { ...s, label: v || null } : s)),
    }));
  }
  public updateIngredient(si: number, ii: number, patch: Partial<{ name: string; qty?: number; unit?: string; raw?: string }>): void {
    this.draft.update((d) => {
      const sections = d.sections.map((s, i) => {
        if (i !== si) return s;
        return {
          ...s,
          items: s.items.map((item, j) => (j === ii ? { ...item, ...patch } : item)),
        };
      });
      return { ...d, sections };
    });
  }
  public updateStepText(idx: number, v: string): void {
    this.draft.update((d) => ({
      ...d,
      steps: d.steps.map((s, i) => (i === idx ? { ...s, text: v } : s)),
    }));
  }
  public updateTimer(stepIdx: number, timerIdx: number, patch: Partial<RecipeDraftStepTimer>): void {
    this.draft.update((d) => ({
      ...d,
      steps: d.steps.map((s, i) =>
        i === stepIdx
          ? {
              ...s,
              timers: s.timers.map((t, j) => (j === timerIdx ? { ...t, ...patch } : t)),
            }
          : s,
      ),
    }));
  }

  public updateTimerMinutes(stepIdx: number, timerIdx: number, raw: unknown): void {
    const n = Math.max(1, Math.round(Number(raw) || 1));
    this.updateTimer(stepIdx, timerIdx, { minutes: n });
  }

  public colorHex(c: RecipeColorKey): string {
    return COLOR_HEX[c];
  }

  public openImport(): void {
    this.dialog
      .open(ImportRecipeDialogComponent, { data: {}, width: '600px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((result: RecipeDraft | undefined) => {
        if (result) this.draft.set(result);
      });
  }
}

function toMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
