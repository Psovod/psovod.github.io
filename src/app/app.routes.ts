import { Routes } from '@angular/router';
import { ProjectsComponent } from './projects/projects.component';
import { InspectComponentComponent } from './projects/birdrockres/inspect-component/inspect-component.component';
import { ProjectComponent } from './projects/birdrockres/project.component';

export const routes: Routes = [
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
    path: '**',
    redirectTo: 'projects',
  },
];
