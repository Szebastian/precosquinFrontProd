import { Component, signal, inject, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { CronogramaService } from '../services/cronograma.service';
import { AgendaEvent } from '../models/cronograma.models';
import { AgendaTimelineComponent } from './agenda-timeline.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component';
import { SearchBarComponent } from '../shared/search-bar.component';

@Component({
  selector: 'app-agenda-general-tab',
  standalone: true,
  imports: [
    AgendaTimelineComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    SearchBarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab-content">
      <div class="tab-controls">
        <app-search-bar
          placeholder="Buscar evento..."
          (searchChange)="onSearchChange($event)"
        />

        <div class="day-pills">
          @for (day of dayOptions(); track day.value) {
            <button
              class="day-pill"
              [class.day-pill-active]="selectedDay() === day.value"
              (click)="toggleDay(day.value)"
            >
              {{ day.label }}
            </button>
          }
          @if (selectedDay()) {
            <button class="day-pill day-pill-clear" (click)="toggleDay('')">
              Limpiar
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <app-loading-skeleton [skeletonItems]="skeletonArray" />
      } @else if (error()) {
        <app-empty-state
          title="Error al cargar"
          description="Ocurrió un error al obtener la agenda. Intentá nuevamente."
          icon="calendar"
          [actionLabel]="'Reintentar'"
          (actionClick)="loadData()"
        />
      } @else if (filteredEvents().length === 0) {
        <app-empty-state
          title="La agenda del evento aún no fue publicada"
          description="Los organizadores están preparando la programación. Próximamente encontrarás aquí todos los eventos del festival."
          icon="calendar"
        />
      } @else {
        <div class="results-count">
          {{ filteredEvents().length }} evento{{ filteredEvents().length !== 1 ? 's' : '' }}
        </div>
        <div class="timeline-list">
          @for (event of filteredEvents(); track event.id) {
            <app-agenda-timeline [item]="event" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .tab-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .tab-controls {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .day-pills {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .day-pill {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--gray-600);
      background: #fff;
      border: 1.5px solid var(--gray-200);
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.15s ease;
      min-height: 40px;
      white-space: nowrap;
    }
    .day-pill:hover {
      border-color: var(--gray-300);
      background: var(--gray-50);
    }
    .day-pill-active {
      color: var(--brand-700);
      border-color: var(--brand-500);
      background: rgba(76, 139, 230, 0.06);
    }
    .day-pill-clear {
      color: var(--brand-600);
      border-color: transparent;
      background: rgba(76, 139, 230, 0.06);
    }
    .results-count {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .timeline-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
  `]
})
export class AgendaGeneralTabComponent implements OnInit {
  private cronogramaService = inject(CronogramaService);

  events = signal<AgendaEvent[]>([]);
  loading = signal(true);
  error = signal(false);
  searchQuery = signal('');
  selectedDay = signal('');

  skeletonArray = Array.from({ length: 4 }, (_, i) => i);

  dayOptions = computed(() => {
    const days = new Set(this.events().map(e => e.day).filter(Boolean));
    return Array.from(days).map(d => ({ value: d!, label: d! }));
  });

  filteredEvents = computed(() => {
    let result = this.events();
    const search = this.searchQuery().toLowerCase();
    const day = this.selectedDay();

    if (search) {
      result = result.filter(e =>
        e.title.toLowerCase().includes(search) ||
        (e.description && e.description.toLowerCase().includes(search)) ||
        (e.location && e.location.toLowerCase().includes(search))
      );
    }
    if (day) result = result.filter(e => e.day === day);

    return result.sort((a, b) => a.time.localeCompare(b.time));
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(false);

    this.cronogramaService.getAgenda({ page_size: 200 }).subscribe({
      next: (res) => {
        this.events.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  toggleDay(day: string): void {
    this.selectedDay.set(this.selectedDay() === day ? '' : day);
  }
}
