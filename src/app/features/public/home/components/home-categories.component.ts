import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-home-categories',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="categories">
      <div class="cat-row">
        <div class="cat-row-head">
          <svg class="cat-row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <span class="cat-row-label">Música</span>
        </div>
        <div class="cat-scroll">
          @for (cat of musicaCats; track cat) {
            <span class="cat-pill cat-pill--musica">{{ cat }}</span>
          }
        </div>
      </div>

      <div class="cat-row">
        <div class="cat-row-head">
          <svg class="cat-row-icon cat-row-icon--danza" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="M12 6v4l-3 5"/><path d="M12 10l3 5"/><path d="M9 21l3-6 3 6"/></svg>
          <span class="cat-row-label cat-row-label--danza">Danza</span>
        </div>
        <div class="cat-scroll">
          @for (cat of danzaCats; track cat) {
            <span class="cat-pill cat-pill--danza">{{ cat }}</span>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .categories {
      width: 100%;
      max-width: min(92%, 1100px);
      margin: 0 auto;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .cat-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .cat-row-head {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      min-width: 80px;
    }

    .cat-row-icon {
      color: #fbbf24;
      opacity: 0.7;
    }

    .cat-row-icon--danza {
      color: #ec4899;
    }

    .cat-row-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
    }

    .cat-row-label--danza {
      color: rgba(236,72,153,0.5);
    }

    .cat-scroll {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      padding: 2px 0;
      flex: 1;
      min-width: 0;
    }

    .cat-scroll::-webkit-scrollbar { display: none; }

    .cat-pill {
      flex-shrink: 0;
      font-size: 12px;
      font-weight: 500;
      padding: 6px 14px;
      border-radius: 999px;
      white-space: nowrap;
      transition: all 0.2s ease;
      cursor: default;
      border: 1px solid transparent;
    }

    .cat-pill--musica {
      color: rgba(255,255,255,0.7);
      background: rgba(251,191,36,0.08);
      border-color: rgba(251,191,36,0.1);
    }

    .cat-pill--musica:hover {
      color: #fbbf24;
      background: rgba(251,191,36,0.12);
      border-color: rgba(251,191,36,0.2);
    }

    .cat-pill--danza {
      color: rgba(255,255,255,0.7);
      background: rgba(236,72,153,0.08);
      border-color: rgba(236,72,153,0.1);
    }

    .cat-pill--danza:hover {
      color: #ec4899;
      background: rgba(236,72,153,0.12);
      border-color: rgba(236,72,153,0.2);
    }

    @media (max-width: 640px) {
      .categories { padding: 24px 16px; gap: 10px; }
      .cat-row { gap: 8px; }
      .cat-row-head { min-width: 64px; gap: 4px; }
      .cat-row-icon { width: 14px; height: 14px; }
      .cat-row-label { font-size: 10px; }
      .cat-pill { font-size: 11px; padding: 5px 10px; }
    }
  `]
})
export class HomeCategoriesComponent {
  musicaCats = [
    'Solista Vocal',
    'Dúo Vocal',
    'Expresión Oral',
    'Conjunto Vocal',
    'Solista Instrumental',
    'Conjunto Instrumental',
    'Canción Inédita',
  ];

  danzaCats = [
    'Malambo Masculino',
    'Malambo Femenino',
    'Conjunto de Malambo',
    'Pareja Tradicional',
    'Pareja Estilizada',
    'Conjunto de Baile',
  ];
}
