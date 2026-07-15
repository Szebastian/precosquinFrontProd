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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (theme of data().themes; track $index; let i = $index) {
                  <tr>
                    <td class="theme-number" data-label="#">{{ i + 1 }}</td>
                    <td data-label="Tema"><input type="text" class="form-input table-input" [(ngModel)]="theme.title" [name]="'themeTitle' + i" placeholder="Nombre del tema" /></td>
                    <td data-label="Ritmo"><input type="text" class="form-input table-input" [(ngModel)]="theme.rhythm" [name]="'themeRhythm' + i" placeholder="Ej: Chacarera" /></td>
                    <td data-label="Autor"><input type="text" class="form-input table-input" [(ngModel)]="theme.author" [name]="'themeAuthor' + i" placeholder="Autor o compositor" /></td>
                    <td class="theme-actions">
                      @if (data().themes.length > 1) {
                        <button type="button" class="btn-remove-theme" (click)="removeTheme(i)" title="Quitar tema">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (data().themes.length < 10) {
            <button type="button" class="btn-add-theme" (click)="addTheme()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Agregar tema
            </button>
          }
        </div>

        <div class="form-group">
          <label class="form-label" for="biography">Contanos sobre vos o tu grupo</label>
          <textarea id="biography" name="biography" class="form-textarea" rows="4" maxlength="500"
            [(ngModel)]="data().biography"
            placeholder="Trayectoria, logros, experiencia..."></textarea>
          <span class="char-count">{{ (data().biography || '').length }} / 500</span>
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
          <textarea id="style" name="style" class="form-textarea" rows="4" maxlength="300"
            [(ngModel)]="data().style"
            placeholder="Contanos un poco del estilo: folklórico, contemporáneo..."></textarea>
          <span class="char-count">{{ (data().style || '').length }} / 300</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="danceList">¿Qué danzas incluye?</label>
          <textarea id="danceList" name="danceList" class="form-textarea" rows="4" maxlength="400"
            [(ngModel)]="data().danceList"
            placeholder="Listá las danzas o cuadros que componen tu presentación"></textarea>
          <span class="char-count">{{ (data().danceList || '').length }} / 400</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="biography">Contanos sobre vos o tu grupo</label>
          <textarea id="biography" name="biography" class="form-textarea" rows="4" maxlength="500"
            [(ngModel)]="data().biography"
            placeholder="Trayectoria, logros, experiencia..."></textarea>
          <span class="char-count">{{ (data().biography || '').length }} / 500</span>
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
    .char-count { display: block; text-align: right; font-size: 0.7rem; color: #475569; margin-top: 4px; }

    @media (max-width: 640px) {
      .themes-table-wrapper { border: none; overflow: visible; }
      .themes-table { display: block; }
      .themes-table thead { display: none; }
      .themes-table tbody { display: flex; flex-direction: column; gap: 1rem; }
      .themes-table tr {
        display: flex; flex-direction: column; gap: 0.5rem;
        padding: 0.75rem; background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 0.5rem;
      }
      .themes-table td { padding: 0; display: flex; flex-direction: column; gap: 0.25rem; }
      .themes-table td::before { content: attr(data-label); font-size: 0.65rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
      .theme-number { width: auto; font-size: 0.75rem; margin-bottom: 0.25rem; }
      .table-input { padding: 0.45rem 0.5rem !important; font-size: 0.8rem !important; }
      .form-textarea { min-height: 80px; }
      .char-count { font-size: 0.65rem; }
    }

    @media (max-width: 480px) {
      .table-input { padding: 0.4rem 0.45rem !important; font-size: 0.75rem !important; }
      .form-textarea { min-height: 70px; font-size: 0.85rem; }
      .themes-table tr { padding: 0.5rem; }
    }

    .theme-actions { width: 30px; }
    .btn-remove-theme {
      background: none; border: none; color: #64748b; cursor: pointer;
      padding: 0.25rem; border-radius: 0.25rem; transition: all 0.15s ease;
      display: flex; align-items: center; justify-content: center;
    }
    .btn-remove-theme:hover { color: #f87171; background: rgba(248, 113, 113, 0.1); }

    .btn-add-theme {
      display: inline-flex; align-items: center; gap: 0.4rem;
      margin-top: 0.75rem; padding: 0.5rem 0.875rem;
      font-size: 0.8rem; font-weight: 600; color: #4ade80;
      background: rgba(74, 222, 128, 0.06); border: 1.5px dashed rgba(74, 222, 128, 0.25);
      border-radius: 0.5rem; cursor: pointer; transition: all 0.15s ease;
    }
    .btn-add-theme:hover { background: rgba(74, 222, 128, 0.12); border-color: rgba(74, 222, 128, 0.4); }
  `]
})
export class InscripcionStep4Component {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();

  addTheme(): void {
    (this.data() as any).themes.push({ title: '', rhythm: '', author: '' });
  }

  removeTheme(index: number): void {
    (this.data() as any).themes.splice(index, 1);
  }
}
