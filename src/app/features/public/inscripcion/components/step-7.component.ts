import { Component, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionData, InscripcionResult } from '../inscripcion.page';
import { subcategoriesByCategory } from '../inscripcion.page';

@Component({
  selector: 'app-inscripcion-step-7',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
      <p class="step-desc" style="margin-top: 0;">      Revisá que todo esté bien y aceptá las condiciones</p>

      <div class="declaration-section">
        <label class="checkbox-label">
          <input type="checkbox" [(ngModel)]="data().acceptRegulations" name="acceptRegulations" />
          <span>Acepto el <a href="#" class="text-brand">reglamento del certamen</a> *</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" [(ngModel)]="data().acceptImageRights" name="acceptImageRights" />
          <span>Autorizo la difusión de imágenes y videos de mi presentación *</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" [(ngModel)]="data().acceptDataTruth" name="acceptDataTruth" />
          <span>Declaro que los datos consignados son veraces *</span>
        </label>
      </div>

      <div class="review-divider"></div>

      <div class="review-section">
        <div class="review-header">
          <h3>Datos Personales</h3>
          <button type="button" class="btn-edit" (click)="goToStep.emit(1)">Editar</button>
        </div>
        <div class="review-grid">
          <div class="review-item">
            <span class="review-label">Nombre</span>
            <span class="review-value">{{ data().fullName || '-' }}</span>
          </div>
          <div class="review-item">
            <span class="review-label">DNI</span>
            <span class="review-value">{{ data().dni || '-' }}</span>
          </div>
          <div class="review-item">
            <span class="review-label">Fecha de Nacimiento</span>
            <span class="review-value">{{ data().birthDate || '-' }}</span>
          </div>
          <div class="review-item">
            <span class="review-label">Edad</span>
            <span class="review-value">{{ data().age !== null ? data().age + ' años' : '-' }}</span>
          </div>
          <div class="review-item full-width">
            <span class="review-label">Domicilio</span>
            <span class="review-value">{{ data().address || '-' }}</span>
          </div>
          <div class="review-item">
            <span class="review-label">Localidad</span>
            <span class="review-value">{{ data().locality || '-' }}</span>
          </div>
          <div class="review-item">
            <span class="review-label">Provincia</span>
            <span class="review-value">{{ data().province || '-' }}</span>
          </div>
          <div class="review-item">
            <span class="review-label">Teléfono</span>
            <span class="review-value">{{ data().phone || '-' }}</span>
          </div>
          <div class="review-item">
            <span class="review-label">Email</span>
            <span class="review-value">{{ data().email || '-' }}</span>
          </div>
        </div>
      </div>

      <div class="review-section">
        <div class="review-header">
          <h3>Rubro de Participación</h3>
          <button type="button" class="btn-edit" (click)="goToStep.emit(2)">Editar</button>
        </div>
        <div class="review-grid">
          <div class="review-item">
            <span class="review-label">Categoría</span>
            <span class="review-value">{{ data().category === 'musica' ? 'Música' : data().category === 'danza' ? 'Danza' : '-' }}</span>
          </div>
          <div class="review-item">
            <span class="review-label">Subcategoría</span>
            <span class="review-value">{{ subcategoryName() || '-' }}</span>
          </div>
        </div>
      </div>

      @if (isGroupType()) {
        <div class="review-section">
          <div class="review-header">
            <h3>Integrantes</h3>
            <button type="button" class="btn-edit" (click)="goToStep.emit(3)">Editar</button>
          </div>
          <div class="review-grid">
            @for (member of data().members; track $index; let i = $index) {
              <div class="review-item full-width">
                <span class="review-label">Integrante {{ i + 1 }}</span>
                <span class="review-value">{{ member.fullName || '-' }} — {{ member.role || '-' }} @if (member.dni) { (DNI: {{ member.dni }}) } @if (member.age) { · {{ member.age }} años }</span>
              </div>
            }
            @if (data().members.length === 0) {
              <div class="review-item full-width">
                <span class="review-value review-empty">No se cargaron integrantes</span>
              </div>
            }
          </div>
        </div>
      }

      <div class="review-section">
        <div class="review-header">
          <h3>Información Artística</h3>
          <button type="button" class="btn-edit" (click)="goToStep.emit(4)">Editar</button>
        </div>
        <div class="review-grid">
          @if (data().category === 'musica') {
            <div class="review-item">
              <span class="review-label">Nombre Artístico</span>
              <span class="review-value">{{ data().artisticName || 'No ingresado' }}</span>
            </div>
            <div class="review-item full-width">
              <span class="review-label">Temas</span>
              <span class="review-value">{{ getFilledThemesCount() }} de 6 temas ingresados</span>
            </div>
          }
          @if (data().category === 'danza') {
            <div class="review-item">
              <span class="review-label">Nombre de la Propuesta</span>
              <span class="review-value">{{ data().proposalName || 'No ingresado' }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Coreógrafo</span>
              <span class="review-value">{{ data().choreographerName || 'No ingresado' }}</span>
            </div>
            @if (data().style) {
              <div class="review-item full-width">
                <span class="review-label">Estilo</span>
                <span class="review-value">{{ data().style }}</span>
              </div>
            }
            @if (data().danceList) {
              <div class="review-item full-width">
                <span class="review-label">Danzas o Cuadros</span>
                <span class="review-value">{{ data().danceList }}</span>
              </div>
            }
          }
        </div>
      </div>

      <div class="review-section">
        <div class="review-header">
          <h3>Rider Técnico</h3>
          <button type="button" class="btn-edit" (click)="goToStep.emit(5)">Editar</button>
        </div>
        <div class="review-grid">
          @if (data().riderTecnico.sonido.microfonos.length > 0) {
            <div class="review-item full-width">
              <span class="review-label">Microfonos</span>
              <span class="review-value">{{ data().riderTecnico.sonido.microfonos.join(', ') }}</span>
            </div>
          }
          @if (data().riderTecnico.sonido.monitores) {
            <div class="review-item">
              <span class="review-label">Monitores</span>
              <span class="review-value">{{ data().riderTecnico.sonido.monitores }}</span>
            </div>
          }
          @if (data().riderTecnico.sonido.diBoxes) {
            <div class="review-item">
              <span class="review-label">DI Boxes</span>
              <span class="review-value">{{ data().riderTecnico.sonido.diBoxes }}</span>
            </div>
          }
          @if (data().riderTecnico.sonido.backline.length > 0) {
            <div class="review-item full-width">
              <span class="review-label">Backline</span>
              <span class="review-value">{{ data().riderTecnico.sonido.backline.join(', ') }}</span>
            </div>
          }
          @if (!hasRiderData()) {
            <div class="review-item full-width">
              <span class="review-value review-empty">Sin rider técnico configurado</span>
            </div>
          }
        </div>
      </div>

      <div class="review-section">
        <div class="review-header">
          <h3>Archivos Adjuntos</h3>
          <button type="button" class="btn-edit" (click)="goToStep.emit(6)">Editar</button>
        </div>
        <div class="review-grid">
          <div class="review-item">
            <span class="review-label">DNI Frente</span>
            <span class="review-value">{{ data().dniFrontName || 'No adjuntado' }}</span>
          </div>
          <div class="review-item">
            <span class="review-label">DNI Dorso</span>
            <span class="review-value">{{ data().dniBackName || 'No adjuntado' }}</span>
          </div>
          <div class="review-item">
            <span class="review-label">Foto Promocional</span>
            <span class="review-value">{{ data().promoPhotoName || 'No adjuntada' }}</span>
          </div>
          <div class="review-item full-width">
            <span class="review-label">Biografía Artística</span>
            <span class="review-value">{{ data().biography || 'No ingresada' }}</span>
          </div>
          @if (data().category === 'musica' && data().subcategory === 'cancion_inedita') {
            <div class="review-item">
              <span class="review-label">Letra</span>
              <span class="review-value">{{ data().lyricsFileName || 'No adjuntada' }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Partitura</span>
              <span class="review-value">{{ data().scoreFileName || 'No adjuntada' }}</span>
            </div>
          }
        </div>
      </div>

      <div class="reset-section">
        <button type="button" class="btn-reset" (click)="confirmReset()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Borrar datos y empezar de nuevo
        </button>
      </div>
    </div>
  `,
  styles: [`
    .step-content { min-height: 200px; padding-bottom: 1rem; }
    .slide-left { animation: slideLeft 0.3s ease-out; }
    .slide-right { animation: slideRight 0.3s ease-out; }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }

    .step-desc { font-size: 0.95rem; color: #94a3b8; margin-bottom: 1.5rem; line-height: 1.5; }

    .declaration-section { display: flex; flex-direction: column; gap: 0.625rem; margin-bottom: 1.5rem; }
    .checkbox-label { display: flex; align-items: flex-start; gap: 0.625rem; font-size: 0.9rem; color: #cbd5e1; cursor: pointer; padding: 0.5rem 0.75rem; border-radius: 0.5rem; transition: background 0.2s ease; }
    .checkbox-label:hover { background: rgba(255, 255, 255, 0.03); }
    .checkbox-label input[type="checkbox"] { width: 18px; height: 18px; margin-top: 2px; accent-color: #4c8be6; flex-shrink: 0; cursor: pointer; }
    .checkbox-label a { color: #4c8be6; text-decoration: none; }
    .checkbox-label a:hover { text-decoration: underline; }

    .review-divider { height: 1px; background: rgba(255, 255, 255, 0.06); margin: 1.5rem 0; }

    .review-section { margin-bottom: 1.5rem; }
    .review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
    .review-header h3 { font-size: 0.85rem; font-weight: 600; color: #e2e8f0; margin: 0; }
    .btn-edit { font-size: 0.75rem; color: #4c8be6; background: none; border: none; cursor: pointer; font-weight: 500; padding: 0.25rem 0.5rem; border-radius: 0.375rem; transition: all 0.2s ease; }
    .btn-edit:hover { background: rgba(76, 139, 230, 0.1); }

    .review-grid { background: rgba(255, 255, 255, 0.025); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 0.625rem; padding: 1rem 1.25rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .review-item.full-width { grid-column: 1 / -1; }
    .review-label { display: block; font-size: 0.7rem; color: #64748b; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    .review-value { display: block; font-size: 0.85rem; font-weight: 500; color: #e2e8f0; line-height: 1.4; }
    .review-empty { color: #475569; font-style: italic; font-weight: 400; }

    @media (max-width: 640px) { .review-grid { grid-template-columns: 1fr; } }

    .reset-section {
      display: flex;
      justify-content: center;
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .btn-reset {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      font-size: 0.8rem;
      font-weight: 500;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-reset:hover {
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.25);
      background: rgba(239, 68, 68, 0.06);
    }
    .btn-reset:active { transform: scale(0.97); }
  `]
})
export class InscripcionStep7Component {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
  goToStep = output<number>();
  resetForm = output<void>();

  subcategoryName = computed(() => {
    const all = [
      { id: 'solista_vocal', name: 'Solista Vocal' },
      { id: 'duo_vocal', name: 'Dúo Vocal' },
      { id: 'conjunto_vocal', name: 'Conjunto Vocal' },
      { id: 'solista_instrumental', name: 'Solista Instrumental' },
      { id: 'conjunto_instrumental', name: 'Conjunto Instrumental' },
      { id: 'cancion_inedita', name: 'Canción Inédita' },
      { id: 'malambo_masculino', name: 'Solista de Malambo Masculino' },
      { id: 'malambo_femenino', name: 'Solista de Malambo Femenino' },
      { id: 'conjunto_malambo', name: 'Conjunto de Malambo' },
      { id: 'pareja_tradicional', name: 'Pareja de Baile Tradicional' },
      { id: 'pareja_estilizada', name: 'Pareja de Baile Estilizada' },
      { id: 'conjunto_baile', name: 'Conjunto de Baile Folklórico' },
    ];
    const found = all.find(s => s.id === this.data().subcategory);
    return found?.name || '';
  });

  isGroupType = computed(() => ['duo_vocal', 'conjunto_vocal', 'conjunto_instrumental', 'conjunto_malambo', 'pareja_tradicional', 'pareja_estilizada', 'conjunto_baile'].includes(this.data().subcategory));

  getFilledThemesCount(): number {
    return this.data().themes.filter(t => t.title || t.rhythm || t.author).length;
  }

  hasRiderData(): boolean {
    const r = this.data().riderTecnico;
    return !!(r.sonido.microfonos.length > 0 || r.sonido.monitores || r.sonido.diBoxes || r.sonido.backline.length > 0 || r.otros);
  }

  confirmReset(): void {
    if (confirm('¿Borrar todos los datos y empezar de nuevo? Esta acción no se puede deshacer.')) {
      this.resetForm.emit();
    }
  }
}
