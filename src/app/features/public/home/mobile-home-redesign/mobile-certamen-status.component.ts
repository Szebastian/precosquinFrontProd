import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';

type Phase = 'inscripcion' | 'preseleccion' | 'jurados' | 'festival' | 'resultados';

interface PhaseConfig {
  id: Phase;
  label: string;
  icon: string;
  active: boolean;
}

@Component({
  selector: 'app-mobile-certamen-status',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="certamen-status">
      <div class="certamen-card">
        <div class="status-badge">
          <span class="status-dot"></span>
          <span class="status-text">Inscripciones abiertas</span>
        </div>

        <div class="countdown-wrapper">
          <div class="countdown-item">
            <span class="countdown-value">{{ countdown().days }}</span>
            <span class="countdown-label">Días</span>
          </div>
          <span class="countdown-separator">:</span>
          <div class="countdown-item">
            <span class="countdown-value">{{ countdown().hours }}</span>
            <span class="countdown-label">Hrs</span>
          </div>
          <span class="countdown-separator">:</span>
          <div class="countdown-item">
            <span class="countdown-value">{{ countdown().minutes }}</span>
            <span class="countdown-label">Min</span>
          </div>
        </div>

        <div class="deadline-text">
          Fecha límite: {{ deadline }}
        </div>

        <button class="btn-primary btn-inscribirme">
          Inscribirme
        </button>

        <button class="btn-secondary btn-bases">
          Ver bases
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 19 19 12 12 5" />
          </svg>
        </button>
      </div>
    </section>
  `,
  styles: [`
    .certamen-status {
      padding: 24px 16px;
    }

    .certamen-card {
      background: #181a1f;
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(76, 180, 98, 0.15);
      border: 1px solid rgba(76, 180, 98, 0.4);
      border-radius: 999px;
      padding: 6px 14px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4cb461;
      box-shadow: 0 0 8px rgba(76, 180, 98, 0.6);
    }

    .status-text {
      font-size: 14px;
      font-weight: 600;
      color: #4cb461;
    }

    .countdown-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .countdown-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 40px;
    }

    .countdown-value {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      font-variant-numeric: tabular-nums;
    }

    .countdown-label {
      font-size: 11px;
      font-weight: 500;
      color: #7b8395;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .countdown-separator {
      font-size: 20px;
      font-weight: 700;
      color: #5a5f73;
    }

    .deadline-text {
      font-size: 13px;
      color: #b0b5c0;
      text-align: center;
    }

    .btn-primary {
      width: 100%;
      border: none;
      border-radius: 16px;
      padding: 16px 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.1s ease, box-shadow 0.1s ease;
      color: #0e0f12;
      background: #c9a87d;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(201, 168, 125, 0.3);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .btn-secondary {
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      padding: 14px 24px;
      font-size: 14px;
      font-weight: 500;
      color: #b0b5c0;
      background: transparent;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: border-color 0.15s ease, color 0.15s ease;
    }

    .btn-secondary:hover {
      border-color: rgba(255, 255, 255, 0.24);
      color: #e0e3ec;
    }
  `],
})
export class MobileCertamenStatusComponent {
  deadline = '15 de noviembre de 2025';

  countdown = signal({ days: 30, hours: 12, minutes: 45 });

  // In a real implementation, this would compute from a deadline date
  // private deadlineDate = new Date('2025-11-15');
  // countdown = computed(() => {
  //   const now = new Date();
  //   const diff = this.deadlineDate.getTime() - now.getTime();
  //   const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  //   const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  //   const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
  //   return { days, hours, minutes };
  // });

  // phases: Phase[] = [
  //   { id: 'inscripcion', label: 'Inscripción', icon: 'calendar', active: true },
  //   { id: 'preseleccion', label: 'Preselección', icon: 'clipboard', active: true },
  //   { id: 'jurados', label: 'Jurados', icon: 'users', active: false },
  //   { id: 'festival', label: 'Festival', icon: 'music', active: false },
  //   { id: 'resultados', label: 'Resultados', icon: 'award', active: false },
  // ];
}