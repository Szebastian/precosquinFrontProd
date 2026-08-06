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
      box-sizing: border-box;
      margin: 0;
      padding: 0;
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
      border-radius: 8px;
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
          padding: 0;
        }
      }

    .elfsight-wrapper,
    div[class*="elfsight-app"],
    div[class*="eapps-instagram-feed"],
    div[id*="elfsight"] {
      margin-top: 0 !important;
      margin-bottom: 40px !important;
      padding-top: 0 !important;
      padding-bottom: 20px !important;
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

     .elfsight-section {
  display: none !important;
}

.elfsight-wrapper {
  overflow: hidden !important;
}

div[class*="eapps-instagram-feed"] {
  display: grid !important;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 4px !important;
  max-width: 100% !important;
  margin: 0 !important;
}

@media (max-width: 640px) {
  div[class*="eapps-instagram-feed"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

div[class*="eapps-widget-toolbar-panel-share-button"],
div[class*="eapps-widget-toolbar-panel-views"] {
  display: none !important;
}

a[href*="elfsight.com"],
a[title*="Remove Elfsight"] {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
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

    const observer = new MutationObserver(() => {
      container.querySelectorAll('a').forEach((link) => {
        const href = link.getAttribute('href') || '';
        if (href.includes('elfsight.com') || link.textContent.includes('Free Instagram Feed')) {
          link.remove();
        }
      });
      container.querySelectorAll('[data-remove-url]').forEach((el) => el.remove());
    });
    observer.observe(container, { childList: true, subtree: true });

    setTimeout(() => {
      const allLinks = container.querySelectorAll('a');
      allLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        if (href.includes('elfsight.com') || link.textContent.includes('Free Instagram Feed')) {
          link.remove();
        }
      });

      const removeButtons = container.querySelectorAll('[data-remove-url]');
      removeButtons.forEach((btn) => btn.remove());

      const toolbarPanels = container.querySelectorAll('.eapps-widget-toolbar-panel');
      toolbarPanels.forEach((panel) => panel.remove());

      const shareButtons = container.querySelectorAll('.eapps-widget-toolbar-panel-share-button');
      shareButtons.forEach((btn) => btn.remove());

      const poweredBy = container.querySelectorAll('[class*="powered-by"], [class*="powerd-by"]');
      poweredBy.forEach((el) => el.remove());

      const feedContainer = container.querySelector('div[class*="eapps-instagram-feed"]');
      if (feedContainer) {
        const items = feedContainer.querySelectorAll('a, div > a, .eapps-instagram-post, .eapps-post');
        const itemsArray = Array.from(items);
        for (let i = 4; i < itemsArray.length; i++) {
          const parent = itemsArray[i].parentElement;
          if (parent) {
            parent.style.display = 'none !important';
          }
        }
      }
    }, 2000);
  }
}
