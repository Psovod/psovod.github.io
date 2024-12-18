import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { Project, projects } from '../shared/data/projects';

@Component({
  selector: 'app-projects',
  imports: [MaterialModule, RouterModule, CommonModule, TranslateDirective, TranslatePipe],
  templateUrl: './projects.component.html',
  animations: [
    trigger('textRollout', [
      state(
        'collapsed',
        style({
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': 1,
          height: '20px',
          transform: 'translateY(-10px)',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
          transform: 'translateY(0)',
        })
      ),
      transition('collapsed <=> expanded', [animate('0.3s ease')]),
    ]),
  ],
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  public projects: Array<Project> = projects;
}
