import { Component, effect, ElementRef, inject, signal, ViewChild, WritableSignal } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { ProjectService } from '../../../shared/services/project.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NamePipe } from './pipes/sanitize-html.pipe';
@Component({
  selector: 'app-inspect-component',
  imports: [MaterialModule, CommonModule, NamePipe],
  templateUrl: './inspect-component.component.html',
  styleUrl: './inspect-component.component.scss',
})
export class InspectComponentComponent {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  private router = inject(Router);
  public projectService: ProjectService = inject(ProjectService);
  public currentViewMode: WritableSignal<'desktop' | 'mobile'> = signal('desktop');
  showCode = false;
  constructor() {
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
    this.router.navigate(['/projects/birdrockres']);
  }
  changeView() {
    this.currentViewMode.set(this.currentViewMode() === 'desktop' ? 'mobile' : 'desktop');
  }
  reloadVideo() {
    const video: HTMLVideoElement = this.videoPlayer?.nativeElement;
    if (video) video.load();
  }
}
