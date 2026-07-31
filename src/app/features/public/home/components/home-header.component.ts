import { Component, signal, HostListener } from '@angular/core';
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
          <img src="assets/img/logoballena.webp" alt="Logo" class="header-logo" />
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
          <a href="#" class="nav-link">Cronograma</a>
          <a routerLink="/patrocinio" class="nav-link">Patrocinio</a>
          <a routerLink="/documentacion" class="nav-link">Documentación</a>
        </nav>

        <div class="header-right">
          <a routerLink="/auth/login" class="login-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Acceder
          </a>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .portal-header { background-color: var(--brand-200); border-bottom: 2px solid var(--brand-500); position: sticky; top: 0; z-index: 100; box-shadow: var(--shadow-sm); transition: all 0.3s ease; }
    .portal-header.header-scrolled .header-inner { height: 56px; }
    .portal-header.header-scrolled .header-logo { height: 32px; }
    .header-topbar { background-color: rgba(0, 0, 0, 0.05); border-bottom: 1px solid rgba(0, 0, 0, 0.08); height: 32px; display: flex; align-items: center; transition: all 0.3s ease; overflow: hidden; }
    .topbar-hidden { height: 0; opacity: 0; border-bottom: none; }
    .header-topbar-inner { max-width: 1200px; margin: 0 auto; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 var(--space-4); }
    .header-topbar-left { display: flex; align-items: center; }
    .topbar-info { font-size: 10px; font-weight: var(--weight-bold); color: var(--brand-900); letter-spacing: 0.08em; }
    .header-topbar-right { display: flex; align-items: center; gap: var(--space-2); }
    .topbar-social-icon { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: var(--radius-sm); background-color: var(--brand-900); color: white; transition: all var(--transition-fast); }
    .topbar-social-icon:hover { background-color: var(--brand-700); transform: scale(1.1); }
    .header-inner { max-width: 1200px; margin: 0 auto; height: 70px; display: flex; align-items: center; justify-content: space-between; padding: 0 var(--space-4); }
    .header-left { display: flex; align-items: center; gap: var(--space-3); height: 100%; }
    .header-logo { height: 40px; width: auto; object-fit: contain; }
    .header-divider { width: 1px; height: 30px; background-color: var(--brand-500); opacity: 0.3; }
    .header-brand-text { display: flex; flex-direction: column; gap: 0; line-height: 1; }
    .header-brand-subtitle { font-size: 9px; font-weight: var(--weight-extrabold); color: var(--brand-800); letter-spacing: 0.15em; text-transform: uppercase; }
    .header-brand-title { font-family: var(--font-display); font-size: var(--text-base); font-weight: var(--weight-extrabold); color: var(--brand-900); letter-spacing: -0.01em; line-height: 1.15; }
    .header-nav { display: flex; align-items: center; gap: var(--space-6); height: 100%; }
    .nav-link { font-size: var(--text-sm); font-weight: var(--weight-bold); color: var(--brand-900); text-transform: uppercase; text-decoration: none; height: 100%; display: flex; align-items: center; padding: 0 var(--space-1); border-bottom: 3px solid transparent; transition: all var(--transition-fast); }
    .nav-link:hover, .nav-link.active { color: var(--brand-900); border-bottom-color: var(--brand-900); }
    .header-right { display: flex; align-items: center; }
    .login-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 20px; font-size: var(--text-sm); font-weight: var(--weight-bold); text-transform: uppercase; text-decoration: none; color: #fff; background: var(--brand-700); border-radius: var(--radius-full); transition: all var(--transition-fast); letter-spacing: 0.03em; }
    .login-btn:hover { background: var(--brand-900); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    @media (max-width: 1024px) { .header-nav { display: none; } }
    @media (max-width: 480px) {
      .portal-header.header-scrolled .header-inner { height: 48px; }
      .portal-header.header-scrolled .header-logo { height: 28px; }
      .portal-header.header-scrolled .header-divider { display: none; }
      .portal-header.header-scrolled .header-brand-subtitle { display: none; }
    }
  `]
})
export class HomeHeaderComponent {
  scrollY = signal(0);
  private ticking = false;

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

