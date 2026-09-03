import { Injectable, signal } from '@angular/core';

/**
 * Controls whether the public inscription form at /inscripcion is visible.
 * Persisted in localStorage so the setting survives page reloads.
 * Admins toggle this from the admin panel config tab.
 * Default: 'true' (open) — if no value exists, inscriptions are open.
 */
@Injectable({ providedIn: 'root' })
export class InscriptionVisibilityService {
  private static readonly STORAGE_KEY = 'inscription_public_visible';

  /** `true` = form visible, `false` = form hidden (inscriptions closed). */
  publicVisible = signal<boolean>(InscriptionVisibilityService.loadInitial());

  toggle(): void {
    this.publicVisible.update(v => {
      const next = !v;
      localStorage.setItem(InscriptionVisibilityService.STORAGE_KEY, String(next));
      return next;
    });
  }

  show(): void {
    this.publicVisible.set(true);
    localStorage.setItem(InscriptionVisibilityService.STORAGE_KEY, 'true');
  }

  hide(): void {
    this.publicVisible.set(false);
    localStorage.setItem(InscriptionVisibilityService.STORAGE_KEY, 'false');
  }

  isOpen(): boolean {
    return this.publicVisible();
  }

  private static loadInitial(): boolean {
    try {
      const val = localStorage.getItem(this.STORAGE_KEY);
          // Default to true (open) if no value exists
      return val !== 'false';
    } catch {
      return true;
    }
  }
}
