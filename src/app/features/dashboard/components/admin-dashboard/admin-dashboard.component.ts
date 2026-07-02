import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

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

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private http = inject(HttpClient);

  stats = signal<DashboardStats | null>(null);

  recentActivity = [
    { id: 1, type: 'submitted' as const, description: 'Juan Pérez envió inscripción - Música > Solista Vocal', time: 'hace 5 min', link: '/panel/inscripciones/123' },
    { id: 2, type: 'approved' as const, description: 'María García aprobada - Danza > Pareja Tradicional', time: 'hace 30 min', link: '/panel/inscripciones/124' },
    { id: 3, type: 'signed' as const, description: 'Los Pibes firmaron contrato', time: 'hace 1 hora', link: '/panel/contratos/125' },
    { id: 4, type: 'pending' as const, description: 'Banda X pendiente revisión documentación', time: 'hace 2 horas', link: '/panel/inscripciones/126' },
    { id: 5, type: 'rejected' as const, description: 'Pedro López rechazado - Documentación incompleta', time: 'hace 3 horas', link: '/panel/inscripciones/127' }
  ];

  ngOnInit(): void {
    this.loadStats();
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
}
