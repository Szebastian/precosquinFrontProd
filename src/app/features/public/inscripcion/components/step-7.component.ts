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
      <h2 class="step-title">Declaración Jurada y Revisión</h2>
      <p class="step-desc">Verificá tu información y aceptá las condiciones</p>

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
    </div>
  `,
  styles: [`
    .step-content { min-height: 200px; }
    .slide-left { animation: slideLeft 0.3s ease-out; }
    .slide-right { animation: slideRight 0.3s ease-out; }
    .declaration-section { display: flex; flex-direction: column; gap: var(--space-1); }
    .review-divider { height: 1px; background: rgba(255, 255, 255, 0.1); margin: var(--space-5) 0; }
    .review-section { margin-bottom: var(--space-5); }
    .review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); }
    .review-header h3 { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: #e2e8f0; }
    .btn-edit { font-size: var(--text-xs); color: var(--brand-400); background: none; border: none; cursor: pointer; font-weight: var(--weight-medium); padding: var(--space-1) var(--space-2); border-radius: var(--radius-md); transition: all var(--transition-fast); }
    .btn-edit:hover { background: rgba(99, 102, 241, 0.1); }
    .review-grid { background: rgba(255, 255, 255, 0.05); border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5); display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .review-item.full-width { grid-column: 1 / -1; }
    .review-label { display: block; font-size: var(--text-xs); color: #94a3b8; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.03em; }
    .review-value { display: block; font-size: var(--text-sm); font-weight: var(--weight-medium); color: #e2e8f0; }
    .review-empty { color: #64748b; font-style: italic; font-weight: normal; }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class InscripcionStep7Component {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
  goToStep = output<number>();

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
}
