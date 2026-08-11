import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/auth/auth.service';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { JuradoDashboardComponent } from '../jurado/components/jurado-dashboard/jurado-dashboard.component';
import { OrganizerDashboardComponent } from './components/organizer-dashboard/organizer-dashboard.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, AdminDashboardComponent, JuradoDashboardComponent, OrganizerDashboardComponent],
  template: `
    @if (auth.isJurado()) {
      <app-jurado-dashboard></app-jurado-dashboard>
    } @else if (auth.isOrganizador()) {
      <app-organizer-dashboard></app-organizer-dashboard>
    } @else {
      <app-admin-dashboard></app-admin-dashboard>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class DashboardPageComponent {
  auth = inject(AuthService);
}
