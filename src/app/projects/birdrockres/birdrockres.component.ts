import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { _Component, ProjectService } from '../../shared/services/project.service';
import { BIRDROCKRES_DESKTOP_COMPONENTS } from './_components/components';

@Component({
  selector: 'app-birdrockres',
  imports: [MaterialModule, CommonModule, RouterModule],
  templateUrl: './birdrockres.component.html',
  styleUrl: './birdrockres.component.scss',
})
export class BirdrockresComponent {
  private projectService: ProjectService = inject(ProjectService);
  private router: Router = inject(Router);
  public components: Array<_Component> = BIRDROCKRES_DESKTOP_COMPONENTS;

  openComponent(component: _Component) {
    this.projectService.component = component;
    this.router.navigate(['/projects/birdrockres/component']);
  }
}
