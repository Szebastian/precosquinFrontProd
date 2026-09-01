import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PartnersService, Partner } from '@core/services/partners.service';

@Component({
  selector: 'app-home-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="portal-footer">
      <div class="footer-collab">
        <div class="collab-inner">
          <!-- Featured Sponsors -->
          @if (sponsors().length > 0) {
            <span class="section-label">SPONSORS</span>
            <div class="featured-grid">
              @for (s of sponsors(); track s.id) {
                <div class="featured-sponsor" role="link" tabindex="0" [title]="s.name" (click)="openUrl(s.link_url)" (keydown.enter)="openUrl(s.link_url)">
                  <div class="featured-logo-wrap">
                    <img [src]="s.logo_url" [alt]="s.name" class="featured-logo" width="180" height="90" loading="lazy" decoding="async" />
                  </div>
                  <span class="featured-sub">{{ s.name }}</span>
                </div>
              }
            </div>
          }

          @if (colaboradores().length > 0) {
            <span class="section-label">COLABORAN</span>
            <div class="collab-grid">
              @for (c of colaboradores(); track c.id) {
                <div class="collab-item" role="link" tabindex="0" [title]="c.name" (click)="openUrl(c.link_url)" (keydown.enter)="openUrl(c.link_url)">
                  <img [src]="c.logo_url" [alt]="c.name" class="collab-img" width="120" height="60" loading="lazy" decoding="async" />
                </div>
              }
            </div>
          }
        </div>
      </div>

      <div class="footer-main">
        <div class="footer-brand">
          <img src="assets/img/logoballena.webp" alt="Precosquin" class="footer-logo" width="60" height="60" loading="lazy" decoding="async" />
          <div class="brand-text">
            <h4>Festival Folclórico</h4>
            <p>Puerto Pirámides, Chubut</p>
          </div>
        </div>

        <div class="footer-links">
          <a routerLink="/documentacion">Documentación</a>
          <a href="#">Contacto</a>
          <a href="#">Términos y Condiciones</a>
          <a href="#">Preguntas Frecuentes</a>
        </div>

        <div class="footer-social">
          <p>Seguinos en redes:</p>
          <div class="social-icons">
            <a href="https://www.instagram.com/precosquinpuertopiramides?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" class="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://www.youtube.com/@PreCosquinPuertoPirámides" target="_blank" class="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-copyright">
        <p>&copy; {{ currentYear }} Precosquin Pirámides. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    .portal-footer { margin-top: auto; background-color: #151D2D; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; }
    .footer-collab { background-color: rgba(17,19,21,0.5); padding: 48px 24px; display: flex; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .collab-inner { width: 100%; max-width: min(92%, 1200px); display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.25em; color: #D9A928; text-transform: uppercase; }
    .collab-grid { display: flex; align-items: center; justify-content: center; gap: 64px; flex-wrap: wrap; }
    .collab-img { height: 60px; max-width: 180px; width: auto; object-fit: contain; object-position: center; filter: grayscale(100%); opacity: 0.6; transition: all 0.3s ease; }
    .collab-item { display: inline-flex; text-decoration: none; cursor: pointer; }
    .collab-item:hover .collab-img { filter: grayscale(0%); opacity: 1; transform: translateY(-2px); }
    .collab-item:focus-visible .collab-img { outline: 2px solid var(--brand-500); outline-offset: 4px; }

    /* Featured Sponsors Grid */
    .featured-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      width: 100%;
      margin-bottom: 8px;
    }
    /* Featured Sponsor */
    .featured-sponsor {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 28px 40px 24px;
      margin-bottom: 8px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
      border: 1px solid rgba(255,255,255,0.08);
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
      position: relative;
      overflow: hidden;
    }
    .featured-sponsor::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 16px;
      background: radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.08) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.35s ease;
    }
    .featured-sponsor:hover::before { opacity: 1; }
    .featured-sponsor:hover {
      border-color: rgba(251,191,36,0.25);
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(251,191,36,0.1), 0 0 0 1px rgba(251,191,36,0.08);
    }
    .featured-sponsor:focus-visible {
      outline: 2px solid var(--brand-500);
      outline-offset: 4px;
    }
    .featured-logo-wrap {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 24px;
      border-radius: 12px;
      background: rgba(28,38,56,0.6);
      backdrop-filter: blur(4px);
    }
    .featured-logo {
      height: 80px;
      max-width: 280px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 2px 8px rgba(251,191,36,0.15));
      transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
    }
    .featured-sponsor:hover .featured-logo {
      filter: drop-shadow(0 4px 16px rgba(251,191,36,0.25));
      transform: scale(1.04);
    }
    .featured-sub {
      font-size: 11px;
      color: rgba(247,243,234,0.5);
      letter-spacing: 0.04em;
      position: relative;
      z-index: 1;
    }

    .footer-main { width: 100%; max-width: min(92%, 1200px); margin: 0 auto; padding: 48px 24px; display: grid; grid-template-columns: 1fr; gap: 32px; }
    .footer-brand { display: flex; align-items: center; gap: var(--space-4); }
    .footer-logo { height: 60px; width: auto; opacity: 0.85; }
    .footer-logo:hover { opacity: 1; }
    .brand-text h4 { margin: 0; color: #F7F3EA; font-size: var(--text-lg); font-weight: var(--weight-bold); }
    .brand-text p { margin: 0; color: rgba(247,243,234,0.5); font-size: var(--text-sm); }
    .footer-links { display: flex; gap: var(--space-6); justify-content: center; }
    .footer-links a { color: rgba(247,243,234,0.6); text-decoration: none; font-size: var(--text-sm); font-weight: var(--weight-medium); transition: color var(--transition-fast); }
    .footer-links a:hover { color: #F7F3EA; }
    .footer-links a:focus-visible { outline: 2px solid #2855B8; outline-offset: 2px; border-radius: 2px; }
    .footer-social { display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-2); }
    .footer-social p { margin: 0; font-size: var(--text-sm); color: rgba(247,243,234,0.5); font-weight: var(--weight-medium); }
    .social-icons { display: flex; gap: var(--space-3); }
    .social-icon { color: rgba(247,243,234,0.5); transition: all var(--transition-fast); display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background-color: rgba(40,85,184,0.15); }
    .social-icon:hover { color: #fff; background-color: #2855B8; transform: translateY(-2px); }
    .social-icon:focus-visible { outline: 2px solid #2855B8; outline-offset: 2px; }
    .footer-copyright { background-color: rgba(17,19,21,0.6); color: rgba(247,243,234,0.4); text-align: center; padding: var(--space-4); font-size: var(--text-xs); border-top: 1px solid rgba(255,255,255,0.04); }
    @media (min-width: 1280px) {
      .collab-inner, .footer-main { max-width: min(90%, 1400px); }
      .footer-main { grid-template-columns: 1fr 1fr 1fr; gap: 40px; }
      .footer-links { justify-content: flex-start; }
      .footer-social { align-items: flex-end; }
    }
    @media (min-width: 1600px) {
      .collab-inner, .footer-main { max-width: min(88%, 1600px); }
    }
    @media (min-width: 1920px) {
      .collab-inner, .footer-main { max-width: min(86%, 1800px); }
    }
    @media (min-width: 2560px) {
      .collab-inner, .footer-main { max-width: min(82%, 2100px); }
    }
    @media (max-width: 1024px) {
      .footer-main { justify-items: center; text-align: center; }
      .footer-brand { flex-direction: column; gap: var(--space-2); }
      .footer-links { flex-direction: column; align-items: center; gap: var(--space-3); }
      .footer-social { align-items: center; text-align: center; }
    }
    @media (max-width: 640px) {
      .footer-collab { padding: var(--space-5) var(--space-4); }
      .collab-img { height: 48px; max-width: 140px; filter: grayscale(100%); opacity: 0.6; }
      .collab-item:hover .collab-img { filter: grayscale(0%); opacity: 1; }
      .collab-grid { gap: var(--space-8); }
      .featured-grid { grid-template-columns: 1fr; gap: 12px; }
      .featured-sponsor { padding: 20px 20px 18px; }
      .featured-logo { height: 56px; max-width: 200px; }
      .featured-sub { font-size: 10px; }
      .footer-main { padding: var(--space-6) var(--space-4); gap: var(--space-5); }
      .footer-logo { height: 40px; }
      .brand-text h4 { font-size: var(--text-base); }
      .footer-links { gap: var(--space-2); }
      .footer-links a { font-size: var(--text-xs); }
    }
  `]
})
export class HomeFooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  private partnersService = inject(PartnersService);

  sponsors = signal<Partner[]>([]);
  colaboradores = signal<Partner[]>([]);

  ngOnInit(): void {
    this.partnersService.getPublicList('sponsor').subscribe({
      next: (res) => this.sponsors.set(res.data || [])
    });
    this.partnersService.getPublicList('colaborador').subscribe({
      next: (res) => this.colaboradores.set(res.data || [])
    });
  }

  openUrl(url: string | null): void {
    if (url) window.open(url, '_blank');
  }
}
