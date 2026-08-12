import { Component, signal, HostListener, HostBinding } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="portal-header" [class.header-scrolled]="scrollY() > 50">
      <div class="header-topbar" [class.topbar-hidden]="scrollY() > 50">
        <div class="header-topbar-inner">
          <div class="header-topbar-left">
            <span class="topbar-info">PRE-COSQUÍN PUERTO PIRÁMIDES 2027</span>
          </div>
          <div class="header-topbar-right">
            <a href="https://www.instagram.com/precosquinpuertopiramides?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" class="topbar-social-icon" title="Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://www.youtube.com/@PreCosquinPuertoPirámides" target="_blank" class="topbar-social-icon" title="YouTube">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div class="header-inner">
        <div class="header-left">
          <img src="assets/img/logoballena.webp" alt="Logo Precosquín" class="header-logo" width="40" height="40" fetchpriority="high" />
          <div class="header-divider"></div>
          <div class="header-brand-text">
            <span class="header-brand-subtitle">PRE-COSQUÍN</span>
            <span class="header-brand-title">Puerto Pirámides</span>
          </div>
        </div>

          <nav class="header-nav">
            <a href="#" class="nav-link active">Inicio</a>
            <a routerLink="/noticias" class="nav-link">Noticias</a>
            <a routerLink="/inscripcion" class="nav-link">Inscripciones</a>
            <a routerLink="/stands/nuevo" class="nav-link">Stands</a>
            <a routerLink="/cronograma" class="nav-link">Cronograma</a>
            <a routerLink="/documentacion" class="nav-link">Documentación</a>
          </nav>

        <div class="header-right">
          <a routerLink="/auth/login" class="login-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Acceder
          </a>
          <button class="hamburger-btn" (click)="toggleMenu()" [attr.aria-label]="menuOpen() ? 'Cerrar menú' : 'Abrir menú'" [attr.aria-expanded]="menuOpen()">
            @if (!menuOpen()) {
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            } @else {
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            }
          </button>
        </div>
      </div>

      @if (menuOpen()) {
        <div class="mobile-overlay" (click)="toggleMenu()"></div>
        <div class="mobile-drawer">
          <nav class="mobile-nav">
            <a href="#" class="mobile-nav-link active" (click)="toggleMenu()">Inicio</a>
            <a routerLink="/noticias" class="mobile-nav-link" (click)="toggleMenu()">Noticias</a>
            <a routerLink="/inscripcion" class="mobile-nav-link" (click)="toggleMenu()">Inscripciones</a>
            <a routerLink="/stands/nuevo" class="mobile-nav-link" (click)="toggleMenu()">Stands</a>
            <a routerLink="/cronograma" class="mobile-nav-link" (click)="toggleMenu()">Cronograma</a>
            <a routerLink="/documentacion" class="mobile-nav-link" (click)="toggleMenu()">Documentación</a>
          </nav>
          <div class="mobile-drawer-footer">
            <a routerLink="/auth/login" class="login-btn mobile-login" (click)="toggleMenu()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Acceder
            </a>
            <div class="mobile-social">
              <a href="https://www.instagram.com/precosquinpuertopiramides" target="_blank" class="topbar-social-icon">IG</a>
              <a href="https://www.youtube.com/@PreCosquinPuertoPirámides" target="_blank" class="topbar-social-icon">YT</a>
            </div>
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    .portal-header { background-color: #2855B8; border-bottom: 2px solid #1F4498; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 12px rgba(40,85,184,0.3); transition: background-color 0.3s ease, box-shadow 0.3s ease; }
    .portal-header.header-scrolled .header-inner { height: 56px; }
    .portal-header.header-scrolled .header-logo { height: 32px; width: 32px; }
    .header-topbar { background-color: rgba(31,68,152,0.6); border-bottom: 1px solid rgba(255,255,255,0.12); height: 32px; display: flex; align-items: center; transition: all 0.3s ease; overflow: hidden; }
    .topbar-hidden { height: 0; opacity: 0; border-bottom: none; }
    .header-topbar-inner { width: 100%; max-width: min(92%, 1200px); margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 24px; }
    .header-topbar-left { display: flex; align-items: center; }
    .topbar-info { font-size: 10px; font-weight: var(--weight-bold); color: rgba(255,255,255,0.9); letter-spacing: 0.08em; }
    .header-topbar-right { display: flex; align-items: center; gap: 8px; }
    .topbar-social-icon { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: var(--radius-sm); background-color: rgba(255,255,255,0.2); color: white; transition: all var(--transition-fast); }
    .topbar-social-icon:hover { background-color: rgba(255,255,255,0.35); transform: scale(1.1); }
    .header-inner { width: 100%; max-width: min(92%, 1200px); margin: 0 auto; height: 70px; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
    .header-left { display: flex; align-items: center; gap: var(--space-3); height: 100%; }
    .header-logo { height: 40px; width: auto; object-fit: contain; }
    .header-divider { width: 1px; height: 30px; background-color: rgba(255,255,255,0.3); }
    .header-brand-text { display: flex; flex-direction: column; gap: 0; line-height: 1; }
    .header-brand-subtitle { font-size: 9px; font-weight: var(--weight-extrabold); color: rgba(255,255,255,0.7); letter-spacing: 0.15em; text-transform: uppercase; }
    .header-brand-title { font-family: var(--font-display); font-size: var(--text-base); font-weight: var(--weight-extrabold); color: #fff; letter-spacing: -0.01em; line-height: 1.15; }
    .header-nav { display: flex; align-items: center; gap: var(--space-6); height: 100%; }
    .nav-link { font-size: var(--text-sm); font-weight: var(--weight-bold); color: rgba(255,255,255,0.8); text-transform: uppercase; text-decoration: none; height: 100%; display: flex; align-items: center; padding: 0 var(--space-1); border-bottom: 3px solid transparent; transition: all var(--transition-fast); }
    .nav-link:hover, .nav-link.active { color: #fff; border-bottom-color: #D9A928; }
    .nav-link:focus-visible { outline: 2px solid #D9A928; outline-offset: 2px; border-radius: 2px; }
    .header-right { display: flex; align-items: center; gap: var(--space-2); }
    .login-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 20px; font-size: var(--text-sm); font-weight: var(--weight-bold); text-transform: uppercase; text-decoration: none; color: #17191C; background: #D9A928; border-radius: var(--radius-full); transition: all var(--transition-fast); letter-spacing: 0.03em; }
    .login-btn:hover { background: #B98B1D; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .login-btn:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
    .hamburger-btn { display: none; align-items: center; justify-content: center; width: 44px; height: 44px; border: none; background: transparent; color: #fff; cursor: pointer; border-radius: var(--radius-sm); transition: background var(--transition-fast); }
    .hamburger-btn:hover { background: rgba(255,255,255,0.1); }
    .hamburger-btn:focus-visible { outline: 2px solid #D9A928; outline-offset: 2px; }
    @media (min-width: 1280px) {
      .header-nav { gap: var(--space-8); }
      .nav-link { padding: 0 var(--space-3); font-size: var(--text-sm); }
      .header-topbar-inner, .header-inner { max-width: min(90%, 1400px); }
    }
    @media (min-width: 1600px) {
      .header-topbar-inner, .header-inner { max-width: min(88%, 1600px); }
    }
    @media (min-width: 1920px) {
      .header-topbar-inner, .header-inner { max-width: min(86%, 1800px); }
    }
    @media (min-width: 2560px) {
      .header-topbar-inner, .header-inner { max-width: min(82%, 2100px); }
    }
    .mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; animation: fadeIn 0.2s ease; }
    .mobile-drawer { display: none; position: fixed; top: 0; right: 0; width: 280px; max-width: 85vw; height: 100vh; background: #2855B8; z-index: 201; box-shadow: -4px 0 20px rgba(0,0,0,0.2); animation: slideIn 0.25s ease; display: flex; flex-direction: column; }
    .mobile-nav { flex: 1; padding: 80px var(--space-6) var(--space-6); display: flex; flex-direction: column; gap: var(--space-1); }
    .mobile-nav-link { display: flex; align-items: center; min-height: 48px; padding: 0 var(--space-4); font-size: var(--text-base); font-weight: var(--weight-bold); color: #fff; text-decoration: none; border-radius: var(--radius-sm); transition: background var(--transition-fast); }
    .mobile-nav-link:hover, .mobile-nav-link.active { background: rgba(255,255,255,0.1); }
    .mobile-nav-link:focus-visible { outline: 2px solid #D9A928; outline-offset: -2px; }
    .mobile-nav-link.active { border-left: 3px solid #D9A928; }
    .mobile-drawer-footer { padding: var(--space-4) var(--space-6); border-top: 1px solid rgba(255,255,255,0.12); display: flex; flex-direction: column; gap: var(--space-4); }
    .mobile-login { width: 100%; justify-content: center; }
    .mobile-social { display: flex; gap: var(--space-3); justify-content: center; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @media (max-width: 1024px) {
      .header-nav { display: none; }
      .login-btn { display: none; }
      .hamburger-btn { display: flex; }
    }
    @media (max-width: 1024px) {
      .portal-header { box-shadow: none; }
      .header-topbar { display: none; }
      .header-inner { height: 56px; padding: 0 12px; }
      .header-logo { height: 36px; width: auto; }
      .header-divider { display: none; }
      .header-brand-text { gap: 0; }
      .header-brand-subtitle { display: none; }
      .header-brand-title { font-size: 0.85rem; }
      .hamburger-btn { display: none; }
    }
    @media (max-width: 480px) {
      .header-inner { height: 52px; padding: 0 10px; }
      .header-logo { height: 32px; }
      .header-brand-title { font-size: 0.8rem; }
    }
  `]
})
export class HomeHeaderComponent {
  scrollY = signal(0);
  menuOpen = signal(false);
  private ticking = false;

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.scrollY.set(window.scrollY);
        this.ticking = false;
      });
      this.ticking = true;
    }
  }
}

