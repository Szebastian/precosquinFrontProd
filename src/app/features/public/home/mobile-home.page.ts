import {
  Component,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
}

@Component({
  selector: 'app-mobile-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: [
    './mobile-home-redesign/components.css',
    './mobile-home-redesign/tokens.css',
  ],
  template: `
    <!-- Mobile Header -->
    <header class="mobile-header">
      <div class="header-left">
        <div class="header-logo">
          <span class="logo-icon">&#9835;</span>
          <span class="logo-text">Pre Cosquín</span>
        </div>
        <div class="header-location">
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="var(--accent)" stroke="none"/>
            <circle cx="12" cy="10" r="3" fill="#0E0F12"/>
          </svg>
          <span>Puerto Pirámides</span>
        </div>
      </div>
      <div class="header-right">
        <button class="header-bell">
          <svg viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="notification-dot"></span>
        </button>
        <button class="header-avatar"></button>
      </div>
    </header>

    <!-- Scrollable Content -->
    <main class="mobile-content">

      <!-- 1. STATUS CARD -->
      <section class="status-card">
        <div class="status-badge">
          <span class="status-dot"></span>
          <span>Inscripciones Abiertas</span>
        </div>
        <h2 class="status-title">Pre Cosquín 2027</h2>
        <p class="status-subtitle">Certamen Folklórico Nacional</p>

        <div class="countdown">
          <div class="countdown-item">
            <span class="countdown-number">{{ days() }}</span>
            <span class="countdown-label">días</span>
          </div>
          <div class="countdown-separator">:</div>
          <div class="countdown-item">
            <span class="countdown-number">{{ hours() }}</span>
            <span class="countdown-label">horas</span>
          </div>
          <div class="countdown-separator">:</div>
          <div class="countdown-item">
            <span class="countdown-number">{{ minutes() }}</span>
            <span class="countdown-label">min</span>
          </div>
          <div class="countdown-separator">:</div>
          <div class="countdown-item">
            <span class="countdown-number">{{ seconds() }}</span>
            <span class="countdown-label">seg</span>
          </div>
        </div>

        <div class="status-deadline">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>Fecha límite: 31 de Agosto, 2026</span>
        </div>

        <button class="btn-primary status-cta">Inscribirme ahora</button>
        <button class="btn-secondary status-secondary">Ver bases y condiciones</button>
      </section>

      <!-- 2. TIMELINE -->
      <section class="timeline-section">
        <div class="section-header">
          <h3 class="section-title">Etapas del certamen</h3>
        </div>
        <div class="timeline">
          <div class="timeline-step completed">
            <div class="timeline-dot"></div>
            <div class="timeline-line"></div>
            <div class="timeline-content">
              <span class="timeline-label">Inscripción</span>
              <span class="timeline-date">Ago 2026</span>
            </div>
          </div>
          <div class="timeline-step active">
            <div class="timeline-dot"></div>
            <div class="timeline-line"></div>
            <div class="timeline-content">
              <span class="timeline-label">Preselección</span>
              <span class="timeline-date">Sep 2026</span>
            </div>
          </div>
          <div class="timeline-step upcoming">
            <div class="timeline-dot"></div>
            <div class="timeline-line"></div>
            <div class="timeline-content">
              <span class="timeline-label">Jurados</span>
              <span class="timeline-date">Sep 2026</span>
            </div>
          </div>
          <div class="timeline-step upcoming">
            <div class="timeline-dot"></div>
            <div class="timeline-line"></div>
            <div class="timeline-content">
              <span class="timeline-label">Festival</span>
              <span class="timeline-date">5-6 Sep 2026</span>
            </div>
          </div>
          <div class="timeline-step upcoming last">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-label">Resultados</span>
              <span class="timeline-date">Sep 2026</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. QUICK ACTIONS GRID -->
      <section class="quick-actions-section">
        <div class="quick-actions-grid">
          <button class="quick-action" (click)="navigate('/inscripcion')">
            <div class="quick-action-icon">
              <svg viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <span class="quick-action-label">Inscripciones</span>
          </button>
          <button class="quick-action" (click)="navigate('/documentacion')">
            <div class="quick-action-icon">
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <span class="quick-action-label">Bases</span>
          </button>
          <button class="quick-action" (click)="navigate('/noticias')">
            <div class="quick-action-icon">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <span class="quick-action-label">Categorías</span>
          </button>
          <button class="quick-action">
            <div class="quick-action-icon">
              <svg viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span class="quick-action-label">Jurados</span>
          </button>
          <button class="quick-action">
            <div class="quick-action-icon">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <span class="quick-action-label">Cronograma</span>
          </button>
          <button class="quick-action">
            <div class="quick-action-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
              </svg>
            </div>
            <span class="quick-action-label">Resultados</span>
          </button>
        </div>
      </section>

      <!-- 4. NEXT EVENT CARD -->
      <section class="event-section">
        <div class="section-header">
          <h3 class="section-title">Próximo evento</h3>
          <button class="section-action">Ver agenda</button>
        </div>
        <div class="event-card">
          <div class="event-date-block">
            <span class="event-day">5</span>
            <span class="event-month">SEP</span>
          </div>
          <div class="event-info">
            <h4 class="event-title">Pre Cosquín Puerto Pirámides</h4>
            <div class="event-detail">
              <svg viewBox="0 0 24 24" width="12" height="12">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Teatro Municipal, Puerto Pirámides</span>
            </div>
            <div class="event-detail">
              <svg viewBox="0 0 24 24" width="12" height="12">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>20:00 hs</span>
            </div>
          </div>
          <button class="event-calendar-btn">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <line x1="12" y1="14" x2="12" y2="18"/>
              <line x1="10" y1="16" x2="14" y2="16"/>
            </svg>
          </button>
        </div>
      </section>

      <!-- 5. NEWS -->
      <section class="news-section">
        <div class="section-header">
          <h3 class="section-title">Últimas noticias</h3>
          <button class="section-action">Ver todas</button>
        </div>
        <div class="news-list">
          @for (item of newsItems(); track item.id) {
            <article class="news-card">
              <img class="news-thumbnail" [src]="item.thumbnail" [alt]="item.title" />
              <div class="news-content">
                <span class="news-category badge badge-info">Noticia</span>
                <h4 class="news-title">{{ item.title }}</h4>
                <span class="news-date">{{ item.date }}</span>
              </div>
            </article>
          }
        </div>
      </section>

      <!-- 6. LIVE CARD (conditional) -->
      @if (isLive()) {
        <section class="live-section">
          <div class="live-card">
            <div class="live-badge">
              <span class="live-dot"></span>
              <span>EN VIVO</span>
            </div>
            <div class="live-thumbnail">
              <div class="live-play-btn">
                <svg viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
            </div>
            <h4 class="live-title">Transmisión en vivo del festival</h4>
          </div>
        </section>
      }

    </main>

    <!-- 7. BOTTOM NAVIGATION -->
    <nav class="mobile-bottom-nav">
      <button class="nav-tab active">
        <svg viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Inicio</span>
      </button>
      <button class="nav-tab">
        <svg viewBox="0 0 24 24">
          <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/>
          <line x1="7" y1="8" x2="13" y2="8"/>
          <line x1="7" y1="12" x2="11" y2="12"/>
        </svg>
        <span>Noticias</span>
      </button>
      <button class="nav-tab nav-tab-center" (click)="navigate('/inscripcion')">
        <div class="nav-tab-center-icon">
          <svg viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
        <span>Inscribirme</span>
      </button>
      <button class="nav-tab">
        <svg viewBox="0 0 24 24">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
        <span>Videos</span>
      </button>
      <button class="nav-tab">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="12" cy="5" r="1"/>
          <circle cx="12" cy="19" r="1"/>
        </svg>
        <span>Más</span>
      </button>
    </nav>
  `,
})
export class MobileHomeRedesignComponent implements OnInit, AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private countdownTarget = new Date('2026-08-31T23:59:59-03:00');
  private intervalId: ReturnType<typeof setInterval> | null = null;

  days = signal('00');
  hours = signal('00');
  minutes = signal('00');
  seconds = signal('00');
  isLive = signal(false);
  newsItems = signal<NewsItem[]>([]);

  ngOnInit(): void {
    this.updateCountdown();
    this.loadNews();
  }

  ngAfterViewInit(): void {
    this.intervalId = setInterval(() => this.updateCountdown(), 1000);
    this.destroyRef.onDestroy(() => {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }

  private updateCountdown(): void {
    const now = new Date();
    const diff = this.countdownTarget.getTime() - now.getTime();

    if (diff <= 0) {
      this.days.set('00');
      this.hours.set('00');
      this.minutes.set('00');
      this.seconds.set('00');
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    this.days.set(String(d).padStart(2, '0'));
    this.hours.set(String(h).padStart(2, '0'));
    this.minutes.set(String(m).padStart(2, '0'));
    this.seconds.set(String(s).padStart(2, '0'));
  }

  private loadNews(): void {
    this.http.get<NewsItem[]>(`${environment.apiUrl}/news/`).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.newsItems.set(data.slice(0, 3));
        }
      },
      error: (err) => console.error('Error fetching news', err),
    });
  }
}
