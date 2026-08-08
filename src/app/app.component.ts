import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { initClarity } from './shared/utils/clarity-init';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  template: `
    <div class="route-container">
      <router-outlet />
    </div>
    <app-toast-container />
  `,
  styles: [`
    .route-container {
      animation: routeFadeIn 0.3s ease;
    }

    @keyframes routeFadeIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Precosquin';

  ngOnInit(): void {
    initClarity();
  }
}
