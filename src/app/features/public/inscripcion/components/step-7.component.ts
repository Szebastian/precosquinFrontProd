import { Component, input, computed, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionData, InscripcionResult } from '../inscripcion.page';
import { subcategoriesByCategory } from '../inscripcion.page';
import { StagePlotComponent } from './stage-plot/stage-plot.component';

@Component({
  selector: 'app-inscripcion-step-7',
  standalone: true,
  imports: [CommonModule, FormsModule, StagePlotComponent],
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

      <!-- Solista Instrumental Details -->
      @if (data().subcategory === 'solista_instrumental') {
        <div class="review-section">
          <div class="review-header">
            <h3>Detalles del Instrumento (Art. 31)</h3>
            <button type="button" class="btn-edit" (click)="goToStep.emit(2)">Editar</button>
          </div>
          <div class="review-grid">
            <div class="review-item">
              <span class="review-label">Tipo de Instrumento</span>
              <span class="review-value">{{ data().instrumentType === 'melodico' ? 'Melódico' : data().instrumentType === 'armonico' ? 'Armónico' : '-' }}</span>
            </div>
            <div class="review-item">
              <span class="review-label">Instrumento</span>
              <span class="review-value">{{ data().instrumentName || '-' }}</span>
            </div>
            @if (data().instrumentType === 'melodico') {
              <div class="review-item">
                <span class="review-label">Acompañamiento</span>
                <span class="review-value">{{ data().hasAccompaniment ? 'Sí' : 'No' }}</span>
              </div>
            }
            @if (data().hasAccompaniment) {
              <div class="review-item">
                <span class="review-label">Instrumento Acompañante</span>
                <span class="review-value">{{ data().accompanimentInstrument || '-' }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">Músico Acompañante</span>
                <span class="review-value">{{ data().accompanimentMusician || '-' }}</span>
              </div>
            }
          </div>
        </div>
      }

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
          @if (data().riderTecnico.monitorCount > 0) {
            <div class="review-item">
              <span class="review-label">Monitores</span>
              <span class="review-value">{{ data().riderTecnico.monitorCount }} monitor(es)</span>
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
          @if (data().riderTecnico.otros) {
            <div class="review-item full-width">
              <span class="review-label">Otros requerimientos técnicos</span>
              <span class="review-value">{{ data().riderTecnico.otros }}</span>
            </div>
          }
          @if (!hasRiderData()) {
            <div class="review-item full-width">
              <span class="review-value review-empty">Sin rider técnico configurado</span>
            </div>
          }
        </div>
        @if (data().riderTecnico.stagePlotInstruments.length > 0) {
          <div class="stage-plot-review">
            <span class="review-label">Stage Plot</span>
            <app-stage-plot
              [initialInstruments]="data().riderTecnico.stagePlotInstruments"
              [readonly]="true">
            </app-stage-plot>
          </div>
        }
      </div>

      <div class="review-section">
        <div class="review-header">
          <h3>Personas Acompañantes</h3>
          <button type="button" class="btn-edit" (click)="goToStep.emit(7)">Editar</button>
        </div>
        <div class="review-grid">
          @if (data().accompanyingPersons.length > 0) {
            @for (person of data().accompanyingPersons; track $index; let i = $index) {
              <div class="review-item">
                <span class="review-label">Acompañante {{ i + 1 }}</span>
                <span class="review-value">{{ person.fullName }} — DNI {{ person.dni }}</span>
              </div>
            }
          } @else {
            <div class="review-item full-width">
              <span class="review-value review-empty">Sin personas acompañantes registradas</span>
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

      @if (showResetModal()) {
        <div class="reset-modal-overlay" (click)="cancelReset()">
          <div class="reset-modal" (click)="$event.stopPropagation()" role="alertdialog" aria-modal="true" aria-labelledby="resetModalTitle" aria-describedby="resetModalDesc">
            <div class="reset-modal-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3 id="resetModalTitle" class="reset-modal-title">¿Borrar todo y empezar de nuevo?</h3>
            <p id="resetModalDesc" class="reset-modal-desc">Se eliminarán todos los datos completados. Esta acción no se puede deshacer.</p>
            <div class="reset-modal-actions">
              <button type="button" class="reset-btn-cancel" (click)="cancelReset()">Cancelar</button>
              <button type="button" class="reset-btn-confirm" (click)="executeReset()">Sí, borrar todo</button>
            </div>
          </div>
        </div>
      }
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
    .stage-plot-review { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid rgba(255, 255, 255, 0.05); }

    @media (max-width: 640px) {
      .review-grid { grid-template-columns: 1fr; }
      .checkbox-label { padding: 0.75rem 1rem; font-size: 0.85rem; }
      .checkbox-label input[type="checkbox"] { width: 22px; height: 22px; }
      .declaration-section { gap: 0.5rem; }
      .review-value { font-size: 0.8rem; }
      .btn-reset { min-height: 44px; width: 100%; justify-content: center; }
    }

    @media (max-width: 480px) {
      .checkbox-label { padding: 0.625rem 0.75rem; font-size: 0.8rem; }
      .review-label { font-size: 0.65rem; }
      .review-value { font-size: 0.75rem; }
      .btn-edit { min-height: 40px; font-size: 0.75rem; }
    }

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

    .reset-modal-overlay {
      position: fixed; inset: 0; z-index: 1000;
      background: rgba(0, 0, 0, 0.7);
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.2s ease;
    }
    .reset-modal {
      background: #1e2330; border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px; padding: 2rem; max-width: 400px; width: 100%;
      text-align: center;
      animation: scaleIn 0.2s ease;
    }
    .reset-modal-icon {
      width: 56px; height: 56px; border-radius: 50%;
      background: rgba(239, 68, 68, 0.12); display: flex; align-items: center;
      justify-content: center; margin: 0 auto 1rem; color: #ef4444;
    }
    .reset-modal-title { font-size: 1.1rem; font-weight: 600; color: #e2e8f0; margin: 0 0 0.5rem; }
    .reset-modal-desc { font-size: 0.85rem; color: #94a3b8; margin: 0 0 1.5rem; line-height: 1.5; }
    .reset-modal-actions { display: flex; gap: 0.75rem; justify-content: center; }
    .reset-btn-cancel {
      padding: 0.6rem 1.25rem; border-radius: 0.5rem; font-size: 0.85rem;
      font-weight: 500; cursor: pointer; transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
    }
    .reset-btn-cancel:hover { background: rgba(255, 255, 255, 0.1); }
    .reset-btn-confirm {
      padding: 0.6rem 1.25rem; border-radius: 0.5rem; font-size: 0.85rem;
      font-weight: 500; cursor: pointer; transition: all 0.2s ease;
      background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4);
      color: #ef4444;
    }
    .reset-btn-confirm:hover { background: rgba(239, 68, 68, 0.25); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class InscripcionStep7Component {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
  goToStep = output<number>();
  resetForm = output<void>();

  showResetModal = signal(false);

  subcategoryName = computed(() => {
    const all = [
      { id: 'solista_vocal', name: 'Solista Vocal' },
      { id: 'duo_vocal', name: 'Dúo Vocal' },
      { id: 'expresion_oral_folclorica', name: 'Expresión Oral Folclórica' },
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
    return !!(r.sonido.microfonos.length > 0 || r.monitorCount > 0 || r.sonido.diBoxes || r.sonido.backline.length > 0 || r.otros);
  }

  confirmReset(): void {
    this.showResetModal.set(true);
  }

  cancelReset(): void {
    this.showResetModal.set(false);
  }

  executeReset(): void {
    this.showResetModal.set(false);
    this.resetForm.emit();
  }
}
