import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MaterialModule } from '../../material/material.module';
import { RecipeDraft } from '../services/recipe-author.service';
import { parseRecipeText, ParseResult } from '../utils/recipe-text-parser';

const CHATGPT_PROMPT = `Format the following recipe in this exact structure. Output ONLY the formatted text, nothing else.

# Name: [recipe name]
# Servings: [number of servings]
# Color: [pick one: mustard, terracotta, burgundy, sage, slate, plum]
# Emoji: [single relevant emoji]

## Ingredients

- [quantity unit]: [ingredient name — name only, no prep notes like "finely diced" or "seeded"]
- [free text like "to taste"]: [ingredient name]

## Prep

1. [step text. Use @ingredient name to reference ingredients. Add [timer: Label, Nmin] for timed actions.]
2. ...

## Cook

1. [step text]
2. ...

---
[Paste your recipe text below this line]`;

@Component({
  selector: 'app-import-recipe-dialog',
  imports: [CommonModule, FormsModule, MaterialModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ 'app.recipes.dialog.import.title' | translate }}</h2>
    <mat-dialog-content>
      <p class="hint">{{ 'app.recipes.dialog.import.hint' | translate }}</p>

      <mat-expansion-panel class="prompt-panel">
        <mat-expansion-panel-header>
          <mat-panel-title>{{ 'app.recipes.dialog.import.promptLabel' | translate }}</mat-panel-title>
        </mat-expansion-panel-header>
        <div class="prompt-body">
          <pre class="prompt-text">{{ chatGptPrompt }}</pre>
          <button mat-icon-button class="copy-btn" (click)="copyPrompt()" [matTooltip]="copied() ? 'Copied!' : 'Copy'">
            <mat-icon>{{ copied() ? 'check' : 'content_copy' }}</mat-icon>
          </button>
        </div>
      </mat-expansion-panel>

      <textarea
        class="paste-area"
        rows="14"
        [(ngModel)]="rawText"
        placeholder="# Name: My Recipe&#10;## Ingredients&#10;- 400 g: pasta&#10;## Cook&#10;1. Boil @pasta."
      ></textarea>

      <button mat-stroked-button (click)="parse()" class="parse-btn">
        <mat-icon>play_arrow</mat-icon>
        {{ 'app.recipes.dialog.import.parse' | translate }}
      </button>

      @if (parseResult(); as result) {
        @if (result.errors.length) {
          <div class="errors">
            @for (e of result.errors; track e.line) {
              <div class="error-line">Line {{ e.line }}: {{ e.message }}</div>
            }
          </div>
        }
        @if (parsed()?.label) {
          <div class="preview">
            {{ 'app.recipes.dialog.import.preview' | translate: {
              name: parsed()!.label,
              sections: parsed()!.sections.length,
              steps: parsed()!.steps.length
            } }}
          </div>
          <mat-expansion-panel class="raw-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>Raw parsed data</mat-panel-title>
            </mat-expansion-panel-header>
            <pre class="raw-text">{{ parsed() | json }}</pre>
          </mat-expansion-panel>
        }
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">{{ 'app.recipes.dialog.import.cancel' | translate }}</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="!parsed()?.label"
        (click)="import()"
      >
        <mat-icon>download</mat-icon>
        {{ 'app.recipes.dialog.import.import' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .hint { font-size: 13px; opacity: 0.7; margin: 0 0 0.75rem; }
      .prompt-panel { margin-bottom: 1rem; font-size: 13px; }
      .prompt-body { position: relative; }
      .prompt-text { font-size: 12px; white-space: pre-wrap; word-break: break-word; margin: 0; line-height: 1.5; padding-right: 2.5rem; }
      .copy-btn { position: absolute; top: 0; right: 0; }
      .paste-area { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid rgba(0,0,0,0.2); border-radius: 4px; font-family: monospace; font-size: 13px; resize: vertical; }
      .parse-btn { margin: 0.5rem 0; }
      .errors { background: rgba(211,47,47,0.08); border: 1px solid rgba(211,47,47,0.3); border-radius: 4px; padding: 8px 12px; margin-top: 0.5rem; }
      .error-line { font-size: 12px; color: #c62828; line-height: 1.6; }
      .preview { background: rgba(46,125,50,0.08); border: 1px solid rgba(46,125,50,0.3); border-radius: 4px; padding: 8px 12px; margin-top: 0.5rem; font-size: 13px; color: #1b5e20; }
      .raw-panel { margin-top: 0.5rem; font-size: 13px; }
      .raw-text { font-size: 11px; white-space: pre-wrap; word-break: break-all; margin: 0; line-height: 1.5; max-height: 300px; overflow-y: auto; }
    `,
  ],
})
export class ImportRecipeDialogComponent {
  public readonly data = inject(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ImportRecipeDialogComponent, RecipeDraft>);

  public readonly chatGptPrompt = CHATGPT_PROMPT;
  public rawText = '';
  public readonly parseResult = signal<ParseResult | null>(null);
  public readonly parsed = computed(() => this.parseResult()?.draft ?? null);
  public readonly copied = signal(false);

  public copyPrompt(): void {
    navigator.clipboard.writeText(CHATGPT_PROMPT).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  public parse(): void {
    this.parseResult.set(parseRecipeText(this.rawText));
  }

  public import(): void {
    const draft = this.parsed();
    if (draft?.label) this.ref.close(draft);
  }

  public cancel(): void {
    this.ref.close();
  }
}
