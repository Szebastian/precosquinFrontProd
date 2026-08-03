import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresentationItem } from '../models/cronograma.models';

@Component({
  selector: 'app-presentation-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="pres-card" [class]="'day-' + (item().day || 'default')">
      <!-- Day + Time Header -->
      <div class="pres-header">
        <div class="pres-day">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {{ getDayLabel(item().day) }}
        </div>
        <div class="pres-time-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ item().time }}
        </div>
      </div>

      <!-- Order Number -->
      <div class="pres-order">#{{ item().order }}</div>

      <!-- Participant -->
      <div class="pres-card-body">
        <h3 class="pres-name">{{ item().participantName }}</h3>
        @if (item().groupName) {
          <p class="pres-group">{{ item().groupName }}</p>
        }
      </div>

      <!-- Category + Stage Row -->
      <div class="pres-footer">
        <span class="pres-category">{{ item().category }}</span>
        @if (item().subcategory) {
          <span class="pres-subcategory">{{ item().subcategory }}</span>
        }
        @if (item().stage) {
          <span class="pres-stage">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ item().stage }}
          </span>
        }
      </div>

      @if (item().observations) {
        <div class="pres-notes">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          {{ item().observations }}
        </div>
      }
    </article>
  `,
  styles: [`
    .pres-card {
      position: relative;
      background: #fff;
      border-radius: 14px;
      border: 1px solid rgba(0,0,0,0.06);
      border-left: 4px solid var(--brand-500);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      overflow: hidden;
    }
    .pres-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    }

    /* Day-based accent colors */
    .day-viernes-14 { border-left-color: #2563eb; }
    .day-sabado-15 { border-left-color: #7c3aed; }
    .day-domingo-16 { border-left-color: #059669; }
    .day-default { border-left-color: var(--brand-500); }

    /* Header: Day + Time */
    .pres-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--gray-100);
      background: var(--gray-50);
    }
    .day-viernes-14 .pres-header { background: #eff6ff; }
    .day-sabado-15 .pres-header { background: #f5f3ff; }
    .day-domingo-16 .pres-header { background: #ecfdf5; }

    .pres-day {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .day-viernes-14 .pres-day { color: #2563eb; }
    .day-sabado-15 .pres-day { color: #7c3aed; }
    .day-domingo-16 .pres-day { color: #059669; }
    .day-default .pres-day { color: var(--brand-700); }

    .pres-time-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      font-family: var(--font-mono);
      background: #fff;
      color: var(--gray-800);
      border: 1px solid var(--gray-200);
    }
    .day-viernes-14 .pres-time-badge { color: #2563eb; border-color: #bfdbfe; }
    .day-sabado-15 .pres-time-badge { color: #7c3aed; border-color: #ddd6fe; }
    .day-domingo-16 .pres-time-badge { color: #059669; border-color: #a7f3d0; }

    /* Order number */
    .pres-order {
      position: absolute;
      top: 12px;
      right: 16px;
      font-size: 11px;
      font-weight: 800;
      color: var(--gray-300);
      font-family: var(--font-mono);
    }

    /* Body */
    .pres-card-body {
      padding: 14px 16px 0;
    }
    .pres-name {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: var(--weight-bold);
      color: var(--gray-900);
      margin: 0 0 2px;
      line-height: 1.3;
    }
    .pres-group {
      font-size: var(--text-sm);
      color: var(--gray-500);
      margin: 0;
    }

    /* Footer tags */
    .pres-footer {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 12px 16px;
      flex-wrap: wrap;
    }
    .pres-category {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #fff;
      background: var(--brand-600);
      padding: 2px 8px;
      border-radius: 5px;
    }
    .day-viernes-14 .pres-category { background: #2563eb; }
    .day-sabado-15 .pres-category { background: #7c3aed; }
    .day-domingo-16 .pres-category { background: #059669; }

    .pres-subcategory {
      font-size: 11px;
      font-weight: 600;
      color: var(--gray-500);
      background: var(--gray-100);
      padding: 2px 8px;
      border-radius: 5px;
    }
    .pres-stage {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 11px;
      font-weight: 600;
      color: var(--gray-400);
    }

    /* Notes */
    .pres-notes {
      display: flex;
      align-items: flex-start;
      gap: 5px;
      margin: 0;
      padding: 10px 16px;
      font-size: 11px;
      color: var(--gray-500);
      font-style: italic;
      background: var(--gray-50);
      border-top: 1px solid var(--gray-100);
      line-height: 1.4;
    }

    @media (max-width: 640px) {
      .pres-header { padding: 10px 12px; }
      .pres-card-body { padding: 10px 12px 0; }
      .pres-footer { padding: 10px 12px; }
      .pres-name { font-size: 14px; }
      .pres-day { font-size: 11px; }
    }
  `]
})
export class PresentationCardComponent {
  item = input.required<PresentationItem>();

  getDayLabel(day: string | undefined): string {
    const map: Record<string, string> = {
      'viernes-14': 'Viernes 14 Nov',
      'sabado-15': 'Sábado 15 Nov',
      'domingo-16': 'Domingo 16 Nov',
    };
    return map[day || ''] || day || 'Sin día';
  }
}
