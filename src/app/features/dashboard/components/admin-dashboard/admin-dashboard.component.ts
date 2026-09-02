import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { SubscriptionChartsComponent } from '../subscription-charts/subscription-charts.component';
import { SorteoVisibilityService } from '@core/services/sorteo-visibility.service';

interface DashboardStats {
  total_inscripciones: number;
  inscripciones_pendientes: number;
  inscripciones_aprobadas: number;
  artistas_confirmados: number;
  jurados_activos: number;
  eventos_proximos: number;
  incidencias_abiertas: number;
  contratos_pendientes: number;
}

interface ActivityItem {
  id: string;
  type: 'submitted' | 'approved' | 'rejected' | 'pending' | 'signed' | 'sorteado' | 'acreditado';
  description: string;
  time: string;
  link: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SubscriptionChartsComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private http = inject(HttpClient);
  private sorteoVisibility = inject(SorteoVisibilityService);

  stats = signal<DashboardStats | null>(null);
  recentActivity = signal<ActivityItem[]>([]);

  /** Expose signal to template */
  get sorteoLiveVisible() { return this.sorteoVisibility.sorteoLiveVisible; }

  toggleSorteoLive(): void {
    this.sorteoVisibility.toggle();
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentActivity();
  }

  getRoleLabel(): string {
    const role = this.auth.profile()?.role;
    const labels: Record<string, string> = {
      admin: 'Administrador',
      organizador: 'Organizador',
      staff: 'Staff',
      jurado: 'Jurado'
    };
    return labels[role || ''] || 'Usuario';
  }

  getRoleBadgeClass(): string {
    const role = this.auth.profile()?.role;
    const classes: Record<string, string> = {
      admin: 'badge-admin',
      organizador: 'badge-organizador',
      staff: 'badge-staff',
      jurado: 'badge-jurado'
    };
    return classes[role || ''] || 'badge-soft-brand';
  }

  private loadStats(): void {
    this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`).subscribe({
      next: (data) => this.stats.set(data),
      error: () => {
        this.stats.set({
          total_inscripciones: 47,
          inscripciones_pendientes: 12,
          inscripciones_aprobadas: 28,
          artistas_confirmados: 23,
          jurados_activos: 8,
          eventos_proximos: 3,
          incidencias_abiertas: 2,
          contratos_pendientes: 5
        });
      }
    });
  }

  private loadRecentActivity(): void {
    this.http.get<ActivityItem[]>(`${environment.apiUrl}/dashboard/recent-activity?limit=10`).subscribe({
      next: (items) => this.recentActivity.set(items),
      error: () => this.recentActivity.set([])
    });
  }
}
