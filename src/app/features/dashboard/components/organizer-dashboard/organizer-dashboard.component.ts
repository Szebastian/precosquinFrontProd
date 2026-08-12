import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@core/auth/auth.service';
import { environment } from '../../../../../environments/environment';

interface PipelineStage {
  label: string;
  count: number;
  total: number;
  percentage: number;
}

interface CategoryBreakdown {
  name: string;
  count: number;
  percentage: number;
}

interface StatusItem {
  status: string;
  count: number;
}

interface RecentInscription {
  id: string;
  full_name: string;
  stage_name?: string;
  category: string;
  subcategory?: string;
  status: string;
  created_at: string;
}

interface OrganizerDashboard {
  total_inscripciones: number;
  inscripciones_pendientes: number;
  inscripciones_aprobadas: number;
  inscripciones_rechazadas: number;
  inscripciones_en_evaluacion: number;
  acreditaciones_acreditadas: number;
  acreditaciones_total: number;
  jurados_activos: number;
  documents_uploaded: number;
  pipeline: PipelineStage[];
  by_category: CategoryBreakdown[];
  by_status: StatusItem[];
  recent: RecentInscription[];
}

interface HourlyMetric {
  hour: number;
  hour_label: string;
  views: number;
  unique_visitors: number;
  pages: number;
}

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './organizer-dashboard.component.html',
  styleUrl: './organizer-dashboard.component.css'
})
export class OrganizerDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private http = inject(HttpClient);

  data = signal<OrganizerDashboard | null>(null);
  hourly = signal<HourlyMetric[]>([]);
  selectedDate = signal(new Date().toISOString().slice(0, 10));
  loading = signal(true);

  showPasswordForm = signal(false);
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordError = signal('');
  passwordSuccess = signal('');
  changingPassword = signal(false);

  greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  });

  fullName = computed(() => {
    const p = this.auth.profile();
    return p?.full_name || p?.email?.split('@')[0] || 'Organizador';
  });

  totalDayViews = computed(() => this.hourly().reduce((s, h) => s + h.views, 0));
  maxHourViews = computed(() => Math.max(1, ...this.hourly().map(h => h.views)));
  peakHour = computed(() => {
    const h = this.hourly();
    if (!h.length) return null;
    return h.reduce((max, cur) => cur.views > max.views ? cur : max, h[0]);
  });

  isToday = computed(() => this.selectedDate() === new Date().toISOString().slice(0, 10));

  quickActions = [
    { icon: '📋', label: 'Revisar inscripciones', route: '/panel/inscripciones', color: '#3b82f6' },
    { icon: '✅', label: 'Acreditar artistas', route: '/panel/acreditaciones', color: '#22c55e' },
    { icon: '⚖️', label: 'Admitir inscriptos', route: '/panel/jurado/admission', color: '#8b5cf6' },
    { icon: '📊', label: 'Reportes', route: '/panel/reportes', color: '#f59e0b' },
  ];

  ngOnInit(): void {
    this.loadData();
    this.loadHourly();
  }

  prevDay(): void {
    const d = new Date(this.selectedDate() + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    this.selectedDate.set(d.toISOString().slice(0, 10));
    this.loadHourly();
  }

  nextDay(): void {
    const d = new Date(this.selectedDate() + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    const today = new Date().toISOString().slice(0, 10);
    if (d.toISOString().slice(0, 10) <= today) {
      this.selectedDate.set(d.toISOString().slice(0, 10));
      this.loadHourly();
    }
  }

  private loadData(): void {
    this.http.get<OrganizerDashboard>(`${environment.apiUrl}/dashboard/stats`).subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  private loadHourly(): void {
    this.http.get<HourlyMetric[]>(`${environment.apiUrl}/dashboard/hourly?date=${this.selectedDate()}`).subscribe({
      next: (d) => this.hourly.set(d),
      error: () => {},
    });
  }

  statusClass(status: string): string {
    const s = status.toUpperCase();
    if (s === 'PENDIENTE') return 'pending';
    if (s === 'APROBADA') return 'approved';
    if (s === 'RECHAZADA') return 'rejected';
    if (s === 'EN_EVALUACION') return 'submitted';
    if (s === 'ACREDITADO') return 'approved';
    return 'pending';
  }

  statusLabel(status: string): string {
    const s = status.toUpperCase();
    if (s === 'PENDIENTE') return 'Pendiente';
    if (s === 'APROBADA') return 'Aprobada';
    if (s === 'RECHAZADA') return 'Rechazada';
    if (s === 'EN_EVALUACION') return 'En evaluación';
    if (s === 'ACREDITADO') return 'Acreditado';
    return status;
  }

  categoryIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('musica') || n.includes('música')) return '🎵';
    if (n.includes('danza')) return '💃';
    return '🎭';
  }

  shortDate(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  }

  dayLabel(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  togglePasswordForm(): void {
    this.showPasswordForm.update(v => !v);
    this.passwordError.set('');
    this.passwordSuccess.set('');
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  async onChangePassword(): Promise<void> {
    this.passwordError.set('');
    this.passwordSuccess.set('');

    if (!this.currentPassword || !this.newPassword) {
      this.passwordError.set('Completá todos los campos');
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError.set('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('Las contraseñas no coinciden');
      return;
    }
    if (this.currentPassword === this.newPassword) {
      this.passwordError.set('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    this.changingPassword.set(true);
    const result = await this.auth.changePassword(this.currentPassword, this.newPassword);
    this.changingPassword.set(false);

    if (result.error) {
      this.passwordError.set(result.error);
    } else {
      this.passwordSuccess.set('Contraseña actualizada correctamente');
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      setTimeout(() => this.showPasswordForm.set(false), 2000);
    }
  }
}
