import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MaterialModule } from '../../material/material.module';
import { COUNTABLE_UNITS } from '../models/recipe.types';
import { IngredientOverride } from '../models/recipe.types';

export interface EditIngredientDialogData {
  name: string;
  current: {
    qty?: number;
    unit?: string;
    raw?: string;
  };
}

@Component({
  selector: 'app-edit-ingredient-dialog',
  imports: [CommonModule, FormsModule, MaterialModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ 'app.recipes.dialog.ing.title' | translate }}</h2>
    <mat-dialog-content>
      <p class="subject">{{ data.name }}</p>

      <label class="field">
        <span>{{ 'app.recipes.dialog.ing.mode' | translate }}</span>
        <select [(ngModel)]="mode">
          <option value="countable">{{ 'app.recipes.dialog.ing.modeCountable' | translate }}</option>
          <option value="free">{{ 'app.recipes.dialog.ing.modeFree' | translate }}</option>
        </select>
      </label>

      @if (mode === 'countable') {
        <div class="row">
          <label class="field grow">
            <span>{{ 'app.recipes.dialog.ing.qty' | translate }}</span>
            <input type="number" step="0.1" min="0" [(ngModel)]="qty" />
          </label>
          <label class="field">
            <span>{{ 'app.recipes.dialog.ing.unit' | translate }}</span>
            <select [(ngModel)]="unit">
              @for (u of units; track u) {
                <option [value]="u">{{ u }}</option>
              }
            </select>
          </label>
        </div>
      } @else {
        <label class="field">
          <span>{{ 'app.recipes.dialog.ing.freeText' | translate }}</span>
          <input type="text" [(ngModel)]="raw" />
        </label>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="reset()">{{ 'app.recipes.dialog.ing.reset' | translate }}</button>
      <button mat-button (click)="cancel()">{{ 'app.recipes.dialog.ing.cancel' | translate }}</button>
      <button mat-flat-button color="primary" (click)="save()">
        {{ 'app.recipes.dialog.ing.save' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .subject { opacity: 0.7; margin: 0 0 0.5rem; }
      .field { display: block; margin: 0.5rem 0; }
      .field > span { display: block; font-size: 12px; opacity: 0.7; margin-bottom: 4px; }
      input, select { width: 100%; padding: 6px 8px; border: 1px solid rgba(0,0,0,0.2); border-radius: 4px; font-family: inherit; }
      .row { display: flex; gap: 0.5rem; }
      .row .grow { flex: 1; }
    `,
  ],
})
export class EditIngredientDialogComponent {
  public readonly data = inject<EditIngredientDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<EditIngredientDialogComponent, IngredientOverride | null>);

  public readonly units = COUNTABLE_UNITS;
  public mode: 'countable' | 'free' = this.data.current.qty != null ? 'countable' : 'free';
  public qty = this.data.current.qty ?? 0;
  public unit = (this.data.current.unit as string) ?? 'g';
  public raw = this.data.current.raw ?? '';

  public save(): void {
    if (this.mode === 'countable') {
      this.ref.close({ qty: this.qty, unit: this.unit });
    } else {
      this.ref.close({ raw: this.raw });
    }
  }

  public reset(): void {
    this.ref.close(null);
  }

  public cancel(): void {
    this.ref.close();
  }
}
