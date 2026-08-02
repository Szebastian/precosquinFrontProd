import { Component, signal, inject, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { CronogramaService } from '../services/cronograma.service';
import { PresentationItem, CronogramaFilters } from '../models/cronograma.models';
import { PresentationCardComponent } from './presentation-card.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component';
import { SearchBarComponent } from '../shared/search-bar.component';
import { CronogramaFiltersComponent, FilterOption } from '../shared/cronograma-filters.component';

@Component({
  selector: 'app-presentation-order-tab',
  standalone: true,
  imports: [
    PresentationCardComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    SearchBarComponent,
    CronogramaFiltersComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tab-content">
      <div class="tab-controls">
        <app-search-bar
          placeholder="Buscar participante, categoría..."
          (searchChange)="onSearchChange($event)"
        />
        <app-cronograma-filters
          [categories]="categoryOptions()"
          [subcategories]="subcategoryOptions()"
          [stages]="stageOptions()"
          [days]="dayOptions()"
          (filterChange)="onFilterChange($event)"
          (clearFilters)="clearAllFilters()"
        />
      </div>

      @if (loading()) {
        <app-loading-skeleton [skeletonItems]="skeletonArray" />
      } @else if (error()) {
        <app-empty-state
          title="Error al cargar"
          description="Ocurrió un error al obtener el orden de presentación. Intentá nuevamente."
          icon="calendar"
          [actionLabel]="'Reintentar'"
          (actionClick)="loadData()"
        />
      } @else if (presentations().length === 0) {
        <app-empty-state
          title="No hay participantes publicados todavía"
          description="El orden de presentación será publicado por los organizadores cuando esté disponible."
          icon="music"
        />
      } @else {
        <div class="results-count">
          {{ filteredPresentations().length }} presentacion{{ filteredPresentations().length !== 1 ? 'es' : '' }}
        </div>
        <div class="presentations-list">
          @for (item of filteredPresentations(); track item.id) {
            <app-presentation-card [item]="item" />
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
    .results-count {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .presentations-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
  `]
})
export class PresentationOrderTabComponent implements OnInit {
  private cronogramaService = inject(CronogramaService);

  presentations = signal<PresentationItem[]>([]);
  loading = signal(true);
  error = signal(false);
  filters = signal<CronogramaFilters>({
    search: '',
    category: '',
    subcategory: '',
    stage: '',
    day: '',
  });

  skeletonArray = Array.from({ length: 4 }, (_, i) => i);

  categoryOptions = computed(() => {
    const cats = new Set(this.presentations().map(p => p.category).filter(Boolean));
    return Array.from(cats).map(c => ({ value: c, label: c }));
  });

  subcategoryOptions = computed(() => {
    const filtered = this.filters().category
      ? this.presentations().filter(p => p.category === this.filters().category)
      : this.presentations();
    const subs = new Set(filtered.map(p => p.subcategory).filter(Boolean));
    return Array.from(subs).map(s => ({ value: s, label: s }));
  });

  stageOptions = computed(() => {
    const stages = new Set(this.presentations().map(p => p.stage).filter(Boolean));
    return Array.from(stages).map(s => ({ value: s!, label: s! }));
  });

  dayOptions = computed(() => {
    const days = new Set(this.presentations().map(p => p.day).filter(Boolean));
    return Array.from(days).map(d => ({ value: d!, label: d! }));
  });

  filteredPresentations = computed(() => {
    let result = this.presentations();
    const f = this.filters();

    if (f.search) {
      const term = f.search.toLowerCase();
      result = result.filter(p =>
        p.participantName.toLowerCase().includes(term) ||
        (p.groupName && p.groupName.toLowerCase().includes(term)) ||
        p.category.toLowerCase().includes(term) ||
        p.subcategory.toLowerCase().includes(term)
      );
    }
    if (f.category) result = result.filter(p => p.category === f.category);
    if (f.subcategory) result = result.filter(p => p.subcategory === f.subcategory);
    if (f.stage) result = result.filter(p => p.stage === f.stage);
    if (f.day) result = result.filter(p => p.day === f.day);

    return result.sort((a, b) => a.order - b.order);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(false);

    this.cronogramaService.getPresentations({ page_size: 200 }).subscribe({
      next: (res) => {
        this.presentations.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  onSearchChange(value: string): void {
    this.filters.update(f => ({ ...f, search: value }));
  }

  onFilterChange(event: { key: string; value: string }): void {
    this.filters.update(f => ({ ...f, [event.key]: event.value }));
  }

  clearAllFilters(): void {
    this.filters.set({
      search: '',
      category: '',
      subcategory: '',
      stage: '',
      day: '',
    });
  }
}
