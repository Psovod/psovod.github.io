import { Routes } from '@angular/router';
import { BirdrockresComponent } from './projects/birdrockres/birdrockres.component';
import { ProjectsComponent } from './projects/projects.component';
import { InspectComponentComponent } from './projects/birdrockres/inspect-component/inspect-component.component';

export const routes: Routes = [
  {
    path: 'projects',
    component: ProjectsComponent,
  },
  {
    path: 'projects/birdrockres',
    component: BirdrockresComponent,
  },
  {
    path: 'projects/birdrockres/component',
    component: InspectComponentComponent,
  },
  {
    path: '**',
    redirectTo: 'projects',
  },
];
