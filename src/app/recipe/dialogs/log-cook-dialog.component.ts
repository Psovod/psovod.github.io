import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MaterialModule } from '../../material/material.module';

export interface LogCookDialogData {
  recipeLabel: string;
}

export interface LogCookResult {
  date: string;
  rating: number;
  note?: string;
}

@Component({
  selector: 'app-log-cook-dialog',
  imports: [CommonModule, FormsModule, MaterialModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ 'app.recipes.dialog.cook.title' | translate }}</h2>
    <mat-dialog-content>
      <p class="subject">{{ data.recipeLabel }}</p>

      <label class="field">
        <span>{{ 'app.recipes.dialog.cook.date' | translate }}</span>
        <input type="date" [(ngModel)]="date" />
      </label>

      <div class="field">
        <span>{{ 'app.recipes.dialog.cook.rating' | translate }}</span>
        <div class="stars">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <button mat-icon-button type="button" (click)="rating.set(i)">
              <mat-icon>{{ i <= rating() ? 'star' : 'star_border' }}</mat-icon>
            </button>
          }
        </div>
      </div>

      <label class="field">
        <span>{{ 'app.recipes.dialog.cook.note' | translate }}</span>
        <textarea rows="2" [(ngModel)]="note"></textarea>
      </label>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">{{ 'app.recipes.dialog.cook.cancel' | translate }}</button>
      <button mat-flat-button color="primary" (click)="save()">
        {{ 'app.recipes.dialog.cook.save' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .subject { opacity: 0.7; margin: 0 0 0.5rem; }
      .field { display: block; margin: 0.75rem 0; }
      .field > span { display: block; font-size: 12px; opacity: 0.7; margin-bottom: 4px; }
      input[type=date], textarea { width: 100%; padding: 6px 8px; border: 1px solid rgba(0,0,0,0.2); border-radius: 4px; font-family: inherit; }
      .stars { display: flex; gap: 2px; }
    `,
  ],
})
export class LogCookDialogComponent {
  public readonly data = inject<LogCookDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<LogCookDialogComponent, LogCookResult>);

  public readonly rating = signal(5);
  public date = new Date().toISOString().slice(0, 10);
  public note = '';

  public save(): void {
    this.ref.close({
      date: new Date(this.date).toISOString(),
      rating: this.rating(),
      note: this.note.trim() || undefined,
    });
  }

  public cancel(): void {
    this.ref.close();
  }
}
