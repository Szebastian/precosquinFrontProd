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
  ElementRef,
  viewChild,
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

function heroImageUrl(path: string): string {
  const base = resolveUrl(path);
  if (base.includes('/v1/news/images/')) return base + '?w=800';
  return base;
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
  badgeUrl: string;
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
  private readonly sanitizer = inject(DomSanitizer);

  readonly newsItems = input.required<NewsItem[]>();
  readonly activeIndex = signal(0);
  readonly isTransitioning = signal(false);
  readonly slideDirection = signal<'next' | 'prev'>('next');
  isPaused = false;

  private readonly _items = signal<NormalizedNewsItem[]>([]);
  readonly items = this._items.asReadonly();

  readonly secondaryNewsRef = viewChild<ElementRef>('secondaryNews');

  readonly activeNews = computed(() => {
    const list = this.items();
    const i = this.activeIndex();
    return list[i] ?? undefined;
  });

  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const raw = this.newsItems();
      const normalized: NormalizedNewsItem[] = raw.map((item) => ({
        id: item.id,
        category: item.category,
        title: item.title,
        imageUrl: heroImageUrl(item.image),
        imagePosition: item.imagePosition || 'center center',
        thumbType: item.thumbType,
        badgeUrl: item.thumbType === 'img' ? resolveUrl(item.thumbSrc) : '',
        thumbBg: item.thumbBg,
        safeThumbHtml: item.thumbType === 'icon'
          ? this.sanitizer.bypassSecurityTrustHtml(item.thumbSrc)
          : null,
      }));
      this._items.set(normalized);
    });
  }

  ngOnInit(): void { this.startAutoplay(); }
  ngOnDestroy(): void { this.clearAutoplay(); }

  selectNews(index: number): void {
    if (index === this.activeIndex()) return;
    const direction = index > this.activeIndex() ? 'next' : 'prev';
    this.slideDirection.set(direction);
    this.isTransitioning.set(true);
    this.restartAutoplay();
    setTimeout(() => {
      this.activeIndex.set(index);
      this.isTransitioning.set(false);
      this.scrollToActiveItem(index);
    }, 250);
  }

  nextSlide(): void {
    const total = this.newsItems().length;
    if (total === 0) return;
    this.slideDirection.set('next');
    this.selectNews((this.activeIndex() + 1) % total);
  }

  prevSlide(): void {
    const total = this.newsItems().length;
    if (total === 0) return;
    this.slideDirection.set('prev');
    this.selectNews((this.activeIndex() - 1 + total) % total);
  }

  private scrollToActiveItem(index: number): void {
    const container = this.secondaryNewsRef()?.nativeElement;
    if (!container) return;
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (!isMobile) return;
    const activeItem = container.children[index] as HTMLElement | undefined;
    if (activeItem) {
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  private startAutoplay(): void {
    this.clearAutoplay();
    this.ngZone.runOutsideAngular(() => {
      this.autoPlayTimer = setInterval(() => {
        if (!this.isPaused) {
          this.ngZone.run(() => this.nextSlide());
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
