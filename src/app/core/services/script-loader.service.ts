import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface ScriptStatus {
  loaded: boolean;
  error: boolean;
}

@Injectable({ providedIn: 'root' })
export class ScriptLoaderService {
  private platformId = inject(PLATFORM_ID);

  private readonly _scripts = new Map<string, ScriptStatus>();
  private readonly _status = signal<Map<string, ScriptStatus>>(this._scripts);

  /**
   * Loads an external script asynchronously and securely.
   * Returns a signal that updates when the script is loaded or errors.
   */
  loadScript(src: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this._scripts.has(src)) {
      return;
    }

    this._scripts.set(src, { loaded: false, error: false });

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      this._scripts.set(src, { loaded: true, error: false });
      this._status.set(this._scripts);
    };
    script.onerror = () => {
      this._scripts.set(src, { loaded: false, error: true });
      this._status.set(this._scripts);
    };

    document.head.appendChild(script);
  }

  /**
   * Returns a computed signal that indicates if a script is loaded.
   */
  isLoaded(src: string): boolean {
    return this._scripts.get(src)?.loaded ?? false;
  }

  /**
   * Returns a computed signal that indicates if a script has errored.
   */
  hasError(src: string): boolean {
    return this._scripts.get(src)?.error ?? false;
  }
}
