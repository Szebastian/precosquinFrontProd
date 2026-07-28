import { Component, inject, OnInit, signal, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface CategoryReport {
  total: number;
  by_category: Record<string, number>;
  by_subcategory: Record<string, number>;
  by_locality: Record<string, number>;
}

const SUBCATEGORY_LABELS: Record<string, string> = {
  solista_vocal: 'Solista Vocal',
  solista_instrumental: 'Solista Instrumental',
  conjunto_instrumental: 'Conjunto Instrumental',
  conjunto_vocal: 'Conjunto Vocal',
  tema_inedito: 'Tema Inédito',
  malambo_masculino: 'Malambo Masculino',
  malambo_femenino: 'Malambo Femenino',
  pareja_tradicional: 'Pareja Tradicional',
  pareja_estilizada: 'Pareja Estilizada',
  conjunto_malambo: 'Conjunto de Malambo',
  conjunto_baile: 'Conjunto de Baile',
  conjunto_baile_folklorico: 'Conjunto de Baile Folklórico',
};

const MUSIC_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
const DANCE_COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'];
const LOCALITY_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#059669', '#047857', '#065f46'];

@Component({
  selector: 'app-subscription-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="charts-grid-3">
      <!-- Música -->
      <div class="chart-card">
        <div class="chart-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          <div>
            <h3 class="chart-title">Música</h3>
            <p class="chart-subtitle">{{ musicTotal() }} inscripción(es)</p>
          </div>
        </div>
        <div class="chart-canvas-wrap">
          <canvas #musicCanvas></canvas>
        </div>
        @if (musicTotal() === 0) {
          <div class="chart-empty">Sin datos de música</div>
        }
      </div>

      <!-- Danza -->
      <div class="chart-card">
        <div class="chart-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2">
            <circle cx="12" cy="5" r="3"/><path d="M12 8v4l3 5"/><path d="M12 12l-3 5"/>
          </svg>
          <div>
            <h3 class="chart-title">Danza</h3>
            <p class="chart-subtitle">{{ danceTotal() }} inscripción(es)</p>
          </div>
        </div>
        <div class="chart-canvas-wrap">
          <canvas #danceCanvas></canvas>
        </div>
        @if (danceTotal() === 0) {
          <div class="chart-empty">Sin datos de danza</div>
        }
      </div>

      <!-- Ciudades -->
      <div class="chart-card">
        <div class="chart-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <div>
            <h3 class="chart-title">Inscriptos por Ciudad</h3>
            <p class="chart-subtitle">{{ localityTotal() }} total</p>
          </div>
        </div>
        <div class="chart-canvas-wrap chart-canvas-wrap-tall">
          <canvas #localityCanvas></canvas>
        </div>
        @if (localityTotal() === 0) {
          <div class="chart-empty">Sin datos de localidad</div>
        }
      </div>
    </div>
  `,
  styles: `
    .charts-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.25rem;
    }
    @media (max-width: 1024px) {
      .charts-grid-3 { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 640px) {
      .charts-grid-3 { grid-template-columns: 1fr; }
    }
    .chart-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 1.25rem;
    }
    :host-context(.dark) .chart-card { background: #1e293b; border-color: #334155; }
    .chart-header {
      display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;
    }
    .chart-title { font-size: 0.9375rem; font-weight: 700; color: #1e293b; margin: 0; }
    :host-context(.dark) .chart-title { color: #f1f5f9; }
    .chart-subtitle { font-size: 0.75rem; color: #94a3b8; margin: 0.125rem 0 0; }
    .chart-canvas-wrap { position: relative; width: 100%; height: 220px; }
    .chart-canvas-wrap-tall { height: 280px; }
    .chart-canvas-wrap canvas { width: 100% !important; height: 100% !important; }
    .chart-empty {
      text-align: center; padding: 2rem 0; color: #94a3b8; font-size: 0.8125rem; font-style: italic;
    }
  `
})
export class SubscriptionChartsComponent implements OnInit, AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  @ViewChild('musicCanvas') musicCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('danceCanvas') danceCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('localityCanvas') localityCanvas!: ElementRef<HTMLCanvasElement>;

  musicTotal = signal(0);
  danceTotal = signal(0);
  localityTotal = signal(0);
  private musicChart: Chart | null = null;
  private danceChart: Chart | null = null;
  private localityChart: Chart | null = null;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.loadReport();
  }

  ngOnDestroy(): void {
    this.musicChart?.destroy();
    this.danceChart?.destroy();
    this.localityChart?.destroy();
  }

  private loadReport(): void {
    this.http.get<CategoryReport>(`${environment.apiUrl}/reports/inscriptions`).subscribe({
      next: (data) => this.buildCharts(data),
      error: () => this.buildCharts({ total: 0, by_category: {}, by_subcategory: {}, by_locality: {} })
    });
  }

  private buildCharts(data: CategoryReport): void {
    const musicSubs: Record<string, number> = {};
    const danceSubs: Record<string, number> = {};

    for (const [key, val] of Object.entries(data.by_subcategory || {})) {
      const isDance = ['malambo_masculino', 'malambo_femenino', 'pareja_tradicional',
        'pareja_estilizada', 'conjunto_malambo', 'conjunto_baile', 'conjunto_baile_folklorico'].includes(key);
      if (isDance) {
        danceSubs[key] = val;
      } else {
        musicSubs[key] = val;
      }
    }

    const mTotal = Object.values(musicSubs).reduce((a, b) => a + b, 0);
    const dTotal = Object.values(danceSubs).reduce((a, b) => a + b, 0);
    this.musicTotal.set(mTotal);
    this.danceTotal.set(dTotal);

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#cbd5e1' : '#475569';
    const gridColor = isDark ? '#334155' : '#e5e7eb';

    // Music chart
    if (this.musicCanvas) {
      this.musicChart?.destroy();
      const mLabels = Object.keys(musicSubs).map(k => SUBCATEGORY_LABELS[k] || k);
      const mValues = Object.values(musicSubs);
      this.musicChart = new Chart(this.musicCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: mLabels,
          datasets: [{
            data: mValues,
            backgroundColor: MUSIC_COLORS.slice(0, mLabels.length),
            borderRadius: 6,
            maxBarThickness: 48,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, color: textColor }, grid: { color: gridColor } },
            x: { ticks: { color: textColor, font: { size: 11 } }, grid: { display: false } }
          }
        }
      });
    }

    // Dance chart
    if (this.danceCanvas) {
      this.danceChart?.destroy();
      const dLabels = Object.keys(danceSubs).map(k => SUBCATEGORY_LABELS[k] || k);
      const dValues = Object.values(danceSubs);
      this.danceChart = new Chart(this.danceCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: dLabels,
          datasets: [{
            data: dValues,
            backgroundColor: DANCE_COLORS.slice(0, dLabels.length),
            borderRadius: 6,
            maxBarThickness: 48,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1, color: textColor }, grid: { color: gridColor } },
            x: { ticks: { color: textColor, font: { size: 11 } }, grid: { display: false } }
          }
        }
      });
    }

    // Locality chart (horizontal bar)
    if (this.localityCanvas) {
      this.localityChart?.destroy();
      const sorted = Object.entries(data.by_locality || {})
        .filter(([k]) => !!k && k !== 'null')
        .sort((a, b) => b[1] - a[1]);
      const lLabels = sorted.map(([k]) => k);
      const lValues = sorted.map(([, v]) => v);
      this.localityTotal.set(lValues.reduce((a, b) => a + b, 0));
      this.localityChart = new Chart(this.localityCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: lLabels,
          datasets: [{
            data: lValues,
            backgroundColor: LOCALITY_COLORS.slice(0, lLabels.length),
            borderRadius: 4,
            maxBarThickness: 32,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, ticks: { stepSize: 1, color: textColor }, grid: { color: gridColor } },
            y: { ticks: { color: textColor, font: { size: 11 } }, grid: { display: false } }
          }
        }
      });
    }
  }
}
