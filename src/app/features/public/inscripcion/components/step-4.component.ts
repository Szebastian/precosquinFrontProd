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
        <p class="step-desc" style="margin-top: 0;">Contanos sobre tu presentación musical</p>

        @if (data().subcategory === 'cancion_inedita') {
          <div class="alert-info" style="margin-bottom: var(--space-4);">
            <strong>Ojo:</strong> Para Canción Inédita vas a tener que subir la letra y la partitura en el paso de Archivos.
          </div>
        }

        <div class="form-group">
          <label class="form-label" for="artisticName">¿Tenés nombre artístico?</label>
          <input type="text" id="artisticName" name="artisticName" class="form-input"
            [(ngModel)]="data().artisticName" placeholder="Si lo tenés, ponelo acá" />
        </div>

        <div class="form-group">
          <label class="form-label">¿Qué temas vas a tocar?</label>
          <div class="themes-table-wrapper">
            <table class="themes-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tema</th>
                  <th>Ritmo</th>
                  <th>¿Quién lo compuso?</th>
                </tr>
              </thead>
              <tbody>
                @for (theme of data().themes; track $index; let i = $index) {
                  <tr>
                    <td class="theme-number">{{ i + 1 }}</td>
                    <td><input type="text" class="form-input table-input" [(ngModel)]="theme.title" [name]="'themeTitle' + i" placeholder="Nombre del tema" /></td>
                    <td><input type="text" class="form-input table-input" [(ngModel)]="theme.rhythm" [name]="'themeRhythm' + i" placeholder="Ej: Chacarera" /></td>
                    <td><input type="text" class="form-input table-input" [(ngModel)]="theme.author" [name]="'themeAuthor' + i" placeholder="Autor o compositor" /></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (data().category === 'danza') {
        <p class="step-desc" style="margin-top: 0;">Contanos sobre tu presentación de danza</p>

        <div class="form-group">
          <label class="form-label" for="proposalName">¿Cómo se llama tu propuesta?</label>
          <input type="text" id="proposalName" name="proposalName" class="form-input"
            [(ngModel)]="data().proposalName" placeholder="Ej: Zamba del Tropero" />
        </div>

        <div class="form-group">
          <label class="form-label" for="choreographerName">¿Quién es el coreógrafo?</label>
          <input type="text" id="choreographerName" name="choreographerName" class="form-input"
            [(ngModel)]="data().choreographerName" placeholder="Nombre del coreógrafo" />
        </div>

        <div class="form-group">
          <label class="form-label" for="style">¿Qué estilo tiene?</label>
          <textarea id="style" name="style" class="form-textarea" rows="4"
            [(ngModel)]="data().style"
            placeholder="Contanos un poco del estilo: folklórico, contemporáneo..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="danceList">¿Qué danzas incluye?</label>
          <textarea id="danceList" name="danceList" class="form-textarea" rows="4"
            [(ngModel)]="data().danceList"
            placeholder="Listá las danzas o cuadros que componen tu presentación"></textarea>
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

    .form-group { margin-bottom: 1.25rem; }
    .form-label { font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.35rem; display: block; }
    .form-input, .form-textarea { width: 100%; padding: 0.7rem 0.875rem; font-size: 0.95rem; color: #f1f5f9; background: transparent; border: 1.5px solid rgba(255, 255, 255, 0.08); border-radius: 0.5rem; outline: none; transition: border-color 0.2s ease; }
    .form-input:focus, .form-textarea:focus { border-color: #4c8be6; box-shadow: 0 0 0 2px rgba(76, 139, 230, 0.12); }
    .form-input::placeholder, .form-textarea::placeholder { color: #475569; }

    .alert-info { background: rgba(76, 139, 230, 0.06); border: 1px solid rgba(76, 139, 230, 0.18); border-radius: 0.625rem; padding: 0.75rem 1rem; font-size: 0.85rem; color: #93c5fd; line-height: 1.6; margin-bottom: 1.25rem; }
    .alert-info strong { color: #bfdbfe; }

    .themes-table-wrapper { overflow-x: auto; margin-top: 0.5rem; border: 1.5px solid rgba(255, 255, 255, 0.06); border-radius: 0.625rem; }
    .themes-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .themes-table th { text-align: left; padding: 0.625rem 0.75rem; color: #64748b; font-weight: 600; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255, 255, 255, 0.06); background: rgba(255, 255, 255, 0.02); }
    .themes-table td { padding: 0.5rem 0.625rem; }
    .theme-number { color: #475569; font-weight: 600; width: 30px; font-size: 0.8rem; }
    .table-input { padding: 0.5rem 0.625rem !important; font-size: 0.85rem !important; border-radius: 0.375rem !important; }
  `]
})
export class InscripcionStep4Component {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
}
