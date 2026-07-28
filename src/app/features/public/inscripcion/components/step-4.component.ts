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

        <!-- Regla: Sin pistas ni bases pregrabadas -->
        @if (data().subcategory !== 'cancion_inedita') {
          <div class="alert-info">
            <strong>Reglamento:</strong> No se permiten pistas ni bases pregrabadas. Presentación en vivo. Sin cambio de instrumento.
          </div>
        }

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

        <!-- Regla: Sin pistas pregrabadas (Malambo) -->
        @if (needsDanceStyle()) {
          <div class="alert-info">
            <strong>Reglamento:</strong> Los malambos presentan en vivo con 4 músicos acompañantes (guitarra, violín, bombo y contrabajo). Sin pistas pregrabadas.
          </div>
        }

        <div class="form-group">
          <label class="form-label" for="proposalName">¿Cómo se llama tu propuesta?</label>
          <input type="text" id="proposalName" name="proposalName" class="form-input"
            [(ngModel)]="data().proposalName" placeholder="Ej: Zamba del Tropero" />
        </div>

        <div class="form-group">
          <label class="form-label" for="choreographerName">¿Quién es el coreógrafo? *</label>
          <input type="text" id="choreographerName" name="choreographerName" class="form-input" required
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

        <!-- DANZA: Danzas (Parejas) - 3 títulos -->
        @if (needsDanceThemes()) {
          <div class="dance-themes-section">
            <span class="section-label">{{ data().subcategory === 'pareja_tradicional' ? 'Rondas de presentación' : 'Danzas a presentar' }} *</span>
            @if (data().subcategory === 'pareja_tradicional') {
              <p class="field-hint">Cargá el nombre de la danza y la canción para cada ronda</p>
            }
            @for (theme of data().danceThemes; track $index; let i = $index) {
              <div class="dance-round-card">
                <div class="dance-round-header">
                  <span class="dance-round-number">Ronda {{ i + 1 }}</span>
                  @if (i === 2) {
                    <span class="dance-round-badge">Final</span>
                  }
                </div>
                <div class="dance-round-fields">
                  <div class="form-group">
                    <label class="form-label">Nombre de la danza *</label>
                    <input type="text" class="form-input" [(ngModel)]="theme.title" [name]="'danceTheme' + i"
                      placeholder="Ej: Chacarera, Zamba, Gato..." />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Canción / Tema *</label>
                    <input type="text" class="form-input" [(ngModel)]="theme.song" [name]="'danceSong' + i"
                      placeholder="Nombre de la canción" />
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- DANZA: Nombre de la obra (Conjunto Baile) -->
        @if (needsWorkTitle()) {
          <div class="form-group">
            <label class="form-label" for="workTitle">Nombre de la obra *</label>
            <input type="text" id="workTitle" name="workTitle" class="form-input"
              [(ngModel)]="data().workTitle" placeholder="Nombre de la obra a presentar" />
          </div>
        }

        <!-- DANZA: Música MP3 -->
        @if (needsDanceMp3()) {
          <div class="dance-mp3-section">
            <span class="section-label">Música (MP3) *</span>
            <p class="field-hint">Subí el archivo MP3 con la música para tus danzas. Recordá traer un <strong>pendrive exclusivo</strong> con los temas el día de la presentación.</p>
            @if (data().danceMp3FileName) {
              <div class="file-loaded">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                <span class="file-loaded-name">{{ data().danceMp3FileName }}</span>
                <button type="button" class="btn-remove-file" (click)="removeDanceMp3()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            } @else {
              <label class="file-drop-zone" (dragover)="$event.preventDefault()" (drop)="$event.preventDefault(); onMp3Drop($event)">
                <input type="file" accept="audio/mpeg,audio/mp3" (change)="onMp3Select($event)" hidden />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Hacé click o arrastrá tu archivo MP3</span>
                <span class="file-drop-hint">MP3, máx. 10MB</span>
              </label>
            }
          </div>
        }

        <!-- DANZA: Banda de Música (Pareja Tradicional) -->
        @if (needsBandMembers()) {
          <div class="band-members-section">
            <span class="section-label">Banda de Músico(s) Acompañante(s) *</span>
            <p class="field-hint">Agregá los integrantes de la banda que te acompaña</p>

            @for (member of data().bandMembers; track $index; let i = $index) {
              <div class="band-member-card">
                <div class="band-member-header">
                  <span class="band-member-number">Músico {{ i + 1 }}</span>
                  <button type="button" class="btn-remove" (click)="removeBandMember.emit(i)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Nombre y apellido</label>
                    <input type="text" class="form-input" [(ngModel)]="member.fullName" [name]="'bandName' + i" placeholder="Nombre completo" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Instrumento</label>
                    <input type="text" class="form-input" [(ngModel)]="member.instrument" [name]="'bandInstrument' + i" placeholder="Ej: Guitarra, Acordeón..." />
                  </div>
                </div>
              </div>
            }

            <button type="button" class="btn-add-band-member" (click)="addBandMember.emit()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Agregar músico
            </button>
          </div>
        }

        <!-- DANZA: Asistentes (Pareja Tradicional) -->
        @if (needsAssistants()) {
          <div class="form-group">
            <label class="form-label" for="assistantsCount">Cantidad de asistentes</label>
            <input type="number" id="assistantsCount" name="assistantsCount" class="form-input"
              [(ngModel)]="data().assistantsCount" min="0" max="10" placeholder="0" />
            <span class="field-hint">Personas que te acompañan como asistentes técnicos</span>
          </div>
        }

        <!-- DANZA: Aviso de fotografía -->
        @if (data().subcategory === 'pareja_tradicional') {
          <div class="danza-requirement-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Recordá traer una <strong>fotografía</strong> de la pareja y un <strong>pendrive exclusivo</strong> con los temas musicales el día de la presentación.</span>
          </div>
        }

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

    /* Danza sections */
    .section-label { font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem; display: block; }
    .field-hint { font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.75rem; }

    .dance-themes-section { margin-bottom: 1.25rem; }

    .dance-round-card {
      background: rgba(255, 255, 255, 0.02); border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.75rem; padding: 1rem; margin-bottom: 0.75rem; transition: border-color 0.2s ease;
    }
    .dance-round-card:hover { border-color: rgba(255, 255, 255, 0.15); }
    .dance-round-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .dance-round-number { font-size: 0.8rem; font-weight: 600; color: #4c8be6; }
    .dance-round-badge { font-size: 0.65rem; font-weight: 600; color: #f59e0b; background: rgba(245, 158, 11, 0.1); padding: 0.15rem 0.5rem; border-radius: 9999px; }
    .dance-round-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

    .dance-mp3-section { margin-bottom: 1.25rem; }

    .band-members-section { margin-bottom: 1.25rem; }
    .band-member-card {
      background: rgba(255, 255, 255, 0.02); border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.75rem; padding: 0.875rem; margin-bottom: 0.75rem;
    }
    .band-member-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; }
    .band-member-number { font-size: 0.75rem; font-weight: 600; color: #4c8be6; }
    .btn-remove { background: none; border: none; color: #64748b; cursor: pointer; padding: 0.25rem; border-radius: 0.25rem; transition: all 0.15s ease; display: flex; }
    .btn-remove:hover { color: #f87171; background: rgba(248, 113, 113, 0.1); }
    .btn-add-band-member {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.5rem 0.875rem; font-size: 0.8rem; font-weight: 600; color: #4ade80;
      background: rgba(74, 222, 128, 0.06); border: 1.5px dashed rgba(74, 222, 128, 0.25);
      border-radius: 0.5rem; cursor: pointer; transition: all 0.15s ease;
    }
    .btn-add-band-member:hover { background: rgba(74, 222, 128, 0.12); border-color: rgba(74, 222, 128, 0.4); }

    .danza-requirement-banner {
      display: flex; align-items: flex-start; gap: 0.75rem;
      padding: 0.875rem 1rem; background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 0.75rem; font-size: 0.8rem; color: #94a3b8; line-height: 1.5; margin-bottom: 1.25rem;
    }
    .danza-requirement-banner svg { flex-shrink: 0; margin-top: 2px; color: #f59e0b; }
    .danza-requirement-banner strong { color: #fbbf24; font-weight: 600; }
    .file-loaded { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: rgba(74, 222, 128, 0.06); border: 1px solid rgba(74, 222, 128, 0.2); border-radius: 0.5rem; }
    .file-loaded svg { color: #4ade80; flex-shrink: 0; }
    .file-loaded-name { font-size: 0.85rem; color: #e2e8f0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .btn-remove-file { background: none; border: none; color: #64748b; cursor: pointer; padding: 0.25rem; border-radius: 0.25rem; transition: all 0.15s ease; display: flex; align-items: center; }
    .btn-remove-file:hover { color: #f87171; background: rgba(248, 113, 113, 0.1); }

    .file-drop-zone { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.5rem; border: 1.5px dashed rgba(255, 255, 255, 0.12); border-radius: 0.75rem; background: rgba(255, 255, 255, 0.02); cursor: pointer; transition: all 0.2s ease; text-align: center; }
    .file-drop-zone:hover { border-color: rgba(76, 139, 230, 0.4); background: rgba(76, 139, 230, 0.04); }
    .file-drop-zone svg { color: #64748b; }
    .file-drop-zone span { font-size: 0.85rem; color: #94a3b8; }
    .file-drop-hint { font-size: 0.7rem; color: #475569; }
  `]
})
export class InscripcionStep4Component {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
  fileSelected = output<{ fieldName: string; file: File }>();
  addBandMember = output<void>();
  removeBandMember = output<number>();

  addTheme(): void {
    (this.data() as any).themes.push({ title: '', rhythm: '', author: '' });
  }

  removeTheme(index: number): void {
    (this.data() as any).themes.splice(index, 1);
  }

  needsDanceThemes(): boolean {
    return ['pareja_tradicional', 'pareja_estilizada'].includes(this.data().subcategory);
  }

  needsDanceStyle(): boolean {
    return ['malambo_masculino', 'malambo_femenino'].includes(this.data().subcategory);
  }

  needsDanceMp3(): boolean {
    return ['pareja_tradicional', 'pareja_estilizada', 'conjunto_baile'].includes(this.data().subcategory);
  }

  needsWorkTitle(): boolean {
    return this.data().subcategory === 'conjunto_baile';
  }

  needsAssistants(): boolean {
    return this.data().subcategory === 'pareja_tradicional';
  }

  needsBandMembers(): boolean {
    return this.data().subcategory === 'pareja_tradicional';
  }

  onMp3Select(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.fileSelected.emit({ fieldName: 'danceMp3File', file: input.files[0] });
    }
  }

  onMp3Drop(event: DragEvent): void {
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (file.type === 'audio/mpeg' || file.name.endsWith('.mp3')) {
        this.fileSelected.emit({ fieldName: 'danceMp3File', file });
      }
    }
  }

  removeDanceMp3(): void {
    (this.data() as any).danceMp3File = null;
    (this.data() as any).danceMp3FileName = '';
  }
}
