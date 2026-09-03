import { Injectable, signal } from '@angular/core';

/**
 * Controls whether the public acreditacion-pena form at /acreditacion-pena is visible.
 * Persisted in localStorage so the setting survives page reloads.
 * Admins toggle this from the admin panel config tab.
 * Default: 'true' (open) — if no value exists, the form is open.
 */
@Injectable({ providedIn: 'root' })
export class AcreditacionVisibilityService {
  private static readonly STORAGE_KEY = 'acreditacion_pena_visible';

  /** `true` = form visible, `false` = form hidden (closed). */
  publicVisible = signal<boolean>(AcreditacionVisibilityService.loadInitial());

  toggle(): void {
    this.publicVisible.update(v => {
      const next = !v;
      localStorage.setItem(AcreditacionVisibilityService.STORAGE_KEY, String(next));
      return next;
    });
  }

  show(): void {
    this.publicVisible.set(true);
    localStorage.setItem(AcreditacionVisibilityService.STORAGE_KEY, 'true');
  }

  hide(): void {
    this.publicVisible.set(false);
    localStorage.setItem(AcreditacionVisibilityService.STORAGE_KEY, 'false');
  }

  isOpen(): boolean {
    return this.publicVisible();
  }

  private static loadInitial(): boolean {
    try {
      const val = localStorage.getItem(this.STORAGE_KEY);
      return val !== 'false';
    } catch {
      return true;
    }
  }
}
