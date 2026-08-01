import {
  Component,
  input,
  signal,
  computed,
  effect,
  inject,
  AfterViewInit,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ScriptLoaderService } from '../../../../core/services/script-loader.service';

@Component({
  selector: 'app-instagram-feed',
  standalone: true,
   changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="instagram-section">
      <div class="instagram-header">
        <h3 class="instagram-title">Síguenos en Instagram</h3>
        <p class="instagram-desc">Vive la magia del Pre-Cosquín desde los dedos de tu celular</p>
      </div>

      <div #elfsightContainer class="elfsight-wrapper">
        @if (!scriptLoaded() && !scriptError()) {
          <div class="elfsight-placeholder">
            <div class="elfsight-skeleton"></div>
          </div>
        }

        @if (scriptError()) {
          <div class="elfsight-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p>No se pudo cargar el feed de Instagram</p>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .instagram-section {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 60px 20px;
      background-color: #F4F1EA;
    }

    .instagram-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .instagram-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-900);
      margin: 0 0 8px;
    }

    .instagram-desc {
      font-size: 0.9rem;
      color: var(--gray-600);
      margin: 0;
    }

    .elfsight-wrapper {
      position: relative;
    }

    .elfsight-placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 0;
    }

    .elfsight-skeleton {
      width: 100%;
      height: 16px;
      background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
      background-size: 200% 100%;
      border-radius: 8px;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .elfsight-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--gray-500);
      padding: 40px;
      text-align: center;
    }

     @media (max-width: 1024px) {
      .instagram-section {
        padding: 40px 16px;
      }
      .instagram-title {
        font-size: 1.25rem;
      }
    }

    .elfsight-wrapper,
    div[class*="elfsight-app"],
    div[class*="eapps-instagram-feed"],
    div[id*="elfsight"] {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }

    .instagram-header {
      margin-bottom: 24px !important;
    }

    div[class*="elfsight"],
    div[id*="elfsight"],
    iframe[id*="elfsight"] {
      display: block !important;
    }

    .elfsight-modal,
    .eapps-modal,
    .eapps-popup,
    .eapps-tooltip,
    [class*="popup"],
    [class*="tooltip"],
    [class*="modal"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    .elfsight-watermark,
    .eapps-watermark,
    [class*="powered-by"],
    [class*="powerd-by"],
    .eapps-power-link,
    .elfsight-branding,
    .eapps-credit,
    .eapps-attribution {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    iframe[id*="elfsight"] {
      margin-top: 0 !important;
    }

    [class*="eapps-instagram-followers"],
    [class*="eapps-instagram-button"] {
      display: none !important;
    }

    .elfsight-app-container,
    .eapps-instagram-feed-container {
      padding-top: 0 !important;
      margin-top: 0 !important;
    }

    .elfsight-promotion,
    [class*="promotion"],
    [class*="upgrade"] {
      display: none !important;
    }

    .elfsight-header {
      display: none !important;
    }

     .elfsight-footer,
    .eapps-footer {
      display: none !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
    }

    a[href*="elfsight.com"],
    [data-remove-url],
    [title*="Remove Elfsight"],
    [title*="branding"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      pointer-events: none !important;
    }
  `],
})
export class InstagramFeedComponent implements AfterViewInit {
  private readonly scriptLoader = inject(ScriptLoaderService);
  private readonly ELFSIGHT_SCRIPT_SRC = 'https://elfsightcdn.com/platform.js';
  @ViewChild('elfsightContainer', { static: true }) container!: ElementRef<HTMLDivElement>;

  readonly appId = input<string>('e4e109a1-28c4-4f82-b2a4-638a649f9699');
  readonly scriptLoaded = signal(false);
  readonly scriptError = signal(false);

  private readonly isReady = computed(() => this.scriptLoaded() || this.scriptError());

  constructor() {
    effect(() => {
      const loaded = this.scriptLoader.isLoaded(this.ELFSIGHT_SCRIPT_SRC);
      const error = this.scriptLoader.hasError(this.ELFSIGHT_SCRIPT_SRC);

      this.scriptLoaded.set(loaded && !error);
      this.scriptError.set(error && !loaded);
    });
  }

  ngAfterViewInit(): void {
    this.scriptLoader.loadScript(this.ELFSIGHT_SCRIPT_SRC);
    this.renderElfsightWidget();
  }

  private renderElfsightWidget(): void {
    const container = this.container.nativeElement;
    const appId = this.appId();

    const existingWidget = container.querySelector('.elfsight-app');
    if (existingWidget) {
      existingWidget.remove();
    }

    const widget = document.createElement('div');
    widget.className = `elfsight-app-${appId}`;
    widget.setAttribute('data-elfsight-app-lazy', '');

    container.appendChild(widget);

    setTimeout(() => {
      const allLinks = container.querySelectorAll('a');
      allLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        if (href.includes('elfsight.com')) {
          link.remove();
        }
      });

      const removeButtons = container.querySelectorAll('[data-remove-url]');
      removeButtons.forEach((btn) => btn.remove());
    }, 1000);
  }
}
