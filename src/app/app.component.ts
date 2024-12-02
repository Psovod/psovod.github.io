import { Component, HostListener, inject, signal } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [MaterialModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  GITHUB_URL = 'https://github.com/Psovod';
  LINKEDIN_URL = 'https://www.linkedin.com/in/pavlikson';
  lastScrollTop = 0;
  toolbarVisible = signal(true);
  constructor() {
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    iconRegistry.addSvgIcon('github', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/github-mark.svg'));
    iconRegistry.addSvgIcon('linkedin', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/linkedin.svg'));
    iconRegistry.addSvgIcon('angular', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/angular.svg'));
    iconRegistry.addSvgIcon('typescript', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/angular.svg'));
    iconRegistry.addSvgIcon('html', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/angular.svg'));
    iconRegistry.addSvgIcon('tailwind', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/angular.svg'));
    iconRegistry.addSvgIcon('material', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/angular.svg'));
    iconRegistry.addSvgIcon('css', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/angular.svg'));
  }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScroll = window.scrollY || document.documentElement.scrollTop;
    if (currentScroll > this.lastScrollTop) {
      // Scrolling down
      this.toolbarVisible.set(false);
    } else {
      // Scrolling up
      this.toolbarVisible.set(true);
    }
    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
  }
}
