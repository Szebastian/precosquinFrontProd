import { Component } from '@angular/core';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-skeleton-news-grid',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <div class="skeleton-news-grid">
      <div class="skeleton-featured">
        <app-skeleton width="100%" height="500px" borderRadius="var(--radius-xl)" />
      </div>
      <div class="skeleton-secondary">
        @for (i of [1,2,3]; track i) {
          <div class="skeleton-news-item">
            <div class="skeleton-news-content">
              <app-skeleton width="80%" height="1.25rem" />
              <app-skeleton width="60%" height="1rem" style="margin-top: 0.5rem;" />
            </div>
            <app-skeleton width="120px" height="120px" borderRadius="var(--radius-lg)" />
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .skeleton-news-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-6);
      min-height: 500px;
    }

    .skeleton-news-item {
      display: flex;
      height: calc(33.333% - 0.7rem);
      min-height: 120px;
    }

    .skeleton-news-content {
      flex: 1;
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    @media (max-width: 1024px) {
      .skeleton-news-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SkeletonNewsGridComponent {}