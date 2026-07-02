import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { InscriptionsService, Inscription } from '@core/services/inscriptions.service';

interface JuradoStats {
  inscriptions_assigned: number;
  pending_evaluations: number;
  completed_evaluations: number;
  average_score: number;
}

interface InscriptionToEvaluate {
  id: string;
  artist_name: string;
  stage_name: string;
  category: string;
  subcategory: string;
  status: string;
  submitted_at: string;
  evaluation_status: 'pending' | 'in_progress' | 'completed';
  score?: number;
}

@Component({
  selector: 'app-jurado-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './jurado-dashboard.component.html',
  styleUrl: './jurado-dashboard.component.css'
})
export class JuradoDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private inscriptionsService = inject(InscriptionsService);

  stats = signal<JuradoStats | null>(null);
  pendingInscriptions = signal<InscriptionToEvaluate[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.inscriptionsService.getInscriptions({ page_size: 100 }).subscribe({
      next: (res) => {
        const all = res.data;
        const total = all.length;
        const pending = all.filter(i => i.status === 'PENDIENTE' || i.status === 'EN_REVISION').length;
        const completed = all.filter(i => i.status === 'APROBADA' || i.status === 'RECHAZADA').length;

        this.stats.set({
          inscriptions_assigned: total,
          pending_evaluations: pending,
          completed_evaluations: completed,
          average_score: 0
        });

        this.pendingInscriptions.set(
          all
            .filter(i => i.status === 'PENDIENTE' || i.status === 'EN_REVISION')
            .slice(0, 10)
            .map(i => ({
              id: i.id,
              artist_name: i.full_name,
              stage_name: i.stage_name || '',
              category: i.category,
              subcategory: i.subcategory,
              status: i.status,
              submitted_at: i.created_at,
              evaluation_status: 'pending' as const
            }))
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  }

  getProgressPercent(): number {
    const s = this.stats();
    if (!s || s.inscriptions_assigned === 0) return 0;
    return Math.round((s.completed_evaluations / s.inscriptions_assigned) * 100);
  }
}
