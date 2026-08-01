import {
  Component,
  ChangeDetectionStrategy,
  output,
} from '@angular/core';

interface NavItem {
  id: string;
  label: string;
  active: boolean;
}

@Component({
  selector: 'app-mobile-bottom-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="bottom-nav" role="navigation" aria-label="Navegación principal">
      @for (item of items; track item.id) {
        <button
          class="nav-item"
          [class.active]="item.active"
          (click)="selectTab(item.id)"
          [attr.aria-label]="item.label"
          [attr.aria-current]="item.active ? 'page' : null"
        >
          <span class="nav-icon" [innerHTML]="getIcon(item.id)"></span>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      }
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: space-around;
      background: #0e0f12;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding: 6px 0 env(safe-area-inset-bottom, 0px);
      z-index: 100;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 8px 12px;
      background: transparent;
      border: none;
      color: #7b8395;
      cursor: pointer;
      min-width: 48px;
      min-height: 48px;
      justify-content: center;
      transition: color 0.15s ease;
    }

    .nav-item.active {
      color: #c9a87d;
    }

    .nav-item:hover {
      color: #b0b5c0;
    }

    .nav-item.active:hover {
      color: #c9a87d;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }

    .nav-icon svg {
      width: 22px;
      height: 22px;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.5;
    }

    .nav-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.3px;
    }
  `],
})
export class MobileBottomNavComponent {
  tabChanged = output<string>();

  items: NavItem[] = [
    { id: 'inicio', label: 'Inicio', active: true },
    { id: 'noticias', label: 'Noticias', active: false },
    { id: 'agenda', label: 'Agenda', active: false },
    { id: 'videos', label: 'Videos', active: false },
    { id: 'mas', label: 'Más', active: false },
  ];

  selectTab(id: string): void {
    this.items = this.items.map((item) => ({
      ...item,
      active: item.id === id,
    }));
    this.tabChanged.emit(id);
  }

  getIcon(id: string): string {
    const icons: Record<string, string> = {
      home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"/></svg>`,
      noticias: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="12" y2="16"/></svg>`,
      agenda: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
      videos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
      mas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`,
    };
    return icons[id] || icons['home'];
  }
}