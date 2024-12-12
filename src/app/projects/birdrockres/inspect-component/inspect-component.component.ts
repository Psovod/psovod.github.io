import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { ProjectService } from '../../../shared/services/project.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-inspect-component',
  imports: [MaterialModule, CommonModule],
  templateUrl: './inspect-component.component.html',
  styleUrl: './inspect-component.component.scss',
})
export class InspectComponentComponent {
  private router = inject(Router);
  public projectService: ProjectService = inject(ProjectService);
  showCode = false;
  view: 'mobile' | 'desktop' = 'desktop';
  codeForHighlight = `export class SuperUser {
    name: string;
  
    contructor(name: string) {
      this.name = name;
    }
  }`;
  codeSnippet = `
    export class TabExampleComponent {
            tabs = ['Tab 1', 'Tab 2'];
          }`;

  toggleCode() {
    this.showCode = !this.showCode;
  }
  goBack() {
    this.router.navigate(['/projects/birdrockres']);
  }
  changeView() {
    this.view = this.view === 'desktop' ? 'mobile' : 'desktop';
  }
}
