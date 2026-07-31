import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { HomeHeaderComponent } from './components/home-header.component';
import { NewsCarouselComponent, NewsItem } from './components/news-carousel.component';
import { HomeComponentSeparatorComponent } from './components/home-separator.component';
import { HomeCtaBannerComponent } from './components/home-cta-banner.component';
import { HomeDeclaracionHeroComponent } from './components/home-declaracion-hero.component';
import { HomeScoreboardComponent } from './components/home-scoreboard.component';
import { HomeFooterComponent } from './components/home-footer.component';
import { YoutubeLiveWidgetComponent } from './components/youtube-live-widget.component';
import { BackToTopComponent } from '../../../shared/components/back-to-top/back-to-top.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HomeHeaderComponent,
    NewsCarouselComponent,
    HomeComponentSeparatorComponent,
    HomeCtaBannerComponent,
    HomeDeclaracionHeroComponent,
    HomeScoreboardComponent,
    HomeFooterComponent,
    YoutubeLiveWidgetComponent,
    BackToTopComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

      @defer (on idle) {
        <app-home-scoreboard />
      } @loading (minimum 500ms) {
        <div style="height: 100px;"></div>
      }
      <app-home-declaracion-hero />
      @defer (on idle) {
        <app-home-footer />
      } @loading (minimum 500ms) {
        <div style="height: 200px;"></div>
      }
      @defer (on idle) {
        <app-youtube-live-widget />
      } @loading (minimum 1s) {
        <div style="height: 80px;"></div>
      }
      @defer (on idle) {
        <app-back-to-top />
      }
    </div>
  `,
  styles: [`
    .portal { min-height: 100vh; background-color: var(--gray-50); font-family: var(--font-sans); display: flex; flex-direction: column; }
    .portal-main { flex: 1; max-width: 1200px; margin: 0 auto; width: 100%; padding: var(--space-6) var(--space-4); }
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
