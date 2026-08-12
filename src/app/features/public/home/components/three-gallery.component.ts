import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  signal,
  computed,
  PLATFORM_ID,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { GalleryService, GalleryItem } from '../../../../core/services/gallery.service';

@Component({
  selector: 'app-three-gallery',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="gallery-section">
      <!-- Header -->
      <div class="gallery-header">
        <span class="gallery-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          GALERÍA
        </span>
        <h2 class="gallery-title">Momentos que cuentan historias</h2>
        <p class="gallery-subtitle">Descubrí los recintos, los artistas y la magia del Pre-Cosquín</p>
      </div>

      <!-- Filter Pills -->
      @if (albums().length > 0) {
        <div class="filter-row">
          <div class="filter-scroll">
            <button class="filter-pill" [class.filter-pill-active]="activeFilter() === ''" (click)="setFilter('')">
              Todas
              <span class="pill-count">{{ allItems().length }}</span>
            </button>
            @for (album of albums(); track album.name) {
              <button class="filter-pill" [class.filter-pill-active]="activeFilter() === album.name" (click)="setFilter(album.name)">
                {{ album.name }}
                <span class="pill-count">{{ album.count }}</span>
              </button>
            }
          </div>
        </div>
      }

      <!-- Masonry Grid -->
      @if (filteredItems().length > 0) {
        <div class="masonry-wrapper">
          <div class="masonry-scroll">
            <div #masonryContainer class="masonry-container" [style.height.px]="containerHeight()">
              @for (item of filteredItems(); track item.id; let i = $index) {
                <div class="masonry-item"
                  [style.width.px]="getItemWidth()"
                  [style.height.px]="getItemHeight(i)"
                  [style.left.px]="getItemX(i)"
                  [style.top.px]="getItemY(i)"
                  [style.animationDelay.ms]="i * 70"
                  (click)="openLightbox(i)">
                  @if (visibleItems().has(i)) {
                    <div class="masonry-img" [style.backgroundImage]="'url(' + item.image + ')'"></div>
                  } @else {
                    <div class="masonry-img masonry-img-placeholder"></div>
                  }
                  <div class="masonry-overlay">
                    <span class="masonry-category">{{ item.category }}</span>
                    <span class="masonry-title">{{ item.title || 'Sin título' }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
          <div class="masonry-fade"></div>
        </div>
      } @else if (allItems().length > 0) {
        <div class="empty-filter">
          <p>No hay imágenes en este álbum</p>
        </div>
      }
    </section>

    <!-- Lightbox -->
    @if (activeIndex() !== null) {
      <div class="lightbox-overlay" (click)="onOverlayClick($event)">
        <button class="lightbox-close" (click)="closeLightbox()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <button class="lightbox-nav lightbox-prev" (click)="prevItem($event)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div class="lightbox-content"
          (touchstart)="onTouchStart($event)"
          (touchend)="onTouchEnd($event)">
          <div class="lightbox-img-wrapper">
            <img [src]="filteredItems()[activeIndex()!].image" [alt]="filteredItems()[activeIndex()!].title" class="lightbox-img" />
          </div>
          <div class="lightbox-info">
            <span class="lightbox-category">{{ filteredItems()[activeIndex()!].category }}</span>
            <h3 class="lightbox-title">{{ filteredItems()[activeIndex()!].title || 'Sin título' }}</h3>
            <span class="lightbox-counter">{{ activeIndex()! + 1 }} / {{ filteredItems().length }}</span>
          </div>
        </div>

        <button class="lightbox-nav lightbox-next" (click)="nextItem($event)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    }
  `,
  styles: [`
    .gallery-section {
      width: 100%;
    }

    /* ═══ HEADER ═══ */
    .gallery-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .gallery-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #2855B8;
      background: rgba(40,85,184,0.08);
      padding: 5px 14px;
      border-radius: 999px;
      margin-bottom: 14px;
      border: 1px solid rgba(40,85,184,0.15);
    }

    .gallery-title {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: 800;
      color: #17191C;
      margin: 0;
      line-height: 1.2;
    }

    .gallery-subtitle {
      font-size: var(--text-sm);
      color: #857a68;
      margin: 8px 0 0;
      line-height: 1.5;
    }

    /* ═══ FILTER PILLS ═══ */
    .filter-row {
      margin-bottom: 24px;
      overflow: visible;
    }

    .filter-scroll {
      display: flex;
      gap: 8px;
      justify-content: center;
      flex-wrap: wrap;
      padding: 0 8px;
    }

    .filter-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      border-radius: 999px;
      border: 1px solid #E6DED0;
      background: #fff;
      color: #857a68;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
      white-space: nowrap;
      font-family: var(--font-sans);
      letter-spacing: 0.01em;
    }

    .filter-pill:hover {
      background: #F1EDE4;
      color: #17191C;
      border-color: #d1c8b8;
    }

    .filter-pill-active {
      background: #2855B8;
      color: #fff;
      border-color: #2855B8;
    }

    .filter-pill-active:hover {
      background: #1F4498;
      color: #fff;
      border-color: #1F4498;
    }

    .filter-pill-active .pill-count {
      background: rgba(255,255,255,0.2);
      color: #fff;
    }

    .pill-count {
      font-size: 10px;
      font-weight: 700;
      background: rgba(40,85,184,0.08);
      color: #2855B8;
      padding: 1px 6px;
      border-radius: 99px;
      min-width: 18px;
      text-align: center;
      transition: all 0.25s ease;
    }

    /* ═══ MASONRY ═══ */
    .masonry-wrapper {
      position: relative;
    }

    .masonry-scroll {
      max-height: 520px;
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.15) transparent;
    }

    .masonry-scroll::-webkit-scrollbar { width: 6px; }
    .masonry-scroll::-webkit-scrollbar-track { background: transparent; }
    .masonry-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
    .masonry-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }

    .masonry-container {
      position: relative;
      width: 100%;
      transition: height 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .masonry-item {
      position: absolute;
      padding: 6px;
      cursor: pointer;
      opacity: 0;
      transform: translateY(80px) scale(0.92);
      animation: masonryStagger 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      will-change: transform, opacity;
      transition: left 0.4s cubic-bezier(0.22, 1, 0.36, 1), top 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes masonryStagger {
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .masonry-img {
      position: relative;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center center;
      border-radius: 10px;
      box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.4);
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
    }

    .masonry-img-placeholder {
      background: linear-gradient(135deg, rgba(40,85,184,0.06) 0%, rgba(217,169,40,0.04) 100%);
    }

    .masonry-item:hover .masonry-img {
      transform: scale(0.95);
      box-shadow: 0 16px 50px -10px rgba(0, 0, 0, 0.5);
    }

    .masonry-overlay {
      position: absolute;
      inset: 6px;
      border-radius: 10px;
      background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 45%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 14px;
      opacity: 0;
      transition: opacity 0.35s ease;
      pointer-events: none;
    }

    .masonry-item:hover .masonry-overlay {
      opacity: 1;
    }

    .masonry-category {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--brand-accent);
      margin-bottom: 3px;
    }

    .masonry-title {
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      line-height: 1.3;
    }

    .masonry-fade {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 80px;
      background: linear-gradient(to top, #1C2638 20%, transparent);
      pointer-events: none;
      border-radius: 0 0 12px 12px;
    }

    .empty-filter {
      text-align: center;
      padding: 60px 20px;
      color: #857a68;
      font-size: var(--text-sm);
    }

    /* ═══ LIGHTBOX ═══ */
    .lightbox-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.92);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: lbFadeIn 0.25s ease;
    }

    @keyframes lbFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .lightbox-close {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      z-index: 10;
    }
    .lightbox-close:hover { background: rgba(255, 255, 255, 0.2); }

    .lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      z-index: 10;
    }
    .lightbox-nav:hover { background: rgba(255, 255, 255, 0.25); }
    .lightbox-prev { left: 16px; }
    .lightbox-next { right: 16px; }

    .lightbox-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 90vw;
      max-height: 90vh;
      animation: lbScaleIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes lbScaleIn {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }

    .lightbox-img-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lightbox-img {
      max-width: 85vw;
      max-height: 72vh;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
    }

    .lightbox-info {
      text-align: center;
      margin-top: 20px;
    }

    .lightbox-category {
      display: block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--brand-accent);
      margin-bottom: 6px;
    }

    .lightbox-title {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 700;
      color: #fff;
      margin: 0 0 6px;
    }

    .lightbox-counter {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.35);
    }

    /* ═══ RESPONSIVE ═══ */
    @media (max-width: 640px) {
      .gallery-header { margin-bottom: 18px; }
      .gallery-title { font-size: var(--text-xl); }
      .gallery-subtitle { font-size: 12px; margin-top: 5px; }
      .filter-row { margin-bottom: 16px; }
      .filter-scroll {
        justify-content: flex-start;
        flex-wrap: nowrap;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 4px;
        gap: 6px;
        padding-left: 4px;
        padding-right: 4px;
      }
      .filter-pill { flex-shrink: 0; padding: 5px 11px; font-size: 11px; }
      .masonry-scroll { max-height: 420px; }
      .masonry-overlay { opacity: 1; background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 40%); }
      .masonry-category { font-size: 8px; }
      .masonry-title { font-size: 11px; }
      .lightbox-nav { display: none; }
      .lightbox-img { max-width: 95vw; max-height: 65vh; }
      .lightbox-close { top: 10px; right: 10px; width: 38px; height: 38px; }
    }

    @media (max-width: 380px) {
      .gallery-badge { font-size: 9px; padding: 4px 10px; margin-bottom: 10px; }
      .gallery-title { font-size: 17px; }
      .gallery-subtitle { font-size: 11px; }
      .filter-scroll { gap: 5px; }
      .filter-pill { padding: 4px 9px; font-size: 10px; gap: 4px; }
      .pill-count { font-size: 9px; padding: 0 5px; min-width: 16px; }
      .masonry-scroll { max-height: 360px; }
      .masonry-item { padding: 4px; }
      .masonry-overlay { padding: 8px; inset: 4px; }
      .masonry-category { font-size: 7px; margin-bottom: 2px; }
      .masonry-title { font-size: 10px; }
      .lightbox-img { max-width: 100vw; max-height: 60vh; border-radius: 0; }
      .lightbox-info { padding: 0 12px; }
      .lightbox-title { font-size: var(--text-base); }
    }
  `],
})
export class ThreeGalleryComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly galleryService = inject(GalleryService);
  private readonly cdr = inject(ChangeDetectorRef);
  @ViewChild('masonryContainer') containerRef!: ElementRef<HTMLDivElement>;

  readonly allItems = signal<GalleryItem[]>([]);
  readonly activeFilter = signal('');
  readonly activeIndex = signal<number | null>(null);
  readonly containerHeight = signal(0);
  readonly visibleItems = signal<Set<number>>(new Set());

  readonly filteredItems = computed(() => {
    const filter = this.activeFilter();
    const items = this.allItems();
    if (!filter) return items;
    return items.filter(i => (i.title || 'Sin título') === filter);
  });

  readonly albums = computed(() => {
    const items = this.allItems();
    const map = new Map<string, number>();
    for (const item of items) {
      const name = item.title || 'Sin título';
      map.set(name, (map.get(name) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });

  private columns = 3;
  private columnHeights: number[] = [];
  private itemPositions: { x: number; y: number; w: number; h: number }[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private containerWidth = 0;
  private touchStartX = 0;
  private touchStartY = 0;

  private readonly aspectRatios = [0.75, 1.0, 1.33, 0.8, 1.1, 0.65, 1.2, 0.9];

  private onKeyDown = (e: KeyboardEvent): void => {
    if (this.activeIndex() === null) return;
    if (e.key === 'Escape') this.closeLightbox();
    if (e.key === 'ArrowLeft') this.prevItem(e);
    if (e.key === 'ArrowRight') this.nextItem(e);
  };

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('resize', this.onResize);
    this.galleryService.getGallery().subscribe({
      next: (items) => {
        this.allItems.set(items);
        this.cdr.markForCheck();
        setTimeout(() => {
          this.calculateLayout();
          this.observeItems();
        }, 0);
      },
      error: () => {},
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.resizeObserver = new ResizeObserver(() => {
      this.updateColumns();
      this.calculateLayout();
    });
    if (this.containerRef) {
      this.resizeObserver.observe(this.containerRef.nativeElement);
    }

    const scrollContainer = this.containerRef?.nativeElement?.closest('.masonry-scroll');
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        const updated = new Set(this.visibleItems());
        for (const entry of entries) {
          const idx = parseInt(entry.target.getAttribute('data-idx') || '-1', 10);
          if (idx < 0) continue;
          if (entry.isIntersecting) {
            updated.add(idx);
          }
        }
        if (updated.size !== this.visibleItems().size) {
          this.visibleItems.set(updated);
          this.cdr.markForCheck();
        }
      },
      {
        root: scrollContainer || null,
        rootMargin: '400px 0px',
        threshold: 0,
      }
    );

    setTimeout(() => {
      this.calculateLayout();
      this.observeItems();
    }, 50);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('resize', this.onResize);
    document.body.style.overflow = '';
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
  }

  setFilter(category: string): void {
    this.activeFilter.set(category);
    this.activeIndex.set(null);
    this.visibleItems.set(new Set());
    this.cdr.markForCheck();
    setTimeout(() => {
      this.calculateLayout();
      this.observeItems();
    }, 0);
  }

  private onResize = (): void => {
    this.updateColumns();
    this.calculateLayout();
    this.cdr.markForCheck();
  };

  private updateColumns(): void {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    if (w >= 1500) this.columns = 5;
    else if (w >= 1000) this.columns = 4;
    else if (w >= 600) this.columns = 3;
    else this.columns = 2;
  }

  private calculateLayout(): void {
    if (!this.containerRef) return;
    this.containerWidth = this.containerRef.nativeElement.clientWidth;
    if (this.containerWidth === 0) return;

    const columnWidth = this.containerWidth / this.columns;
    this.columnHeights = new Array(this.columns).fill(0);
    this.itemPositions = [];

    this.filteredItems().forEach((_, i) => {
      const col = this.columnHeights.indexOf(Math.min(...this.columnHeights));
      const x = columnWidth * col;
      const ratio = this.aspectRatios[i % this.aspectRatios.length];
      const h = columnWidth * ratio;
      const y = this.columnHeights[col];

      this.columnHeights[col] += h;
      this.itemPositions.push({ x, y, w: columnWidth, h });
    });

    this.containerHeight.set(Math.max(...this.columnHeights, 0));
  }

  getItemWidth(): number {
    return this.containerWidth / this.columns;
  }

  getItemHeight(index: number): number {
    return this.itemPositions[index]?.h || 200;
  }

  getItemX(index: number): number {
    return this.itemPositions[index]?.x || 0;
  }

  getItemY(index: number): number {
    return this.itemPositions[index]?.y || 0;
  }

  private observeItems(): void {
    if (!this.intersectionObserver || !this.containerRef) return;
    this.intersectionObserver.disconnect();
    const container = this.containerRef.nativeElement;
    const items = container.querySelectorAll('.masonry-item');
    items.forEach((el, i) => {
      el.setAttribute('data-idx', String(i));
      this.intersectionObserver!.observe(el);
    });
  }

  openLightbox(index: number): void {
    this.activeIndex.set(index);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.activeIndex.set(null);
    document.body.style.overflow = '';
  }

  onOverlayClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('lightbox-overlay')) {
      this.closeLightbox();
    }
  }

  prevItem(event: Event): void {
    event.stopPropagation();
    const len = this.filteredItems().length;
    if (len === 0) return;
    this.activeIndex.set((this.activeIndex()! - 1 + len) % len);
  }

  nextItem(event: Event): void {
    event.stopPropagation();
    const len = this.filteredItems().length;
    if (len === 0) return;
    this.activeIndex.set((this.activeIndex()! + 1) % len);
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchStartY = event.changedTouches[0].screenY;
  }

  onTouchEnd(event: TouchEvent): void {
    const dx = event.changedTouches[0].screenX - this.touchStartX;
    const dy = event.changedTouches[0].screenY - this.touchStartY;
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) this.nextItem(event);
    else this.prevItem(event);
  }
}
