import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InscripcionResult, InscripcionData, formatDate } from '../inscripcion.page';

@Component({
  selector: 'app-inscripcion-constancia',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="constancia-page" id="constancia">
      <div class="constancia-card">
        <div class="constancia-top-bar"></div>

        <div class="constancia-header">
          <img src="assets/img/logoballena.webp" alt="Precosquin" class="constancia-logo-img" />
          <h1 class="constancia-event-name">Festival Precosquín 2027</h1>
          <div class="constancia-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
            </svg>
            Inscripción Registrada
          </div>
        </div>

        <div class="constancia-title-row">
          <h2 class="constancia-title">Constancia de Inscripción</h2>
          <span class="constancia-fecha">Fecha: {{ formatDate(result()!.created_at) }}</span>
        </div>

        <div class="constancia-body">
          <div class="constancia-id-block">
            <span class="constancia-label">N° de Inscripción</span>
            <span class="constancia-value constancia-id">{{ result()!.id }}</span>
          </div>

          <div class="constancia-section-title">Datos Personales</div>

          <div class="constancia-field">
            <span class="constancia-label">Nombre Completo</span>
            <span class="constancia-value constancia-name">{{ data().firstName }} {{ data().lastName }}</span>
          </div>

          <div class="constancia-grid-3">
            <div class="constancia-field">
              <span class="constancia-label">DNI</span>
              <span class="constancia-value">{{ data().dni }}</span>
            </div>
            <div class="constancia-field">
              <span class="constancia-label">Nacimiento</span>
              <span class="constancia-value">{{ data().birthDate }}</span>
            </div>
            <div class="constancia-field">
              <span class="constancia-label">Edad</span>
              <span class="constancia-value">{{ data().age !== null ? data().age + ' años' : '-' }}</span>
            </div>
          </div>

          <div class="constancia-grid-3">
            <div class="constancia-field">
              <span class="constancia-label">Domicilio</span>
              <span class="constancia-value">{{ data().address }}</span>
            </div>
            <div class="constancia-field">
              <span class="constancia-label">Localidad</span>
              <span class="constancia-value">{{ data().locality }}</span>
            </div>
            <div class="constancia-field">
              <span class="constancia-label">Provincia</span>
              <span class="constancia-value">{{ data().province }}</span>
            </div>
          </div>

          <div class="constancia-grid-2">
            <div class="constancia-field">
              <span class="constancia-label">Teléfono</span>
              <span class="constancia-value">{{ data().phone }}</span>
            </div>
            <div class="constancia-field">
              <span class="constancia-label">Email</span>
              <span class="constancia-value">{{ data().email }}</span>
            </div>
          </div>

          <div class="constancia-section-title">Participación</div>

          <div class="constancia-grid-2">
            <div class="constancia-field">
              <span class="constancia-label">Categoría</span>
              <span class="constancia-value constancia-category">{{ data().category === 'musica' ? 'Música' : 'Danza' }}</span>
            </div>
            <div class="constancia-field">
              <span class="constancia-label">Subcategoría</span>
              <span class="constancia-value constancia-category">{{ subcategoryName() }}</span>
            </div>
          </div>

          @if (data().category === 'musica' && data().artisticName) {
            <div class="constancia-field">
              <span class="constancia-label">Nombre Artístico</span>
              <span class="constancia-value">{{ data().artisticName }}</span>
            </div>
          }

          @if (data().category === 'danza') {
            @if (data().proposalName) {
              <div class="constancia-field">
                <span class="constancia-label">Nombre de la Propuesta</span>
                <span class="constancia-value">{{ data().proposalName }}</span>
              </div>
            }
            @if (data().style) {
              <div class="constancia-field">
                <span class="constancia-label">Estilo</span>
                <span class="constancia-value">{{ data().style }}</span>
              </div>
            }
          }

          @if (data().biography) {
            <div class="constancia-field">
              <span class="constancia-label">Biografía Artística</span>
              <span class="constancia-value constancia-bio">{{ data().biography }}</span>
            </div>
          }

          <div class="constancia-status-block">
            <div class="constancia-status-dot"></div>
            <span class="constancia-label">Estado: </span>
            <span class="constancia-value constancia-status">Pendiente de revisión</span>
          </div>

          <div class="constancia-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
            </svg>
            <span>Conservá esta constancia como comprobante. Tu inscripción será revisada por el jurado. Recibirás un email con los próximos pasos.</span>
          </div>
        </div>

        <div class="constancia-footer">
          <button type="button" class="btn btn-primary" (click)="printRequested.emit()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Descargar / Imprimir
          </button>
          <button type="button" class="btn btn-secondary" (click)="resetRequested.emit()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Nueva inscripción
          </button>
          <a routerLink="/" class="btn btn-secondary">Volver al Inicio</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .constancia-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }

    .constancia-card {
      max-width: 640px;
      width: 100%;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
      overflow: hidden;
    }

    .constancia-top-bar {
      height: 6px;
      background: linear-gradient(90deg, #2563eb, #3b82f6, #60a5fa);
    }

    .constancia-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.25rem 2rem 1rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .constancia-logo-img { height: 42px; }

    .constancia-event-name {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      letter-spacing: 0.03em;
    }

    .constancia-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #dcfce7;
      color: #166534;
      padding: 4px 14px;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
    }
    .constancia-badge svg { color: #16a34a; }

    .constancia-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 2rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .constancia-title {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 1.1rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    .constancia-fecha {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }

    .constancia-body {
      padding: 1rem 2rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .constancia-id-block {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .constancia-section-title {
      font-size: 0.7rem;
      font-weight: 700;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 0.2rem 0 0;
      padding-bottom: 0.2rem;
      border-bottom: 1px solid #dbeafe;
    }

    .constancia-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; }
    .constancia-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }

    .constancia-field { display: flex; flex-direction: column; gap: 1px; }

    .constancia-label {
      font-size: 0.6rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .constancia-value { font-size: 0.8rem; color: #1e293b; font-weight: 500; line-height: 1.3; }
    .constancia-id { font-family: 'Courier New', monospace; font-weight: 700; color: #2563eb; font-size: 0.75rem; }
    .constancia-name { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
    .constancia-category { font-weight: 700; color: #2563eb; }
    .constancia-status { font-weight: 700; color: #d97706; }
    .constancia-bio { font-size: 0.75rem; line-height: 1.4; color: #475569; max-height: 3.2em; overflow: hidden; }

    .constancia-status-block {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      margin-top: 0.15rem;
    }
    .constancia-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f59e0b;
      flex-shrink: 0;
    }

    .constancia-note {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
    }
    .constancia-note svg { flex-shrink: 0; color: #2563eb; margin-top: 1px; }
    .constancia-note span { font-size: 0.65rem; color: #475569; line-height: 1.4; }

    .constancia-footer {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      padding: 0 2rem 1.5rem;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }
    .btn-primary { background: #2563eb; color: white; }
    .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
    .btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    .btn-secondary:hover { background: #e2e8f0; }

    /* Print styles handled globally in styles.scss */
  `]
})
export class InscripcionConstanciaComponent {
  result = input.required<InscripcionResult>();
  data = input.required<InscripcionData>();
  subcategoryName = input.required<string>();
  printRequested = output();
  resetRequested = output();

  formatDate(dateStr: string): string {
    return formatDate(dateStr);
  }
}
