import {
  Component,
  input,
  signal,
  computed,
  inject,
  NgZone,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  effect,
  ChangeDetectorRef,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';

const API_BASE = environment.apiUrl.replace(/\/v1\/?$/, '');

function resolveUrl(path: string): string {
  if (!path) return path;
  if (path.startsWith('data:') || path.startsWith('http') || path.startsWith('assets/')) return path;
  if (path.startsWith('/v1/')) return API_BASE + path;
  return path;
}

export interface NewsItem {
  id: number;
  category: string;
  title: string;
  description?: string;
  image: string;
  imagePosition?: string;
  thumbType: 'img' | 'icon';
  thumbSrc: string;
  thumbBg: string;
}

interface NormalizedNewsItem {
  id: number;
  category: string;
  title: string;
  imageUrl: string;
  imagePosition: string;
  thumbType: 'img' | 'icon';
  thumbUrl: string;
  thumbBg: string;
  safeThumbHtml: SafeHtml | null;
}

@Component({
  selector: 'app-news-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly sanitizer = inject(DomSanitizer);

  readonly newsItems = input.required<NewsItem[]>();

  readonly activeIndex = signal(0);
  readonly isTransitioning = signal(false);
  isPaused = false;

  private readonly _items = signal<NormalizedNewsItem[]>([]);
  readonly items = this._items.asReadonly();

  readonly activeNews = computed(() => {
    const list = this.items();
    const i = this.activeIndex();
    return list[i] ?? undefined;
  });

  readonly featuredBg = computed(() => {
    const news = this.activeNews();
    return news?.imageUrl ? `url(${news.imageUrl})` : '';
  });

  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const raw = this.newsItems();
      const normalized: NormalizedNewsItem[] = raw.map((item) => ({
        id: item.id,
        category: item.category,
        title: item.title,
        imageUrl: resolveUrl(item.image),
        imagePosition: item.imagePosition || 'center center',
        thumbType: item.thumbType,
        thumbUrl: item.thumbType === 'img' ? resolveUrl(item.thumbSrc) : '',
        thumbBg: item.thumbBg,
        safeThumbHtml: item.thumbType === 'icon'
          ? this.sanitizer.bypassSecurityTrustHtml(item.thumbSrc)
          : null,
      }));
      this._items.set(normalized);
    });
  }

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.clearAutoplay();
  }

  selectNews(index: number): void {
    if (index === this.activeIndex()) return;
    this.isTransitioning.set(true);
    this.restartAutoplay();
    setTimeout(() => {
      this.activeIndex.set(index);
      this.isTransitioning.set(false);
      this.cdr.markForCheck();
    }, 200);
  }

  nextSlide(): void {
    const total = this.newsItems().length;
    if (total === 0) return;
    this.selectNews((this.activeIndex() + 1) % total);
  }

  prevSlide(): void {
    const total = this.newsItems().length;
    if (total === 0) return;
    this.selectNews((this.activeIndex() - 1 + total) % total);
  }

  private startAutoplay(): void {
    this.clearAutoplay();
    this.ngZone.runOutsideAngular(() => {
      this.autoPlayTimer = setInterval(() => {
        if (!this.isPaused) {
          this.ngZone.run(() => {
            this.nextSlide();
            this.cdr.markForCheck();
          });
        }
      }, 5000);
    });
  }

  private clearAutoplay(): void {
    if (this.autoPlayTimer !== null) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private restartAutoplay(): void {
    this.clearAutoplay();
    this.startAutoplay();
  }
}
