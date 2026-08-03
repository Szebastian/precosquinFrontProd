import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="admin-bottom-nav" role="navigation" aria-label="Navegación del panel">
      <a routerLink="/panel/dashboard" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
        <span class="nav-label">Inicio</span>
      </a>
      <a routerLink="/panel/inscripciones" routerLinkActive="nav-active" class="nav-item">
        <div class="nav-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>
          @if (pendingCount() > 0) {
            <span class="nav-badge">{{ pendingCount() }}</span>
          }
        </div>
        <span class="nav-label">Inscripciones</span>
      </a>
      <a routerLink="/panel/cronograma" routerLinkActive="nav-active" class="nav-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        <span class="nav-label">Cronograma</span>
      </a>
      <a routerLink="/panel/acreditaciones" routerLinkActive="nav-active" class="nav-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span class="nav-label">Acreditación</span>
      </a>
      <button class="nav-item" (click)="toggleMore()" [attr.aria-expanded]="moreOpen()" aria-haspopup="true" aria-label="Más opciones">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        <span class="nav-label">Más</span>
      </button>
    </nav>

    @if (moreOpen()) {
      <div class="more-overlay" (click)="toggleMore()"></div>
      <div class="more-panel">
        <div class="more-header">
          <h3 class="more-title">Más secciones</h3>
          <button class="more-close" (click)="toggleMore()" aria-label="Cerrar menú">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="more-links">
          @for (item of moreItems(); track item.route) {
            <a [routerLink]="item.route" class="more-link" (click)="toggleMore()">
              <span class="more-icon" [innerHTML]="item.icon"></span>
              {{ item.label }}
            </a>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: none; }

    @media (max-width: 1023px) {
      :host { display: block; }
    }

    .admin-bottom-nav {
      display: flex;
      align-items: center;
      justify-content: space-around;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 900;
      background: #1e293b;
      border-top: 1px solid rgba(255,255,255,0.08);
      padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
      box-shadow: 0 -2px 12px rgba(0,0,0,0.3);
    }

    :host-context(.dark) .admin-bottom-nav {
      background: #0f172a;
      border-top-color: rgba(255,255,255,0.06);
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      min-width: 48px;
      min-height: 48px;
      padding: 4px 6px;
      border: none;
      background: transparent;
      color: #94a3b8;
      text-decoration: none;
      cursor: pointer;
      transition: color 0.15s ease;
      -webkit-tap-highlight-color: transparent;
      position: relative;
    }

    .nav-item:active {
      transform: scale(0.92);
    }

    .nav-label {
      font-size: 10px;
      font-weight: 600;
      line-height: 1;
      letter-spacing: 0.01em;
    }

    .nav-icon-wrap {
      position: relative;
      display: flex;
    }

    .nav-badge {
      position: absolute;
      top: -4px;
      right: -8px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      background: #f59e0b;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);
      animation: badge-pulse 2s ease-in-out infinite;
    }

    @keyframes badge-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .nav-active {
      color: #60a5fa;
    }

    .nav-active .nav-badge {
      background: #f59e0b;
    }

    /* More overlay */
    .more-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 950;
      animation: fadeIn 0.2s ease;
    }

    .more-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 951;
      background: #1e293b;
      border-radius: 20px 20px 0 0;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.4);
      animation: slideUp 0.25s ease;
      max-height: 70vh;
      overflow-y: auto;
      padding-bottom: env(safe-area-inset-bottom);
    }

    :host-context(.dark) .more-panel {
      background: #0f172a;
    }

    .more-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .more-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #f1f5f9;
    }

    .more-close {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: rgba(255,255,255,0.08);
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
    }

    .more-close:hover {
      background: rgba(255,255,255,0.12);
    }

    .more-links {
      padding: 8px 12px;
    }

    .more-link {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 12px;
      font-size: 15px;
      font-weight: 500;
      color: #e2e8f0;
      text-decoration: none;
      border-radius: 12px;
      transition: background 0.15s ease;
      min-height: 48px;
    }

    .more-link:hover {
      background: rgba(255,255,255,0.06);
    }

    .more-link:active {
      background: rgba(255,255,255,0.1);
    }

    .more-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      flex-shrink: 0;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `]
})
export class AdminBottomNavComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private http = inject(HttpClient);

  pendingCount = signal(0);
  moreOpen = signal(false);
  private pollSub?: Subscription;

  ngOnInit(): void {
    this.fetchPendingCount();
    this.pollSub = interval(30000).subscribe(() => this.fetchPendingCount());
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  fetchPendingCount(): void {
    this.http.get<{ inscripciones_pendientes: number }>(`${environment.apiUrl}/dashboard/stats`).subscribe({
      next: (data) => this.pendingCount.set(data.inscripciones_pendientes || 0),
      error: () => {},
    });
  }

  toggleMore() {
    this.moreOpen.set(!this.moreOpen());
    if (this.moreOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  moreItems = computed(() => {
    const role = this.auth.profile()?.role;
    const allItems = [
      { label: 'Artistas', route: '/panel/artistas', roles: ['organizador', 'admin', 'staff', 'jurado'], icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
      { label: 'Jurado', route: '/panel/jurado', roles: ['admin'], icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
      { label: 'Staff', route: '/panel/staff', roles: ['staff', 'organizador', 'admin'], icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg>' },
      { label: 'Comunicaciones', route: '/panel/comunicaciones', roles: ['organizador', 'admin', 'staff'], icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>' },
      { label: 'Contratos', route: '/panel/contratos', roles: ['organizador', 'admin'], icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>' },
      { label: 'Reportes', route: '/panel/reportes', roles: ['organizador', 'admin'], icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>' },
      { label: 'Noticias', route: '/panel/noticias', roles: ['organizador', 'admin', 'staff'], icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M16 8h2m-2 4h2m-14 0h6m-6-4h6m-6 8h14"/></svg>' },
      { label: 'Mensajes', route: '/panel/mensajes', roles: ['organizador', 'admin', 'staff'], icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' },
      { label: 'Admin', route: '/panel/admin', roles: ['admin'], icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>' },
    ];
    if (!role) return allItems;
    return allItems.filter(item => item.roles.includes(role));
  });
}
