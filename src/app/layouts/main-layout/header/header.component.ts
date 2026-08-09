import { Component, inject, signal, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="app-header">
      <div class="header-inner">
        <div class="header-left">
          <button
            (click)="toggleSidebar.emit()"
            class="btn-ghost btn-icon mobile-menu-btn"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              @if (isSidebarOpen) {
                <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
              } @else {
                <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
              }
            </svg>
          </button>
          <span class="header-section-title">{{ sectionTitle() }}</span>
        </div>

        <div class="header-right">
          <button
            class="btn-ghost btn-icon theme-toggle"
            (click)="themeService.toggle()"
            [attr.aria-label]="themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          >
            @if (themeService.isDark()) {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
              </svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            }
          </button>

          <div class="user-menu">
            <button
              (click)="userMenuOpen.set(!userMenuOpen())"
              class="user-menu-trigger"
              aria-label="Menu de usuario"
            >
              <div class="avatar">{{ initials() }}</div>
            </button>

            @if (userMenuOpen()) {
              <div class="dropdown-menu animate-fade-in-down">
                <div class="dropdown-header">
                  <div class="dropdown-avatar">{{ initials() }}</div>
                  <div class="dropdown-user-info">
                    <p class="dropdown-user-name">{{ auth.profile()?.full_name || 'Usuario' }}</p>
                    <p class="dropdown-user-email">{{ auth.profile()?.email }}</p>
                    <span class="dropdown-role-badge">{{ auth.profile()?.role || 'admin' }}</span>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                <a routerLink="/panel/dashboard" class="dropdown-item" (click)="userMenuOpen.set(false)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                  Dashboard
                </a>
                <a routerLink="/panel/admin" class="dropdown-item" (click)="userMenuOpen.set(false)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  Administracion
                </a>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item logout-item" (click)="logout()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  Cerrar sesion
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
      background-color: #fff;
      border-bottom: 1px solid var(--gray-200);
      height: var(--header-height);
    }

    :host-context(.dark) .app-header {
      background-color: var(--gray-100);
      border-bottom-color: var(--gray-200);
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 var(--space-4);
    }

    @media (max-width: 639px) {
      .header-inner {
        padding: 0 var(--space-2);
      }
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .mobile-menu-btn {
      display: none;
    }

    .header-section-title {
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      color: var(--gray-900);
    }

    :host-context(.dark) .header-section-title {
      color: var(--gray-100);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .theme-toggle {
      color: var(--gray-500);
    }

    @media (max-width: 639px) {
      .mobile-menu-btn {
        display: flex;
      }
    }

    /* User Menu */
    .user-menu {
      position: relative;
    }

    .user-menu-trigger {
      display: flex;
      align-items: center;
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
    }

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--brand-500), var(--brand-600));
      color: #fff;
      font-size: 0.8125rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.02em;
      border: 2px solid transparent;
      transition: border-color 0.2s ease;
    }

    .user-menu-trigger:hover .avatar {
      border-color: var(--brand-400);
    }

    /* Dropdown */
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 240px;
      background-color: #fff;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-dropdown);
      overflow: hidden;
    }

    :host-context(.dark) .dropdown-menu {
      background-color: var(--gray-100);
      border-color: var(--gray-200);
    }

    .dropdown-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-100);
    }

    :host-context(.dark) .dropdown-header {
      background: rgba(255, 255, 255, 0.03);
      border-bottom-color: var(--gray-200);
    }

    .dropdown-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--brand-500), var(--brand-600));
      color: #fff;
      font-size: 0.8125rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .dropdown-user-info {
      min-width: 0;
    }

    .dropdown-user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :host-context(.dark) .dropdown-user-name {
      color: var(--gray-100);
    }

    .dropdown-user-email {
      font-size: 0.75rem;
      color: var(--gray-500);
      margin: 0;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-role-badge {
      display: inline-block;
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--brand-600);
      background-color: rgba(59, 130, 246, 0.1);
      padding: 0.15em 0.5em;
      border-radius: 0.375rem;
      margin-top: 0.25rem;
    }

    .dropdown-divider {
      height: 1px;
      background-color: var(--gray-100);
      margin: 0;
    }

    :host-context(.dark) .dropdown-divider {
      background-color: var(--gray-200);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      width: 100%;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-700);
      text-align: left;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.15s ease;
      text-decoration: none;
    }

    :host-context(.dark) .dropdown-item {
      color: var(--gray-300);
    }

    .dropdown-item:hover {
      background-color: var(--gray-50);
    }

    :host-context(.dark) .dropdown-item:hover {
      background-color: var(--gray-200);
    }

    .dropdown-item svg {
      flex-shrink: 0;
      color: var(--gray-400);
    }

    .logout-item {
      color: var(--danger-600);
    }

    .logout-item svg {
      color: var(--danger-500);
    }

    .logout-item:hover {
      background-color: rgba(239, 68, 68, 0.06);
    }

    :host-context(.dark) .logout-item:hover {
      background-color: rgba(239, 68, 68, 0.12);
    }
  `]
})
export class HeaderComponent {
  @Input() isSidebarOpen: boolean = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  auth = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);

  userMenuOpen = signal(false);

  private routeTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/inscripciones': 'Inscripciones',
    '/artistas': 'Artistas',
    '/cronograma': 'Cronograma',
    '/acreditaciones': 'Acreditaciones',
    '/jurado': 'Jurado',
    '/jurado/admission': 'Admisión',
    '/staff': 'Staff',
    '/comunicaciones': 'Comunicaciones',
    '/contratos': 'Contratos',
    '/reportes': 'Reportes',
    '/noticias': 'Noticias',
    '/galeria': 'Galeria',
    '/mensajes': 'Mensajes',
    '/documentation': 'Documentación',
    '/admin': 'Administracion',
    '/settings': 'Configuracion',
  };

  sectionTitle = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => {
        const url = this.router.url.split('?')[0].split('#')[0];
        return this.routeTitles[url] || 'Panel';
      })
    ),
    { initialValue: this.getInitialTitle() }
  );

  private getInitialTitle(): string {
    const url = this.router.url.split('?')[0].split('#')[0];
    return this.routeTitles[url] || 'Panel';
  }

  initials = (): string => {
    const name = this.auth.profile()?.full_name || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.userMenuOpen.set(false);
    }
  }

  async logout(): Promise<void> {
    this.userMenuOpen.set(false);
    await this.auth.logout();
  }
}
