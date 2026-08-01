import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';

interface Phase {
  id: string;
  label: string;
  icon: 'calendar' | 'clipboard' | 'users' | 'music' | 'award';
  active: boolean;
}

@Component({
  selector: 'app-mobile-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="timeline-nav">
      <div class="timeline-track"></div>

      <ul class="timeline-list">
        @for (phase of phases(); track phase.id; let i = $index; let last = $last) {
          <li class="timeline-item" [class.active]="phase.active">
            <div class="timeline-icon">
              @switch (phase.icon) {
                @case ('calendar') {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
                @case ('clipboard') {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 11h6" />
                    <path d="M9 15h6" />
                    <path d="M9 7h6" />
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                  </svg>
                }
                @case ('users') {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-2.517-3.64" />
                    <path d="M15.77 15.77A3.985 3.985 0 0 1 17 14c1.657 0 3 1.343 3 3v4" />
                  </svg>
                }
                @case ('music') {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 1a3 3 0 0 1 3 3v8a3 3 0 1 1-6 0V4a3 3 0 0 1 3-3z" />
                    <path d="M6 12v8a3 3 0 0 0 6 0" />
                    <path d="M18 8v8a3 3 0 0 0 6 0V8" />
                  </svg>
                }
                @case ('award') {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M12 2v4" />
                    <path d="M12 14v8" />
                    <path d="m4.93 4.93 2.83 2.83" />
                    <path d="m16.24 16.24 2.83 2.83" />
                    <path d="M4.93 19.07l2.83-2.83" />
                    <path d="m16.24 7.76 2.83-2.83" />
                  </svg>
                }
              }
            </div>

            <span class="timeline-label">{{ phase.label }}</span>

            @if (!last) {
              <div class="timeline-connector" [class.active]="phase.active"></div>
            }
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [`
    .timeline-nav {
      padding: 20px 16px;
      overflow-x: auto;
    }

    .timeline-track {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-50%);
      pointer-events: none;
    }

    .timeline-list {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      min-width: 360px;
    }

    .timeline-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 2;
    }

    .timeline-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #7b8395;
      transition: all 0.2s ease;
    }

    .timeline-item.active .timeline-icon {
      background: rgba(201, 168, 125, 0.15);
      border-color: rgba(201, 168, 125, 0.4);
      color: #c9a87d;
    }

    .timeline-label {
      margin-top: 8px;
      font-size: 11px;
      font-weight: 500;
      color: #7b8395;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .timeline-item.active .timeline-label {
      color: #c9a87d;
      font-weight: 600;
    }

    .timeline-connector {
      position: absolute;
      top: 18px;
      left: 50%;
      width: calc(100% - 36px);
      height: 2px;
      background: rgba(255, 255, 255, 0.08);
      transform: translateX(50%);
    }

    .timeline-item:last-child .timeline-connector {
      display: none;
    }

    .timeline-item.active + .timeline-item .timeline-connector,
    .timeline-item.active .timeline-connector {
      background: #c9a87d;
    }

    .timeline-item.active ~ .timeline-item .timeline-connector {
      background: rgba(201, 168, 125, 0.3);
    }
  `],
})
export class MobileTimelineComponent {
  phases = input<Phase[]>([
    { id: 'inscripcion', label: 'Inscripción', icon: 'calendar', active: true },
    { id: 'preseleccion', label: 'Preselección', icon: 'clipboard', active: true },
    { id: 'jurados', label: 'Jurados', icon: 'users', active: false },
    { id: 'festival', label: 'Festival', icon: 'music', active: false },
    { id: 'resultados', label: 'Resultados', icon: 'award', active: false },
  ]);
}