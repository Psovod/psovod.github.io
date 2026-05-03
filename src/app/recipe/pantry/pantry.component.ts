import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MaterialModule } from '../../material/material.module';
import { COUNTABLE_UNITS, normaliseName } from '../models/recipe.types';
import { PantryItem } from '../models/pantry.types';
import { PantryService } from '../services/pantry.service';

@Component({
  selector: 'app-pantry',
  imports: [CommonModule, FormsModule, MaterialModule, MatAutocompleteModule, TranslatePipe],
  templateUrl: './pantry.component.html',
  styleUrl: './pantry.component.scss',
})
export class PantryComponent {
  protected readonly pantry = inject(PantryService);
  protected readonly skeletonRows = [0, 1, 2, 3];
  protected readonly units = COUNTABLE_UNITS;

  public readonly nameSig = signal('');
  public readonly filteredNames = computed(() => {
    const q = this.nameSig().trim().toLowerCase();
    const taken = new Set(this.pantry.items().map((it) => it.ingredientKey));
    const options = this.pantry.recipeIngredientOptions().filter((o) => !taken.has(o.key));
    if (!q) return options.slice(0, 30);
    return options.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 30);
  });

  public get name(): string { return this.nameSig(); }
  public set name(v: string) { this.nameSig.set(v); }
  public qty: number | null = null;
  public unit = '';
  public price: number | null = null;
  public purchasedAt = '';
  public store = '';
  public saving = signal(false);

  public readonly editingId = signal<number | null>(null);
  public editName = '';
  public editQty: number | null = null;
  public editUnit = '';
  public editPrice: number | null = null;
  public editPurchasedAt = '';
  public editStore = '';

  public async addItem(): Promise<void> {
    const name = this.name.trim();
    if (!name) return;
    const key = normaliseName(name);
    // Require the name to exist as an ingredient in any recipe to keep pantry
    // keys aligned with what match logic can compare against.
    const known = this.pantry.recipeIngredientOptions().some((o) => o.key === key);
    if (!known) return;
    this.saving.set(true);
    try {
      await this.pantry.add({
        name,
        ingredientKey: key,
        qty: this.qty ?? undefined,
        unit: this.unit || undefined,
        price: this.price ?? undefined,
        purchasedAt: this.purchasedAt || undefined,
        store: this.store.trim() || undefined,
      });
      this.resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      this.saving.set(false);
    }
  }

  public startEdit(item: PantryItem): void {
    this.editingId.set(item.id);
    this.editName = item.name;
    this.editQty = item.qty ?? null;
    this.editUnit = item.unit ?? '';
    this.editPrice = item.price ?? null;
    this.editPurchasedAt = item.purchasedAt ?? '';
    this.editStore = item.store ?? '';
  }

  public async saveEdit(): Promise<void> {
    const id = this.editingId();
    if (id == null) return;
    const name = this.editName.trim();
    if (!name) return;
    await this.pantry.update(id, {
      name,
      ingredientKey: normaliseName(name),
      qty: this.editQty ?? undefined,
      unit: this.editUnit || undefined,
      price: this.editPrice ?? undefined,
      purchasedAt: this.editPurchasedAt || undefined,
      store: this.editStore.trim() || undefined,
    });
    this.editingId.set(null);
  }

  public cancelEdit(): void {
    this.editingId.set(null);
  }

  public async removeItem(id: number): Promise<void> {
    await this.pantry.remove(id);
  }

  public isKnownName(): boolean {
    const key = normaliseName(this.name.trim());
    if (!key) return false;
    return this.pantry.recipeIngredientOptions().some((o) => o.key === key);
  }

  private resetForm(): void {
    this.nameSig.set('');
    this.qty = null;
    this.unit = '';
    this.price = null;
    this.purchasedAt = '';
    this.store = '';
  }
}
