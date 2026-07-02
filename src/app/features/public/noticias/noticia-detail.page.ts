import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
  selector: 'app-noticia-detail',
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
            <a routerLink="/auth/login" class="btn btn-outline btn-sm">Acceder</a>
          </div>
        </div>
      </header>

      <main class="detail-main">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner-lg"></div>
            <p>Cargando noticia...</p>
          </div>
        } @else if (!item()) {
          <div class="error-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <h2>Noticia no encontrada</h2>
            <p>La noticia que buscás no existe o fue removida.</p>
            <a routerLink="/noticias" class="btn btn-primary">Volver a Noticias</a>
          </div>
        } @else {
          <article class="detail-article">

            <!-- HERO IMAGE -->
            <div class="detail-hero" [style.background-image]="'url(' + (item()?.image || '') + ')'" [style.background-position]="item()?.imagePosition || 'center center'">
              <div class="detail-hero-overlay"></div>
              <div class="detail-hero-content">
                <a routerLink="/noticias" class="back-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
                  Volver a Noticias
                </a>
                <div class="hero-meta">
                  <span class="article-category">{{ item()?.category }}</span>
                </div>
                <h1 class="detail-title">{{ item()?.title }}</h1>
              </div>
            </div>

            <!-- CONTENT CARD -->
            <div class="detail-card-wrapper">
              <div class="detail-body">
                <div class="detail-meta">
                  <span class="meta-category">{{ item()?.category }}</span>
                  <span class="meta-dot"></span>
                  <span class="meta-date">Festival Precosquín 2026</span>
                </div>

                <div class="detail-content">
                  @for (paragraph of parsedDescription(); track $index) {
                    @if (paragraph.type === 'heading') {
                      <h3 class="detail-heading">{{ paragraph.text }}</h3>
                    } @else if (paragraph.type === 'list') {
                      <ul class="detail-list">
                        @for (li of paragraph.items; track $index) {
                          <li>{{ li }}</li>
                        }
                      </ul>
                    } @else {
                      <p class="detail-paragraph" [class.first-paragraph]="$index === 0">{{ paragraph.text }}</p>
                    }
                  }
                  
                  @if (item()?.image) {
                    <div class="full-article-image" style="margin-top: 32px; text-align: center;">
                      <img [src]="item()?.image" alt="Imagen completa de la noticia" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid var(--gray-200);" />
                    </div>
                  }
                </div>

                <div class="detail-footer">
                  <a routerLink="/noticias" class="btn btn-secondary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
                    Ver más noticias
                  </a>
                </div>
              </div>
            </div>

          </article>
        }
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
    /* ============================
       BASE
    ============================ */
    .portal {
      min-height: 100vh;
      background: var(--gray-50, #f8fafc);
      font-family: var(--font-sans, 'Inter', 'Segoe UI', sans-serif);
      display: flex;
      flex-direction: column;
    }

    /* ============================
       HEADER
    ============================ */
    .portal-header {
      background-color: var(--brand-200, #bfdbfe);
      border-bottom: 2px solid var(--brand-500, #3b82f6);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
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
      padding: 0 24px;
    }

    .topbar-info {
      font-size: 10px;
      font-weight: 700;
      color: var(--brand-800, #1e40af);
      letter-spacing: 0.08em;
    }

    .header-topbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .topbar-social-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 4px;
      background-color: var(--brand-900, #1e3a8a);
      color: white;
      transition: all 0.2s;
    }
    .topbar-social-icon:hover {
      background-color: var(--brand-700, #1d4ed8);
      transform: scale(1.1);
    }

    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      height: 68px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      width: 100%;
    }

    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-logo { height: 42px; width: auto; }
    .header-divider { width: 2px; height: 34px; background: var(--brand-500, #3b82f6); border-radius: 2px; }
    .header-brand-text { display: flex; flex-direction: column; }
    .header-brand-subtitle { font-size: 10px; font-weight: 700; color: var(--brand-900, #1e3a8a); letter-spacing: 0.12em; }
    .header-brand-title { font-size: 1.1rem; font-weight: 700; color: var(--brand-800, #1e40af); line-height: 1.1; }

    .header-nav { display: flex; align-items: center; gap: 4px; }
    .nav-link {
      padding: 7px 14px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--brand-900, #1e3a8a);
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .nav-link:hover { background: rgba(255,255,255,0.5); }
    .nav-link.active { background: var(--brand-600, #2563eb); color: #fff; }

    .header-right { display: flex; align-items: center; }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 20px;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      line-height: 1;
    }
    .btn-primary { background: var(--brand-600, #2563eb); color: #fff; }
    .btn-primary:hover { background: var(--brand-700, #1d4ed8); }
    .btn-secondary {
      background: var(--gray-100, #f1f5f9);
      color: var(--gray-700, #334155);
      border: 1px solid var(--gray-200, #e2e8f0);
    }
    .btn-secondary:hover { background: var(--gray-200, #e2e8f0); }
    .btn-outline {
      background: transparent;
      color: var(--brand-800, #1e40af);
      border: 2px solid var(--brand-500, #3b82f6);
    }
    .btn-outline:hover { background: var(--brand-600, #2563eb); color: #fff; }
    .btn-sm { padding: 6px 14px; font-size: 0.8rem; }

    /* ============================
       MAIN / ARTICLE
    ============================ */
    .detail-main {
      flex: 1;
      background: var(--gray-50, #f8fafc);
    }

    .detail-article {
      display: flex;
      flex-direction: column;
    }

    /* ============================
       HERO
    ============================ */
    .detail-hero {
      position: relative;
      min-height: 500px;
      height: auto;
      aspect-ratio: 2110 / 500;
      background-size: cover;
      background-position: 50% 20%; /* Move image down to show more content */
      background-repeat: no-repeat;
      background-color: #1e293b;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .detail-hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.88) 0%,
        rgba(0, 0, 0, 0.50) 45%,
        rgba(0, 0, 0, 0.10) 80%,
        transparent 100%
      );
      z-index: 1;
    }

    .detail-hero-content {
      position: relative;
      z-index: 10;
      padding: 40px 48px 56px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 860px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      padding: 7px 14px;
      border-radius: 8px;
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2);
      width: fit-content;
      transition: all 0.2s;
      letter-spacing: 0.02em;
    }
    .back-link:hover {
      color: #fff;
      background: rgba(255,255,255,0.22);
      border-color: rgba(255,255,255,0.4);
      transform: translateX(-2px);
    }

    .hero-meta { display: flex; align-items: center; gap: 12px; }

    .article-category {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      background-color: var(--brand-accent, #f59e0b);
      color: #1a1a1a;
      padding: 5px 14px;
      border-radius: 4px;
    }

    .detail-title {
      font-family: var(--font-display, Georgia, serif);
      font-size: clamp(1.8rem, 4vw, 3rem);
      font-weight: 800;
      color: #ffffff;
      line-height: 1.18;
      margin: 0;
      text-shadow: 0 2px 16px rgba(0,0,0,0.5);
      letter-spacing: -0.01em;
    }

    /* ============================
       CONTENT CARD
    ============================ */
    .detail-card-wrapper {
      background: var(--gray-50, #f8fafc);
      padding: 0 24px 64px;
      display: flex;
      justify-content: center;
    }

    .detail-body {
      background: #fff;
      width: 100%;
      max-width: 760px;
      margin-top: -48px;
      position: relative;
      z-index: 20;
      border-radius: 20px;
      padding: 48px 52px;
      box-shadow:
        0 4px 24px rgba(0,0,0,0.10),
        0 1px 4px rgba(0,0,0,0.05);
      border: 1px solid var(--gray-100, #f1f5f9);
    }

    .detail-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--gray-200, #e2e8f0);
    }

    .meta-category {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      background-color: var(--brand-100, #dbeafe);
      color: var(--brand-700, #1d4ed8);
      padding: 4px 12px;
      border-radius: 4px;
    }

    .meta-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--gray-300, #cbd5e1);
    }

    .meta-date {
      font-size: 0.8rem;
      color: var(--gray-400, #94a3b8);
      font-weight: 500;
    }

    /* ============================
       CONTENT TYPOGRAPHY
    ============================ */
    .detail-content {
      margin-bottom: 40px;
    }

    .detail-paragraph {
      font-size: 1.05rem;
      color: var(--gray-600, #475569);
      line-height: 1.9;
      margin: 0 0 20px;
      letter-spacing: 0.005em;
    }

    .detail-paragraph.first-paragraph {
      font-size: 1.1rem;
      color: var(--gray-700, #334155);
      line-height: 1.85;
      margin-bottom: 28px;
    }

    .detail-paragraph.first-paragraph::first-letter {
      font-family: var(--font-display, Georgia, serif);
      font-size: 3.6rem;
      font-weight: 800;
      color: var(--brand-600, #2563eb);
      float: left;
      line-height: 0.82;
      margin-right: 10px;
      margin-top: 8px;
    }

    .detail-heading {
      font-family: var(--font-display, Georgia, serif);
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--gray-900, #0f172a);
      margin: 40px 0 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--brand-200, #bfdbfe);
      line-height: 1.3;
    }

    .detail-heading:first-child { margin-top: 0; }

    .detail-list {
      margin: 0 0 24px;
      padding-left: 0;
      list-style: none;
    }

    .detail-list li {
      font-size: 1.02rem;
      color: var(--gray-600, #475569);
      line-height: 1.85;
      margin-bottom: 10px;
      padding-left: 22px;
      position: relative;
    }

    .detail-list li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 11px;
      width: 6px;
      height: 6px;
      background: var(--brand-500, #3b82f6);
      border-radius: 50%;
    }

    /* ============================
       FOOTER ACTIONS
    ============================ */
    .detail-footer {
      padding-top: 28px;
      border-top: 1px solid var(--gray-200, #e2e8f0);
      display: flex;
      justify-content: flex-start;
    }

    /* ============================
       STATES
    ============================ */
    .loading-state,
    .error-state {
      text-align: center;
      padding: 80px 0;
      color: var(--gray-500, #64748b);
    }
    .error-state svg { color: var(--gray-300, #cbd5e1); margin-bottom: 16px; }
    .error-state h2 { font-size: 1.25rem; color: var(--gray-700, #334155); margin-bottom: 8px; }
    .error-state p { font-size: 0.9rem; color: var(--gray-500, #64748b); margin: 0 0 24px; }
    .spinner-lg {
      width: 36px;
      height: 36px;
      border: 3px solid var(--gray-200, #e2e8f0);
      border-top-color: var(--brand-600, #2563eb);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ============================
       FOOTER
    ============================ */
    .portal-footer {
      background: var(--gray-900, #0f172a);
      color: var(--gray-300, #cbd5e1);
      padding: 48px 24px 24px;
      margin-top: auto;
    }

    .footer-main {
      max-width: 960px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .footer-brand { display: flex; align-items: center; gap: 12px; }
    .footer-logo { height: 44px; width: auto; filter: brightness(0) invert(1); }
    .brand-text h4 { font-size: 0.875rem; font-weight: 700; color: #fff; margin: 0; }
    .brand-text p { font-size: 0.8rem; color: var(--gray-400, #94a3b8); margin: 0; }
    .footer-links { display: flex; gap: 24px; }
    .footer-links a { font-size: 0.875rem; color: var(--gray-400, #94a3b8); text-decoration: none; transition: color 0.2s; }
    .footer-links a:hover { color: #fff; }
    .footer-copyright { max-width: 960px; margin: 0 auto; text-align: center; padding-top: 24px; }
    .footer-copyright p { font-size: 0.78rem; color: var(--gray-500, #64748b); margin: 0; }

    /* ============================
       RESPONSIVE
    ============================ */
    @media (max-width: 768px) {
      .header-nav { display: none; }
      .header-right { display: none; }

      .detail-hero { min-height: 320px; }
      .detail-hero-content { padding: 24px 20px 40px; gap: 12px; }
      .detail-title { font-size: 1.6rem; }

      .detail-card-wrapper { padding: 0 12px 40px; }
      .detail-body {
        margin-top: -28px;
        padding: 28px 24px;
        border-radius: 16px;
      }

      .detail-paragraph,
      .detail-list li { font-size: 0.95rem; }
      .detail-heading { font-size: 1.1rem; }
      .detail-paragraph.first-paragraph::first-letter { font-size: 2.8rem; }

      .footer-main { flex-direction: column; gap: 16px; text-align: center; }
      .footer-links { flex-wrap: wrap; justify-content: center; }
    }

    @media (max-width: 480px) {
      .detail-body { padding: 24px 18px; border-radius: 12px; }
      .detail-title { font-size: 1.4rem; }
    }
  `]
})
export class NoticiaDetailPageComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  item = signal<NewsItem | null>(null);
  loading = signal(true);

  parsedDescription = signal<{ type: string; text?: string; items?: string[] }[]>([]);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.http.get<NewsItem[]>(`${environment.apiUrl}/news`).subscribe({
      next: (data) => {
        const found = data.find(n => n.id === id) || null;
        this.item.set(found);
        if (found?.description) {
          this.parsedDescription.set(this.parseText(found.description));
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private parseText(raw: string): { type: string; text?: string; items?: string[] }[] {
    const blocks: { type: string; text?: string; items?: string[] }[] = [];
    const lines = raw.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      if (line === '') { i++; continue; }

      const isHeading = (
        (line.endsWith(':') && line.length < 80) ||
        (line === line.toUpperCase() && line.length < 80 && line.length > 2) ||
        line.startsWith('# ')
      );

      if (isHeading) {
        blocks.push({ type: 'heading', text: line.replace(/^#\s*/, '').replace(/:$/, '') });
        i++;
        continue;
      }

      const listMatch = line.match(/^[-*•]\s+(.+)/);
      const numMatch = line.match(/^\d+[.)]\s+(.+)/);

      if (listMatch || numMatch) {
        const items: string[] = [];
        while (i < lines.length) {
          const lm = lines[i].trim().match(/^[-*•]\s+(.+)/);
          const nm = lines[i].trim().match(/^\d+[.)]\s+(.+)/);
          if (lm) { items.push(lm[1]); i++; }
          else if (nm) { items.push(nm[1]); i++; }
          else if (lines[i].trim() === '') { break; }
          else { break; }
        }
        blocks.push({ type: 'list', items });
        continue;
      }

      const paraLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== '') {
        paraLines.push(lines[i].trim());
        i++;
      }
      if (paraLines.length) {
        const text = paraLines.join(' ');
        if (text.length > 300) {
          const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
          let chunk = '';
          for (const sentence of sentences) {
            chunk += sentence;
            if (chunk.length > 180) {
              blocks.push({ type: 'paragraph', text: chunk.trim() });
              chunk = '';
            }
          }
          if (chunk.trim()) blocks.push({ type: 'paragraph', text: chunk.trim() });
        } else {
          blocks.push({ type: 'paragraph', text });
        }
      }
    }

    return blocks;
  }
}
