import { Routes } from '@angular/router';
import { ProjectsComponent } from './projects/projects.component';
import { AboutComponent } from './about/about.component';
import { ProjectComponent } from './projects/project/project.component';
import { InspectComponentComponent } from './projects/project/inspect-component/inspect-component.component';
import { RECIPE_ROUTES } from './recipe/recipe.routes';

export const routes: Routes = [
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'projects',
    component: ProjectsComponent,
  },
  {
    path: 'projects/:project',
    component: ProjectComponent,
  },
  {
    path: 'projects/:project/component',
    component: InspectComponentComponent,
  },
  {
    path: 'recipes',
    children: RECIPE_ROUTES,
  },
  {
    path: '**',
    redirectTo: 'about',
  },
];
