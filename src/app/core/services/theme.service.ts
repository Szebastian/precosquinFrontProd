import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);

  private _theme = signal<Theme>('light');

  readonly theme = this._theme.asReadonly();
  readonly isDark = this._theme.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('precosquin-theme') as Theme | null;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = saved || (prefersDark ? 'dark' : 'light');
      this._theme.set(initial);
      this._apply(initial);

      effect(() => {
        const current = this._theme();
        this._apply(current);
        localStorage.setItem('precosquin-theme', current);
      });
    }
  }

  toggle(): void {
    this._theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  private _apply(_theme: Theme): void {
    // Dark mode is applied via .app-layout in main-layout.component, not on <html>
    // This prevents dark CSS variables from leaking into public pages (home, inscripcion)
  }
}
