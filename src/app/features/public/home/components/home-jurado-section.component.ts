import { Component, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-home-jurado-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="jurado-section">
      <div class="jurado-container">
        <div class="jurado-content">
          <h2 class="jurado-title">Nuestro Jurado</h2>
          <p class="jurado-subtitle">Profesionales del folklore que evaluarán su presentación</p>

          <div class="jurado-cards">
            <div class="jurado-card">
              <div class="jurado-card-header">
                <span class="jurado-badge jurado-badge-danza">Jurado de Danza</span>
              </div>
              <div class="jurado-card-body">
                <h3 class="jurado-card-title">Primer integrante</h3>
                <p class="jurado-card-desc">Especialista en danza folklórica con más de 15 años de experiencia.</p>
              </div>
            </div>

            <div class="jurado-card">
              <div class="jurado-card-header">
                <span class="jurado-badge jurado-badge-musica">Jurado de Música</span>
              </div>
              <div class="jurado-card-body">
                <h3 class="jurado-card-title">Segundo integrante</h3>
                <p class="jurado-card-desc">Músico y compositor especializado en folklorismo patagónico.</p>
              </div>
            </div>
          </div>
        </div>

        <aside class="jurado-sidebar">
          <div class="instagram-widget" #instagramContainer>
            <div class="instagram-header">
              <span class="instagram-title">@precosquinpuertopiramides</span>
            </div>
            <div class="elfsight-instagram-container">
              <div class="elfsight-app-e4e109a1-28c4-4f82-b2a4-638a649f9699" data-elfsight-app-lazy></div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  `,
  styles: [`
    .jurado-section {
      padding: var(--space-8) var(--space-4);
      background: var(--gray-50);
    }

    .jurado-section :host-context(.dark) & {
      background: #0a0d14;
    }

    .jurado-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-6);
      max-width: 1200px;
      margin: 0 auto;
    }

    .jurado-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .jurado-title {
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      color: var(--gray-900);
      margin: 0;
    }

    .jurado-subtitle {
      color: var(--gray-500);
      margin: 0;
    }

    .jurado-cards {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .jurado-card {
      background: #ffffff;
      border-radius: var(--radius-xl);
      border: 1px solid var(--gray-200);
      padding: var(--space-4);
    }

    .jurado-card-header {
      margin-bottom: var(--space-2);
    }

    .jurado-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 10px;
      border-radius: var(--radius-sm);
    }

    .jurado-badge-danza {
      background-color: var(--warning-500);
      color: #1e293b;
    }

    .jurado-badge-musica {
      background-color: var(--brand-500);
      color: #ffffff;
    }

    .jurado-card-title {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--gray-800);
      margin: 0 0 var(--space-1);
    }

    .jurado-card-desc {
      font-size: var(--text-xs);
      color: var(--gray-500);
      margin: 0;
      line-height: 1.4;
    }

    .jurado-sidebar {
      display: flex;
      flex-direction: column;
    }

    .instagram-widget {
      background: #ffffff;
      border-radius: var(--radius-xl);
      border: 1px solid var(--gray-200);
      overflow: hidden;
      padding: var(--space-4);
    }

    .instagram-header {
      margin-bottom: var(--space-3);
    }

    .instagram-title {
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
      color: var(--gray-800);
      margin: 0;
    }

    .elfsight-instagram-container {
      width: 100%;
    }

    /* Dark mode */
    :host-context(.dark) .jurado-title { color: #ffffff; }
    :host-context(.dark) .jurado-subtitle { color: #94a3b8; }
    :host-context(.dark) .jurado-card { background: #1e293b; border-color: #334155; }
    :host-context(.dark) .jurado-card-title { color: #e2e8f0; }
    :host-context(.dark) .jurado-card-desc { color: #94a3b8; }
    :host-context(.dark) .instagram-widget { background: #1e293b; border-color: #334155; }
    :host-context(.dark) .instagram-title { color: #e2e8f0; }

    /* Responsive */
    @media (max-width: 1024px) {
      .jurado-container {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .jurado-section {
        padding: var(--space-6) var(--space-3);
      }

      .jurado-title {
        font-size: var(--text-xl);
      }

      .jurado-card {
        padding: var(--space-3);
      }
    }
  `]
})
export class HomeJuradoSectionComponent implements AfterViewInit {
  private doc = inject(DOCUMENT);
  @ViewChild('instagramContainer', { static: true }) instagramContainer!: ElementRef;

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      const hasScript = this.doc.querySelector('script[src*="elfsightcdn"]');
      if (!hasScript) {
        const script = this.doc.createElement('script');
        script.src = 'https://elfsightcdn.com/platform.js';
        script.async = true;
        script.defer = true;
        script.setAttribute('data-elfsight-app-lazy', '');
        script.onload = () => {
          const lazyDiv = this.instagramContainer.nativeElement.querySelector('[data-elfsight-app-lazy]');
          if (lazyDiv) {
            lazyDiv.setAttribute('data-elfsight-app-lazy', '');
          }
        };
        this.doc.body.appendChild(script);
      }
    }
  }
}
