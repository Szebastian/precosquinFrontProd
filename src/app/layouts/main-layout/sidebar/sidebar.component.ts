import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/auth/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { environment } from '../../../../environments/environment';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <!-- Brand -->
      <div class="sidebar-brand">
        <div class="brand-logo">
          <img src="assets/img/logoballena.webp" alt="Precosquin" class="logo-img">
        </div>
        <div class="brand-info">
          <span class="brand-name">Pre-Cosquin</span>
          <span class="brand-edition">Puerto Piramides 2026</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        @for (item of filteredNavItems(); track item.label) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-item"
          >
            <span class="nav-icon" [innerHTML]="sanitizeIcon(item.icon)"></span>
            <span class="nav-label">{{ item.label }}</span>
            @if (item.badge) {
              <span class="nav-badge" [class.nav-badge-pulse]="item.badgePulse">{{ item.badge }}</span>
            }
          </a>
        }
      </nav>

      <!-- User Section -->
      <div class="sidebar-footer">
        <div class="sidebar-role-badge">
          <span class="role-badge-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </span>
          <span class="role-badge-label">{{ auth.profile()?.role === 'admin' ? 'ADMIN' : auth.profile()?.role === 'sede' ? 'SEDE COSQUÍN' : 'PANEL DE CONTROL' }}</span>
        </div>
        <div class="sidebar-user" [class.jurado-user]="auth.isJurado()" [class.sede-user]="auth.isSede()">
          <div class="user-avatar">
            <span class="avatar-text">{{ initials() }}</span>
          </div>
          <div class="user-info">
            <p class="user-name">{{ auth.profile()?.full_name || 'Usuario' }}</p>
            <p class="user-role" [class.jurado-role-badge]="auth.isJurado()" [class.sede-role-badge]="auth.isSede()">
              @if (auth.isJurado()) {
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="jurado-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              }
              @if (auth.isSede()) {
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>
              }
              {{ auth.profile()?.role || 'staff' }}
            </p>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      display: flex;
      flex-direction: column;
      width: 260px;
      height: 100%;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      color: #f8fafc;
      overflow: hidden;
      position: sticky;
      top: 0;
      border-right: 1px solid #334155;
    }

    @media (max-width: 1023px) {
      .sidebar {
        display: none;
      }
    }

    /* Brand */
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem 1.25rem;
      border-bottom: 1px solid #334155;
      background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
    }

    .brand-logo {
      width: 40px;
      height: 40px;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, var(--brand-500), var(--brand-600));
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      flex-shrink: 0;
    }

    .logo-img {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    .brand-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }

    .brand-name {
      font-size: 1rem;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.025em;
      line-height: 1.2;
    }

    .brand-edition {
      font-size: 0.7rem;
      font-weight: 500;
      color: #94a3b8;
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .sidebar-nav::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: #475569;
      border-radius: 3px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0.875rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #cbd5e1;
      border-radius: 0.75rem;
      text-decoration: none;
      transition: all 0.2s ease;
      position: relative;
    }

    .nav-item:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.08);
      transform: translateX(2px);
    }

    .nav-item.active {
      color: #f8fafc;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(59, 130, 246, 0.1));
      border: 1px solid rgba(59, 130, 246, 0.3);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background: linear-gradient(180deg, var(--brand-400), var(--brand-600));
      border-radius: 0 2px 2px 0;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      opacity: 0.9;
    }

    .nav-item.active .nav-icon {
      opacity: 1;
      color: #60a5fa;
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.625rem;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #fff;
      border-radius: 9999px;
      line-height: 1;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
    }

    /* Role Badge */
    .sidebar-role-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15));
      border: 1px solid rgba(59, 130, 246, 0.25);
      border-radius: 0.625rem;
      margin-bottom: 0.75rem;
    }

    .role-badge-icon {
      color: #60a5fa;
      display: flex;
      align-items: center;
    }

    .role-badge-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: #93c5fd;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    /* Footer */
    .sidebar-footer {
      padding: 1rem 1rem 1.25rem 1rem;
      border-top: 1px solid #334155;
      background: linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 100%);
    }

    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.75rem;
      border-radius: 0.875rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.2s ease;
    }

    .sidebar-user:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.12);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 0.875rem;
      background: linear-gradient(135deg, var(--brand-500), var(--brand-600));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .avatar-text {
      font-size: 0.875rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.025em;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
      line-height: 1.2;
    }

    .user-role {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: capitalize;
      margin: 0.125rem 0 0 0;
      line-height: 1.2;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .jurado-user {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 167, 38, 0.15));
      border-color: rgba(255, 193, 7, 0.3);
    }

    .jurado-user:hover {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 167, 38, 0.2));
      border-color: rgba(255, 193, 7, 0.4);
    }

    .jurado-role-badge {
      font-weight: 700;
      color: #ffc107; /* Color dorado/amarillo para jurado */
      background-color: rgba(255, 193, 7, 0.1);
      padding: 0.2em 0.5em;
      border-radius: 0.5em;
      display: inline-flex;
      align-items: center;
      gap: 0.25em;
      line-height: 1;
    }

    .jurado-role-badge .jurado-icon {
      color: #ffc107;
      width: 0.9em;
      height: 0.9em;
    }

    .sede-user {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.15));
      border-color: rgba(168, 85, 247, 0.3);
    }

    .sede-user:hover {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(139, 92, 246, 0.2));
      border-color: rgba(168, 85, 247, 0.4);
    }

    .sede-role-badge {
      font-weight: 700;
      color: #a855f7;
      background-color: rgba(168, 85, 247, 0.1);
      padding: 0.2em 0.5em;
      border-radius: 0.5em;
      display: inline-flex;
      align-items: center;
      gap: 0.25em;
      line-height: 1;
    }

    .nav-badge-pulse {
      animation: badge-pulse 2s ease-in-out infinite;
    }
    @keyframes badge-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `]
})
export class SidebarComponent {
  auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private http = inject(HttpClient);
  notifications = inject(NotificationService);

  private pollSub?: Subscription;

  sanitizeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }

  ngOnInit(): void {
    this.fetchPendingCount();
    this.pollSub = interval(30000).subscribe(() => this.fetchPendingCount());
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  fetchPendingCount(): void {
    this.http.get<{ inscripciones_pendientes: number }>(`${environment.apiUrl}/dashboard/stats`).subscribe({
      next: (data) => this.notifications.inscripcionesPendientes.set(data.inscripciones_pendientes || 0),
      error: () => {},
    });
    this.http.get<{ unread: number }>(`${environment.apiUrl}/pena-acreditaciones/unread-count`).subscribe({
      next: (data) => this.notifications.penaUnread.set(data.unread || 0),
      error: () => {},
    });
    this.http.get<{ unread: number }>(`${environment.apiUrl}/sorteo-avistaje/unread-count`).subscribe({
      next: (data) => this.notifications.sorteoPendientes.set(data.unread || 0),
      error: () => {},
    });
  }

  navItems = computed(() => {
    const count = this.notifications.inscripcionesPendientes();
    const pena = this.notifications.penaUnread();
    const sorteo = this.notifications.sorteoPendientes();
    return [
      { label: 'Dashboard', route: '/panel/dashboard', roles: ['organizador', 'admin', 'staff', 'jurado', 'sede'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>' },
      { label: 'Inscripciones', route: '/panel/inscripciones', roles: ['organizador', 'admin', 'staff', 'sede'], badge: count > 0 ? String(count) : '', badgePulse: count > 0, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>' },
      { label: 'Artistas', route: '/panel/artistas', roles: ['organizador', 'admin', 'staff', 'jurado'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
      { label: 'Cronograma', route: '/panel/cronograma', roles: ['organizador', 'admin', 'staff'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>' },
      { label: 'Acreditaciones', route: '/panel/acreditaciones', roles: ['organizador', 'admin', 'staff'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
      { label: 'Jurado', route: '/panel/jurado', roles: ['admin', 'jurado'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
      { label: 'Admisión', route: '/panel/jurado/admission', roles: ['admin', 'jurado'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>' },
      { label: 'Staff', route: '/panel/staff', roles: ['staff', 'organizador', 'admin'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg>' },
      { label: 'Stands', route: '/panel/admin/stands', roles: ['organizador', 'admin'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/></svg>' },
      { label: 'Stage Plots', route: '/panel/stage-plots', roles: ['organizador', 'admin', 'staff', 'sede'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></svg>' },
      { label: 'Comunicaciones', route: '/panel/comunicaciones', roles: ['organizador', 'admin', 'staff'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>' },
      { label: 'Contratos', route: '/panel/contratos', roles: ['organizador', 'admin'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>' },
      { label: 'Reportes', route: '/panel/reportes', roles: ['organizador', 'admin', 'sede'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>' },
      { label: 'Sorteo Avistaje', route: '/panel/sorteo-avistaje', roles: ['organizador', 'admin'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>' },
      { label: 'Peña Acreditaciones', route: '/panel/pena-acreditaciones', roles: ['organizador', 'admin'], badge: pena > 0 ? String(pena) : '', badgePulse: pena > 0, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11v-2a4 4 0 0 0-3-3.87"/></svg>' },
      { label: 'Invitados', route: '/panel/invitados', roles: ['organizador', 'admin'], badge: pena > 0 || count > 0 ? String((pena||0)+(count||0)) : '', badgePulse: pena > 0 || count > 0, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
      { label: 'Partners', route: '/panel/partners', roles: ['organizador', 'admin'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' },
      { label: 'Noticias', route: '/panel/noticias', roles: ['organizador', 'admin', 'staff'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M16 8h2m-2 4h2m-14 0h6m-6-4h6m-6 8h14"/></svg>' },
      { label: 'Galería', route: '/panel/galeria', roles: ['organizador', 'admin', 'staff'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' },
      { label: 'Mensajes', route: '/panel/mensajes', roles: ['organizador', 'admin', 'staff'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' },
      { label: 'Admin', route: '/panel/admin', roles: ['admin'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>' },
      { label: 'Documentación', route: '/panel/documentation', roles: ['organizador', 'admin', 'staff', 'jurado'], badge: '', badgePulse: false, icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>' },
    ];
  });

  filteredNavItems = computed(() => {
    const profile = this.auth.profile();
    const items = this.navItems();
    if (!profile) return items;
    return items.filter(item => !item.roles || item.roles.includes(profile.role));
  });

  initials = computed(() => {
    const name = this.auth.profile()?.full_name || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  });
}
