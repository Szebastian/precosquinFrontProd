import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { HeroCarouselComponent, NewsItem } from './components/hero.component';
import { HomeHeaderComponent } from './components/home-header.component';
import { HomeComponentSeparatorComponent } from './components/home-separator.component';
import { HomeDeclaracionHeroComponent } from './components/home-declaracion-hero.component';
import { HomeScoreboardComponent } from './components/home-scoreboard.component';
import { HomeFooterComponent } from './components/home-footer.component';
import { InstagramFeedComponent } from './components/instagram-feed.component';
import { ThreeGalleryComponent } from './components/three-gallery.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    HomeHeaderComponent,
    HeroCarouselComponent,
    HomeComponentSeparatorComponent,
    HomeDeclaracionHeroComponent,
    HomeScoreboardComponent,
    HomeFooterComponent,
    InstagramFeedComponent,
    ThreeGalleryComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="portal">
      <app-home-header />

      <main class="portal-main">
        <!-- 1. HERO CAROUSEL — dark band -->
        <div class="band-dark">
          <div class="band-inner">
            <app-news-carousel [newsItems]="newsItems()" />
          </div>
        </div>

        <!-- 2. INSCRIPCIONES CTA — light band -->
        <section class="band-light">
          <div class="band-inner">
            <div class="inscripciones-block">
              <div class="inscripciones-inner">
                <div class="inscripciones-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  INSCRIPCIONES ABIERTAS
                </div>
                <h2 class="inscripciones-title">¿Listo para participar?</h2>
                <p class="inscripciones-desc">Inscribí tu propuesta artística y formá parte del festival folclórico más importante de la Patagonia.</p>
                <div class="inscripciones-actions">
                  <a routerLink="/inscripcion" class="btn-primary">
                    INSCRIBIRME AHORA
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </a>
                  <a routerLink="/documentacion" class="btn-secondary">
                    Ver documentación
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. CATEGORÍAS — blue band (full-bleed image) -->
        <div class="band-blue">
          <app-home-separator variant="wave">
            <span class="separator-label">MÚSICA Y DANZA</span>
            <h2 class="separator-title">Categorías del Festival</h2>
            <div class="separator-groups">
              <div class="separator-group">
                <span class="separator-group-label">Música</span>
                <div class="separator-cats">
                  <span class="sep-cat">Solista Vocal</span>
                  <span class="sep-cat">Dúo Vocal</span>
                  <span class="sep-cat">Expresión Oral Folclórica</span>
                  <span class="sep-cat">Conjunto Vocal</span>
                  <span class="sep-cat">Solista Instrumental</span>
                  <span class="sep-cat">Conjunto Instrumental</span>
                  <span class="sep-cat">Canción Inédita</span>
                </div>
              </div>
              <div class="separator-group">
                <span class="separator-group-label">Danza</span>
                <div class="separator-cats">
                  <span class="sep-cat">Malambo Masculino</span>
                  <span class="sep-cat">Malambo Femenino</span>
                  <span class="sep-cat">Conjunto de Malambo</span>
                  <span class="sep-cat">Pareja Tradicional</span>
                  <span class="sep-cat">Pareja Estilizada</span>
                  <span class="sep-cat">Conjunto de Baile</span>
                </div>
              </div>
            </div>
          </app-home-separator>
        </div>

        <!-- 4. SCOREBOARD — light band -->
        <section class="band-light">
          <div class="band-inner">
            @defer (on idle) {
              <app-home-scoreboard />
            } @loading (minimum 500ms) {
              <div style="height: 80px;"></div>
            }
          </div>
        </section>

        <!-- 5. INSTITUCIONAL — dark band -->
        <div class="band-dark">
          <div class="band-inner">
            @defer (on idle) {
              <app-home-declaracion-hero />
            } @loading (minimum 500ms) {
              <div style="height: 200px;"></div>
            }
          </div>
        </div>

        <!-- 6. INSTAGRAM — light band -->
        <section class="band-light">
          <div class="band-inner">
            @defer (on idle) {
              <app-instagram-feed />
            } @loading (minimum 1s) {
              <div style="height: 80px; text-align: center;">
                <div class="loading-spinner"></div>
              </div>
            }
          </div>
        </section>

        <!-- 6.5. GALERÍA 3D — dark band -->
        <div class="band-dark">
          <div class="band-inner">
            @defer (on idle) {
              <app-three-gallery />
            } @loading (minimum 1s) {
              <div style="height: 500px;"></div>
            }
          </div>
        </div>

        <!-- 7. FOOTER — dark band -->
        <div class="band-dark band-dark--flush">
          @defer (on idle) {
            <app-home-footer />
          } @loading (minimum 500ms) {
            <div style="height: 200px;"></div>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════════
       DESIGN TOKENS
       ═══════════════════════════════════════════════════ */
    :host {
      --radius: 16px;
      --radius-sm: 12px;
      --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
      --shadow-hover: 0 4px 16px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06);
    }

    /* ═══════════════════════════════════════════════════
       PORTAL — FLEX + FULL-BLEED BANDS
       ═══════════════════════════════════════════════════ */
    .portal {
      min-height: 100vh;
      background-color: var(--gray-50);
      font-family: var(--font-sans);
      display: flex;
      flex-direction: column;
    }

    .portal-main {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    /* ─── Band: dark (full-bleed) ─── */
    .band-dark {
      width: 100%;
      background-color: var(--gray-900);
    }

    .band-dark .band-inner {
      width: 100%;
      max-width: min(92%, 1200px);
      margin: 0 auto;
      padding: 32px 24px;
    }

    .band-dark--flush {
      padding: 0;
    }

    .band-dark--flush .band-inner {
      padding: 0;
    }

    /* ─── Band: light (uses portal beige bg) ─── */
    .band-light {
      width: 100%;
      background-color: var(--gray-50);
    }

    .band-light .band-inner {
      width: 100%;
      max-width: min(92%, 1200px);
      margin: 0 auto;
      padding: 32px 24px;
    }

    /* ─── Band: blue/image (full-bleed) ─── */
    .band-blue {
      width: 100%;
    }

    .loading-spinner {
      width: 24px; height: 24px;
      border: 3px solid var(--gray-200);
      border-top-color: var(--brand-500);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ═══════════════════════════════════════════════════
       INSCRIPCIONES BLOCK
       ═══════════════════════════════════════════════════ */
    .inscripciones-block {
      background: linear-gradient(135deg, var(--brand-600) 0%, var(--brand-800) 100%);
      border-radius: var(--radius);
      padding: 24px 32px;
      text-align: center;
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow);
    }
    .inscripciones-block::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
    }
    .inscripciones-inner { position: relative; z-index: 1; }
    .inscripciones-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: rgba(255,255,255,0.85);
      background: rgba(255,255,255,0.12);
      padding: 5px 14px;
      border-radius: 999px;
      margin-bottom: 16px;
    }
    .inscripciones-title {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: 800;
      color: #fff;
      margin: 0 0 8px;
      line-height: 1.15;
    }
    .inscripciones-desc {
      font-size: var(--text-sm);
      color: rgba(255,255,255,0.8);
      margin: 0 auto 24px;
      line-height: 1.6;
      max-width: 480px;
    }
    .inscripciones-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    /* ═══════════════════════════════════════════════════
       BUTTONS — Consistent across all CTAs
       ═══════════════════════════════════════════════════ */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--brand-accent);
      color: var(--gray-900);
      padding: 12px 24px;
      border-radius: 999px;
      font-size: var(--text-sm);
      font-weight: 800;
      text-decoration: none;
      letter-spacing: 0.04em;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      min-height: 48px;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }
    .btn-primary:focus-visible {
      outline: 3px solid var(--brand-500);
      outline-offset: 2px;
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      color: var(--gray-200);
      padding: 12px 20px;
      border-radius: 999px;
      font-size: var(--text-sm);
      font-weight: 600;
      text-decoration: none;
      border: 1px solid var(--gray-600);
      transition: all 0.2s ease;
      min-height: 48px;
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.08);
      color: #fff;
      border-color: var(--gray-500);
    }
    .btn-secondary:focus-visible {
      outline: 3px solid rgba(255,255,255,0.5);
      outline-offset: 2px;
    }

    /* ═══════════════════════════════════════════════════
       RESPONSIVE
       ═══════════════════════════════════════════════════ */
    @media (min-width: 1280px) {
      .band-dark .band-inner,
      .band-light .band-inner {
        max-width: min(90%, 1400px);
        padding: 40px 32px;
      }
    }

    @media (min-width: 1600px) {
      .band-dark .band-inner,
      .band-light .band-inner {
        max-width: min(88%, 1600px);
        padding: 48px 40px;
      }
    }

    @media (min-width: 1920px) {
      .band-dark .band-inner,
      .band-light .band-inner {
        max-width: min(86%, 1800px);
        padding: 48px 48px;
      }
    }

    @media (min-width: 2560px) {
      .band-dark .band-inner,
      .band-light .band-inner {
        max-width: min(82%, 2100px);
        padding: 56px 56px;
      }
    }

    @media (max-width: 640px) {
      .band-dark .band-inner,
      .band-light .band-inner {
        padding: 20px 16px;
      }
      .inscripciones-block { padding: 20px 16px; border-radius: var(--radius-sm); }
      .inscripciones-title { font-size: var(--text-xl); }
      .inscripciones-actions { flex-direction: column; width: 100%; }
      .btn-primary { width: 100%; justify-content: center; }
      .btn-secondary { width: 100%; justify-content: center; }
    }
  `]
})
export class HomePageComponent implements OnInit {
  private http = inject(HttpClient);

  newsItems = signal<NewsItem[]>([]);

  ngOnInit(): void {
    this.http.get<NewsItem[]>(`${environment.apiUrl}/news/`).subscribe({
      next: (data) => { if (data && data.length > 0) { this.newsItems.set(data); } },
      error: (err) => console.error('Error fetching news', err),
    });
  }
}
