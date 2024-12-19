import { Routes } from '@angular/router';
import { ProjectsComponent } from './projects/projects.component';
import { InspectComponentComponent } from './projects/birdrockres/inspect-component/inspect-component.component';
import { ProjectComponent } from './projects/birdrockres/project.component';
import { AboutComponent } from './about/about.component';

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
    path: '**',
    redirectTo: 'projects',
  },
];
