import { Routes } from '@angular/router';
import { ProjectsComponent } from './projects/projects.component';
import { AboutComponent } from './about/about.component';
import { ProjectComponent } from './projects/project/project.component';
import { InspectComponentComponent } from './projects/project/inspect-component/inspect-component.component';

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
    redirectTo: 'about',
  },
];
