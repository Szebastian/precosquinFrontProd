import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="skeleton" [class.skeleton-circle]="circle()" [class.skeleton-wave]="wave()" [style.width]="width()" [style.height]="height()" [style.border-radius]="borderRadius()" [style.animation-duration]="duration()"></div>
  `,
  styles: [`
    .skeleton {
      background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-300) 50%, var(--gray-200) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    .skeleton-circle {
      border-radius: 50%;
    }

    .skeleton-wave {
      animation-duration: 2s;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `]
})
export class SkeletonComponent {
  width = input('100%');
  height = input('1rem');
  circle = input(false);
  wave = input(false);
  borderRadius = input('var(--radius-md)');
  duration = input('1.5s');
}