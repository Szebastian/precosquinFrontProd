import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-mobile-mas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="compact-header">
      <button class="back-btn" (click)="goBack()" aria-label="Volver">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1 class="header-title">Más</h1>
      <div class="header-spacer"></div>
    </header>

    <main class="mas-content">
      <div class="menu-list">
        @for (item of menuItems; track item.route) {
          <button class="menu-card" (click)="navigate(item.route)">
            <div class="menu-icon" [innerHTML]="item.icon"></div>
            <span class="menu-label">{{ item.label }}</span>
            <svg class="menu-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        }
      </div>

      <div class="app-version">
        <span>Pre Cosquín v2027.1</span>
      </div>

      <div class="bottom-spacer"></div>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      background: #0E0F12;
      color: #FFFFFF;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow-x: hidden;
    }

    /* ---- Compact Header ---- */
    .compact-header {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      height: 56px;
      padding: 0 16px;
      padding-top: env(safe-area-inset-top, 0px);
      background: rgba(14, 15, 18, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: none;
      color: #FFFFFF;
      cursor: pointer;
      border-radius: 9999px;
      transition: background 150ms cubic-bezier(0.4, 0, 0.2, 1);
      margin-left: -8px;
    }

    .back-btn:active {
      background: rgba(255, 255, 255, 0.08);
    }

    .header-title {
      flex: 1;
      text-align: center;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .header-spacer {
      width: 40px;
    }

    /* ---- Menu content ---- */
    .mas-content {
      flex: 1;
      padding: 20px;
      padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px) + 20px);
    }

    .menu-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .menu-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
      background: #181A1F;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
      cursor: pointer;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
      text-align: left;
      width: 100%;
    }

    .menu-card:active {
      transform: scale(0.98);
      background: #1E2027;
    }

    .menu-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      background: rgba(201, 168, 76, 0.1);
      border-radius: 12px;
      color: #C9A84C;
    }

    .menu-icon :first-child {
      width: 20px;
      height: 20px;
    }

    .menu-label {
      flex: 1;
      font-size: 15px;
      font-weight: 500;
      color: #FFFFFF;
    }

    .menu-chevron {
      flex-shrink: 0;
      color: #6B7280;
    }

    /* ---- App version ---- */
    .app-version {
      display: flex;
      justify-content: center;
      padding: 40px 0 20px;
      margin-top: 20px;
    }

    .app-version span {
      font-size: 12px;
      font-weight: 500;
      color: #6B7280;
      letter-spacing: 0.02em;
    }

    .bottom-spacer {
      height: 20px;
    }
  `],
})
export class MobileMasPageComponent {
  private readonly router = inject(Router);

  readonly menuItems: MenuItem[] = [
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      label: 'Documentación / Bases',
      route: '/documentacion',
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
      label: 'Categorías',
      route: '/categorias',
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      label: 'Jurados',
      route: '/jurados',
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
      label: 'Patrocinio',
      route: '/patrocinio',
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      label: 'Declaración Institucional',
      route: '/declaracion',
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
      label: 'Contacto',
      route: '/contacto',
    },
    {
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
      label: 'Compartir',
      route: '/compartir',
    },
  ];

  navigate(route: string): void {
    if (route === '/compartir') {
      this.shareApp();
      return;
    }
    this.router.navigate([route]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  private shareApp(): void {
    if (navigator.share) {
      navigator.share({
        title: 'Pre Cosquín Puerto Pirámides 2027',
        text: 'Certamen Folklórico Nacional - Pre Cosquín Puerto Pirámides 2027',
        url: window.location.origin,
      });
    }
  }
}
