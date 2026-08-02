import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `
    <div class="skeleton-container">
      @for (item of skeletonItems(); track item) {
        <div class="skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton-badge"></div>
            <div class="skeleton-time"></div>
          </div>
          <div class="skeleton-body">
            <div class="skeleton-line skeleton-line-lg"></div>
            <div class="skeleton-line skeleton-line-md"></div>
            <div class="skeleton-line skeleton-line-sm"></div>
          </div>
          <div class="skeleton-footer">
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .skeleton-card {
      background: #fff;
      border-radius: 14px;
      padding: var(--space-5);
      border: 1px solid rgba(0,0,0,0.06);
    }
    .skeleton-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);
    }
    .skeleton-badge {
      width: 80px;
      height: 20px;
      border-radius: 6px;
      background: linear-gradient(110deg, var(--gray-200) 30%, var(--gray-100) 50%, var(--gray-200) 70%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-time {
      width: 60px;
      height: 16px;
      border-radius: 4px;
      background: linear-gradient(110deg, var(--gray-200) 30%, var(--gray-100) 50%, var(--gray-200) 70%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-body {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }
    .skeleton-line {
      border-radius: 4px;
      background: linear-gradient(110deg, var(--gray-200) 30%, var(--gray-100) 50%, var(--gray-200) 70%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .skeleton-line-lg { width: 75%; height: 18px; }
    .skeleton-line-md { width: 55%; height: 14px; }
    .skeleton-line-sm { width: 40%; height: 12px; }
    .skeleton-footer {
      display: flex;
      gap: var(--space-2);
    }
    .skeleton-tag {
      width: 70px;
      height: 22px;
      border-radius: 999px;
      background: linear-gradient(110deg, var(--gray-200) 30%, var(--gray-100) 50%, var(--gray-200) 70%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class LoadingSkeletonComponent {
  count = input(4);
  skeletonItems = input.required<unknown[]>();
}
