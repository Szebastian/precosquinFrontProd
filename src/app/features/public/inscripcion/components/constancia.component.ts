import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InscripcionResult, InscripcionData, formatDate } from '../inscripcion.page';

@Component({
  selector: 'app-inscripcion-constancia',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="constancia-page animate-scale-in" id="constancia">
      <div class="constancia-card">
        <div class="constancia-header">
          <img src="assets/img/logoballena.webp" alt="Precosquin" class="constancia-logo-img" />
          <div class="constancia-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
            </svg>
            Inscripción Registrada
          </div>
        </div>

        <h2 class="constancia-title">Constancia de Inscripción</h2>

        <div class="constancia-body">
          <div class="constancia-field">
            <span class="constancia-label">N° de Inscripción</span>
            <span class="constancia-value constancia-id">{{ result()!.id }}</span>
          </div>

          <div class="constancia-field">
            <span class="constancia-label">Fecha de Inscripción</span>
            <span class="constancia-value">{{ formatDate(result()!.created_at) }}</span>
          </div>

          <div class="constancia-divider"></div>

          <div class="constancia-field">
            <span class="constancia-label">Nombre Completo</span>
            <span class="constancia-value">{{ data().fullName }}</span>
          </div>

          <div class="constancia-row">
            <div class="constancia-field">
              <span class="constancia-label">DNI</span>
              <span class="constancia-value">{{ data().dni }}</span>
            </div>
            <div class="constancia-field">
              <span class="constancia-label">Fecha de Nacimiento</span>
              <span class="constancia-value">{{ data().birthDate }}</span>
            </div>
          </div>

          <div class="constancia-row">
            <div class="constancia-field">
              <span class="constancia-label">Edad</span>
              <span class="constancia-value">{{ data().age !== null ? data().age + ' años' : '-' }}</span>
            </div>
            <div class="constancia-field">
              <span class="constancia-label">Domicilio</span>
              <span class="constancia-value">{{ data().address }}</span>
            </div>
          </div>

          <div class="constancia-row">
            <div class="constancia-field">
              <span class="constancia-label">Localidad</span>
              <span class="constancia-value">{{ data().locality }}</span>
            </div>
            <div class="constancia-field">
              <span class="constancia-label">Provincia</span>
              <span class="constancia-value">{{ data().province }}</span>
            </div>
          </div>

          <div class="constancia-row">
            <div class="constancia-field">
              <span class="constancia-label">Teléfono</span>
              <span class="constancia-value">{{ data().phone }}</span>
            </div>
            <div class="constancia-field">
              <span class="constancia-label">Email</span>
              <span class="constancia-value">{{ data().email }}</span>
            </div>
          </div>

          <div class="constancia-divider"></div>

          <div class="constancia-row">
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
            <div class="constancia-divider"></div>
            <div class="constancia-field">
              <span class="constancia-label">Biografía Artística</span>
              <span class="constancia-value">{{ data().biography }}</span>
            </div>
          }

          <div class="constancia-divider"></div>

          <div class="constancia-field">
            <span class="constancia-label">Estado</span>
            <span class="constancia-value constancia-status">Pendiente de revisión</span>
          </div>

          <div class="constancia-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
            </svg>
            <p>Conservá esta constancia como comprobante. Tu inscripción será revisada por el jurado. Recibirás un email con los próximos pasos.</p>
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
    .constancia-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--space-6); background: linear-gradient(135deg, var(--gray-50) 0%, var(--brand-50) 100%); }
    .constancia-card { max-width: 600px; width: 100%; background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-xl); overflow: hidden; }
    .constancia-header { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-8) var(--space-6) var(--space-4); border-bottom: 1px solid var(--gray-100); }
    .constancia-logo-img { height: 48px; }
    .constancia-badge { display: inline-flex; align-items: center; gap: var(--space-2); background: #dcfce7; color: #166534; padding: 6px 16px; border-radius: var(--radius-full); font-size: var(--text-sm); font-weight: var(--weight-bold); }
    .constancia-title { text-align: center; font-family: var(--font-display); font-size: var(--text-xl); font-weight: var(--weight-extrabold); padding: var(--space-4) var(--space-6) 0; margin: 0; }
    .constancia-body { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-3); }
    .constancia-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .constancia-field { display: flex; flex-direction: column; gap: 2px; }
    .constancia-label { font-size: 11px; font-weight: var(--weight-bold); color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; }
    .constancia-value { font-size: var(--text-sm); color: var(--gray-800); }
    .constancia-id { font-family: var(--font-mono); font-weight: var(--weight-bold); color: var(--brand-600); }
    .constancia-category { font-weight: var(--weight-bold); color: var(--brand-700); }
    .constancia-status { font-weight: var(--weight-bold); color: #f59e0b; }
    .constancia-divider { height: 1px; background: var(--gray-100); margin: var(--space-2) 0; }
    .constancia-note { display: flex; gap: var(--space-3); background: var(--brand-50); border: 1px solid var(--brand-200); border-radius: var(--radius-lg); padding: var(--space-3) var(--space-4); margin-top: var(--space-2); }
    .constancia-note svg { flex-shrink: 0; color: var(--brand-600); margin-top: 2px; }
    .constancia-note p { margin: 0; font-size: var(--text-xs); color: var(--gray-600); line-height: 1.5; }
    .constancia-footer { display: flex; justify-content: center; gap: var(--space-3); padding: 0 var(--space-6) var(--space-6); flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: var(--space-2); padding: 10px 20px; border-radius: var(--radius-lg); font-size: var(--text-sm); font-weight: var(--weight-bold); text-decoration: none; cursor: pointer; border: none; transition: all var(--transition-fast); }
    .btn-primary { background: var(--brand-600); color: white; }
    .btn-primary:hover { background: var(--brand-700); }
    .btn-secondary { background: var(--gray-100); color: var(--gray-700); border: 1px solid var(--gray-200); }
    .btn-secondary:hover { background: var(--gray-200); }
    .animate-scale-in { animation: scaleIn 0.5s ease; }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
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
