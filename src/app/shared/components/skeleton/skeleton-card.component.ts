import { Component, input, computed } from '@angular/core';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    <div class="skeleton-card">
      <div class="skeleton-card-header">
        <app-skeleton width="30%" height="1.25rem" />
        <app-skeleton width="20%" height="1rem" style="margin-top: var(--space-1);" />
      </div>
      <div class="skeleton-card-body" style="margin-top: var(--space-4);">
        @for (i of lineArray(); track i) {
          <app-skeleton width="100%" height="1rem" style="margin-top: var(--space-2);" />
        }
      </div>
      <div class="skeleton-card-footer" style="margin-top: var(--space-4);">
        <app-skeleton width="40%" height="1rem" />
      </div>
    </div>
  `,
  styles: [`
    .skeleton-card {
      background: #fff;
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
      padding: var(--space-4);
      box-shadow: var(--shadow-sm);
    }

    .skeleton-card-header {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .skeleton-card-body {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .skeleton-card-footer {
      border-top: 1px solid var(--gray-100);
      padding-top: var(--space-3);
    }
  `]
})
export class SkeletonCardComponent {
  lines = input<number>(3);
  lineArray = computed(() => Array.from({ length: this.lines() }, (_, i) => i));
}