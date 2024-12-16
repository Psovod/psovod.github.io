import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { _Component, ProjectService } from '../../shared/services/project.service';
import { BIRDROCKRES_DESKTOP_COMPONENTS, BIRDROCKRES_MOBILE_COMPONENTS } from './_components/components';

@Component({
  selector: 'app-project',
  imports: [MaterialModule, CommonModule, RouterModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent {
  private projectService: ProjectService = inject(ProjectService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  public components!: Array<_Component>;

  constructor() {
    switch (this.route.snapshot.paramMap.get('project')) {
      case 'birdrockres-desktop':
        this.components = BIRDROCKRES_DESKTOP_COMPONENTS;
        break;
      case 'birdrockres-mobile':
        this.components = BIRDROCKRES_MOBILE_COMPONENTS;
        break;
      case 'nbazar':
        this.components = [];
        break;
      case 'bagrak':
        this.components = [];
        break;
      default:
        this.components = [];
    }
  }
  openComponent(component: _Component) {
    this.projectService.component = component;
    this.router.navigate([`/projects/${this.route.snapshot.paramMap.get('project')}/component`]);
  }
}
