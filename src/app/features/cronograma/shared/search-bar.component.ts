import { Component, signal, output, input, ElementRef, ViewChild, effect } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  template: `
    <div class="search-container">
      <div class="search-input-wrap">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          #searchInput
          type="text"
          class="search-input"
          [placeholder]="placeholder()"
          [value]="searchValue()"
          (input)="onInput($event)"
          (keydown.escape)="clearAndEmit()"
          aria-label="Buscar"
        />
        @if (searchValue()) {
          <button class="search-clear" (click)="clearAndEmit()" aria-label="Limpiar búsqueda">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      width: 100%;
    }
    .search-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      color: var(--gray-400);
      pointer-events: none;
      z-index: 1;
    }
    .search-input {
      width: 100%;
      height: 48px;
      padding: 0 44px 0 42px;
      font-size: var(--text-sm);
      font-family: var(--font-sans);
      color: var(--gray-900);
      background: #fff;
      border: 1.5px solid var(--gray-200);
      border-radius: 14px;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .search-input::placeholder {
      color: var(--gray-400);
    }
    .search-input:focus {
      border-color: var(--brand-400);
      box-shadow: 0 0 0 3px rgba(76, 139, 230, 0.12);
    }
    .search-clear {
      position: absolute;
      right: 8px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: var(--gray-100);
      color: var(--gray-500);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s ease;
    }
    .search-clear:hover {
      background: var(--gray-200);
    }
  `]
})
export class SearchBarComponent {
  placeholder = input('Buscar por nombre, categoría...');
  initialValue = input('');
  searchChange = output<string>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchValue = signal('');
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const val = this.initialValue();
      if (val !== undefined) {
        this.searchValue.set(val);
      }
    });
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.set(value);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.searchChange.emit(value);
    }, 300);
  }

  clearAndEmit(): void {
    this.searchValue.set('');
    this.searchChange.emit('');
    this.searchInput?.nativeElement?.focus();
  }
}
