import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MaterialModule } from '../../material/material.module';
import { RecipeStateService } from '../services/recipe-state.service';

@Component({
  selector: 'app-recipes-shell',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MaterialModule, TranslatePipe],
  templateUrl: './recipes-shell.component.html',
  styleUrl: './recipes-shell.component.scss',
})
export class RecipesShellComponent {
  private readonly state = inject(RecipeStateService);

  public exportAll(): void {
    const json = this.state.exportUserData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
