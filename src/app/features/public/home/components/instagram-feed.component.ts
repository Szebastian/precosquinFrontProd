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

div[class*="eapps-instagram-feed"] a,
div[class*="eapps-instagram-feed"] .eapps-instagram-post,
div[class*="eapps-instagram-feed"] .eapps-post {
  aspect-ratio: 1 / 1 !important;
  overflow: hidden !important;
  position: relative !important;
  display: block !important;
}

div[class*="eapps-instagram-feed"] a img,
div[class*="eapps-instagram-feed"] .eapps-instagram-post img,
div[class*="eapps-instagram-feed"] .eapps-post img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
}

div[class*="eapps-instagram-feed"] a::before,
div[class*="eapps-instagram-feed"] .eapps-instagram-post::before,
div[class*="eapps-instagram-feed"] .eapps-post::before {
  content: '';
  position: absolute !important;
  top: 8px !important;
  left: 8px !important;
  width: 20px !important;
  height: 20px !important;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23fff'%3E%3Cpath d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'/%3E%3C/svg%3E") no-repeat center !important;
  background-size: contain !important;
  border-radius: 4px !important;
  opacity: 0.8 !important;
  z-index: 5 !important;
  pointer-events: none !important;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)) !important;
}

@media (max-width: 640px) {
  div[class*="eapps-instagram-feed"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  div[class*="eapps-instagram-feed"] a::before,
  div[class*="eapps-instagram-feed"] .eapps-instagram-post::before,
  div[class*="eapps-instagram-feed"] .eapps-post::before {
    width: 16px !important;
    height: 16px !important;
    top: 6px !important;
    left: 6px !important;
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
    if (typeof IntersectionObserver === 'undefined') {
      this.loadElfsight();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          this.loadElfsight();
        }
      },
      { rootMargin: '600px 0px', threshold: 0 }
    );
    observer.observe(this.container.nativeElement);
  }

  private loadElfsight(): void {
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
