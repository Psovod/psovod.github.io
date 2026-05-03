import { Routes } from '@angular/router';
import { RecipesShellComponent } from './shell/recipes-shell.component';
import { RecipeListComponent } from './list/recipe-list.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { RecipeDetailComponent } from './detail/recipe-detail.component';
import { RecipeEditComponent } from './edit/recipe-edit.component';
import { CookModeComponent } from './cook/cook-mode.component';
import { PantryComponent } from './pantry/pantry.component';
import { RecipeSettingsComponent } from './settings/settings.component';

export const RECIPE_ROUTES: Routes = [
  {
    path: '',
    component: RecipesShellComponent,
    children: [
      { path: '', component: RecipeListComponent, pathMatch: 'full' },
      { path: 'shopping-list', component: ShoppingListComponent },
      { path: 'storage', component: PantryComponent },
      { path: 'settings', component: RecipeSettingsComponent },
      { path: 'new', component: RecipeEditComponent },
      { path: ':id', component: RecipeDetailComponent },
      { path: ':id/edit', component: RecipeEditComponent },
      { path: ':id/cook', component: CookModeComponent },
    ],
  },
];
