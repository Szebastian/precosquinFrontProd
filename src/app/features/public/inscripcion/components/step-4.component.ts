import { Component, input, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionData, InscripcionResult, formatDate } from '../inscripcion.page';
import { subcategoriesByCategory } from '../inscripcion.page';

@Component({
  selector: 'app-inscripcion-step-4',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
      @if (data().category === 'musica') {
        <h2 class="step-title">Información Artística — Música</h2>
        <p class="step-desc">Completá los datos de tu presentación musical</p>

        @if (data().subcategory === 'cancion_inedita') {
          <div class="alert-info" style="margin-bottom: var(--space-4);">
            <strong>Atención:</strong> Para Canción Inédita deberás cargar la letra y la partitura en el paso 6 (Archivos).
          </div>
        }

        <div class="form-group">
          <label class="form-label" for="artisticName">Nombre artístico</label>
          <input type="text" id="artisticName" name="artisticName" class="form-input"
            [(ngModel)]="data().artisticName" placeholder="Si tenés nombre artístico, ingresalo" />
        </div>

        <div class="form-group">
          <label class="form-label">Listado de 6 temas</label>
          <div class="themes-table-wrapper">
            <table class="themes-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Ritmo</th>
                  <th>Autor</th>
                </tr>
              </thead>
              <tbody>
                @for (theme of data().themes; track $index; let i = $index) {
                  <tr>
                    <td class="theme-number">{{ i + 1 }}</td>
                    <td><input type="text" class="form-input table-input" [(ngModel)]="theme.title" [name]="'themeTitle' + i" placeholder="Título del tema" /></td>
                    <td><input type="text" class="form-input table-input" [(ngModel)]="theme.rhythm" [name]="'themeRhythm' + i" placeholder="Ej: Chacarera" /></td>
                    <td><input type="text" class="form-input table-input" [(ngModel)]="theme.author" [name]="'themeAuthor' + i" placeholder="Autor / compositor" /></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (data().category === 'danza') {
        <h2 class="step-title">Información Artística — Danza</h2>
        <p class="step-desc">Completá los datos de tu presentación de danza</p>

        <div class="form-group">
          <label class="form-label" for="proposalName">Nombre de la propuesta</label>
          <input type="text" id="proposalName" name="proposalName" class="form-input"
            [(ngModel)]="data().proposalName" placeholder="Ej: 'Zamba del Tropero'" />
        </div>

        <div class="form-group">
          <label class="form-label" for="choreographerName">Nombre del coreógrafo</label>
          <input type="text" id="choreographerName" name="choreographerName" class="form-input"
            [(ngModel)]="data().choreographerName" placeholder="Nombre del coreógrafo" />
        </div>

        <div class="form-group">
          <label class="form-label" for="style">Estilo</label>
          <textarea id="style" name="style" class="form-textarea" rows="4"
            [(ngModel)]="data().style"
            placeholder="Describí el estilo de la presentación (folklórico, contemporáneo, etc.)..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="danceList">Listado de danzas o cuadros</label>
          <textarea id="danceList" name="danceList" class="form-textarea" rows="4"
            [(ngModel)]="data().danceList"
            placeholder="Listá las danzas o cuadros que componen la presentación..."></textarea>
        </div>
      }
    </div>
  `,
  styles: [`
    .step-content { min-height: 200px; }
    .slide-left { animation: slideLeft 0.3s ease-out; }
    .slide-right { animation: slideRight 0.3s ease-out; }
    .alert-info { background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--radius-lg); padding: var(--space-3) var(--space-4); font-size: var(--text-sm); color: #c7d2fe; line-height: 1.6; }
    .themes-table-wrapper { overflow-x: auto; margin-top: var(--space-2); }
    .themes-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
    .themes-table th { text-align: left; padding: var(--space-2) var(--space-3); color: #94a3b8; font-weight: var(--weight-medium); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.03em; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    .themes-table td { padding: var(--space-2) var(--space-3); }
    .theme-number { color: #64748b; font-weight: var(--weight-medium); width: 30px; }
    .table-input { padding: 0.5rem 0.625rem !important; font-size: var(--text-sm) !important; }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class InscripcionStep4Component {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
}
