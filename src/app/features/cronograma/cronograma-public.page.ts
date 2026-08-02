import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { PresentationOrderTabComponent } from './components/presentation-order-tab.component';
import { AgendaGeneralTabComponent } from './components/agenda-general-tab.component';

@Component({
  selector: 'app-cronograma-public',
  standalone: true,
  imports: [PresentationOrderTabComponent, AgendaGeneralTabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cronograma-page">
      <header class="cronograma-header">
        <span class="cronograma-badge">EVENTO 2027</span>
        <h1 class="cronograma-title">Cronograma</h1>
        <p class="cronograma-subtitle">Orden de presentación y agenda del festival</p>
      </header>

      <div class="tabs-container">
        <div class="tabs-nav" role="tablist">
          <button
            class="tab-btn"
            [class.tab-active]="activeTab() === 'presentation'"
            (click)="setTab('presentation')"
            role="tab"
            [attr.aria-selected]="activeTab() === 'presentation'"
            aria-controls="panel-presentations"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            Orden de Presentación
          </button>
          <button
            class="tab-btn"
            [class.tab-active]="activeTab() === 'agenda'"
            (click)="setTab('agenda')"
            role="tab"
            [attr.aria-selected]="activeTab() === 'agenda'"
            aria-controls="panel-agenda"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Agenda General
          </button>
        </div>

        <div class="tabs-content">
          @if (activeTab() === 'presentation') {
            <div id="panel-presentations" role="tabpanel">
              <app-presentation-order-tab />
            </div>
          } @else {
            <div id="panel-agenda" role="tabpanel">
              <app-agenda-general-tab />
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cronograma-page {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    .cronograma-header {
      text-align: center;
      margin-bottom: var(--space-8);
    }
    .cronograma-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: var(--weight-bold);
      letter-spacing: 0.15em;
      color: var(--brand-600);
      background: rgba(76, 139, 230, 0.08);
      padding: 4px 14px;
      border-radius: 999px;
      margin-bottom: var(--space-3);
    }
    .cronograma-title {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      font-weight: var(--weight-extrabold);
      color: var(--gray-900);
      margin: 0 0 var(--space-2);
      line-height: 1.15;
    }
    .cronograma-subtitle {
      font-size: var(--text-sm);
      color: var(--gray-500);
      margin: 0;
    }

    .tabs-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .tabs-nav {
      display: flex;
      gap: var(--space-2);
      background: var(--gray-100);
      padding: 4px;
      border-radius: 14px;
    }

    .tab-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--gray-600);
      background: transparent;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 48px;
    }

    .tab-btn:hover {
      color: var(--gray-800);
    }

    .tab-active {
      color: var(--brand-700);
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      font-weight: var(--weight-bold);
    }

    .tabs-content {
      min-height: 400px;
    }

    @media (min-width: 1024px) {
      .cronograma-page {
        padding: 48px 32px;
      }
    }
    @media (min-width: 1280px) {
      .cronograma-page {
        padding: 48px 32px;
      }
      .cronograma-title { font-size: var(--text-4xl); }
    }
    @media (min-width: 1600px) {
      .cronograma-page { max-width: 1280px; }
    }
    @media (min-width: 1920px) {
      .cronograma-page { max-width: 1400px; }
    }
    @media (min-width: 2560px) {
      .cronograma-page { max-width: 1520px; }
    }

    @media (max-width: 640px) {
      .cronograma-page { padding: 24px 16px; }
      .cronograma-title { font-size: var(--text-2xl); }
      .tabs-nav { flex-direction: column; }
      .tab-btn { justify-content: flex-start; padding: 14px 16px; }
    }
  `]
})
export class CronogramaPublicPageComponent {
  activeTab = signal<'presentation' | 'agenda'>('presentation');

  setTab(tab: 'presentation' | 'agenda'): void {
    this.activeTab.set(tab);
  }
}
