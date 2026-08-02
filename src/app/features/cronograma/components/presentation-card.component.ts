import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { PresentationItem } from '../models/cronograma.models';

@Component({
  selector: 'app-presentation-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="pres-card">
      <div class="pres-card-top">
        <span class="pres-category">{{ item().category }}</span>
        <span class="pres-time">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {{ item().time }}
        </span>
      </div>

      <div class="pres-card-body">
        <h3 class="pres-name">{{ item().participantName }}</h3>
        @if (item().groupName) {
          <p class="pres-group">{{ item().groupName }}</p>
        }
        <div class="pres-meta">
          <span class="pres-subcategory">{{ item().subcategory }}</span>
          @if (item().stage) {
            <span class="pres-stage">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ item().stage }}
            </span>
          }
        </div>
      </div>

      @if (item().observations) {
        <div class="pres-card-footer">
          <p class="pres-observations">{{ item().observations }}</p>
        </div>
      }

      @if (item().day) {
        <div class="pres-day-badge">{{ item().day }}</div>
      }
    </article>
  `,
  styles: [`
    .pres-card {
      position: relative;
      background: #fff;
      border-radius: 14px;
      padding: var(--space-5);
      border: 1px solid rgba(0,0,0,0.06);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      overflow: hidden;
    }
    .pres-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    }
    .pres-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-3);
    }
    .pres-category {
      display: inline-block;
      font-size: 10px;
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--brand-700);
      background: rgba(76, 139, 230, 0.08);
      padding: 3px 10px;
      border-radius: 999px;
    }
    .pres-time {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      color: var(--gray-600);
      font-family: var(--font-mono);
    }
    .pres-card-body {
      margin-bottom: var(--space-2);
    }
    .pres-name {
      font-family: var(--font-display);
      font-size: var(--text-base);
      font-weight: var(--weight-bold);
      color: var(--gray-900);
      margin: 0 0 4px;
      line-height: 1.3;
    }
    .pres-group {
      font-size: var(--text-sm);
      color: var(--gray-600);
      margin: 0 0 var(--space-2);
    }
    .pres-meta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .pres-subcategory {
      font-size: 11px;
      font-weight: var(--weight-semibold);
      color: var(--gray-500);
      background: var(--gray-100);
      padding: 2px 8px;
      border-radius: 6px;
    }
    .pres-stage {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 11px;
      font-weight: var(--weight-semibold);
      color: var(--gray-500);
    }
    .pres-card-footer {
      margin-top: var(--space-3);
      padding-top: var(--space-3);
      border-top: 1px solid var(--gray-100);
    }
    .pres-observations {
      font-size: var(--text-xs);
      color: var(--gray-500);
      font-style: italic;
      margin: 0;
      line-height: 1.5;
    }
    .pres-day-badge {
      position: absolute;
      top: 12px;
      right: -28px;
      transform: rotate(45deg);
      font-size: 9px;
      font-weight: var(--weight-bold);
      color: #fff;
      background: var(--brand-accent);
      padding: 2px 32px;
      letter-spacing: 0.04em;
    }
    @media (max-width: 640px) {
      .pres-card { padding: var(--space-4); }
      .pres-name { font-size: var(--text-sm); }
    }
  `]
})
export class PresentationCardComponent {
  item = input.required<PresentationItem>();
}
