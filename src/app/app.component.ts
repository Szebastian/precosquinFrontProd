import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { initClarity } from './shared/utils/clarity-init';
import { environment } from '../environments/environment';
import { filter } from 'rxjs';

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
  private router = inject(Router);

  ngOnInit(): void {
    initClarity();
    this.trackPageViews();
  }

  private trackPageViews(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        try {
          const visitorId = localStorage.getItem('pv_id') || this.generateId();
          localStorage.setItem('pv_id', visitorId);
          fetch(`${environment.apiUrl}/dashboard/pageview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: e.urlAfterRedirects || e.url, visitor_id: visitorId }),
          }).catch(() => {});
        } catch {}
      });
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
}
