import { Component, input } from '@angular/core';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-skeleton-stats',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <div class="skeleton-stats">
      @for (i of [1,2,3,4]; track i) {
        <div class="skeleton-stat-card">
          <div class="skeleton-stat-inner">
            <app-skeleton width="52px" height="52px" borderRadius="var(--radius-lg)" />
            <div class="skeleton-stat-content">
              <app-skeleton width="60px" height="2rem" />
              <app-skeleton width="80px" height="0.875rem" style="margin-top: var(--space-1);" />
            </div>
          </div>
          <div class="skeleton-stat-footer" style="margin-top: var(--space-3);">
            <app-skeleton width="50%" height="0.875rem" />
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-stats {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: var(--space-5);
    }

    .skeleton-stat-card {
      background: #fff;
      border-radius: var(--radius-xl);
      border: 1px solid var(--gray-200);
      padding: var(--space-5);
    }

    .skeleton-stat-inner {
      display: flex;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .skeleton-stat-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .skeleton-stat-footer {
      border-top: 1px solid var(--gray-100);
      padding-top: var(--space-3);
    }

    @media (min-width: 640px) {
      .skeleton-stats { grid-template-columns: repeat(2, 1fr); }
    }

    @media (min-width: 1024px) {
      .skeleton-stats { grid-template-columns: repeat(4, 1fr); }
    }
  `]
})
export class SkeletonStatsComponent {}