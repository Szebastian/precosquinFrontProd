import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Venue {
  id: string;
  badge: string;
  color: string;
  name: string;
  fullAddress: string;
  shortAddress: string;
  stage: string;
  hours: string;
  hoursLabel: string;
  mapsUrl: string;
  embedUrl: string;
  safeEmbedUrl?: SafeResourceUrl;
  icon: string;
}

@Component({
  selector: 'app-location-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="location">
      <div class="sliced-waves">
        <div class="sw-row" style="--r:0"></div>
        <div class="sw-row" style="--r:1"></div>
        <div class="sw-row" style="--r:2"></div>
        <div class="sw-row" style="--r:3"></div>
        <div class="sw-row" style="--r:4"></div>
        <div class="sw-row" style="--r:5"></div>
        <div class="sw-row" style="--r:6"></div>
        <div class="sw-row" style="--r:7"></div>
      </div>
      <div class="location-inner">
        <!-- LEFT: Card with tabs -->
        <div class="location-card">
          <div class="venue-tabs" role="tablist" aria-label="Sedes del evento">
            @for (v of venues; track v.id) {
              <button class="venue-tab" role="tab"
                [class.active]="activeVenue() === v.id"
                [attr.aria-selected]="activeVenue() === v.id"
                [attr.aria-controls]="'panel-' + v.id"
                (click)="selectVenue(v.id)">
                <span class="venue-tab-icon" [innerHTML]="v.icon"></span>
                <span class="venue-tab-label">{{ v.badge }}</span>
              </button>
            }
          </div>

          @for (v of venues; track v.id) {
            @if (activeVenue() === v.id) {
              <div class="venue-content" role="tabpanel" [id]="'panel-' + v.id">
                <div class="venue-badge" [style.--venue-color]="v.color">
                  <span class="venue-badge-dot"></span>
                  {{ v.badge }}
                </div>

                <h2 class="location-title">{{ v.name }}</h2>
                <p class="location-address">{{ v.shortAddress }}</p>
                <p class="location-fulladdress">{{ v.fullAddress }}</p>

                <div class="location-details">
                  <div class="detail-row">
                    <div class="detail-icon detail-icon--stage">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/><line x1="12" y1="2" x2="12" y2="8.5"/></svg>
                    </div>
                    <div class="detail-text">
                      <span class="detail-label">Escenario</span>
                      <span class="detail-value">{{ v.stage }}</span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <div class="detail-icon detail-icon--date">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>
                    </div>
                    <div class="detail-text">
                      <span class="detail-label">Fechas</span>
                      <span class="detail-value">5 y 6 de septiembre 2026</span>
                    </div>
                  </div>

                  <div class="detail-row">
                    <div class="detail-icon detail-icon--hours">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div class="detail-text">
                      <span class="detail-label">{{ v.hoursLabel }}</span>
                      <span class="detail-value">{{ v.hours }}</span>
                    </div>
                  </div>
                </div>

                <div class="location-actions">
                  <a class="location-btn" [href]="v.mapsUrl" target="_blank" rel="noopener noreferrer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Abrir en Google Maps
                  </a>
                  <button class="location-copy" (click)="copyAddress(v.fullAddress)" [attr.aria-label]="'Copiar dirección de ' + v.name">
                    @if (copied()) {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Copiado
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Copiar dirección
                    }
                  </button>
                </div>
              </div>
            }
          }
        </div>

        <!-- RIGHT: Map with floating GPS button -->
        <div class="location-map">
          @for (v of venues; track v.id) {
            @if (activeVenue() === v.id) {
              <iframe [class.map-hidden]="!mapLoaded()" (load)="mapLoaded.set(true)"
                [src]="v.safeEmbedUrl"
                width="100%" height="100%" style="border:0;" allowfullscreen loading="lazy"
                referrerpolicy="no-referrer-when-downgrade" [title]="'Mapa de ' + v.name"></iframe>
            }
          }

          <a class="map-gps-fab" [href]="currentVenue().mapsUrl" target="_blank" rel="noopener noreferrer"
            [attr.aria-label]="'Abrir ' + currentVenue().name + ' en Google Maps'">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span class="gps-fab-label">GPS</span>
          </a>

          <div class="map-venue-label">
            <span class="map-venue-dot" [style.background]="currentVenue().color"></span>
            {{ currentVenue().name }}
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .location { width: 100%; position: relative; overflow: visible; }

    /* ─── Sliced Waves ─── */
    .sliced-waves {
      position: absolute; top: -40px; bottom: -40px; left: 50%;
      width: 100vw; transform: translateX(-50%);
      overflow: hidden; pointer-events: none; z-index: 0;
    }
    .sw-row {
      position: absolute; left: -10%; width: 120%; height: 18px;
      border-radius: 999px; top: calc(var(--r) * 12.5%);
      animation: sw-move 4s ease-in-out calc(var(--r) * 0.3s) infinite alternate;
    }
    .sw-row::before, .sw-row::after { content: ''; position: absolute; inset: 0; border-radius: inherit; }
    .sw-row::after { filter: blur(12px); opacity: 0.5; }
    .sw-row:nth-child(1) { background: linear-gradient(90deg, transparent 5%, rgba(251,191,36,0.5) 30%, rgba(251,191,36,0.7) 50%, rgba(251,191,36,0.5) 70%, transparent 95%); }
    .sw-row:nth-child(2) { background: linear-gradient(90deg, transparent 10%, rgba(236,72,153,0.4) 35%, rgba(236,72,153,0.6) 55%, rgba(236,72,153,0.4) 75%, transparent 90%); }
    .sw-row:nth-child(3) { background: linear-gradient(90deg, transparent 8%, rgba(96,165,250,0.5) 25%, rgba(96,165,250,0.7) 50%, rgba(96,165,250,0.5) 75%, transparent 92%); }
    .sw-row:nth-child(4) { background: linear-gradient(90deg, transparent 12%, rgba(251,191,36,0.4) 30%, rgba(236,72,153,0.5) 55%, rgba(96,165,250,0.4) 80%, transparent 88%); }
    .sw-row:nth-child(5) { background: linear-gradient(90deg, transparent 6%, rgba(96,165,250,0.45) 28%, rgba(96,165,250,0.65) 52%, rgba(96,165,250,0.45) 72%, transparent 94%); }
    .sw-row:nth-child(6) { background: linear-gradient(90deg, transparent 15%, rgba(236,72,153,0.35) 32%, rgba(251,191,36,0.5) 58%, rgba(236,72,153,0.35) 78%, transparent 85%); }
    .sw-row:nth-child(7) { background: linear-gradient(90deg, transparent 10%, rgba(251,191,36,0.4) 25%, rgba(251,191,36,0.6) 48%, rgba(251,191,36,0.4) 70%, transparent 90%); }
    .sw-row:nth-child(8) { background: linear-gradient(90deg, transparent 8%, rgba(96,165,250,0.35) 30%, rgba(236,72,153,0.45) 55%, rgba(96,165,250,0.35) 75%, transparent 92%); }
    @keyframes sw-move {
      0% { transform: translateY(0) scaleY(1); opacity: 0.7; }
      30% { transform: translateY(-12px) scaleY(1.4); opacity: 0.9; }
      60% { transform: translateY(8px) scaleY(0.7); opacity: 0.6; }
      100% { transform: translateY(-6px) scaleY(1.2); opacity: 0.8; }
    }

    /* ─── Layout ─── */
    .location-inner {
      display: grid; grid-template-columns: 1fr; gap: 0;
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.2);
      position: relative; z-index: 1;
    }

    /* ─── Tabs ─── */
    .venue-tabs {
      display: flex; gap: 6px; padding: 6px;
      background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .venue-tab {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 16px 20px; background: transparent; border: 2px solid transparent;
      border-radius: 12px; color: #94a3b8;
      font-size: 14px; font-weight: 700; letter-spacing: 0.03em;
      cursor: pointer; transition: all 0.25s ease; text-transform: uppercase;
      min-height: 52px;
    }
    .venue-tab:hover { color: #e2e8f0; background: rgba(255,255,255,0.04); }
    .venue-tab.active {
      color: #0f172a; background: #fbbf24; border-color: #fbbf24;
      box-shadow: 0 2px 12px rgba(251,191,36,0.3);
    }
    .venue-tab-icon { display: flex; align-items: center; }
    .venue-tab-icon :is(svg) { width: 20px; height: 20px; }
    .venue-tab-label { white-space: nowrap; }

    /* ─── Card ─── */
    .location-card {
      background: linear-gradient(160deg, #0f172a 0%, #1a2332 100%);
      padding: 0 32px 32px; display: flex; flex-direction: column; gap: 0;
      position: relative; overflow: hidden;
    }
    .venue-content { display: flex; flex-direction: column; gap: 14px; padding-top: 24px; }

    .location-card::before {
      content: ''; position: absolute; top: -40%; right: -30%;
      width: 240px; height: 240px; border-radius: 50%;
      background: radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%);
      pointer-events: none;
    }

    .venue-badge {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
      color: #fff; background: color-mix(in srgb, var(--venue-color, #fbbf24) 20%, transparent);
      border: 1px solid color-mix(in srgb, var(--venue-color, #fbbf24) 30%, transparent);
      padding: 6px 16px; border-radius: 999px; width: fit-content; position: relative;
      text-transform: uppercase;
    }
    .venue-badge-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--venue-color, #fbbf24);
    }

    .location-title {
      font-family: var(--font-display); font-size: 1.75rem;
      font-weight: 800; color: #fff; margin: 0; line-height: 1.2; position: relative;
    }
    .location-address {
      font-size: 16px; font-weight: 600; color: #e2e8f0; margin: 0; position: relative;
    }
    .location-fulladdress {
      font-size: 14px; font-weight: 400; color: #94a3b8; margin: 0; position: relative;
      line-height: 1.4;
    }

    .location-details {
      display: flex; flex-direction: column; gap: 16px; padding: 18px 0;
      border-top: 1px solid rgba(255,255,255,0.08);
      border-bottom: 1px solid rgba(255,255,255,0.08); position: relative;
    }
    .detail-row { display: flex; align-items: center; gap: 14px; }
    .detail-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: transform 0.2s ease;
    }
    .detail-row:hover .detail-icon { transform: scale(1.08); }
    .detail-icon--stage { background: rgba(251,191,36,0.12); color: #fbbf24; }
    .detail-icon--date { background: rgba(96,165,250,0.12); color: #60a5fa; }
    .detail-icon--hours { background: rgba(168,85,247,0.12); color: #a855f7; }
    .detail-text { display: flex; flex-direction: column; gap: 2px; }
    .detail-label {
      font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
      color: #94a3b8; text-transform: uppercase;
    }
    .detail-value { font-size: 16px; font-weight: 500; color: #f1f5f9; line-height: 1.3; }

    .location-actions {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }
    .location-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--brand-accent); color: #0f172a;
      padding: 14px 28px; border-radius: 999px; font-size: 16px;
      font-weight: 800; text-decoration: none; letter-spacing: 0.02em;
      transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.25);
      min-height: 52px; width: fit-content; position: relative;
    }
    .location-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.35); }
    .location-btn:focus-visible { outline: 3px solid #fbbf24; outline-offset: 2px; }

    .location-copy {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      background: rgba(255,255,255,0.06); color: #cbd5e1;
      padding: 12px 20px; border-radius: 999px; font-size: 14px;
      font-weight: 600; border: 1px solid rgba(255,255,255,0.1);
      cursor: pointer; transition: all 0.2s ease; min-height: 48px;
    }
    .location-copy:hover { background: rgba(255,255,255,0.1); color: #fff; border-color: rgba(255,255,255,0.2); }
    .location-copy:focus-visible { outline: 3px solid rgba(255,255,255,0.4); outline-offset: 2px; }

    /* ─── Map ─── */
    .location-map {
      position: relative; min-height: 400px;
      background-color: #1e293b; overflow: hidden;
    }
    .location-map iframe {
      display: block; width: 100%; height: 100%; min-height: 400px;
      transition: opacity 0.4s ease;
    }
    .map-hidden { opacity: 0; pointer-events: none; }

    .map-gps-fab {
      position: absolute; bottom: 16px; right: 16px;
      display: flex; align-items: center; gap: 8px;
      background: #fbbf24; color: #0f172a;
      padding: 14px 20px; border-radius: 14px;
      font-size: 14px; font-weight: 800; text-decoration: none;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      z-index: 5; transition: all 0.2s ease;
      min-height: 52px; min-width: 52px;
    }
    .map-gps-fab:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.4); }
    .map-gps-fab:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
    .gps-fab-label { letter-spacing: 0.05em; }

    .map-venue-label {
      position: absolute; top: 12px; left: 12px;
      display: flex; align-items: center; gap: 8px;
      background: rgba(15,23,42,0.9); backdrop-filter: blur(8px);
      color: #f1f5f9; font-size: 13px; font-weight: 600;
      padding: 8px 14px; border-radius: 10px; z-index: 5;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .map-venue-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

    /* ─── Responsive ─── */
    @media (min-width: 768px) {
      .location-inner { grid-template-columns: 1fr 1fr; }
      .location-card { padding: 0 40px 40px; }
      .venue-content { padding-top: 28px; }
    }
    @media (min-width: 1280px) {
      .location-card { padding: 0 48px 48px; }
      .venue-content { padding-top: 32px; }
    }
    @media (max-width: 640px) {
      .location-card { padding: 0 20px 24px; }
      .location-title { font-size: 1.5rem; }
      .location-address { font-size: 15px; }
      .venue-tab { padding: 14px 12px; font-size: 12px; gap: 6px; min-height: 48px; }
      .venue-tab-icon :is(svg) { width: 16px; height: 16px; }
      .detail-value { font-size: 15px; }
      .location-btn { font-size: 15px; padding: 12px 24px; min-height: 48px; }
      .location-map { min-height: 320px; }
      .location-map iframe { min-height: 320px; }
      .map-gps-fab { padding: 12px 16px; font-size: 13px; bottom: 12px; right: 12px; }
    }
  `]
})
export class LocationSectionComponent {
  private sanitizer = inject(DomSanitizer);
  mapLoaded = signal(false);
  activeVenue = signal('anfiteatro');
  copied = signal(false);

  venues: Venue[] = [
    {
      id: 'anfiteatro',
      badge: 'Certamen',
      color: '#fbbf24',
      name: 'Esc. 87',
      fullAddress: 'Av. de las Ballenas S/N, Puerto Pirámides, Chubut, Argentina',
      shortAddress: 'Puerto Pirámides, Chubut',
      stage: 'Anfiteatro Natural a cielo abierto',
      hours: '8:00 a 18:00 hs',
      hoursLabel: 'Horario del certamen',
      mapsUrl: 'https://maps.app.goo.gl/phQP1GWmbuXBmXmf6',
      embedUrl: 'https://maps.google.com/maps?q=-42.5717596,-64.2828188&z=16&output=embed',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/><line x1="12" y1="2" x2="12" y2="8.5"/></svg>'
    },
    {
      id: 'pena',
      badge: 'Peña Oficial',
      color: '#ec4899',
      name: 'La Nona',
      fullAddress: '193 Av. de las Ballenas, Puerto Pirámides, Chubut, Argentina',
      shortAddress: 'Puerto Pirámides, Chubut',
      stage: 'Sede de la Peña Oficial',
      hours: 'A partir de las 19:00 hs',
      hoursLabel: 'Horario de la peña',
      mapsUrl: 'https://maps.app.goo.gl/mwuBJQCnJ2hEGz2h8',
      embedUrl: 'https://maps.google.com/maps?q=-42.5699421,-64.2773466&z=16&output=embed',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
    }
  ];

  constructor() {
    this.venues.forEach(v => {
      v.safeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(v.embedUrl);
    });
  }

  currentVenue = signal(this.venues[0]);

  selectVenue(id: string): void {
    this.mapLoaded.set(false);
    this.activeVenue.set(id);
    this.currentVenue.set(this.venues.find(v => v.id === id)!);
  }

  copyAddress(address: string): void {
    navigator.clipboard.writeText(address).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
