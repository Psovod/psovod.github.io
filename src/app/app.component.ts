import { Component, HostListener, inject, signal, WritableSignal } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { TranslateDirective, TranslatePipe, TranslateService } from '@ngx-translate/core';
import defaultLanguage from '../../public/i18n/cs.json';
import { PreferredThemeService } from './shared/services/preferred-theme.service';
import { HighlightLoader } from 'ngx-highlightjs';
type Language = 'en' | 'cs';
type Theme = 'dark' | 'light';
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
  colorMode: WritableSignal<Theme | null> = signal(null);
  language: WritableSignal<Language> = signal('en');
  constructor() {
    const browserLang = this.translate.getBrowserLang();
    this.colorMode.set(this.preferredTheme.isDark() ? 'dark' : 'light');
    this.language.set(browserLang === 'cs' ? 'cs' : 'en');
    this.translate.setTranslation('cs', defaultLanguage);
    this.translate.addLangs(['cs', 'en']);
    this.translate.setDefaultLang(browserLang === 'cs' ? 'cs' : 'en');
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
    this.language.set(this.language() === 'en' ? 'cs' : 'en');
    this.translate.use(this.language());
  }
  useMode(): void {
    this.colorMode.set(this.colorMode() === 'dark' ? 'light' : 'dark');
    this.updateTheme();
  }
  private updateTheme(): void {
    const themeClass = this.colorMode() === 'dark' ? 'dark' : 'light';
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
