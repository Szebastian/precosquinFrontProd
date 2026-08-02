import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { AgendaEvent } from '../models/cronograma.models';

@Component({
  selector: 'app-agenda-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="timeline-item">
      <div class="timeline-marker">
        <div class="timeline-dot" [class]="'dot-' + item().eventType"></div>
        <div class="timeline-line"></div>
      </div>
      <div class="timeline-content">
        <div class="timeline-time">{{ item().time }}</div>
        <div class="timeline-card">
          <div class="timeline-card-header">
            <span class="event-type-badge" [class]="'badge-' + item().eventType">{{ eventTypeLabel() }}</span>
            @if (item().day) {
              <span class="event-day">{{ item().day }}</span>
            }
          </div>
          <h3 class="timeline-title">{{ item().title }}</h3>
          @if (item().description) {
            <p class="timeline-desc">{{ item().description }}</p>
          }
          @if (item().location) {
            <div class="timeline-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ item().location }}
            </div>
          }
        </div>
      </div>
    </article>
  `,
  styles: [`
    .timeline-item {
      display: flex;
      gap: var(--space-4);
      position: relative;
    }
    .timeline-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      width: 20px;
    }
    .timeline-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 3px solid var(--brand-500);
      background: #fff;
      flex-shrink: 0;
      z-index: 1;
    }
    .dot-presentation { border-color: var(--brand-500); }
    .dot-break { border-color: var(--gray-400); background: var(--gray-100); }
    .dot-soundcheck { border-color: var(--warning-500); }
    .dot-rehearsal { border-color: var(--info-500); }
    .dot-opening { border-color: var(--success-500); }
    .dot-closing { border-color: var(--danger-500); }
    .dot-other { border-color: var(--gray-400); }
    .timeline-line {
      width: 2px;
      flex: 1;
      background: var(--gray-200);
      min-height: 20px;
    }
    .timeline-item:last-child .timeline-line {
      display: none;
    }
    .timeline-content {
      flex: 1;
      padding-bottom: var(--space-5);
    }
    .timeline-time {
      font-size: 12px;
      font-weight: var(--weight-bold);
      color: var(--brand-600);
      font-family: var(--font-mono);
      margin-bottom: 6px;
    }
    .timeline-card {
      background: #fff;
      border-radius: 14px;
      padding: var(--space-4);
      border: 1px solid rgba(0,0,0,0.06);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .timeline-card:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.05);
    }
    .timeline-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-2);
    }
    .event-type-badge {
      font-size: 10px;
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .badge-presentation { color: var(--brand-700); background: rgba(76, 139, 230, 0.1); }
    .badge-break { color: var(--gray-600); background: var(--gray-100); }
    .badge-soundcheck { color: var(--warning-700); background: rgba(245, 158, 11, 0.1); }
    .badge-rehearsal { color: var(--info-700); background: rgba(59, 130, 246, 0.1); }
    .badge-opening { color: var(--success-700); background: rgba(34, 197, 94, 0.1); }
    .badge-closing { color: var(--danger-700); background: rgba(239, 68, 68, 0.1); }
    .badge-other { color: var(--gray-600); background: var(--gray-100); }
    .event-day {
      font-size: 11px;
      font-weight: var(--weight-semibold);
      color: var(--gray-500);
    }
    .timeline-title {
      font-family: var(--font-display);
      font-size: var(--text-base);
      font-weight: var(--weight-bold);
      color: var(--gray-900);
      margin: 0 0 6px;
      line-height: 1.3;
    }
    .timeline-desc {
      font-size: var(--text-sm);
      color: var(--gray-600);
      margin: 0 0 var(--space-2);
      line-height: 1.5;
    }
    .timeline-location {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: var(--text-xs);
      color: var(--gray-500);
      margin-top: var(--space-2);
    }
    @media (max-width: 640px) {
      .timeline-item { gap: var(--space-3); }
      .timeline-card { padding: var(--space-3); }
      .timeline-title { font-size: var(--text-sm); }
    }
  `]
})
export class AgendaTimelineComponent {
  item = input.required<AgendaEvent>();

  eventTypeLabels: Record<string, string> = {
    presentation: 'Presentación',
    break: 'Pausa',
    soundcheck: 'Soundcheck',
    rehearsal: 'Ensayo',
    opening: 'Apertura',
    closing: 'Cierre',
    other: 'Otro',
  };

  eventTypeLabel(): string {
    return this.eventTypeLabels[this.item().eventType] || 'Evento';
  }
}
