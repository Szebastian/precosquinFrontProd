import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface NewsItem {
  id: number;
  title: string;
  thumbnail: string;
  publishedAt: string;
  category?: string;
}

@Component({
  selector: 'app-mobile-noticias',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="compact-header">
      <button class="back-btn" (click)="goBack()" aria-label="Volver">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1 class="header-title">Noticias</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- Pull-to-refresh indicator -->
    @if (refreshing()) {
      <div class="pull-indicator">
        <div class="pull-spinner"></div>
      </div>
    }

    <!-- Filter chips -->
    <div class="filter-bar">
      @for (filter of filters; track filter.key) {
        <button
          class="chip"
          [class.chip-active]="activeFilter() === filter.key"
          (click)="setFilter(filter.key)">
          {{ filter.label }}
        </button>
      }
    </div>

    <!-- News list -->
    <main class="news-content">
      <div class="news-list">
        @for (news of filteredNews(); track news.id) {
          <article class="news-card" (click)="openNews(news.id)">
            @if (news.thumbnail) {
              <img class="news-thumb" [src]="news.thumbnail" [alt]="news.title" loading="lazy" />
            } @else {
              <div class="news-thumb news-thumb-placeholder">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            }
            <div class="news-body">
              @if (news.category) {
                <span class="news-cat">{{ news.category }}</span>
              }
              <h3 class="news-title">{{ news.title }}</h3>
              <span class="news-date">{{ formatDate(news.publishedAt) }}</span>
            </div>
            <svg class="news-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </article>
        } @empty {
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p class="empty-title">Sin noticias</p>
            <p class="empty-desc">No hay noticias para esta categoría</p>
          </div>
        }
      </div>

      <div class="bottom-spacer"></div>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      background: #0E0F12;
      color: #FFFFFF;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow-x: hidden;
    }

    /* ---- Compact Header ---- */
    .compact-header {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      height: 56px;
      padding: 0 16px;
      padding-top: env(safe-area-inset-top, 0px);
      background: rgba(14, 15, 18, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: none;
      background: none;
      color: #FFFFFF;
      cursor: pointer;
      border-radius: 9999px;
      transition: background 150ms cubic-bezier(0.4, 0, 0.2, 1);
      margin-left: -8px;
    }

    .back-btn:active {
      background: rgba(255, 255, 255, 0.08);
    }

    .header-title {
      flex: 1;
      text-align: center;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .header-spacer {
      width: 40px;
    }

    /* ---- Pull indicator ---- */
    .pull-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 0;
    }

    .pull-spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(255, 255, 255, 0.06);
      border-top-color: #C9A84C;
      border-radius: 9999px;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ---- Filter chips ---- */
    .filter-bar {
      display: flex;
      gap: 8px;
      padding: 14px 20px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .filter-bar::-webkit-scrollbar {
      display: none;
    }

    .chip {
      flex-shrink: 0;
      padding: 8px 18px;
      border: 1px solid rgba(255, 255, 255, 0.10);
      border-radius: 9999px;
      background: #181A1F;
      color: #B0B5C0;
      font-size: 13px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
    }

    .chip:active {
      transform: scale(0.96);
    }

    .chip-active {
      background: linear-gradient(135deg, #C9A84C, #A08030);
      border-color: transparent;
      color: #0E0F12;
    }

    /* ---- News list ---- */
    .news-content {
      flex: 1;
      padding: 0 20px;
      padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px) + 20px);
    }

    .news-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .news-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px;
      background: #181A1F;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 18px;
      cursor: pointer;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .news-card:active {
      transform: scale(0.98);
      background: #1E2027;
    }

    .news-thumb {
      width: 80px;
      height: 80px;
      border-radius: 14px;
      object-fit: cover;
      flex-shrink: 0;
      background: #1E2027;
    }

    .news-thumb-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6B7280;
    }

    .news-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .news-cat {
      display: inline-flex;
      align-self: flex-start;
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: rgba(201, 168, 76, 0.12);
      color: #C9A84C;
    }

    .news-title {
      font-size: 14px;
      font-weight: 600;
      color: #FFFFFF;
      line-height: 1.35;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .news-date {
      font-size: 12px;
      color: #6B7280;
    }

    .news-chevron {
      flex-shrink: 0;
      color: #6B7280;
    }

    /* ---- Empty state ---- */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 60px 20px;
      color: #6B7280;
      text-align: center;
    }

    .empty-title {
      font-size: 16px;
      font-weight: 600;
      color: #B0B5C0;
      margin: 0;
    }

    .empty-desc {
      font-size: 13px;
      margin: 0;
    }

    .bottom-spacer {
      height: 20px;
    }
  `],
})
export class MobileNoticiasPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly filters = [
    { key: 'todas', label: 'Todas' },
    { key: 'certamen', label: 'Certamen' },
    { key: 'festival', label: 'Festival' },
    { key: 'artistas', label: 'Artistas' },
  ];

  readonly activeFilter = signal('todas');
  readonly newsItems = signal<NewsItem[]>([]);
  readonly refreshing = signal(false);

  readonly filteredNews = signal<NewsItem[]>([]);

  ngOnInit(): void {
    this.loadNews();
  }

  setFilter(key: string): void {
    this.activeFilter.set(key);
    this.applyFilter();
  }

  openNews(id: number): void {
    this.router.navigate(['/noticias', id]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateStr;
    }
  }

  private loadNews(): void {
    this.refreshing.set(true);
    this.http.get<{ data: NewsItem[] }>(`${environment.apiUrl}/news/`).subscribe({
      next: (res) => {
        const items = (res.data || res || []) as NewsItem[];
        this.newsItems.set(items);
        this.applyFilter();
        this.refreshing.set(false);
      },
      error: () => {
        this.newsItems.set([]);
        this.filteredNews.set([]);
        this.refreshing.set(false);
      },
    });
  }

  private applyFilter(): void {
    const filter = this.activeFilter();
    const all = this.newsItems();
    if (filter === 'todas') {
      this.filteredNews.set(all);
    } else {
      const match = filter.charAt(0).toUpperCase() + filter.slice(1);
      this.filteredNews.set(all.filter(n => n.category?.toLowerCase() === match.toLowerCase()));
    }
  }
}
