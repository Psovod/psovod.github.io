import { Component, HostListener, inject, signal, WritableSignal } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { TranslateDirective, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PreferredThemeService } from './shared/services/preferred-theme.service';
import { HighlightLoader } from 'ngx-highlightjs';
@Component({
  selector: 'app-root',
  imports: [MaterialModule, RouterModule, TranslateDirective, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private translate: TranslateService = inject(TranslateService);
  private preferredTheme: PreferredThemeService = inject(PreferredThemeService);
  private iconRegistry = inject(MatIconRegistry);
  private sanitizer = inject(DomSanitizer);
  private hljsLoader: HighlightLoader = inject(HighlightLoader);
  GITHUB_URL = 'https://github.com/Psovod';
  LINKEDIN_URL = 'https://www.linkedin.com/in/pavlikson';
  lastScrollTop = 0;
  toolbarVisible = signal(true);
  colorMode: WritableSignal<'dark_mode' | 'light_mode' | null> = signal(null);
  language: WritableSignal<'en' | 'cz'> = signal('en');
  constructor() {
    this.colorMode.set(this.preferredTheme.isDark() ? 'dark_mode' : 'light_mode');
    this.translate.addLangs(['cz', 'en']);
    this.translate.setDefaultLang(this.translate.getBrowserLang() || 'en');
    this.initIcons();
  }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScroll = window.scrollY || document.documentElement.scrollTop;
    if (currentScroll > this.lastScrollTop) {
      this.toolbarVisible.set(false);
    } else {
      this.toolbarVisible.set(true);
    }
    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }

  useLanguage(): void {
    this.language.set(this.language() === 'en' ? 'cz' : 'en');
    this.translate.use(this.language());
  }
  useMode(): void {
    this.colorMode.set(this.colorMode() === 'dark_mode' ? 'light_mode' : 'dark_mode');
    this.updateTheme();
  }
  private updateTheme(): void {
    const themeClass = this.colorMode() === 'dark_mode' ? 'dark' : 'light';
    this.hljsLoader.setTheme(themeClass === 'dark' ? 'styles/solarized-dark.css' : 'styles/solarized-light.css');
    document.documentElement.className = themeClass;
  }
  private initIcons(): void {
    const icons = [
      'github',
      'linkedin',
      'angular',
      'ionic',
      'pwa',
      'angular_new',
      'typescript',
      'javascript',
      'html',
      'tailwind',
      'material',
      'css',
      'kotlin',
      'swift',
      'docker',
      'vsfs',
    ];

    icons.forEach(icon => {
      this.iconRegistry.addSvgIcon(icon, this.sanitizer.bypassSecurityTrustResourceUrl(`icons/${icon}.svg`));
    });
  }
}
