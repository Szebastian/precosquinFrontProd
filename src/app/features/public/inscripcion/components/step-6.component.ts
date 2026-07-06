import { Component, input, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionData } from '../inscripcion.page';

@Component({
  selector: 'app-inscripcion-step-6',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
      <p class="step-desc" style="margin-top: 0;">Subí los archivos requeridos para completar tu inscripción</p>

      <div class="form-group">
        <label class="form-label">Foto de DNI — Frente</label>
        <div class="file-upload-area">
          <div class="file-drop-zone" [class.drag-over]="dragStates()['dniFrontFile']" [class.has-file]="data().dniFrontName"
            (dragover)="onDragOver($event, 'dniFrontFile')" (dragleave)="onDragLeave($event, 'dniFrontFile')" (drop)="onDrop($event, 'dniFrontFile')">
            <label class="file-upload-btn">
              <input type="file" #dniFrontInput accept="image/*" hidden (change)="onFileSelect($event, 'dniFrontFile')" />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Seleccionar archivo
            </label>
            <span class="file-name-display">{{ data().dniFrontName || 'Arrastrá un archivo o hacé click' }}</span>
            @if (dragStates()['dniFrontFile']) {
              <span class="drag-over-text">Soltá el archivo aquí</span>
            }
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Foto de DNI — Dorso</label>
        <div class="file-upload-area">
          <div class="file-drop-zone" [class.drag-over]="dragStates()['dniBackFile']" [class.has-file]="data().dniBackName"
            (dragover)="onDragOver($event, 'dniBackFile')" (dragleave)="onDragLeave($event, 'dniBackFile')" (drop)="onDrop($event, 'dniBackFile')">
            <label class="file-upload-btn">
              <input type="file" #dniBackInput accept="image/*" hidden (change)="onFileSelect($event, 'dniBackFile')" />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Seleccionar archivo
            </label>
            <span class="file-name-display">{{ data().dniBackName || 'Arrastrá un archivo o hacé click' }}</span>
            @if (dragStates()['dniBackFile']) {
              <span class="drag-over-text">Soltá el archivo aquí</span>
            }
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Foto promocional del artista o grupo</label>
        <div class="file-upload-area">
          <div class="file-drop-zone" [class.drag-over]="dragStates()['promoPhotoFile']" [class.has-file]="data().promoPhotoName"
            (dragover)="onDragOver($event, 'promoPhotoFile')" (dragleave)="onDragLeave($event, 'promoPhotoFile')" (drop)="onDrop($event, 'promoPhotoFile')">
            <label class="file-upload-btn">
              <input type="file" #promoPhotoInput accept="image/*" hidden (change)="onFileSelect($event, 'promoPhotoFile')" />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Seleccionar archivo
            </label>
            <span class="file-name-display">{{ data().promoPhotoName || 'Arrastrá un archivo o hacé click' }}</span>
            @if (dragStates()['promoPhotoFile']) {
              <span class="drag-over-text">Soltá el archivo aquí</span>
            }
          </div>
        </div>
      </div>

      @if (data().category === 'musica') {
        <div class="file-section-divider">
          <h3 class="section-subtitle">Archivos para Canción Inédita</h3>
        </div>

        <div class="form-group">
          <label class="form-label">Letra de la canción</label>
          <div class="file-upload-area">
            <div class="file-drop-zone" [class.drag-over]="dragStates()['lyricsFile']" [class.has-file]="data().lyricsFileName"
              (dragover)="onDragOver($event, 'lyricsFile')" (dragleave)="onDragLeave($event, 'lyricsFile')" (drop)="onDrop($event, 'lyricsFile')">
              <label class="file-upload-btn">
                <input type="file" #lyricsInput accept=".pdf,.doc,.docx,.txt" hidden (change)="onFileSelect($event, 'lyricsFile')" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                Seleccionar archivo
              </label>
              <span class="file-name-display">{{ data().lyricsFileName || 'Arrastrá un archivo o hacé click' }}</span>
              @if (dragStates()['lyricsFile']) {
                <span class="drag-over-text">Soltá el archivo aquí</span>
              }
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Partitura</label>
          <div class="file-upload-area">
            <div class="file-drop-zone" [class.drag-over]="dragStates()['scoreFile']" [class.has-file]="data().scoreFileName"
              (dragover)="onDragOver($event, 'scoreFile')" (dragleave)="onDragLeave($event, 'scoreFile')" (drop)="onDrop($event, 'scoreFile')">
              <label class="file-upload-btn">
                <input type="file" #scoreInput accept=".pdf,.png,.jpg,.jpeg" hidden (change)="onFileSelect($event, 'scoreFile')" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                Seleccionar archivo
              </label>
              <span class="file-name-display">{{ data().scoreFileName || 'Arrastrá un archivo o hacé click' }}</span>
              @if (dragStates()['scoreFile']) {
                <span class="drag-over-text">Soltá el archivo aquí</span>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .step-content { min-height: 200px; }
    .slide-left { animation: slideLeft 0.3s ease-out; }
    .slide-right { animation: slideRight 0.3s ease-out; }
    .file-section-divider { margin: var(--space-6) 0 var(--space-2); }
    .section-subtitle { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--brand-400); margin: 0 0 var(--space-4); padding-top: var(--space-4); border-top: 1px solid rgba(255, 255, 255, 0.1); }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class InscripcionStep6Component {
  data = input.required<any>();
  lastDirection = input.required<'left' | 'right'>();

  fileSelected = output<{ fieldName: string; file: File }>();

  dragStates = signal<Record<string, boolean>>({});

  onDragOver(event: DragEvent, fieldName: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragStates.update(s => ({ ...s, [fieldName]: true }));
  }

  onDragLeave(event: DragEvent, fieldName: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragStates.update(s => ({ ...s, [fieldName]: false }));
  }

  onDrop(event: DragEvent, fieldName: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragStates.update(s => ({ ...s, [fieldName]: false }));
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.fileSelected.emit({ fieldName, file: files[0] });
    }
  }

  onFileSelect(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileSelected.emit({ fieldName, file: input.files[0] });
    }
  }
}
