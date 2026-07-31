import { Component, input, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface NewsItem {
  id: number;
  category: string;
  title: string;
  image: string;
  imagePosition?: string;
  thumbType: 'img' | 'icon';
  thumbSrc: string;
  thumbBg: string;
}

@Component({
  selector: 'app-news-carousel',
  standalone: true,
  imports: [RouterLink, NgClass],
  template: `
    <div class="news-grid" (mouseenter)="isPaused = true" (mouseleave)="isPaused = false">
      @if (newsItems().length === 0) {
        <div class="featured-news featured-skeleton">
          <div class="skeleton-pulse"></div>
          <div class="skeleton-text-group">
            <div class="skeleton-badge"></div>
            <div class="skeleton-title"></div>
          </div>
        </div>
        <aside class="secondary-news">
          @for (i of [1, 2, 3]; track i) {
            <div class="news-item skeleton-card">
              <div class="news-item-content"><div class="skeleton-text-line"></div></div>
              <div class="news-item-thumb skeleton-thumb"></div>
            </div>
          }
        </aside>
      } @else {
        <a
          routerLink="/noticias"
          class="featured-news"
          [style.background-image]="'url(' + activeNews()?.image + ')'"
          [style.background-position]="activeNews()?.imagePosition || 'center center'"
        >
          <div class="featured-overlay"></div>
          <div class="featured-content featured-fade" [class.fade-in]="!isTransitioning()">
            <span class="news-category">{{ activeNews()?.category }}</span>
            <h2 class="featured-title">{{ activeNews()?.title }}</h2>
          </div>
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
          <button class="carousel-arrow carousel-prev" (click)="prevSlide(); $event.preventDefault(); $event.stopPropagation()" aria-label="Anterior">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button class="carousel-arrow carousel-next" (click)="nextSlide(); $event.preventDefault(); $event.stopPropagation()" aria-label="Siguiente">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </a>

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
                  <img [src]="item.thumbSrc" [alt]="item.title" width="80" height="80" loading="lazy" decoding="async" />
                } @else {
                  <span [innerHTML]="sanitizeHtml(item.thumbSrc)"></span>
                }
              </div>
            </a>
          }
        </aside>
      }
    </div>
  `,
  styles: [`
    .news-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-6);
      min-height: 500px;
    }
    .featured-news {
      position: relative;
      border-radius: var(--radius-xl);
      overflow: hidden;
      background-color: var(--gray-200, #e2e8f0);
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
    .featured-news:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .featured-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 60%, transparent 100%); }
    .featured-content { position: relative; z-index: 10; color: white; max-width: 80%; }
    .news-category {
      font-size: var(--text-xs); font-weight: var(--weight-bold); text-transform: uppercase; letter-spacing: 0.1em;
      background-color: var(--brand-accent); color: var(--gray-900); padding: 0.2rem 0.6rem; border-radius: var(--radius-sm); display: inline-block; margin-bottom: var(--space-3);
    }
    .featured-title { font-size: var(--text-3xl); color: white; line-height: 1.2; margin: 0; }
    .secondary-news { display: flex; flex-direction: column; justify-content: space-between; height: 100%; }
    .news-item {
      display: flex; align-items: center; justify-content: space-between; gap: var(--space-3);
      background: white; border-radius: 12px; overflow: hidden;
      box-shadow: var(--shadow-sm); border: 1px solid var(--gray-200);
      padding: var(--space-3);
      min-height: 88px; cursor: pointer;
      text-decoration: none; color: inherit;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .news-item:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
    .news-item:focus-visible { outline: 3px solid var(--brand-400); outline-offset: 2px; }
    .news-item-content { flex: 1; min-width: 0; }
    .news-item-title {
      font-size: var(--text-sm); font-family: var(--font-sans); font-weight: var(--weight-semibold);
      color: var(--gray-800); line-height: 1.4; margin: 0;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .news-item-thumb {
      width: 80px; height: 80px; flex-shrink: 0;
      border-radius: var(--radius-md); overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      color: white; background-color: var(--gray-300);
    }
    .news-item-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .bg-blue { background-color: var(--brand-500); background-image: url('/assets/img/simbolAzul.webp'); background-size: cover; background-position: center; }
    .bg-gold { background-color: var(--brand-accent); color: var(--gray-900) !important; background-image: url('/assets/img/simbolMostaza.webp'); background-size: cover; background-position: center; }
    .bg-gray { background-color: var(--gray-400); color: var(--gray-900) !important; }
    .news-item-active { background-color: var(--brand-50) !important; border: 1px solid var(--brand-300); box-shadow: var(--shadow-md); }
    .news-item-active .news-item-title { color: var(--brand-700); }
    .featured-fade { transition: opacity 0.2s ease; }
    .featured-fade.fade-in { opacity: 1; }
    .featured-fade:not(.fade-in) { opacity: 0; }
    .carousel-dots { position: absolute; bottom: var(--space-4); right: var(--space-4); display: flex; gap: var(--space-2); z-index: 20; }
    .dot {
      width: 10px; height: 10px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.5); border: none;
      cursor: pointer; transition: all var(--transition-fast); padding: 0;
    }
    .dot-active { background-color: white; transform: scale(1.3); }
    .dot:hover:not(.dot-active) { background-color: rgba(255, 255, 255, 0.8); }
    .carousel-arrow {
      position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%;
      border: none; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); color: #fff; cursor: pointer;
      display: flex; align-items: center; justify-content: center; z-index: 20; transition: all 0.2s ease; opacity: 0;
    }
    .featured-news:hover .carousel-arrow { opacity: 1; }
    .carousel-arrow:hover { background: rgba(255,255,255,0.4); transform: translateY(-50%) scale(1.1); }
    .carousel-prev { left: var(--space-4); }
    .carousel-next { right: var(--space-4); }

    .featured-skeleton { align-items: stretch; }
    .skeleton-pulse {
      position: absolute; inset: 0;
      background: linear-gradient(110deg, var(--gray-200) 30%, var(--gray-100) 50%, var(--gray-200) 70%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-text-group { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 8px; }
    .skeleton-badge { width: 120px; height: 20px; border-radius: 4px; background: rgba(255,255,255,0.15); }
    .skeleton-title { width: 80%; height: 32px; border-radius: 6px; background: rgba(255,255,255,0.15); }
    .skeleton-card { pointer-events: none; }
    .skeleton-text-line { width: 70%; height: 14px; border-radius: 4px; background: var(--gray-200); }
    .skeleton-thumb { background: var(--gray-200); }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    @media (max-width: 1024px) {
      .news-grid { grid-template-columns: 1fr; }
      .carousel-arrow { width: 34px; height: 34px; opacity: 1; background: rgba(255,255,255,0.3); }
    }
  `]
})
export class NewsCarouselComponent implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);

  newsItems = input.required<NewsItem[]>();
  activeIndex = signal(0);
  isTransitioning = signal(false);
  isPaused = false;

  private autoPlayInterval: ReturnType<typeof setInterval> | null = null;

  activeNews = computed<NewsItem | undefined>(() => {
    const items = this.newsItems();
    const index = this.activeIndex();
    return items.length > 0 && index >= 0 && index < items.length ? items[index] : undefined;
  });

  ngOnInit(): void { this.startCarousel(); }
  ngOnDestroy(): void { this.stopCarousel(); }

  sanitizeHtml(html: string): SafeHtml { return this.sanitizer.bypassSecurityTrustHtml(html); }

  startCarousel(): void {
    this.stopCarousel();
    this.autoPlayInterval = setInterval(() => { if (!this.isPaused) this.nextSlide(); }, 5000);
  }

  stopCarousel(): void { if (this.autoPlayInterval) clearInterval(this.autoPlayInterval); }

  nextSlide(): void {
    const nextIndex = (this.activeIndex() + 1) % this.newsItems().length;
    this.selectNews(nextIndex);
  }

  prevSlide(): void {
    const prevIndex = (this.activeIndex() - 1 + this.newsItems().length) % this.newsItems().length;
    this.selectNews(prevIndex);
  }

  selectNews(index: number): void {
    if (index === this.activeIndex()) return;
    this.startCarousel();
    this.isTransitioning.set(true);
    setTimeout(() => {
      this.activeIndex.set(index);
      this.isTransitioning.set(false);
    }, 200);
  }
}
