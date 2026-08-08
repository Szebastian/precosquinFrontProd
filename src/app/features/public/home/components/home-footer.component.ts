import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="portal-footer">
      <div class="footer-sponsors">
        <div class="sponsors-inner">
          <span class="sponsors-label">COLABORAN</span>
          <div class="sponsors-grid">
            <a href="https://www.instagram.com/municipalidad_puerto_piramides/" target="_blank" class="sponsor-link" title="Municipalidad Puerto Pirámides">
              <img src="assets/img/LPiramides.webp" alt="Puerto Pirámides" class="sponsor-logo" width="120" height="60" loading="lazy" decoding="async" />
            </a>
            <a href="https://www.instagram.com/rayentrayhoteles" target="_blank" class="sponsor-link" title="Hotel Rayentray">
              <img src="assets/img/LRayentray.webp" alt="Hotel Rayentray" class="sponsor-logo" width="120" height="60" loading="lazy" decoding="async" />
            </a>
            <a href="https://www.instagram.com/hydrosportavistajes" target="_blank" class="sponsor-link" title="Hydro Sport Avistajes">
              <img src="assets/img/LHydro.webp" alt="Hydro" class="sponsor-logo" width="120" height="60" loading="lazy" decoding="async" />
            </a>
            <a href="https://www.instagram.com/hidden.house" target="_blank" class="sponsor-link" title="Hidden House">
              <img src="assets/img/logoHH.webp" alt="HH" class="sponsor-logo" width="120" height="60" loading="lazy" decoding="async" />
            </a>
            <a href="https://www.instagram.com/bodegon_elrefugio" target="_blank" class="sponsor-link" title="Bodegón El Refugio">
              <img src="assets/img/BodegonElRefugio.webp" alt="Bodegón El Refugio" class="sponsor-logo" width="120" height="60" loading="lazy" decoding="async" />
            </a>
            <a href="https://www.instagram.com/elrefugiopiramides" target="_blank" class="sponsor-link" title="El Refugio Pirámides">
              <img src="assets/img/ElRefugioPIramiLogo.webp" alt="El Refugio Pirámides" class="sponsor-logo" width="120" height="60" loading="lazy" decoding="async" />
            </a>
            <a href="https://www.instagram.com/lareservaenelmar" target="_blank" class="sponsor-link" title="La Reserva En El Mar">
              <img src="assets/img/logoLaReservaEnElMar.webp" alt="La Reserva En El Mar" class="sponsor-logo" width="120" height="60" loading="lazy" decoding="async" />
            </a>
            <a href="https://www.instagram.com/avistajespekesosa" target="_blank" class="sponsor-link" title="Avistajes Peke Sosa">
              <img src="assets/img/LOGO-PEKE-png-4k.webp" alt="Avistajes Peke Sosa" class="sponsor-logo" width="120" height="60" loading="lazy" decoding="async" />
            </a>
          </div>
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
    .portal-footer { margin-top: auto; background-color: var(--gray-900); border-top: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; }
    .footer-sponsors { background-color: rgba(0,0,0,0.3); padding: 48px 24px; display: flex; justify-content: center; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .sponsors-inner { width: 100%; max-width: min(92%, 1200px); display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .sponsors-label { font-size: 10px; font-weight: var(--weight-bold); letter-spacing: 0.2em; color: var(--gray-300); }
    .sponsors-grid { display: flex; align-items: center; justify-content: center; gap: 64px; flex-wrap: wrap; }
    .sponsor-logo { height: 48px; max-width: 140px; width: auto; object-fit: contain; object-position: center; opacity: 0.8; transition: all 0.3s ease; }
    .sponsor-link { display: inline-flex; text-decoration: none; }
    .sponsor-link:hover .sponsor-logo { opacity: 1; transform: translateY(-2px); }
    .sponsor-link:focus-visible .sponsor-logo { outline: 2px solid var(--brand-500); outline-offset: 4px; }
    .footer-main { width: 100%; max-width: min(92%, 1200px); margin: 0 auto; padding: 48px 24px; display: grid; grid-template-columns: 1fr; gap: 32px; }
    .footer-brand { display: flex; align-items: center; gap: var(--space-4); }
    .footer-logo { height: 60px; width: auto; opacity: 0.85; }
    .footer-logo:hover { opacity: 1; }
    .brand-text h4 { margin: 0; color: #fff; font-size: var(--text-lg); font-weight: var(--weight-bold); }
    .brand-text p { margin: 0; color: var(--gray-300); font-size: var(--text-sm); }
    .footer-links { display: flex; gap: var(--space-6); justify-content: center; }
    .footer-links a { color: var(--gray-300); text-decoration: none; font-size: var(--text-sm); font-weight: var(--weight-medium); transition: color var(--transition-fast); }
    .footer-links a:hover { color: #fff; }
    .footer-links a:focus-visible { outline: 2px solid var(--brand-500); outline-offset: 2px; border-radius: 2px; }
    .footer-social { display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-2); }
    .footer-social p { margin: 0; font-size: var(--text-sm); color: var(--gray-300); font-weight: var(--weight-medium); }
    .social-icons { display: flex; gap: var(--space-3); }
    .social-icon { color: var(--gray-300); transition: all var(--transition-fast); display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background-color: rgba(255,255,255,0.08); }
    .social-icon:hover { color: #fff; background-color: var(--brand-500); transform: translateY(-2px); }
    .social-icon:focus-visible { outline: 2px solid var(--brand-500); outline-offset: 2px; }
    .footer-copyright { background-color: rgba(0,0,0,0.4); color: var(--gray-300); text-align: center; padding: var(--space-4); font-size: var(--text-xs); border-top: 1px solid rgba(255,255,255,0.05); }
    @media (min-width: 1280px) {
      .sponsors-inner, .footer-main { max-width: min(90%, 1400px); }
      .footer-main { grid-template-columns: 1fr 1fr 1fr; gap: 40px; }
      .footer-links { justify-content: flex-start; }
      .footer-social { align-items: flex-end; }
    }
    @media (min-width: 1600px) {
      .sponsors-inner, .footer-main { max-width: min(88%, 1600px); }
    }
    @media (min-width: 1920px) {
      .sponsors-inner, .footer-main { max-width: min(86%, 1800px); }
    }
    @media (min-width: 2560px) {
      .sponsors-inner, .footer-main { max-width: min(82%, 2100px); }
    }
    @media (max-width: 1024px) {
      .footer-main { justify-items: center; text-align: center; }
      .footer-brand { flex-direction: column; gap: var(--space-2); }
      .footer-links { flex-direction: column; align-items: center; gap: var(--space-3); }
      .footer-social { align-items: center; text-align: center; }
    }
    @media (max-width: 640px) {
      .footer-sponsors { padding: var(--space-5) var(--space-4); }
      .sponsor-logo { height: 36px; max-width: 100px; opacity: 0.8; }
      .sponsor-link:hover .sponsor-logo { opacity: 1; }
      .sponsors-grid { gap: var(--space-8); }
      .footer-main { padding: var(--space-6) var(--space-4); gap: var(--space-5); }
      .footer-logo { height: 40px; }
      .brand-text h4 { font-size: var(--text-base); }
      .footer-links { gap: var(--space-2); }
      .footer-links a { font-size: var(--text-xs); }
    }
  `]
})
export class HomeFooterComponent {
  currentYear = new Date().getFullYear();
}
