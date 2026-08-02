import { Component, signal, input, output } from '@angular/core';

export interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-cronograma-filters',
  standalone: true,
  template: `
    <div class="filters-container">
      <button class="filters-toggle" (click)="toggleOpen()" [attr.aria-expanded]="isOpen()" aria-controls="filter-panel">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        Filtros
        @if (activeCount() > 0) {
          <span class="filter-badge">{{ activeCount() }}</span>
        }
        <svg class="toggle-chevron" [class.open]="isOpen()" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      @if (isOpen()) {
        <div class="filter-panel" id="filter-panel">
          <div class="filter-group">
            <label class="filter-label">Categoría</label>
            <select class="filter-select" (change)="onFilterChange('category', $event)" [value]="selectedCategory()">
              <option value="">Todas</option>
              @for (opt of categories(); track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Subcategoría</label>
            <select class="filter-select" (change)="onFilterChange('subcategory', $event)" [value]="selectedSubcategory()">
              <option value="">Todas</option>
              @for (opt of subcategories(); track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Escenario</label>
            <select class="filter-select" (change)="onFilterChange('stage', $event)" [value]="selectedStage()">
              <option value="">Todos</option>
              @for (opt of stages(); track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Día</label>
            <select class="filter-select" (change)="onFilterChange('day', $event)" [value]="selectedDay()">
              <option value="">Todos</option>
              @for (opt of days(); track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </div>

          @if (activeCount() > 0) {
            <button class="filter-clear" (click)="clearAll()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Limpiar filtros
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .filters-container {
      width: 100%;
    }
    .filters-toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--gray-700);
      background: #fff;
      border: 1.5px solid var(--gray-200);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
      min-height: 44px;
    }
    .filters-toggle:hover {
      border-color: var(--gray-300);
      background: var(--gray-50);
    }
    .filter-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--brand-500);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
    }
    .toggle-chevron {
      transition: transform 0.2s ease;
    }
    .toggle-chevron.open {
      transform: rotate(180deg);
    }
    .filter-panel {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      padding: var(--space-4);
      margin-top: var(--space-3);
      background: #fff;
      border: 1px solid var(--gray-200);
      border-radius: 14px;
      animation: slideDown 0.2s ease;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .filter-group {
      flex: 1;
      min-width: 140px;
    }
    .filter-label {
      display: block;
      font-size: 11px;
      font-weight: var(--weight-bold);
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }
    .filter-select {
      width: 100%;
      height: 42px;
      padding: 0 12px;
      font-size: var(--text-sm);
      font-family: var(--font-sans);
      color: var(--gray-900);
      background: var(--gray-50);
      border: 1.5px solid var(--gray-200);
      border-radius: 10px;
      outline: none;
      cursor: pointer;
      transition: border-color 0.15s ease;
      appearance: auto;
    }
    .filter-select:focus {
      border-color: var(--brand-400);
    }
    .filter-clear {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--brand-600);
      background: rgba(76, 139, 230, 0.06);
      border: 1px solid rgba(76, 139, 230, 0.15);
      border-radius: 999px;
      cursor: pointer;
      transition: background 0.15s ease;
      align-self: flex-end;
      min-height: 38px;
    }
    .filter-clear:hover {
      background: rgba(76, 139, 230, 0.12);
    }
    @media (max-width: 640px) {
      .filter-panel {
        flex-direction: column;
      }
      .filter-group {
        min-width: auto;
      }
    }
  `]
})
export class CronogramaFiltersComponent {
  categories = input<FilterOption[]>([]);
  subcategories = input<FilterOption[]>([]);
  stages = input<FilterOption[]>([]);
  days = input<FilterOption[]>([]);

  filterChange = output<{ key: string; value: string }>();
  clearFilters = output<void>();

  isOpen = signal(false);
  selectedCategory = signal('');
  selectedSubcategory = signal('');
  selectedStage = signal('');
  selectedDay = signal('');

  toggleOpen(): void {
    this.isOpen.set(!this.isOpen());
  }

  activeCount(): number {
    let count = 0;
    if (this.selectedCategory()) count++;
    if (this.selectedSubcategory()) count++;
    if (this.selectedStage()) count++;
    if (this.selectedDay()) count++;
    return count;
  }

  onFilterChange(key: string, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    switch (key) {
      case 'category': this.selectedCategory.set(value); break;
      case 'subcategory': this.selectedSubcategory.set(value); break;
      case 'stage': this.selectedStage.set(value); break;
      case 'day': this.selectedDay.set(value); break;
    }
    this.filterChange.emit({ key, value });
  }

  clearAll(): void {
    this.selectedCategory.set('');
    this.selectedSubcategory.set('');
    this.selectedStage.set('');
    this.selectedDay.set('');
    this.clearFilters.emit();
  }
}
