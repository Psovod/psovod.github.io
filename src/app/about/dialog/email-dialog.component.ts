import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-email-dialog',
  imports: [MaterialModule],
  template: `
    <h2 mat-dialog-title>E-mail</h2>
    <mat-dialog-content>
      <div class="flex items-center gap-4 py-2 px-4 border border-solid border-gray-300 rounded-lg">
        <span class="text-lg">{{ data.email }}</span>
        <button mat-icon-button (click)="copyEmail()">
          <mat-icon>{{ copied ? 'check' : 'content_copy' }}</mat-icon>
        </button>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close cdkFocusInitial>Close</button>
    </mat-dialog-actions>
  `,
})
export class EmailDialogComponent {
  public data: { email: string } = inject(MAT_DIALOG_DATA);
  public copied = false;

  copyEmail(): void {
    navigator.clipboard.writeText(this.data.email);
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }
}
