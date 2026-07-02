import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '../auth/auth.service';
import { tap, catchError, of, EMPTY } from 'rxjs';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    in_app: boolean;
  };
  dashboard: {
    default_view: string;
    items_per_page: number;
  };
}

@Injectable({ providedIn: 'root' })
export class UserStore {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private _preferences = signal<UserPreferences>({
    theme: 'system',
    language: 'es',
    notifications: { email: true, push: true, in_app: true },
    dashboard: { default_view: 'grid', items_per_page: 20 }
  });
  private _loading = signal(false);

  readonly preferences = this._preferences.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly theme = computed(() => this._preferences().theme);
  readonly language = computed(() => this._preferences().language);

  async loadPreferences(): Promise<void> {
    if (!this.auth.isAuthenticated()) return;

    this._loading.set(true);
    try {
      const prefs = await this.http
        .get<UserPreferences>(`${environment.apiUrl}/users/preferences`)
        .pipe(
          catchError(() => of(this._preferences()))
        )
        .toPromise();

      if (prefs) {
        this._preferences.set({ ...this._preferences(), ...prefs });
        this.applyTheme(prefs.theme);
      }
    } finally {
      this._loading.set(false);
    }
  }

  async updatePreferences(partial: Partial<UserPreferences>): Promise<void> {
    const current = this._preferences();
    const updated = { ...current, ...partial };

    try {
      await this.http
        .patch<UserPreferences>(`${environment.apiUrl}/users/preferences`, partial)
        .toPromise();

      this._preferences.set(updated);
      if (partial.theme) this.applyTheme(partial.theme);
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  private applyTheme(theme: 'light' | 'dark' | 'system'): void {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  }

  toggleTheme(): void {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const current = this._preferences().theme;
    const next = themes[(themes.indexOf(current) + 1) % themes.length];
    this.updatePreferences({ theme: next });
  }
}