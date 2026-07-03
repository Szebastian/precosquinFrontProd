import { Component } from '@angular/core';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-skeleton-declaration',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <div class="skeleton-declaration">
      <div class="skeleton-header">
        <app-skeleton width="200px" height="1.5rem" />
        <app-skeleton width="400px" height="2.5rem" style="margin-top: var(--space-space-space-2);" />
        <div class="skeleton-meta" style="margin-top: var(--space-4);">
          <app-skeleton width="150px" height="1rem" />
          <app-skeleton width="200px" height="1rem" style="margin-left: var(--space-4);" />
        </div>
      </div>

      <div class="skeleton-body" style="margin-top: var(--space-8);">
        <app-skeleton width="100%" height="2rem" />
        <app-skeleton width="80%" height="1.5rem" style="margin-top: var(--space-4);" />
        @for (i of [1,2,3,4,5,6,7,8]; track i) {
          <app-skeleton width="100%" height="1.5rem" style="margin-top: var(--space-3);" />
        }
        @for (i of [1,2,3,4]; track i) {
          <div class="skeleton-article" style="margin-top: var(--space-6);">
            <app-skeleton width="100px" height="1.25rem" />
            <app-skeleton width="100%" height="1.5rem" style="margin-top: var(--space-2);" />
            <app-skeleton width="90%" height="1.5rem" style="margin-top: var(--space-1);" />
          </div>
        }
      </div>

      <div class="skeleton-cta" style="margin-top: var(--space-8);">
        <app-skeleton width="300px" height="2rem" />
        <app-skeleton width="400px" height="1.5rem" style="margin-top: var(--space-3);" />
        <app-skeleton width="180px" height="3rem" borderRadius="var(--radius-full)" style="margin-top: var(--space-4);" />
      </div>
    </div>
  `,
  styles: [`
    .skeleton-declaration {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--space-8) var(--space-10);
    }

    .skeleton-meta {
      display: flex;
      gap: var(--space-4);
    }

    .skeleton-article {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }
  `]
})
export class SkeletonDeclarationComponent {}