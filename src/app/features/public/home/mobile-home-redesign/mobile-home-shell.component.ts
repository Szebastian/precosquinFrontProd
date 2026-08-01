import {
  Component,
  ChangeDetectionStrategy,
  signal,
  OnInit,
} from '@angular/core';
import { MobileHomeHeaderComponent } from './mobile-home-header.component';
import { MobileCertamenStatusComponent } from './mobile-certamen-status.component';
import { MobileTimelineComponent } from './mobile-timeline.component';
import { MobileQuickActionsComponent } from './mobile-quick-actions.component';
import { MobileEventCardComponent } from './mobile-event-card.component';
import { MobileNewsGridComponent } from './mobile-news-grid.component';
import { MobileLiveCardComponent } from './mobile-live-card.component';
import { MobileBottomNavComponent } from './mobile-bottom-nav.component';
import { MobileFabComponent } from './mobile-fab.component';

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
}

@Component({
  selector: 'app-mobile-home-shell',
  standalone: true,
  imports: [
    MobileHomeHeaderComponent,
    MobileCertamenStatusComponent,
    MobileTimelineComponent,
    MobileQuickActionsComponent,
    MobileEventCardComponent,
    MobileNewsGridComponent,
    MobileLiveCardComponent,
    MobileBottomNavComponent,
    MobileFabComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mobile-home-shell">
      <app-mobile-home-header />

      <main class="mobile-home-content">
        <app-mobile-certamen-status />

        <app-mobile-timeline />

        <section class="section-quick-actions">
          <div class="section-header">
            <h2 class="section-title">Accesos rápidos</h2>
            <button class="section-action">Ver todos</button>
          </div>
          <app-mobile-quick-actions />
        </section>

        <app-mobile-event-card />

        <section class="section-news">
          <div class="section-header">
            <h2 class="section-title">Noticias</h2>
            <button class="section-action">Ver todas</button>
          </div>
          <app-mobile-news-grid [newsItems]="newsItems()" />
        </section>

        @if (isLive()) {
          <app-mobile-live-card
            [title]="liveTitle()"
            [description]="liveDescription()"
          />
        }

        <footer class="mobile-home-footer">
          <p class="footer-text">Pre Cosquín Puerto Pirámides 2027</p>
          <p class="footer-sub">Certamen para nuevos valores</p>
        </footer>
      </main>

      <app-mobile-fab />
      <app-mobile-bottom-nav />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      contain: layout style;
    }

    .mobile-home-content {
      display: flex;
      flex-direction: column;
      min-height: calc(100dvh - 56px);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px 0;
    }

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--m-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-action {
      background: none;
      border: none;
      font-size: 13px;
      font-weight: 500;
      color: var(--m-brand);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: var(--m-radius-sm);
      transition: opacity var(--m-transition-fast);
    }

    .section-action:hover {
      opacity: 0.8;
    }

    .section-news {
      padding-bottom: 8px;
    }

    .mobile-home-footer {
      text-align: center;
      padding: 40px 16px 24px;
      border-top: 1px solid var(--m-border);
      margin-top: 20px;
    }

    .footer-text {
      font-size: var(--m-font-sm);
      font-weight: 600;
      color: var(--m-text-tertiary);
      margin-bottom: 4px;
    }

    .footer-sub {
      font-size: var(--m-font-xs);
      color: var(--m-text-disabled);
    }
  `],
})
export class MobileHomeShellComponent implements OnInit {
  isLive = signal(false);
  liveTitle = signal('Concert de apertura');
  liveDescription = signal('Transmisión en vivo desde el escenario principal');

  newsItems = signal<NewsItem[]>([
    {
      id: 1,
      title: '¡Ya abiertas las inscripciones para el certamen!',
      excerpt: 'Inscribite hasta el 15 de noviembre',
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=80&h=80&fit=crop',
      date: '2025-07-10',
      category: 'General',
    },
    {
      id: 2,
      title: 'Nuevos rubros para esta edición 2027',
      excerpt: 'Se suman categorías de expresión oral folclórica',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop',
      date: '2025-06-28',
      category: 'Certamen',
    },
    {
      id: 3,
      title: 'Conocé a los jurados de la etapa regional',
      excerpt: 'Los expertos que evaluarán las presentaciones',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&h=80&fit=crop',
      date: '2025-06-15',
      category: 'Jurados',
    },
  ]);

  ngOnInit(): void {
    // Check if there's a live stream active
    this.checkLiveStatus();
  }

  private checkLiveStatus(): void {
    // In a real implementation, this would check an API endpoint
    // For now, we'll set a default state
    this.isLive.set(false);
  }
}