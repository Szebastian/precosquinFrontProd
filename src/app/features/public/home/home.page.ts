import { Component, signal, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { IMAGE_PATHS } from '../../../shared/constants/image-paths';
import { BackToTopComponent } from '../../../shared/components/back-to-top/back-to-top.component';
import { HomeHeaderComponent } from './components/home-header.component';
import { NewsCarouselComponent, NewsItem } from './components/news-carousel.component';
import { HomeComponentSeparatorComponent } from './components/home-separator.component';
import { HomeCtaBannerComponent } from './components/home-cta-banner.component';
import { HomeScoreboardComponent } from './components/home-scoreboard.component';
import { HomeDeclaracionHeroComponent } from './components/home-declaracion-hero.component';
import { HomeFooterComponent } from './components/home-footer.component';
import { YoutubeLiveWidgetComponent } from './components/youtube-live-widget.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    BackToTopComponent,
    HomeHeaderComponent,
    NewsCarouselComponent,
    HomeComponentSeparatorComponent,
    HomeCtaBannerComponent,
    HomeScoreboardComponent,
    HomeDeclaracionHeroComponent,
    HomeFooterComponent,
    YoutubeLiveWidgetComponent,
  ],
  template: `
    <div class="portal">
      <app-home-header />

      <main class="portal-main">
        <app-news-carousel [newsItems]="newsItems()" />
      </main>

      <app-home-separator variant="wave">
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
      </app-home-separator>

      <app-home-cta-banner />

      <app-home-separator variant="diagonal">
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
      </app-home-separator>

      <app-home-scoreboard />
      <app-home-declaracion-hero />
      <app-home-footer />
      <app-youtube-live-widget />
      <app-back-to-top />
    </div>
  `,
  styles: [`
    .portal { min-height: 100vh; background-color: var(--gray-50); font-family: var(--font-sans); display: flex; flex-direction: column; }
    .portal-main { flex: 1; max-width: 1200px; margin: 0 auto; width: 100%; padding: var(--space-6) var(--space-4); }
  `]
})
export class HomePageComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  newsItems = signal<NewsItem[]>([
    {
      id: 1, category: 'FESTIVAL 2027', title: 'Se abren las inscripciones para el certamen Nuevos Valores',
      image: IMAGE_PATHS.HOME_BACKGROUND, thumbType: 'img', thumbSrc: 'assets/img/cruzBaila.png', thumbBg: 'bg-blue'
    },
    {
      id: 2, category: 'JURADO', title: 'Capacitación para el jurado de danza en el Hotel Rayentray',
      image: 'assets/img/LRayentray.webp', thumbType: 'img', thumbSrc: 'assets/img/cruzBaila.png', thumbBg: 'bg-blue'
    },
    {
      id: 3, category: 'REGLAMENTO', title: 'Modificación en el reglamento del rubro "Solista Vocal"',
      image: 'assets/img/LHydro.webp', thumbType: 'icon',
      thumbSrc: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>',
      thumbBg: 'bg-gold'
    },
    {
      id: 4, category: 'CRONOGRAMA', title: 'Cronograma oficial de la primera ronda clasificatoria',
      image: IMAGE_PATHS.HOME_BACKGROUND, thumbType: 'icon',
      thumbSrc: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      thumbBg: 'bg-gray'
    }
  ]);

  ngOnInit(): void {
    this.http.get<NewsItem[]>(`${environment.apiUrl}/news`).subscribe({
      next: (data) => { if (data && data.length > 0) { this.newsItems.set(data); this.cdr.detectChanges(); } },
      error: (err) => console.error('Error fetching news', err),
    });
  }
}
