import { Injectable, signal } from '@angular/core';

/**
 * Controls whether the "Sorteo en Vivo" link appears in the public navbar.
 * Persisted in localStorage so the setting survives page reloads.
 * Admins toggle this from the dashboard.
 */
@Injectable({ providedIn: 'root' })
export class SorteoVisibilityService {
  private static readonly STORAGE_KEY = 'sorteo_live_visible';

  /** `true` = show link, `false` = hide link. Default `false` so it's hidden until admin enables. */
  sorteoLiveVisible = signal<boolean>(SorteoVisibilityService.loadInitial());

  toggle(): void {
    this.sorteoLiveVisible.update(v => {
      const next = !v;
      localStorage.setItem(SorteoVisibilityService.STORAGE_KEY, String(next));
      return next;
    });
  }

  show(): void {
    this.sorteoLiveVisible.set(true);
    localStorage.setItem(SorteoVisibilityService.STORAGE_KEY, 'true');
  }

  hide(): void {
    this.sorteoLiveVisible.set(false);
    localStorage.setItem(SorteoVisibilityService.STORAGE_KEY, 'false');
  }

  private static loadInitial(): boolean {
    try {
      return localStorage.getItem(this.STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
