import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface NewsItem {
  id: number;
  category: string;
  title: string;
  description: string;
  image: string;
  imagePosition?: string;
  thumbType: 'img' | 'icon';
  thumbSrc: string;
  thumbBg: string;
}

@Component({
  selector: 'app-noticias-public',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="portal">
      <header class="portal-header">
        <div class="header-topbar">
          <div class="header-topbar-inner">
            <div class="header-topbar-left">
              <span class="topbar-info">PRE-COSQUÍN PUERTO PIRÁMIDES 2026</span>
            </div>
            <div class="header-topbar-right">
              <a href="https://www.instagram.com/precosquinpuertopiramides" target="_blank" class="topbar-social-icon" title="Instagram">
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
            <a routerLink="/" class="nav-link">Inicio</a>
            <a routerLink="/noticias" class="nav-link active">Noticias</a>
            <a routerLink="/inscripcion" class="nav-link">Inscripciones</a>
            <a href="#" class="nav-link">Cronograma</a>
            <a href="#" class="nav-link">Documentos</a>
          </nav>
          <div class="header-right">
            <a routerLink="/auth/login" class="btn btn-primary btn-sm login-btn">Acceder</a>
          </div>
        </div>
      </header>

      <main class="noticias-main">
        <div class="noticias-container">
          <div class="noticias-header">
            <span class="noticias-label">ÚLTIMAS NOVEDADES</span>
            <h1 class="noticias-title">Noticias del Festival</h1>
            <div class="header-line"></div>
          </div>

          @if (loading()) {
            <div class="loading-state">
              <div class="spinner-lg"></div>
              <p>Cargando noticias...</p>
            </div>
          } @else if (newsList().length === 0) {
            <div class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="M16 8h2m-2 4h2m-14 0h6m-6-4h6m-6 8h14"/>
              </svg>
              <h3>No hay noticias publicadas todavía</h3>
              <p>Próximately encontrarás aquí todas las novedades del festival.</p>
            </div>
          } @else {
            <!-- Featured article (first item) -->
            @if (newsList().length > 0) {
              <article class="featured-article">
                <div class="featured-img" [style.background-image]="'url(' + newsList()[0].image + ')'" [style.background-position]="newsList()[0].imagePosition || 'center center'">
                  <div class="featured-img-overlay"></div>
                </div>
                <div class="featured-body">
                  <div class="article-meta">
                    <span class="article-category">{{ newsList()[0].category }}</span>
                  </div>
                  <h2 class="featured-title">{{ newsList()[0].title }}</h2>
                  <p class="featured-desc">{{ newsList()[0].description }}</p>
                  <div class="featured-footer">
                    <a class="read-more" [routerLink]="['/noticias', newsList()[0].id]">
                      <span>Leer más</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </a>
                  </div>
                </div>
              </article>
            }

            <!-- Remaining articles -->
            <div class="articles-grid">
              @for (item of newsList(); track item.id; let i = $index) {
                @if (i > 0) {
                  <article class="article-card">
                    <div class="article-card-img" [style.background-image]="'url(' + item.image + ')'" [style.background-position]="item.imagePosition || 'center center'">
                      <div class="article-card-overlay"></div>
                      <span class="article-card-badge">{{ item.category }}</span>
                    </div>
                    <div class="article-card-body">
                      <h3 class="article-card-title">{{ item.title }}</h3>
                      <p class="article-card-desc">{{ item.description }}</p>
                      <div class="article-card-footer">
                        <a class="read-more read-more-sm" [routerLink]="['/noticias', item.id]">
                          <span>Leer más</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </a>
                      </div>
                    </div>
                  </article>
                }
              }
            </div>
          }
        </div>
      </main>

      <footer class="portal-footer">
        <div class="footer-main">
          <div class="footer-brand">
            <img src="assets/img/logoballena.png" alt="Precosquin" class="footer-logo" />
            <div class="brand-text">
              <h4>Festival Folclórico</h4>
              <p>Puerto Pirámides, Chubut</p>
            </div>
          </div>
          <div class="footer-links">
            <a routerLink="/">Inicio</a>
            <a routerLink="/inscripcion">Inscripciones</a>
            <a href="#">Contacto</a>
          </div>
        </div>
        <div class="footer-copyright">
          <p>&copy; 2026 Precosquin Pirámides. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .portal {
      min-height: 100vh;
      background-color: var(--gray-50);
      font-family: var(--font-sans);
      display: flex;
      flex-direction: column;
    }

    /* Header */
    .portal-header {
      background-color: var(--brand-200);
      border-bottom: 2px solid var(--brand-500);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-sm);
    }

    .header-topbar {
      background-color: rgba(0,0,0,0.05);
      border-bottom: 1px solid rgba(0,0,0,0.08);
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

    .topbar-info {
      font-size: 10px;
      font-weight: var(--weight-bold);
      color: var(--brand-800);
      letter-spacing: 0.08em;
    }

    .header-topbar-right { display: flex; align-items: center; gap: var(--space-2); }

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

    .topbar-social-icon:hover { background-color: var(--brand-700); transform: scale(1.1); }

    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-4);
      width: 100%;
    }

    .header-left { display: flex; align-items: center; gap: var(--space-3); }
    .header-logo { height: 44px; width: auto; }
    .header-divider { width: 2px; height: 36px; background: var(--brand-500); border-radius: 2px; }
    .header-brand-text { display: flex; flex-direction: column; }
    .header-brand-subtitle { font-size: 10px; font-weight: var(--weight-bold); color: var(--brand-900); letter-spacing: 0.12em; }
    .header-brand-title { font-size: var(--text-lg); font-weight: var(--weight-bold); color: var(--brand-800); line-height: 1.1; }

    .header-nav { display: flex; align-items: center; gap: var(--space-1); }

    .nav-link {
      padding: 8px 16px;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--brand-900);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .nav-link:hover { background: rgba(255,255,255,0.5); }
    .nav-link.active { background: var(--brand-500); color: #fff; }

    .header-right { display: flex; align-items: center; gap: var(--space-3); }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 8px 20px;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      border-radius: var(--radius-lg);
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .btn-primary { background: var(--brand-600); color: #fff; }
    .btn-primary:hover { background: var(--brand-700); }
    .btn-sm { padding: 6px 16px; font-size: var(--text-xs); }
    .login-btn { border: 2px solid var(--brand-500); background: transparent; color: var(--brand-700); }
    .login-btn:hover { background: var(--brand-500); color: #fff; }

    /* Main */
    .noticias-main {
      flex: 1;
      padding: var(--space-12) var(--space-4) var(--space-16);
    }

    .noticias-container {
      max-width: 960px;
      margin: 0 auto;
    }

    .noticias-header {
      text-align: center;
      margin-bottom: var(--space-12);
    }

    .noticias-label {
      display: inline-block;
      font-size: 11px;
      font-weight: var(--weight-bold);
      letter-spacing: 0.15em;
      color: var(--brand-600);
      background: rgba(76, 139, 230, 0.08);
      padding: 4px 14px;
      border-radius: var(--radius-full);
      margin-bottom: var(--space-3);
    }

    .noticias-title {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: var(--weight-extrabold);
      color: var(--gray-900);
      margin: 0 0 var(--space-4);
      line-height: 1.15;
    }

    .header-line {
      width: 60px;
      height: 4px;
      background: var(--brand-500);
      border-radius: 2px;
      margin: 0 auto;
    }

    /* Loading / Empty */
    .loading-state, .empty-state {
      text-align: center;
      padding: var(--space-16) 0;
      color: var(--gray-500);
    }

    .empty-state svg { color: var(--gray-300); margin-bottom: var(--space-4); }
    .empty-state h3 { font-size: var(--text-lg); color: var(--gray-700); margin-bottom: var(--space-2); }
    .empty-state p { font-size: var(--text-sm); color: var(--gray-500); margin: 0; }

    .spinner-lg {
      width: 36px;
      height: 36px;
      border: 3px solid var(--gray-200);
      border-top-color: var(--brand-600);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin: 0 auto var(--space-4);
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Featured Article */
    .featured-article {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 0;
      background: #fff;
      border-radius: var(--radius-2xl);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      margin-bottom: var(--space-10);
      border: 1px solid var(--gray-200);
    }

    .featured-img {
      min-height: 380px;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
    }

    .featured-img-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%);
    }

    .featured-body {
      padding: var(--space-8) var(--space-8) var(--space-8) var(--space-8);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .article-meta { margin-bottom: var(--space-3); }

    .article-category {
      display: inline-block;
      font-size: 10px;
      font-weight: var(--weight-bold);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background-color: var(--brand-accent);
      color: var(--gray-900);
      padding: 4px 12px;
      border-radius: var(--radius-sm);
    }

    .featured-title {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: var(--weight-bold);
      color: var(--gray-900);
      line-height: 1.25;
      margin: 0 0 var(--space-4);
    }

    .featured-desc {
      font-size: var(--text-base);
      color: var(--gray-600);
      line-height: 1.7;
      margin: 0 0 var(--space-6);
    }

    .featured-footer { margin-top: auto; }

    .read-more {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--brand-600);
      cursor: pointer;
      text-decoration: none;
      transition: gap 0.2s ease;
    }

    .read-more:hover { gap: 10px; color: var(--brand-700); }

    .read-more-sm { font-size: var(--text-xs); }

    /* Articles Grid */
    .articles-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-6);
    }

    .article-card {
      background: #fff;
      border-radius: var(--radius-xl);
      overflow: hidden;
      border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .article-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .article-card-img {
      height: 200px;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
    }

    .article-card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%);
    }

    .article-card-badge {
      position: absolute;
      top: var(--space-3);
      left: var(--space-3);
      z-index: 2;
      font-size: 10px;
      font-weight: var(--weight-bold);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background-color: var(--brand-accent);
      color: var(--gray-900);
      padding: 3px 10px;
      border-radius: var(--radius-sm);
    }

    .article-card-body {
      padding: var(--space-5) var(--space-5) var(--space-6);
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .article-card-title {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: var(--weight-bold);
      color: var(--gray-900);
      line-height: 1.35;
      margin: 0 0 var(--space-3);
    }

    .article-card-desc {
      font-size: var(--text-sm);
      color: var(--gray-500);
      line-height: 1.65;
      margin: 0 0 var(--space-4);
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .article-card-footer { margin-top: auto; }

    /* Footer */
    .portal-footer {
      background: var(--gray-900);
      color: var(--gray-300);
      padding: var(--space-10) var(--space-4) var(--space-6);
    }

    .footer-main {
      max-width: 960px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-8);
      padding-bottom: var(--space-6);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .footer-brand { display: flex; align-items: center; gap: var(--space-3); }
    .footer-logo { height: 48px; width: auto; filter: brightness(0) invert(1); }
    .brand-text h4 { font-size: var(--text-sm); font-weight: var(--weight-bold); color: #fff; margin: 0; }
    .brand-text p { font-size: var(--text-xs); color: var(--gray-400); margin: 0; }

    .footer-links { display: flex; gap: var(--space-6); }
    .footer-links a { font-size: var(--text-sm); color: var(--gray-400); text-decoration: none; transition: color 0.2s; }
    .footer-links a:hover { color: #fff; }

    .footer-copyright {
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      padding-top: var(--space-6);
    }

    .footer-copyright p { font-size: var(--text-xs); color: var(--gray-500); margin: 0; }

    @media (max-width: 768px) {
      .header-nav { display: none; }
      .featured-article { grid-template-columns: 1fr; }
      .featured-img { min-height: 220px; }
      .featured-body { padding: var(--space-5); }
      .featured-title { font-size: 1.375rem; }
      .articles-grid { grid-template-columns: 1fr; }
      .noticias-title { font-size: 1.75rem; }
    }
  `]
})
export class NoticiasPublicPageComponent implements OnInit {
  private http = inject(HttpClient);
  newsList = signal<NewsItem[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.http.get<NewsItem[]>(`${environment.apiUrl}/news`).subscribe({
      next: (data) => {
        this.newsList.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
