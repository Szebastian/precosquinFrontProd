import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-youtube-live-widget',
  standalone: true,
  template: `
    <div class="yt-widget" [class.yt-expanded]="ytExpanded()">
      @if (ytExpanded()) {
        <div class="yt-player">
          <div class="yt-player-header">
            <span class="yt-player-title">
              <span class="yt-live-dot" [class.yt-dot-active]="ytIsLive()"></span>
              Precosquín en Vivo
            </span>
            <div class="yt-player-actions">
              <button class="yt-toggle-btn" (click)="toggleLive()" [class.yt-toggle-active]="ytIsLive()">
                {{ ytIsLive() ? 'EN VIVO' : 'OFFLINE' }}
              </button>
              <a href="https://www.youtube.com/@PreCosquinPuertoPirámides" target="_blank" class="yt-action-btn" title="Abrir en YouTube">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </a>
              <button class="yt-action-btn" (click)="ytExpanded.set(false)" title="Minimizar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
          <div class="yt-player-body">
            @if (ytIsLive()) {
              <iframe
                src="https://www.youtube.com/embed/qlLOBGeWqQs?autoplay=0"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="yt-iframe">
              </iframe>
            } @else {
              <div class="yt-offline">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="9.5 7.5 16.5 12 9.5 16.5 9.5 7.5" fill="currentColor" stroke="none"/></svg>
                <p>Sin transmisión en este momento</p>
                <a href="https://www.youtube.com/@PreCosquinPuertoPirámides" target="_blank" class="yt-channel-link">Ir al canal de YouTube</a>
              </div>
            }
          </div>
        </div>
      } @else {
        <button class="yt-fab" (click)="ytExpanded.set(true)">
          <div class="yt-fab-icon" [class.yt-pulse]="ytIsLive()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
          </div>
          <div class="yt-fab-label">
            <span class="yt-live-dot" [class.yt-dot-active]="ytIsLive()"></span>
            {{ ytIsLive() ? 'EN VIVO' : 'OFFLINE' }}
          </div>
        </button>
      }
    </div>
  `,
  styles: [`
    .yt-widget { position: fixed; bottom: 24px; right: 24px; z-index: 999; }
    .yt-fab { display: flex; align-items: center; gap: 10px; background: #fff; border: none; border-radius: 60px; padding: 10px 18px 10px 14px; cursor: pointer; box-shadow: 0 8px 30px rgba(0,0,0,0.25); transition: all 0.3s ease; }
    .yt-fab:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
    .yt-fab-icon { width: 40px; height: 40px; background: #ff0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; position: relative; }
    .yt-fab-icon.yt-pulse { animation: ytPulse 2s infinite; }
    @keyframes ytPulse { 0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.5); } 70% { box-shadow: 0 0 0 12px rgba(255, 0, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); } }
    .yt-fab-label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #333; letter-spacing: 0.03em; }
    .yt-live-dot { width: 8px; height: 8px; border-radius: 50%; background: #999; }
    .yt-live-dot.yt-dot-active { background: #ff0000; animation: ytBlink 1s infinite; }
    @keyframes ytBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    .yt-expanded { bottom: 24px; right: 24px; }
    .yt-player { width: 400px; background: #1a1a1a; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 50px rgba(0,0,0,0.4); animation: ytSlideUp 0.3s ease; }
    @keyframes ytSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .yt-player-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #111; }
    .yt-player-title { font-size: 13px; font-weight: 600; color: #fff; display: flex; align-items: center; gap: 8px; }
    .yt-player-title::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: #ff0000; }
    .yt-player-actions { display: flex; gap: 4px; }
    .yt-action-btn { width: 28px; height: 28px; border-radius: 6px; border: none; background: rgba(255,255,255,0.1); color: #aaa; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; text-decoration: none; }
    .yt-action-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }
    .yt-toggle-btn { font-size: 10px; font-weight: 700; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 4px; border: none; cursor: pointer; background: rgba(255,255,255,0.1); color: #888; transition: all 0.2s; }
    .yt-toggle-btn:hover { background: rgba(255,255,255,0.2); }
    .yt-toggle-active { background: #ff0000 !important; color: #fff !important; animation: ytBlink 1.5s infinite; }
    .yt-player-body { aspect-ratio: 16/9; background: #000; }
    .yt-iframe { width: 100%; height: 100%; }
    .yt-offline { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #666; }
    .yt-offline p { margin: 0; font-size: 13px; }
    .yt-channel-link { font-size: 12px; color: #ff0000; text-decoration: none; font-weight: 600; padding: 6px 14px; border: 1px solid #ff0000; border-radius: 20px; transition: all 0.2s; }
    .yt-channel-link:hover { background: #ff0000; color: #fff; }
    @media (max-width: 1024px) {
      .yt-widget { bottom: 76px; right: 16px; }
      .yt-fab { padding: 8px 14px 8px 10px; }
      .yt-fab-icon { width: 34px; height: 34px; }
      .yt-fab-label { font-size: 11px; }
      .yt-player { width: calc(100vw - 48px); max-width: 400px; bottom: 76px; }
    }
    @media (max-width: 480px) {
      .yt-widget { bottom: 72px; right: 12px; }
      .yt-fab { padding: 8px 12px 8px 8px; gap: 8px; }
      .yt-fab-icon { width: 32px; height: 32px; }
      .yt-fab-icon svg { width: 18px; height: 18px; }
      .yt-fab-label { font-size: 10px; }
      .yt-player { width: calc(100vw - 24px); border-radius: 12px; bottom: 72px; right: 12px; }
      .yt-player-header { padding: 8px 10px; }
      .yt-player-title { font-size: 12px; }
      .yt-action-btn { width: 32px; height: 32px; }
    }
  `]
})
export class YoutubeLiveWidgetComponent {
  ytExpanded = signal(false);
  ytIsLive = signal(true);

  toggleLive() { this.ytIsLive.set(!this.ytIsLive()); }
}
