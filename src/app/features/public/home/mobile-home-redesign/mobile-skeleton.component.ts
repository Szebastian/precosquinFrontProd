import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-mobile-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-container">
      <div class="skeleton-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-lines">
          <div class="skeleton-line" style="width: 80%"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>

      <div class="skeleton-card">
        <div class="skeleton-line wide"></div>
        <div class="skeleton-line medium"></div>
        <div class="skeleton-button"></div>
      </div>

      <div class="skeleton-grid">
        @for (item of skeletonItems; track item) {
          <div class="skeleton-grid-item">
            <div class="skeleton-icon"></div>
            <div class="skeleton-line short"></div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .skeleton-container {
      padding: 16px;
    }

    .skeleton-header {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .skeleton-avatar {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(90deg, #181a1f 25%, #252830 50%, #181a1f 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-lines {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      justify-content: center;
    }

    .skeleton-line {
      height: 12px;
      border-radius: 6px;
      background: linear-gradient(90deg, #181a1f 25%, #252830 50%, #181a1f 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-line.short {
      width: 60%;
    }

    .skeleton-line.medium {
      width: 80%;
    }

    .skeleton-line.wide {
      width: 100%;
    }

    .skeleton-card {
      background: #181a1f;
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .skeleton-button {
      height: 48px;
      border-radius: 16px;
      background: linear-gradient(90deg, #181a1f 25%, #252830 50%, #181a1f 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      margin-top: 8px;
    }

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .skeleton-grid-item {
      aspect-ratio: 1;
      background: #181a1f;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .skeleton-icon {
      width: 24px;
      height: 24px;
      border-radius: 8px;
      background: linear-gradient(90deg, #181a1f 25%, #252830 50%, #181a1f 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class MobileSkeletonComponent {
  skeletonItems = [1, 2, 3, 4, 5, 6];
}