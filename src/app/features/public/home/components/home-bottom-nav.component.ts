import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-home-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav" role="navigation" aria-label="Navegación principal">
      <a routerLink="/" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span class="nav-label">Inicio</span>
      </a>
      <a routerLink="/noticias" routerLinkActive="nav-active" class="nav-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
        <span class="nav-label">Noticias</span>
      </a>
      <a routerLink="/inscripcion" routerLinkActive="nav-active" class="nav-item nav-item-cta">
        <div class="nav-cta-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        </div>
        <span class="nav-label nav-label-cta">Inscribirme</span>
      </a>
      <a routerLink="/cronograma" routerLinkActive="nav-active" class="nav-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span class="nav-label">Agenda</span>
      </a>
      <button class="nav-item" (click)="toggleMore()" [attr.aria-expanded]="moreOpen()" aria-haspopup="true" aria-label="Más opciones">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        <span class="nav-label">Más</span>
      </button>
    </nav>

    @if (moreOpen()) {
      <div class="more-overlay" (click)="toggleMore()"></div>
      <div class="more-panel">
        <div class="more-header">
          <h3 class="more-title">Más opciones</h3>
          <button class="more-close" (click)="toggleMore()" aria-label="Cerrar menú">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="more-links">
          <a routerLink="/documentacion" class="more-link" (click)="toggleMore()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            Documentación
          </a>
          <a routerLink="/patrocinio" class="more-link" (click)="toggleMore()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            Patrocinadores
          </a>
          <a href="#" class="more-link" (click)="toggleMore()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            Preguntas Frecuentes
          </a>
          <a href="#" class="more-link" (click)="toggleMore()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Contacto
          </a>
          <a href="https://www.instagram.com/precosquinpuertopiramides" target="_blank" class="more-link" (click)="toggleMore()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            Instagram
          </a>
          <a href="https://www.youtube.com/@PreCosquinPuertoPirámides" target="_blank" class="more-link" (click)="toggleMore()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            YouTube
          </a>
        </div>
        <div class="more-footer">
          <a routerLink="/auth/login" class="more-login" (click)="toggleMore()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Acceder
          </a>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: none; }

    .bottom-nav {
      display: flex;
      align-items: center;
      justify-content: space-around;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 900;
      background: #fff;
      border-top: 1px solid rgba(0,0,0,0.08);
      padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
      box-shadow: 0 -2px 10px rgba(0,0,0,0.08);
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      min-width: 48px;
      min-height: 48px;
      padding: 4px 8px;
      border: none;
      background: transparent;
      color: var(--gray-500, #857a68);
      text-decoration: none;
      cursor: pointer;
      transition: color 0.15s ease;
      -webkit-tap-highlight-color: transparent;
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

    .nav-active {
      color: var(--brand-600, #2563eb);
    }

    .nav-item-cta {
      color: var(--brand-600, #2563eb);
      margin-top: -16px;
    }

    .nav-cta-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--brand-accent, #d1ba73);
      color: var(--gray-900, #1a1a1a);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(209,186,115,0.4);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .nav-item-cta:active .nav-cta-icon {
      transform: scale(0.92);
    }

    .nav-label-cta {
      font-weight: 700;
      color: var(--brand-900, #1e3a8a);
    }

    /* More overlay */
    .more-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 950;
      animation: fadeIn 0.2s ease;
    }

    .more-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 951;
      background: #fff;
      border-radius: 20px 20px 0 0;
      box-shadow: 0 -8px 30px rgba(0,0,0,0.15);
      animation: slideUp 0.25s ease;
      max-height: 70vh;
      overflow-y: auto;
      padding-bottom: env(safe-area-inset-bottom);
    }

    .more-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 12px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
    }

    .more-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--gray-900, #1a1a1a);
    }

    .more-close {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: rgba(0,0,0,0.06);
      color: var(--gray-700, #4d4638);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
    }

    .more-close:hover {
      background: rgba(0,0,0,0.1);
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
      color: var(--gray-900, #1a1a1a);
      text-decoration: none;
      border-radius: 12px;
      transition: background 0.15s ease;
      min-height: 48px;
    }

    .more-link:hover {
      background: rgba(0,0,0,0.04);
    }

    .more-link:active {
      background: rgba(0,0,0,0.08);
    }

    .more-link svg {
      color: var(--gray-500, #857a68);
      flex-shrink: 0;
    }

    .more-footer {
      padding: 8px 12px 12px;
      border-top: 1px solid rgba(0,0,0,0.06);
    }

    .more-login {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px;
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      background: var(--brand-700, #1d4ed8);
      border-radius: 14px;
      text-decoration: none;
      transition: background 0.15s ease;
      min-height: 48px;
    }

    .more-login:hover {
      background: var(--brand-800, #1e40af);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    @media (max-width: 1024px) {
      :host { display: block; }
    }
  `]
})
export class HomeBottomNavComponent {
  moreOpen = signal(false);

  toggleMore() {
    this.moreOpen.set(!this.moreOpen());
    if (this.moreOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
}
