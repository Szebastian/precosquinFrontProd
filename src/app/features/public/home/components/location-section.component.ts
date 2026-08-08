import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'app-location-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="location">
      <div class="location-inner">
        <div class="location-card">
          <div class="location-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            SEDE DEL EVENTO
          </div>

          <h2 class="location-title">Puerto Pirámides</h2>
          <p class="location-address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Chubut, Patagonia Argentina
          </p>

          <div class="location-details">
            <div class="detail-row">
              <div class="detail-icon detail-icon--stage">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/><line x1="12" y1="2" x2="12" y2="8.5"/></svg>
              </div>
              <div class="detail-text">
                <span class="detail-label">Escenario</span>
                <span class="detail-value">Anfiteatro Natural</span>
              </div>
            </div>

            <div class="detail-row">
              <div class="detail-icon detail-icon--date">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>
              </div>
              <div class="detail-text">
                <span class="detail-label">Fechas</span>
                <span class="detail-value">5 y 6 de septiembre 2026</span>
              </div>
            </div>
          </div>

          <a class="location-btn" href="https://maps.app.goo.gl/EeVa8UwMotxdeSeg6" target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Abrir Ubicación en Google Maps
          </a>
        </div>

        <div class="location-map" (click)="openMaps()" role="button" tabindex="0" (keydown.enter)="openMaps()">
          @if (!mapLoaded()) {
            <div class="map-skeleton">
              <div class="skeleton-ring">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span class="skeleton-text">Cargando mapa…</span>
            </div>
          }
          <iframe [class.map-hidden]="!mapLoaded()" (load)="mapLoaded.set(true)"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2943.5!2d-64.2833!3d-42.5667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDM0JzAwLjAiUyA2NMKwMTcnMDAuMCJX!5e0!3m2!1ses!2sar!4v1"
            width="100%" height="100%" style="border:0;" allowfullscreen loading="lazy"
            referrerpolicy="no-referrer-when-downgrade" title="Mapa de Puerto Pirámides"></iframe>
          <div class="map-pin-overlay" [class.pin-visible]="mapLoaded()">
            <div class="pin-marker"><div class="pin-pulse"></div><div class="pin-dot"></div></div>
            <div class="pin-label"><span class="pin-name">Pre-Cosquín</span><span class="pin-location">Puerto Pirámides</span></div>
          </div>
          <div class="map-hint" [class.hint-visible]="mapLoaded()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Click para abrir en Google Maps
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .location { width: 100%; }
    .location-inner {
      display: grid; grid-template-columns: 1fr; gap: 0;
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.2);
    }
    .location-card {
      background: linear-gradient(160deg, #0f172a 0%, #1a2332 100%);
      padding: 40px 32px; display: flex; flex-direction: column; gap: 20px;
      position: relative; overflow: hidden;
    }
    .location-card::before {
      content: ''; position: absolute; top: -40%; right: -30%;
      width: 240px; height: 240px; border-radius: 50%;
      background: radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%);
      pointer-events: none;
    }
    .location-badge {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
      color: #0f172a; background-color: #fbbf24;
      padding: 5px 14px; border-radius: 999px; width: fit-content; position: relative;
    }
    .location-title {
      font-family: var(--font-display); font-size: var(--text-3xl);
      font-weight: 800; color: #fff; margin: 0; line-height: 1.15; position: relative;
    }
    .location-address {
      display: flex; align-items: center; gap: 6px;
      font-size: var(--text-sm); color: #94a3b8; margin: 0; position: relative;
    }
    .location-details {
      display: flex; flex-direction: column; gap: 16px; padding: 20px 0;
      border-top: 1px solid rgba(255,255,255,0.06);
      border-bottom: 1px solid rgba(255,255,255,0.06); position: relative;
    }
    .detail-row { display: flex; align-items: center; gap: 14px; }
    .detail-icon {
      width: 42px; height: 42px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: transform 0.2s ease;
    }
    .detail-row:hover .detail-icon { transform: scale(1.08); }
    .detail-icon--stage { background: rgba(251,191,36,0.12); color: #fbbf24; }
    .detail-icon--date { background: rgba(96,165,250,0.12); color: #60a5fa; }
    .detail-text { display: flex; flex-direction: column; gap: 2px; }
    .detail-label {
      font-size: 10px; font-weight: 600; letter-spacing: 0.06em;
      color: #64748b; text-transform: uppercase;
    }
    .detail-value { font-size: var(--text-sm); font-weight: 500; color: #e2e8f0; }
    .location-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--brand-accent); color: #0f172a;
      padding: 12px 24px; border-radius: 999px; font-size: var(--text-sm);
      font-weight: 800; text-decoration: none; letter-spacing: 0.02em;
      transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.25);
      min-height: 48px; width: fit-content; position: relative;
    }
    .location-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.35); }
    .location-btn:focus-visible { outline: 3px solid #fbbf24; outline-offset: 2px; }
    .location-map {
      position: relative; min-height: 360px;
      background-color: #1e293b; cursor: pointer; overflow: hidden;
    }
    .location-map iframe {
      display: block; width: 100%; height: 100%; min-height: 360px;
      transition: opacity 0.4s ease;
    }
    .map-hidden { opacity: 0; pointer-events: none; }
    .map-skeleton {
      position: absolute; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 12px;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); z-index: 2;
    }
    .skeleton-ring {
      width: 56px; height: 56px; border-radius: 50%;
      background: rgba(251,191,36,0.1); display: flex;
      align-items: center; justify-content: center;
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }
    .skeleton-text { font-size: var(--text-xs); color: #64748b; letter-spacing: 0.05em; }
    @keyframes skeleton-pulse {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
    }
    .map-pin-overlay {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -100%);
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      z-index: 3; pointer-events: none; opacity: 0;
      transition: opacity 0.4s ease 0.3s, transform 0.4s ease 0.3s;
    }
    .pin-visible { opacity: 1; transform: translate(-50%, -100%) translateY(-8px); }
    .pin-marker { position: relative; width: 24px; height: 24px; }
    .pin-dot {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 14px; height: 14px; background: #ef4444;
      border: 3px solid #fff; border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .pin-pulse {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 14px; height: 14px; background: rgba(239,68,68,0.4);
      border-radius: 50%; animation: pin-pulse 2s ease-out infinite;
    }
    @keyframes pin-pulse {
      0% { width: 14px; height: 14px; opacity: 0.6; }
      100% { width: 48px; height: 48px; opacity: 0; }
    }
    .pin-label {
      display: flex; flex-direction: column; align-items: center;
      background: #fff; padding: 4px 10px; border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .pin-name { font-size: 11px; font-weight: 700; color: #0f172a; line-height: 1.2; }
    .pin-location { font-size: 9px; color: #64748b; line-height: 1.2; }
    .map-hint {
      position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 5px;
      background: rgba(15,23,42,0.85); backdrop-filter: blur(8px);
      color: #cbd5e1; font-size: 11px; font-weight: 500;
      padding: 6px 14px; border-radius: 999px; z-index: 3;
      pointer-events: none; opacity: 0; transition: opacity 0.3s ease 0.6s;
    }
    .hint-visible { opacity: 1; }
    @media (min-width: 768px) {
      .location-inner { grid-template-columns: 1fr 1fr; }
      .location-card { padding: 48px 40px; }
    }
    @media (min-width: 1280px) { .location-card { padding: 56px 48px; } }
    @media (max-width: 640px) {
      .location-card { padding: 28px 20px; }
      .location-title { font-size: var(--text-2xl); }
      .location-map { min-height: 280px; }
      .location-map iframe { min-height: 280px; }
      .pin-label { padding: 3px 8px; }
      .pin-name { font-size: 10px; }
    }
  `]
})
export class LocationSectionComponent {
  mapLoaded = signal(false);

  openMaps(): void {
    window.open('https://maps.app.goo.gl/EeVa8UwMotxdeSeg6', '_blank');
  }
}
