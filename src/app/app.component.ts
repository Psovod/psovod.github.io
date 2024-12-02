import { Component, HostListener, inject, signal, WritableSignal } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  imports: [MaterialModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private translate: TranslateService = inject(TranslateService);
  public name = 'Pavel';
  GITHUB_URL = 'https://github.com/Psovod';
  LINKEDIN_URL = 'https://www.linkedin.com/in/pavlikson';
  lastScrollTop = 0;
  toolbarVisible = signal(true);
  language: WritableSignal<'en' | 'cz'> = signal('en');
  constructor() {
    this.translate.addLangs(['cz', 'en']);
    this.translate.setDefaultLang('en');
    this.translate.use(this.translate.getBrowserLang() || 'en');
    const iconRegistry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    iconRegistry.addSvgIcon('github', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/github-mark.svg'));
    iconRegistry.addSvgIcon('linkedin', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/linkedin.svg'));
    iconRegistry.addSvgIcon('angular', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/angular.svg'));
    iconRegistry.addSvgIcon('ionic', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/ionic.svg'));
    iconRegistry.addSvgIcon('pwa', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/pwa.svg'));
    iconRegistry.addSvgIcon('angular_new', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/angular_new.svg'));
    iconRegistry.addSvgIcon('typescript', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/typescript.svg'));
    iconRegistry.addSvgIcon('javascript', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/javascript.svg'));
    iconRegistry.addSvgIcon('html', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/html.svg'));
    iconRegistry.addSvgIcon('tailwind', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/tailwind.svg'));
    iconRegistry.addSvgIcon('material', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/material.svg'));
    iconRegistry.addSvgIcon('css', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/css.svg'));
    iconRegistry.addSvgIcon('kotlin', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/kotlin.svg'));
    iconRegistry.addSvgIcon('swift', sanitizer.bypassSecurityTrustResourceUrl('../assets/icons/swift.svg'));
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
  useLanguage(): void {
    this.language.set(this.language() === 'en' ? 'cz' : 'en');
    this.translate.use(this.language());
  }
}
