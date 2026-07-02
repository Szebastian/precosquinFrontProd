import { Component, HostListener, signal, computed, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgStyle, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface NewsItem {
  id: number;
  category: string;
  title: string;
  image: string;        // URL de la imagen de fondo de la noticia destacada
  imagePosition?: string;
  thumbType: 'img' | 'icon';
  thumbSrc: string;     // imagen o ícono SVG inline para el thumbnail
  thumbBg: string;      // clase css bg-blue | bg-gold | bg-gray
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgStyle, NgClass],
  template: `
    <div class="portal">
      <!-- HEADER PRINCIPAL -->
      <header class="portal-header">
        <div class="header-topbar">
          <div class="header-topbar-inner">
            <div class="header-topbar-left">
              <span class="topbar-info">PRE-COSQUÍN PUERTO PIRÁMIDES 2026</span>
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
            <img src="assets/img/logoballena.png" alt="Logo" class="header-logo" />
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
            <a routerLink="/documentacion" class="nav-link">Documentación</a>
          </nav>
          
          <div class="header-right">
            <div class="search-box">
              <input type="text" placeholder="Buscar..." />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
            </div>
            <a routerLink="/auth/login" class="btn btn-primary btn-sm login-btn">Acceder</a>
          </div>
        </div>
      </header>

      <!-- SECCIÓN PRINCIPAL (GRILLA CON CARRUSEL) -->
      <main class="portal-main">
        <div 
          class="news-grid"
          (mouseenter)="isPaused = true"
          (mouseleave)="isPaused = false"
        >
          
          <!-- Noticia Principal (Izquierda) — controlada por activeIndex -->
          <a
            routerLink="/noticias"
            class="featured-news"
            [ngStyle]="{ 'background-image': 'url(' + activeNews().image + ')' }"
            [style.background-position]="activeNews().imagePosition || 'center center'"
          >
            <div class="featured-overlay"></div>
            <div class="featured-content featured-fade" [class.fade-in]="!isTransitioning()">
              <span class="news-category">{{ activeNews().category }}</span>
              <h1 class="featured-title">{{ activeNews().title }}</h1>
            </div>
            <!-- Indicadores de puntos -->
            <div class="carousel-dots">
              @for (item of newsItems(); track item.id) {
                <button
                  class="dot"
                  [class.dot-active]="activeIndex() === $index"
                  (click)="selectNews($index); $event.preventDefault(); $event.stopPropagation()"
                  [attr.aria-label]="'Ver noticia ' + ($index + 1)"
                ></button>
              }
            </div>
          </a>

          <!-- Noticias Secundarias (Derecha) -->
          <aside class="secondary-news">
            @for (item of newsItems(); track item.id; let i = $index) {
              <a
                routerLink="/noticias"
                class="news-item"
                [class.news-item-active]="activeIndex() === i"
                (click)="selectNews(i); $event.preventDefault(); $event.stopPropagation()"
                role="button"
                [attr.aria-label]="'Seleccionar: ' + item.title"
              >
                <div class="news-item-content">
                  <h3 class="news-item-title">{{ item.title }}</h3>
                </div>
                <div class="news-item-thumb" [ngClass]="item.thumbBg">
                  @if (item.thumbType === 'img') {
                    <img [src]="item.thumbSrc" [alt]="item.title" />
                  } @else {
                    <span [innerHTML]="sanitizeHtml(item.thumbSrc)"></span>
                  }
                </div>
              </a>
            }
          </aside>
        </div>
      </main>

      <!-- SEPARADOR 1: Curva con imagen difuminada -->
      <div class="section-separator separator-wave">
        <div class="separator-bg">
          <img src="assets/img/separador.png" alt="" class="separator-img" />
          <div class="separator-overlay"></div>
        </div>
        <div class="separator-content">
          <div class="separator-inner">
            <span class="separator-label">MÚSICA Y DANZA</span>
            <h2 class="separator-title">Categorías del Festival</h2>
            <div class="separator-cats">
              <span class="sep-cat">Solista Vocal</span>
              <span class="sep-cat-dot"></span>
              <span class="sep-cat">Solista Instrumental</span>
              <span class="sep-cat-dot"></span>
              <span class="sep-cat">Dúo</span>
              <span class="sep-cat-dot"></span>
              <span class="sep-cat">Trío</span>
              <span class="sep-cat-dot"></span>
              <span class="sep-cat">Conjunto</span>
              <span class="sep-cat-dot"></span>
              <span class="sep-cat">Coro</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA BANNER -->
      <section class="cta-banner">
        <div class="cta-inner">
          <div class="cta-content">
            <span class="cta-badge">INSCRIPCIONES 2026</span>
            <h2 class="cta-title">¿Listo para participar?</h2>
            <p class="cta-desc">Inscribí tu propuesta artística y formá parte del festival folclórico más importante de la Patagonia.</p>
          </div>
          <a routerLink="/inscripcion" class="cta-btn">
            INSCRIBIRME AHORA
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </section>

      <!-- SEPARADOR 2: Diagonal con imagen difuminada -->
      <div class="section-separator separator-diagonal">
        <div class="separator-bg">
          <img src="assets/img/separador.png" alt="" class="separator-img" />
          <div class="separator-overlay separator-overlay-dark"></div>
        </div>
        <div class="separator-content separator-content-sm">
          <div class="separator-inner">
            <div class="separator-stats">
              <div class="sep-stat">
                <span class="sep-stat-value">2</span>
                <span class="sep-stat-label">Categorías</span>
              </div>
              <div class="sep-stat-divider"></div>
              <div class="sep-stat">
                <span class="sep-stat-value">12</span>
                <span class="sep-stat-label">Subcategorías</span>
              </div>
              <div class="sep-stat-divider"></div>
              <div class="sep-stat">
                <span class="sep-stat-value">5-6</span>
                <span class="sep-stat-label">Septiembre</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SCOREBOARD / CINTA INFERIOR -->
      <section class="portal-scoreboard">
        <div class="scoreboard-inner">
          <div class="score-item">
            <span class="score-label">UBICACIÓN</span>
            <span class="score-value">PUERTO PIRÁMIDES</span>
          </div>
          <div class="score-divider"></div>
          <div class="score-item">
            <span class="score-label">PROVINCIA</span>
            <span class="score-value">CHUBUT, PATAGONIA</span>
          </div>
          <div class="score-divider"></div>
          <div class="score-item">
            <span class="score-label">EDICIÓN</span>
            <span class="score-value">PRE-COSQUÍN 2026</span>
          </div>
          <div class="score-divider"></div>
          <div class="score-item score-action">
            <a routerLink="/inscripcion" class="score-link">VER MÁS INFORMACIÓN</a>
          </div>
        </div>
      </section>
      
      <!-- FOOTER PRINCIPAL -->
      <footer class="portal-footer">
        <div class="footer-sponsors">
          <div class="sponsors-inner">
            <span class="sponsors-label">ORGANIZAN</span>
            <div class="sponsors-grid">
              <img src="assets/img/LPiramides.png" alt="Puerto Pirámides" class="sponsor-logo" />
              <img src="assets/img/LRayentray.png" alt="Hotel Rayentray" class="sponsor-logo" />
              <img src="assets/img/LHydro.png" alt="Hydro" class="sponsor-logo" />
            </div>
          </div>
        </div>
        
        <div class="footer-main">
          <div class="footer-brand">
            <img src="assets/img/logoballena.png" alt="Precosquin" class="footer-logo" />
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
      <!-- YOUTUBE LIVE WIDGET -->
      <div class="yt-widget" [class.yt-expanded]="ytExpanded()">
        @if (ytExpanded()) {
          <div class="yt-player">
            <div class="yt-player-header">
              <span class="yt-player-title">
                <span class="yt-live-dot" [class.yt-dot-active]="ytIsLive()"></span>
                Precosquín en Vivo
              </span>
              <div class="yt-player-actions">
                <button class="yt-toggle-btn" (click)="toggleLive()" [class.yt-toggle-active]="ytIsLive()">
                  {{ ytIsLive() ? 'EN VIVO' : 'OFFLINE' }}
                </button>
                <a href="https://www.youtube.com/@PreCosquinPuertoPirámides" target="_blank" class="yt-action-btn" title="Abrir en YouTube">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
                <button class="yt-action-btn" (click)="ytExpanded.set(false)" title="Minimizar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </div>
            <div class="yt-player-body">
              @if (ytIsLive()) {
                <iframe
                  src="https://www.youtube.com/embed/qlLOBGeWqQs?autoplay=0"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  class="yt-iframe">
                </iframe>
              } @else {
                <div class="yt-offline">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="9.5 7.5 16.5 12 9.5 16.5 9.5 7.5" fill="currentColor" stroke="none"/></svg>
                  <p>Sin transmisión en este momento</p>
                  <a href="https://www.youtube.com/@PreCosquinPuertoPirámides" target="_blank" class="yt-channel-link">Ir al canal de YouTube</a>
                </div>
              }
            </div>
          </div>
        } @else {
          <button class="yt-fab" (click)="ytExpanded.set(true)">
            <div class="yt-fab-icon" [class.yt-pulse]="ytIsLive()">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </div>
            <div class="yt-fab-label">
              <span class="yt-live-dot" [class.yt-dot-active]="ytIsLive()"></span>
              {{ ytIsLive() ? 'EN VIVO' : 'OFFLINE' }}
            </div>
          </button>
        }
      </div>

    </div>
  `,
  styles: [`
    .portal {
      min-height: 100vh;
      background-color: var(--gray-50); /* Fondo claro beige */
      font-family: var(--font-sans);
      display: flex;
      flex-direction: column;
    }

    /* --- HEADER PRINCIPAL --- */
    .portal-header {
      background-color: var(--brand-200); /* Azul claro como en AFA */
      border-bottom: 2px solid var(--brand-500);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-sm);
    }

    .header-topbar {
      background-color: rgba(0, 0, 0, 0.05); /* Tono ligeramente más oscuro */
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      height: 32px;
      display: flex;
      align-items: center;
    }

    .header-topbar-inner {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 var(--space-4);
    }

    .header-topbar-left {
      display: flex;
      align-items: center;
    }

    .topbar-info {
      font-size: 10px;
      font-weight: var(--weight-bold);
      color: var(--brand-800);
      letter-spacing: 0.08em;
    }

    .header-topbar-right {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .topbar-social-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: var(--radius-sm);
      background-color: var(--brand-900);
      color: white;
      transition: all var(--transition-fast);
    }

    .topbar-social-icon:hover {
      background-color: var(--brand-700);
      transform: scale(1.1);
    }

    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-4);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      height: 100%;
    }

    .header-logo {
      height: 40px;
      width: auto;
      object-fit: contain;
    }

    .header-divider {
      width: 1px;
      height: 30px;
      background-color: var(--brand-500);
      opacity: 0.3;
    }

    .header-brand-text {
      display: flex;
      flex-direction: column;
      gap: 0;
      line-height: 1;
    }

    .header-brand-subtitle {
      font-size: 9px;
      font-weight: var(--weight-extrabold);
      color: var(--brand-600);
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }

    .header-brand-title {
      font-family: var(--font-display);
      font-size: var(--text-base);
      font-weight: var(--weight-extrabold);
      color: var(--brand-900);
      letter-spacing: -0.01em;
      line-height: 1.15;
    }

    .header-nav {
      display: flex;
      align-items: center;
      gap: var(--space-6);
      height: 100%;
    }

    .nav-link {
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
      color: var(--gray-800);
      text-transform: uppercase;
      text-decoration: none;
      height: 100%;
      display: flex;
      align-items: center;
      border-bottom: 3px solid transparent;
      transition: all var(--transition-fast);
    }

    .nav-link:hover, .nav-link.active {
      color: var(--brand-800);
      border-bottom-color: var(--brand-700);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-box input {
      background: transparent;
      border: 1px solid var(--brand-300);
      border-radius: var(--radius-full);
      padding: 0.4rem 1rem;
      padding-right: 2.5rem;
      font-size: var(--text-sm);
      color: var(--gray-800);
      outline: none;
      width: 150px;
      transition: width var(--transition-base);
    }

    .search-box input:focus {
      width: 200px;
      border-color: var(--brand-500);
      background: rgba(255,255,255,0.5);
    }

    .search-box svg {
      position: absolute;
      right: 10px;
      color: var(--gray-600);
    }

    .login-btn {
      text-transform: uppercase;
      font-weight: var(--weight-bold);
    }

    /* --- SECCIÓN PRINCIPAL (GRILLA) --- */
    .portal-main {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      padding: var(--space-6) var(--space-4);
    }

    .news-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-6);
      min-height: 500px;
    }

    /* Noticia Principal */
    .featured-news {
      position: relative;
      border-radius: var(--radius-xl);
      overflow: hidden;
      background-size: cover;
      background-position: 50% 20%;
      background-repeat: no-repeat;
      display: flex;
      align-items: flex-end;
      padding: var(--space-8);
      box-shadow: var(--shadow-md);
      transition: transform var(--transition-base);
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      min-height: 500px;
      height: auto;
      aspect-ratio: 2110 / 500;
      width: 100%;
    }

    .featured-news:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .featured-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, transparent 100%);
    }

    .featured-content {
      position: relative;
      z-index: 10;
      color: white;
      max-width: 80%;
    }

    .news-category {
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background-color: var(--brand-accent);
      color: var(--gray-900);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-sm);
      display: inline-block;
      margin-bottom: var(--space-3);
    }

    .featured-title {
      font-size: var(--text-3xl);
      color: white;
      line-height: 1.2;
      margin: 0;
    }

    /* Noticias Secundarias */
    .secondary-news {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .news-item {
      display: flex;
      background: white;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      height: calc(33.333% - 0.7rem); /* 3 items equitativos */
      min-height: 120px;
      cursor: pointer;
      transition: all var(--transition-base);
      border: 1px solid var(--gray-200);
      text-decoration: none;
      color: inherit;
    }

    .news-item:hover {
      box-shadow: var(--shadow-md);
      transform: translateX(-4px);
      border-left: 4px solid var(--brand-500);
    }

    .news-item-content {
      flex: 1;
      padding: var(--space-4);
      display: flex;
      align-items: center;
    }

    .news-item-title {
      font-size: var(--text-base);
      font-family: var(--font-sans);
      font-weight: var(--weight-bold);
      color: var(--gray-800);
      line-height: 1.4;
      margin: 0;
    }

    .news-item-thumb {
      width: 120px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .news-item-thumb img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: var(--space-2);
    }

    .bg-blue { 
      background-color: var(--brand-500); 
      background-image: url('/assets/img/simbolAzul.png');
      background-size: cover;
      background-position: center;
    }
    .bg-gold { 
      background-color: var(--brand-accent); 
      color: var(--gray-900) !important; 
      background-image: url('/assets/img/simbolMostaza.png');
      background-size: cover;
      background-position: center;
    }
    .bg-gray { background-color: var(--gray-300); color: var(--gray-700) !important; }

    /* Estado ACTIVO de la noticia secundaria seleccionada */
    .news-item-active {
      border-left: 4px solid var(--brand-600) !important;
      background-color: var(--brand-50) !important;
      box-shadow: var(--shadow-md);
    }

    .news-item-active .news-item-title {
      color: var(--brand-700);
    }

    /* Animación FADE del panel destacado */
    .featured-fade {
      transition: opacity 0.2s ease;
    }

    .featured-fade.fade-in {
      opacity: 1;
    }

    .featured-fade:not(.fade-in) {
      opacity: 0;
    }

    /* Puntos indicadores del carrusel */
    .carousel-dots {
      position: absolute;
      bottom: var(--space-4);
      right: var(--space-4);
      display: flex;
      gap: var(--space-2);
      z-index: 20;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5);
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
      padding: 0;
    }

    .dot-active {
      background-color: white;
      transform: scale(1.3);
    }

    .dot:hover:not(.dot-active) {
      background-color: rgba(255, 255, 255, 0.8);
    }

    /* --- SECTION SEPARATORS --- */
    .section-separator {
      position: relative;
      overflow: hidden;
    }

    .separator-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .separator-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(3px) brightness(0.7);
      transform: scale(1.1);
    }

    .separator-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.85) 0%, rgba(29, 78, 216, 0.9) 100%);
      mix-blend-mode: multiply;
    }

    .separator-overlay-dark {
      background: linear-gradient(135deg, rgba(29, 78, 216, 0.9) 0%, rgba(30, 58, 138, 0.95) 100%);
    }

    .separator-content {
      position: relative;
      z-index: 3;
      padding: var(--space-8) var(--space-4) var(--space-12);
    }

    .separator-content-sm {
      padding: var(--space-6) var(--space-4) var(--space-10);
    }

    .separator-inner {
      max-width: 1000px;
      margin: 0 auto;
      text-align: center;
    }

    .separator-label {
      display: inline-block;
      font-size: 10px;
      font-weight: var(--weight-bold);
      letter-spacing: 0.2em;
      color: rgba(255,255,255,0.7);
      margin-bottom: var(--space-3);
    }

    .separator-title {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: var(--weight-extrabold);
      color: #fff;
      margin: 0 0 var(--space-6);
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }

    .separator-cats {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .sep-cat {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: rgba(255,255,255,0.9);
      background: rgba(255,255,255,0.12);
      padding: 6px 16px;
      border-radius: var(--radius-full);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255,255,255,0.15);
    }

    .sep-cat-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(255,255,255,0.4);
    }

    .separator-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-8);
    }

    .sep-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .sep-stat-value {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: var(--weight-extrabold);
      color: #fff;
      line-height: 1;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }

    .sep-stat-label {
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      color: rgba(255,255,255,0.7);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .sep-stat-divider {
      width: 1px;
      height: 40px;
      background: rgba(255,255,255,0.25);
    }

    /* --- CTA BANNER --- */
    .cta-banner {
      background: var(--brand-600);
      padding: var(--space-12) var(--space-4);
    }

    .cta-inner {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-8);
    }

    .cta-content {
      flex: 1;
    }

    .cta-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: var(--weight-bold);
      letter-spacing: 0.15em;
      color: var(--brand-200);
      background: rgba(255,255,255,0.12);
      padding: 5px 14px;
      border-radius: var(--radius-full);
      margin-bottom: var(--space-4);
    }

    .cta-title {
      font-family: var(--font-display);
      font-size: 2.25rem;
      font-weight: var(--weight-extrabold);
      color: #fff;
      margin: 0 0 var(--space-3);
      line-height: 1.15;
    }

    .cta-desc {
      font-size: var(--text-base);
      color: rgba(255,255,255,0.8);
      margin: 0;
      max-width: 500px;
      line-height: 1.6;
    }

    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: var(--brand-accent);
      color: var(--gray-900);
      padding: 14px 28px;
      border-radius: var(--radius-full);
      font-size: var(--text-sm);
      font-weight: var(--weight-extrabold);
      text-decoration: none;
      letter-spacing: 0.05em;
      transition: all var(--transition-fast);
      white-space: nowrap;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }

    /* --- SCOREBOARD --- */
    .portal-scoreboard {
      background-color: white;
      border-top: 1px solid var(--gray-200);
      border-bottom: 1px solid var(--gray-200);
      padding: var(--space-3) 0;
      margin-top: var(--space-8);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }

    .scoreboard-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-6);
      padding: 0 var(--space-4);
      flex-wrap: wrap;
    }

    .score-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .score-label {
      font-size: var(--text-xs);
      color: var(--gray-500);
      font-weight: var(--weight-bold);
    }

    .score-value {
      font-size: var(--text-sm);
      color: var(--gray-900);
      font-weight: var(--weight-bold);
      font-family: var(--font-display);
    }

    .score-divider {
      width: 1px;
      height: 20px;
      background-color: var(--gray-300);
    }

    .score-link {
      background-color: var(--brand-accent);
      color: var(--gray-900);
      padding: 0.3rem 1rem;
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      text-decoration: none;
      transition: opacity var(--transition-fast);
    }
    .score-link:hover { opacity: 0.8; }

    /* --- FOOTER PRINCIPAL --- */
    .portal-footer {
      margin-top: auto;
      background-color: var(--gray-900);
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
    }

    .footer-sponsors {
      background-color: rgba(0,0,0,0.3);
      padding: var(--space-8) var(--space-4);
      display: flex;
      justify-content: center;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .sponsors-inner {
      max-width: 1000px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
    }

    .sponsors-label {
      font-size: 10px;
      font-weight: var(--weight-bold);
      letter-spacing: 0.2em;
      color: var(--gray-500);
    }

    .sponsors-grid {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-16);
      flex-wrap: wrap;
    }

    .sponsor-logo {
      height: 60px;
      width: auto;
      object-fit: contain;
      opacity: 0.5;
      filter: grayscale(100%);
      transition: all 0.3s ease;
    }

    .sponsor-logo:hover {
      opacity: 1;
      filter: grayscale(0%);
    }

    .footer-main {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      padding: var(--space-10) var(--space-4);
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: var(--space-8);
      align-items: center;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .footer-logo {
      height: 60px;
      width: auto;
      filter: brightness(0) invert(1) opacity(0.9);
    }

    .brand-text h4 {
      margin: 0;
      color: #fff;
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
    }

    .brand-text p {
      margin: 0;
      color: var(--gray-400);
      font-size: var(--text-sm);
    }

    .footer-links {
      display: flex;
      gap: var(--space-6);
      justify-content: center;
    }

    .footer-links a {
      color: var(--gray-400);
      text-decoration: none;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      transition: color var(--transition-fast);
    }

    .footer-links a:hover {
      color: #fff;
    }

    .footer-social {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-2);
    }

    .footer-social p {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--gray-400);
      font-weight: var(--weight-medium);
    }

    .social-icons {
      display: flex;
      gap: var(--space-3);
    }

    .social-icon {
      color: var(--gray-400);
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(255,255,255,0.08);
    }

    .social-icon:hover {
      color: #fff;
      background-color: var(--brand-500);
      transform: translateY(-2px);
    }

    .footer-copyright {
      background-color: rgba(0,0,0,0.4);
      color: var(--gray-500);
      text-align: center;
      padding: var(--space-4);
      font-size: var(--text-xs);
      border-top: 1px solid rgba(255,255,255,0.05);
    }

    /* --- YOUTUBE LIVE WIDGET --- */
    .yt-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999;
    }

    .yt-fab {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #fff;
      border: none;
      border-radius: 60px;
      padding: 10px 18px 10px 14px;
      cursor: pointer;
      box-shadow: 0 8px 30px rgba(0,0,0,0.25);
      transition: all 0.3s ease;
    }

    .yt-fab:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    }

    .yt-fab-icon {
      width: 40px;
      height: 40px;
      background: #ff0000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      position: relative;
    }

    .yt-fab-icon.yt-pulse {
      animation: ytPulse 2s infinite;
    }

    @keyframes ytPulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.5); }
      70% { box-shadow: 0 0 0 12px rgba(255, 0, 0, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
    }

    .yt-fab-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #333;
      letter-spacing: 0.03em;
    }

    .yt-live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #999;
    }

    .yt-live-dot.yt-dot-active {
      background: #ff0000;
      animation: ytBlink 1s infinite;
    }

    @keyframes ytBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .yt-expanded {
      bottom: 24px;
      right: 24px;
    }

    .yt-player {
      width: 400px;
      background: #1a1a1a;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 16px 50px rgba(0,0,0,0.4);
      animation: ytSlideUp 0.3s ease;
    }

    @keyframes ytSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .yt-player-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #111;
    }

    .yt-player-title {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .yt-player-title::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ff0000;
    }

    .yt-player-actions {
      display: flex;
      gap: 4px;
    }

    .yt-action-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      background: rgba(255,255,255,0.1);
      color: #aaa;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      text-decoration: none;
    }

    .yt-action-btn:hover {
      background: rgba(255,255,255,0.2);
      color: #fff;
    }

    .yt-toggle-btn {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 4px 10px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      background: rgba(255,255,255,0.1);
      color: #888;
      transition: all 0.2s;
    }

    .yt-toggle-btn:hover {
      background: rgba(255,255,255,0.2);
    }

    .yt-toggle-active {
      background: #ff0000 !important;
      color: #fff !important;
      animation: ytBlink 1.5s infinite;
    }

    .yt-player-body {
      aspect-ratio: 16/9;
      background: #000;
    }

    .yt-iframe {
      width: 100%;
      height: 100%;
    }

    .yt-offline {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #666;
    }

    .yt-offline p {
      margin: 0;
      font-size: 13px;
    }

    .yt-channel-link {
      font-size: 12px;
      color: #ff0000;
      text-decoration: none;
      font-weight: 600;
      padding: 6px 14px;
      border: 1px solid #ff0000;
      border-radius: 20px;
      transition: all 0.2s;
    }

    .yt-channel-link:hover {
      background: #ff0000;
      color: #fff;
    }

    /* --- RESPONSIVE --- */
    @media (max-width: 1024px) {
      .header-nav { display: none; }
      .search-box { display: none; }
      
      .news-grid {
        grid-template-columns: 1fr;
      }

      .cta-inner {
        flex-direction: column;
        text-align: center;
      }

      .cta-desc { margin: 0 auto; }

      .separator-title { font-size: 1.5rem; }
      .separator-cats { gap: var(--space-2); }
      .sep-cat { font-size: 11px; padding: 4px 10px; }

      .separator-stats { gap: var(--space-5); }
      .sep-stat-value { font-size: 2rem; }
      
      .footer-main {
        grid-template-columns: 1fr;
        text-align: center;
        gap: var(--space-6);
      }
    }\n  `]
})
export class HomePageComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  currentYear = new Date().getFullYear();
  scrollY = signal(0);
  activeIndex = signal(0);
  isTransitioning = signal(false);
  isPaused = false;

  ytExpanded = signal(false);
  ytIsLive = signal(true);
  ytChannelUrl = 'https://www.youtube.com/@PreCosquinPuertoPirámides';

  private autoPlayInterval: any;

  newsItems = signal<NewsItem[]>([
    {
      id: 1,
      category: 'FESTIVAL 2026',
      title: 'Se abren las inscripciones para el certamen Nuevos Valores',
      image: 'assets/home-background.jpg',
      thumbType: 'img',
      thumbSrc: 'assets/img/cruzBaila.png',
      thumbBg: 'bg-blue'
    },
    {
      id: 2,
      category: 'JURADO',
      title: 'Capacitación para el jurado de danza en el Hotel Rayentray',
      image: 'assets/rayentray.png',
      thumbType: 'img',
      thumbSrc: 'assets/img/cruzBaila.png',
      thumbBg: 'bg-blue'
    },
    {
      id: 3,
      category: 'REGLAMENTO',
      title: 'Modificación en el reglamento del rubro "Solista Vocal"',
      image: 'assets/hidro.jpeg',
      thumbType: 'icon',
      thumbSrc: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>',
      thumbBg: 'bg-gold'
    },
    {
      id: 4,
      category: 'CRONOGRAMA',
      title: 'Cronograma oficial de la primera ronda clasificatoria',
      image: 'assets/home-background.jpg',
      thumbType: 'icon',
      thumbSrc: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      thumbBg: 'bg-gray'
    }
  ]);

  activeNews = computed(() => this.newsItems()[this.activeIndex()]);

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  ngOnInit(): void {
    this.loadNewsFromApi();
    this.startCarousel();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  loadNewsFromApi(): void {
    this.http.get<NewsItem[]>(`${environment.apiUrl}/news`).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.newsItems.set(data);
          this.activeIndex.set(0);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching news from API, using fallback local news', err);
      }
    });
  }

  startCarousel(): void {
    this.stopCarousel();
    this.autoPlayInterval = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, 5000);
  }

  stopCarousel(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  nextSlide(): void {
    const nextIndex = (this.activeIndex() + 1) % this.newsItems().length;
    this.selectNews(nextIndex);
  }

  selectNews(index: number): void {
    if (index === this.activeIndex()) return;
    
    this.startCarousel();

    this.isTransitioning.set(true);
    this.cdr.detectChanges();

    setTimeout(() => {
      this.activeIndex.set(index);
      this.isTransitioning.set(false);
      this.cdr.detectChanges();
    }, 200);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrollY.set(window.scrollY);
  }

  toggleLive() {
    this.ytIsLive.set(!this.ytIsLive());
  }
}
