import { Component, effect, ElementRef, inject, signal, ViewChild, WritableSignal } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { OnlyView, ProjectService } from '../../../shared/services/project.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NamePipe } from './pipes/sanitize-html.pipe';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-inspect-component',
  imports: [MaterialModule, CommonModule, NamePipe, TranslatePipe],
  templateUrl: './inspect-component.component.html',
  styleUrl: './inspect-component.component.scss',
})
export class InspectComponentComponent {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  public projectService: ProjectService = inject(ProjectService);
  public currentViewMode: WritableSignal<OnlyView | null> = signal(null);
  showCode = false;
  constructor() {
    const component = this.projectService.component;
    if (component) this.setViewMode(component?._onlyView);

    effect(() => {
      this.currentViewMode();
      this.reloadVideo();
      // Add any additional logic you want to execute when the view mode changes
    });
  }
  toggleCode() {
    this.showCode = !this.showCode;
  }
  goBack() {
    this.router.navigate(['/projects/' + this.route.snapshot.paramMap.get('project')]);
  }
  changeView() {
    this.currentViewMode.set(this.currentViewMode() === 'desktop' ? 'mobile' : 'desktop');
  }
  reloadVideo() {
    const video: HTMLVideoElement = this.videoPlayer?.nativeElement;
    if (video) video.load();
  }
  private setViewMode(mode: OnlyView) {
    let newMode: OnlyView;
    switch (mode) {
      case 'both':
        newMode = 'desktop';
        break;
      case 'desktop':
        newMode = 'desktop';
        break;
      case 'mobile':
        newMode = 'mobile';
        break;
    }
    this.currentViewMode.set(newMode);
  }
}
