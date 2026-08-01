import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  ElementRef,
  AfterViewInit,
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
  selector: 'app-mobile-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./tokens.css', './components.css'],
  template: `
    <!-- Mobile Header -->
    <header class="mobile-header">
      <div class="header-left">
        <div class="header-logo">
          <span class="logo-icon">♪</span>
          <span class="logo-text">Pre Cosquín</span>
        </div>
        <div class="header-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>Puerto Pirámides</span>
        </div>
      </div>
      <div class="header-right">
        <button class="header-bell" aria-label="Notificaciones">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="notification-dot"></span>
        </button>
        <button class="header-avatar" aria-label="Perfil">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>Fecha límite: 31 de Agosto, 2026</span>
        </div>

        <button class="btn-primary status-cta" (click)="navigate('/inscripcion')">
          Inscribirme ahora
        </button>
        <button class="btn-secondary status-secondary" (click)="navigate('/documentacion')">
          Ver bases y condiciones
        </button>
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
              <span class="timeline-date">5–6 Sep 2026</span>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <span class="quick-action-label">Inscripciones</span>
          </button>
          <button class="quick-action" (click)="navigate('/documentacion')">
            <div class="quick-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <span class="quick-action-label">Bases</span>
          </button>
          <button class="quick-action" (click)="navigate('/noticias')">
            <div class="quick-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </div>
            <span class="quick-action-label">Categorías</span>
          </button>
          <button class="quick-action">
            <div class="quick-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span class="quick-action-label">Jurados</span>
          </button>
          <button class="quick-action">
            <div class="quick-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span class="quick-action-label">Cronograma</span>
          </button>
          <button class="quick-action">
            <div class="quick-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Teatro Municipal, Puerto Pirámides</span>
            </div>
            <div class="event-detail">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>20:00 hs</span>
            </div>
          </div>
          <button class="event-calendar-btn" aria-label="Agregar al calendario">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
          </button>
        </div>
      </section>

      <!-- 5. NEWS (only 3) -->
      <section class="news-section">
        <div class="section-header">
          <h3 class="section-title">Últimas noticias</h3>
          <button class="section-action" (click)="navigate('/noticias')">Ver todas</button>
        </div>
        <div class="news-list">
          @for (news of newsItems(); track news.id) {
            <article class="news-card" (click)="navigate('/noticias/' + news.id)">
              @if (news.thumbnail) {
                <img class="news-thumbnail" [src]="news.thumbnail" [alt]="news.title" loading="lazy" />
              } @else {
                <div class="news-thumbnail news-thumbnail-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              }
              <div class="news-content">
                @if (news.category) {
                  <span class="news-category badge badge-info">{{ news.category }}</span>
                }
                <h4 class="news-title">{{ news.title }}</h4>
                <span class="news-date">{{ formatDate(news.publishedAt) }}</span>
              </div>
            </article>
          } @empty {
            <div class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>Próximamente habrá noticias</p>
            </div>
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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
            <h4 class="live-title">Transmisión en vivo del festival</h4>
          </div>
        </section>
      }

      <!-- Bottom spacer for nav -->
      <div class="bottom-spacer"></div>
    </main>

    <!-- 7. BOTTOM NAVIGATION -->
    <nav class="mobile-bottom-nav">
      <button class="nav-tab active" (click)="navigate('/')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Inicio</span>
      </button>
      <button class="nav-tab" (click)="navigate('/noticias')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
        <span>Noticias</span>
      </button>
      <button class="nav-tab nav-tab-center" (click)="navigate('/inscripcion')">
        <div class="nav-tab-center-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <span>Inscribirme</span>
      </button>
      <button class="nav-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
        <span>Videos</span>
      </button>
      <button class="nav-tab">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        <span>Más</span>
      </button>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100dvh;
      background-color: var(--bg);
      color: var(--text-primary);
      font-family: var(--font-family);
      position: relative;
      overflow-x: hidden;
    }

    .mobile-header {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: var(--header-height);
      padding: 0 var(--content-padding);
      padding-top: var(--safe-area-top);
      background: rgba(14, 15, 18, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
    }

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .header-logo {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .logo-icon {
      font-size: 18px;
      color: var(--accent);
    }

    .logo-text {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.3px;
    }

    .header-location {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--text-secondary);
      font-size: 11px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-bell,
    .header-avatar {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
    }

    .header-bell:active,
    .header-avatar:active {
      transform: scale(0.92);
    }

    .notification-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--red);
      border: 2px solid var(--bg);
    }

    .mobile-content {
      padding: var(--content-padding);
      padding-bottom: calc(var(--bottom-nav-height) + var(--safe-area-bottom) + 20px);
    }

    .bottom-spacer {
      height: 20px;
    }

    /* Status Card */
    .status-card {
      background: var(--surface);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border);
      padding: 24px;
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
    }

    .status-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: var(--radius-full);
      font-size: 13px;
      font-weight: 600;
      color: var(--green);
      margin-bottom: 16px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--green);
      animation: pulse-live 2s infinite;
    }

    .status-title {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 4px;
      letter-spacing: -0.5px;
    }

    .status-subtitle {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin: 0 0 24px;
    }

    .countdown {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin-bottom: 20px;
    }

    .countdown-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 56px;
    }

    .countdown-number {
      font-size: 32px;
      font-weight: 700;
      color: var(--accent);
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .countdown-label {
      font-size: 11px;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    .countdown-separator {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-tertiary);
      margin-top: -12px;
    }

    .status-deadline {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 20px;
    }

    .status-cta {
      width: 100%;
      margin-bottom: 10px;
    }

    .status-secondary {
      width: 100%;
    }

    /* Section Styles */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .section-action {
      font-size: 14px;
      font-weight: 600;
      color: var(--accent);
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 0;
    }

    /* Timeline */
    .timeline-section {
      margin-bottom: 28px;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      padding-left: 4px;
    }

    .timeline-step {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      position: relative;
      padding-bottom: 24px;
    }

    .timeline-step.last {
      padding-bottom: 0;
    }

    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 3px;
      position: relative;
      z-index: 1;
    }

    .timeline-line {
      position: absolute;
      left: 5px;
      top: 15px;
      bottom: 0;
      width: 2px;
    }

    .timeline-step.completed .timeline-dot {
      background: var(--green);
    }

    .timeline-step.completed .timeline-line {
      background: var(--green);
    }

    .timeline-step.active .timeline-dot {
      background: var(--accent);
      box-shadow: 0 0 0 4px rgba(201, 168, 76, 0.2);
    }

    .timeline-step.active .timeline-line {
      background: linear-gradient(to bottom, var(--accent), var(--border));
    }

    .timeline-step.upcoming .timeline-dot {
      background: var(--surface-elevated);
      border: 2px solid var(--border-light);
    }

    .timeline-step.upcoming .timeline-line {
      background: var(--border);
    }

    .timeline-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .timeline-label {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .timeline-step.upcoming .timeline-label {
      color: var(--text-secondary);
    }

    .timeline-date {
      font-size: 13px;
      color: var(--text-tertiary);
    }

    /* Quick Actions */
    .quick-actions-section {
      margin-bottom: 28px;
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .quick-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 20px 8px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
      aspect-ratio: 1;
    }

    .quick-action:active {
      transform: scale(0.95);
      background: var(--surface-elevated);
    }

    .quick-action-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: rgba(201, 168, 76, 0.1);
      color: var(--accent);
    }

    .quick-action-label {
      font-size: 13px;
      font-weight: 600;
      text-align: center;
    }

    /* Event Card */
    .event-section {
      margin-bottom: 28px;
    }

    .event-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      position: relative;
    }

    .event-card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 12px;
      bottom: 12px;
      width: 3px;
      background: var(--accent);
      border-radius: 0 2px 2px 0;
    }

    .event-date-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 48px;
      padding: 8px;
      background: rgba(201, 168, 76, 0.1);
      border-radius: var(--radius-md);
    }

    .event-day {
      font-size: 24px;
      font-weight: 700;
      color: var(--accent);
      line-height: 1;
    }

    .event-month {
      font-size: 11px;
      font-weight: 700;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .event-info {
      flex: 1;
      min-width: 0;
    }

    .event-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .event-detail {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 2px;
    }

    .event-detail svg {
      flex-shrink: 0;
      color: var(--text-tertiary);
    }

    .event-calendar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: rgba(201, 168, 76, 0.1);
      border: 1px solid rgba(201, 168, 76, 0.2);
      color: var(--accent);
      cursor: pointer;
      flex-shrink: 0;
      transition: all var(--duration-fast) var(--ease-default);
    }

    .event-calendar-btn:active {
      transform: scale(0.92);
    }

    /* News */
    .news-section {
      margin-bottom: 28px;
    }

    .news-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .news-card {
      display: flex;
      gap: 14px;
      padding: 14px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
    }

    .news-card:active {
      transform: scale(0.98);
      background: var(--surface-elevated);
    }

    .news-thumbnail {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-md);
      object-fit: cover;
      flex-shrink: 0;
      background: var(--surface-elevated);
    }

    .news-thumbnail-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-tertiary);
    }

    .news-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
    }

    .news-category {
      align-self: flex-start;
    }

    .news-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.3;
    }

    .news-date {
      font-size: 12px;
      color: var(--text-tertiary);
    }

    /* Live Card */
    .live-section {
      margin-bottom: 28px;
    }

    .live-card {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), var(--surface));
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: var(--radius-xl);
      padding: 20px;
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);
    }

    .live-card:active {
      transform: scale(0.98);
    }

    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      background: rgba(239, 68, 68, 0.15);
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 700;
      color: var(--red);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 14px;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--red);
      animation: pulse-live 1.5s infinite;
    }

    .live-thumbnail {
      width: 100%;
      aspect-ratio: 16/9;
      background: var(--surface-elevated);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      position: relative;
      overflow: hidden;
    }

    .live-play-btn {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .live-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px 20px;
      color: var(--text-tertiary);
      text-align: center;
    }

    .empty-state p {
      font-size: 14px;
      margin: 0;
    }

    /* Badge */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 600;
    }

    .badge-info {
      background: rgba(96, 165, 250, 0.12);
      color: #60a5fa;
    }

    .badge-success {
      background: rgba(34, 197, 94, 0.12);
      color: var(--green);
    }

    .badge-warning {
      background: rgba(245, 158, 11, 0.12);
      color: #f59e0b;
    }

    .badge-danger {
      background: rgba(239, 68, 68, 0.12);
      color: var(--red);
    }

    /* Animations */
    @keyframes pulse-live {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slide-up {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class MobileHomeRedesignComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly days = signal(0);
  readonly hours = signal(0);
  readonly minutes = signal(0);
  readonly seconds = signal(0);
  readonly isLive = signal(false);
  readonly newsItems = signal<NewsItem[]>([]);

  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.loadNews();
  }

  ngAfterViewInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return dateStr;
    }
  }

  private startCountdown(): void {
    this.updateCountdown();
    this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  private updateCountdown(): void {
    const deadline = new Date('2026-08-31T23:59:59-03:00');
    const now = new Date();
    const diff = Math.max(0, deadline.getTime() - now.getTime());

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    this.days.set(d);
    this.hours.set(h);
    this.minutes.set(m);
    this.seconds.set(s);
  }

  private loadNews(): void {
    this.http.get<{ data: NewsItem[] }>(`${environment.apiUrl}/news/?limit=3`).subscribe({
      next: (res) => {
        const items = (res.data || res || []) as NewsItem[];
        this.newsItems.set(items.slice(0, 3));
      },
      error: () => {
        this.newsItems.set([]);
      },
    });
  }
}
