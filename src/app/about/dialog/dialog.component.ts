import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { TranslatePipe } from '@ngx-translate/core';
import { Language } from '../../app.component';
import { MatDialogRef } from '@angular/material/dialog';
interface DialogLanguage {
  cs: string;
  en: string;
  title: string;
  content: string;
  close: string;
}
@Component({
  selector: 'app-dialog',
  imports: [MaterialModule, TranslatePipe],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  public dialogLanguage: DialogLanguage = {
    cs: 'app.about.dialog.cs',
    en: 'app.about.dialog.en',
    title: 'app.about.dialog.title',
    content: 'app.about.dialog.content',
    close: 'app.about.dialog.close',
  };

  constructor() {}
  private dialog = inject(MatDialogRef);
  onSelectLanguage(lang: Language) {
    this.dialog.close(lang);
  }
}
