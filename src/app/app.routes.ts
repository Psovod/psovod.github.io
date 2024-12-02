import { Routes } from '@angular/router';
import { BirdrockresComponent } from './projects/birdrockres/birdrockres.component';
import { ProjectsComponent } from './projects/projects.component';

export const routes: Routes = [
  {
    path: 'projects',
    component: ProjectsComponent,
  },
  {
    path: 'projects/:id',
    component: BirdrockresComponent,
  },
  {
    path: '**',
    redirectTo: 'projects',
  },
];
