import { Component, signal, inject, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  host: { '[style.display]': 'hidden() ? "none" : ""' },
  template: `
    @if (!hidden()) {
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
      <a routerLink="/stands/nuevo" routerLinkActive="nav-active" class="nav-item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z"/><path d="M9 14h6"/><path d="M9 8h6"/><path d="M9 18h6"/></svg>
        <span class="nav-label">Stands</span>
      </a>
      <button class="nav-item" (click)="toggleMore()" [attr.aria-expanded]="moreOpen()" aria-haspopup="true" aria-label="Más opciones">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        <span class="nav-label">Más</span>
      </button>
    </nav>

    @if (moreOpen()) {
      <div class="more-overlay" (click)="toggleMore()"></div>
      <div class="more-panel">
        <div class="more-handle"></div>
        <div class="more-header">
          <h3 class="more-title">Más opciones</h3>
          <button class="more-close" (click)="toggleMore()" aria-label="Cerrar menú">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="more-links">
          <a routerLink="/documentacion" class="more-link" (click)="toggleMore()">
            <div class="more-link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            </div>
            <div class="more-link-text">
              <span class="more-link-label">Documentación</span>
              <span class="more-link-desc">Bases y reglamentos</span>
            </div>
          </a>
          <a href="https://www.instagram.com/precosquinpuertopiramides" target="_blank" class="more-link" (click)="toggleMore()">
            <div class="more-link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </div>
            <div class="more-link-text">
              <span class="more-link-label">Instagram</span>
              <span class="more-link-desc">Seguinos en redes</span>
            </div>
          </a>
          <a href="https://www.youtube.com/@PreCosquinPuertoPirámides" target="_blank" class="more-link" (click)="toggleMore()">
            <div class="more-link-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </div>
            <div class="more-link-text">
              <span class="more-link-label">YouTube</span>
              <span class="more-link-desc">Videos y transmisiones</span>
            </div>
          </a>
        </div>
        <div class="more-footer">
          <a routerLink="/auth/login" class="more-login" (click)="toggleMore()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Acceder al panel
          </a>
        </div>
      </div>
    }
    }
  `,
  styles: [`
    :host { display: none; }

    /* ═══ BOTTOM NAV — DARK ═══ */
    .bottom-nav {
      display: flex;
      align-items: center;
      justify-content: space-around;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 900;
      background: rgba(241,237,228,0.95);
      backdrop-filter: saturate(180%) blur(20px);
      -webkit-backdrop-filter: saturate(180%) blur(20px);
      border-top: 1px solid rgba(0,0,0,0.08);
      padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      min-width: 48px;
      min-height: 48px;
      padding: 4px 10px;
      border: none;
      background: transparent;
      color: rgba(23,25,28,0.4);
      text-decoration: none;
      cursor: pointer;
      transition: color 0.2s ease;
      -webkit-tap-highlight-color: transparent;
      position: relative;
    }

    .nav-item:active {
      transform: scale(0.9);
    }

    .nav-label {
      font-size: 10px;
      font-weight: 600;
      line-height: 1;
      letter-spacing: 0.02em;
    }

    .nav-active {
      color: #2855B8;
    }

    .nav-active::after {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: #D9A928;
      border-radius: 0 0 2px 2px;
    }

    /* ═══ CTA BUTTON ═══ */
    .nav-item-cta {
      color: rgba(23,25,28,0.5);
      margin-top: -12px;
    }

    .nav-item-cta.nav-active {
      color: #2855B8;
    }

    .nav-item-cta.nav-active::after {
      display: none;
    }

    .nav-cta-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #D9A928, #B98B1D);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 4px 16px rgba(217, 169, 40, 0.35),
        0 0 0 3px rgba(241, 237, 228, 1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .nav-item-cta:active .nav-cta-icon {
      transform: scale(0.9);
      box-shadow:
        0 2px 8px rgba(217, 169, 40, 0.3),
        0 0 0 3px rgba(241, 237, 228, 1);
    }

    .nav-label-cta {
      font-weight: 700;
      color: #D9A928;
    }

    /* ═══ MORE OVERLAY ═══ */
    .more-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 950;
      animation: fadeIn 0.2s ease;
    }

    /* ═══ MORE PANEL — DARK ═══ */
    .more-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 951;
      background: #fff;
      border-radius: 20px 20px 0 0;
      animation: slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      max-height: 75vh;
      overflow-y: auto;
      padding-bottom: env(safe-area-inset-bottom);
    }

    .more-handle {
      width: 36px;
      height: 4px;
      background: #d1c8b8;
      border-radius: 99px;
      margin: 10px auto 0;
    }

    .more-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 12px;
      border-bottom: 1px solid #E6DED0;
    }

    .more-title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #fff;
    }

    .more-close {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: #F1EDE4;
      color: #857a68;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }

    .more-close:hover {
      background: #E6DED0;
      color: #17191C;
    }

    .more-links {
      padding: 8px 12px;
    }

    .more-link {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px;
      font-size: 15px;
      font-weight: 500;
      color: #17191C;
      text-decoration: none;
      border-radius: 14px;
      transition: background 0.15s ease;
      min-height: 52px;
    }

    .more-link:hover {
      background: #F1EDE4;
    }

    .more-link:active {
      background: #E6DED0;
    }

    .more-link-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: #F1EDE4;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2855B8;
      flex-shrink: 0;
    }

    .more-link-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .more-link-label {
      font-size: 14px;
      font-weight: 600;
      color: #17191C;
    }

    .more-link-desc {
      font-size: 11px;
      color: #857a68;
      font-weight: 400;
    }

    .more-footer {
      padding: 8px 12px 16px;
      border-top: 1px solid #E6DED0;
    }

    .more-login {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px;
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, #2855B8, #1F4498);
      border-radius: 14px;
      text-decoration: none;
      transition: all 0.15s ease;
      min-height: 48px;
    }

    .more-login:hover {
      opacity: 0.9;
      transform: translateY(-1px);
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
export class HomeBottomNavComponent implements OnInit, OnDestroy {
  moreOpen = signal(false);
  hidden = signal(false);
  private router = inject(Router);
  private sub?: Subscription;

  ngOnInit(): void {
    this.checkRoute(this.router.url);
    this.sub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.checkRoute(e.urlAfterRedirects);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private checkRoute(url: string): void {
    this.hidden.set(url.startsWith('/inscripcion'));
  }

  toggleMore() {
    this.moreOpen.set(!this.moreOpen());
    if (this.moreOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
}
