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
      <p class="step-desc" style="margin-top: 0;">      Subí los archivos que necesitamos para completar tu inscripción</p>

      @if (!data().dniFrontFile || !data().dniBackFile || !data().promoPhotoFile) {
        <div class="file-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Subí todos los archivos marcados con * para continuar
        </div>
      }

      <!-- DNI: FREnte + DORSO side by side -->
      <div class="upload-grid-2col">
        <!-- DNI FRENTE -->
        <div class="upload-card">
          <div class="upload-card-header">
            <span class="upload-card-label">DNI — Frente</span>
            <span class="upload-card-required">*</span>
          </div>
          @if (data().dniFrontName) {
            <div class="upload-preview">
              @if (previews()['dniFrontFile']) {
                <img [src]="previews()['dniFrontFile']" alt="DNI Frente" class="preview-image" />
              } @else {
                <div class="preview-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/></svg></div>
              }
              <div class="preview-info">
                <span class="preview-filename">{{ data().dniFrontName }}</span>
                @if (fileSizes()['dniFrontFile']) { <span class="preview-filesize">{{ fileSizes()['dniFrontFile'] }}</span> }
              </div>
              <div class="preview-actions">
                <button type="button" class="btn-preview btn-replace" (click)="dniFrontInput.click()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></button>
                <button type="button" class="btn-preview btn-remove" (click)="removeFile.emit('dniFrontFile')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg></button>
              </div>
              <input type="file" #dniFrontInput accept="image/*" hidden (change)="onFileSelect($event, 'dniFrontFile')" />
            </div>
          } @else {
            <div class="file-drop-zone compact" [class.drag-over]="dragStates()['dniFrontFile']"
              (dragover)="onDragOver($event, 'dniFrontFile')" (dragleave)="onDragLeave($event, 'dniFrontFile')" (drop)="onDrop($event, 'dniFrontFile')" (click)="dniFrontInput.click()">
              <input type="file" #dniFrontInput accept="image/*" hidden (change)="onFileSelect($event, 'dniFrontFile')" />
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span class="drop-text">Subir archivo</span>
              <span class="drop-hint">JPG, PNG — Máx. 5MB</span>
            </div>
          }
        </div>

        <!-- DNI DORSO -->
        <div class="upload-card">
          <div class="upload-card-header">
            <span class="upload-card-label">DNI — Dorso</span>
            <span class="upload-card-required">*</span>
          </div>
          @if (data().dniBackName) {
            <div class="upload-preview">
              @if (previews()['dniBackFile']) {
                <img [src]="previews()['dniBackFile']" alt="DNI Dorso" class="preview-image" />
              } @else {
                <div class="preview-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/></svg></div>
              }
              <div class="preview-info">
                <span class="preview-filename">{{ data().dniBackName }}</span>
                @if (fileSizes()['dniBackFile']) { <span class="preview-filesize">{{ fileSizes()['dniBackFile'] }}</span> }
              </div>
              <div class="preview-actions">
                <button type="button" class="btn-preview btn-replace" (click)="dniBackInput.click()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></button>
                <button type="button" class="btn-preview btn-remove" (click)="removeFile.emit('dniBackFile')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg></button>
              </div>
              <input type="file" #dniBackInput accept="image/*" hidden (change)="onFileSelect($event, 'dniBackFile')" />
            </div>
          } @else {
            <div class="file-drop-zone compact" [class.drag-over]="dragStates()['dniBackFile']"
              (dragover)="onDragOver($event, 'dniBackFile')" (dragleave)="onDragLeave($event, 'dniBackFile')" (drop)="onDrop($event, 'dniBackFile')" (click)="dniBackInput.click()">
              <input type="file" #dniBackInput accept="image/*" hidden (change)="onFileSelect($event, 'dniBackFile')" />
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span class="drop-text">Subir archivo</span>
              <span class="drop-hint">JPG, PNG — Máx. 5MB</span>
            </div>
          }
        </div>
      </div>

      <!-- FOTO PROMOCIONAL — full width -->
      <div class="upload-card">
        <div class="upload-card-header">
          <span class="upload-card-label">Foto promocional</span>
          <span class="upload-card-required">*</span>
        </div>
        @if (data().promoPhotoName) {
          <div class="upload-preview">
            @if (previews()['promoPhotoFile']) {
              <img [src]="previews()['promoPhotoFile']" alt="Foto promocional" class="preview-image" />
            } @else {
              <div class="preview-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/></svg></div>
            }
            <div class="preview-info">
              <span class="preview-filename">{{ data().promoPhotoName }}</span>
              @if (fileSizes()['promoPhotoFile']) { <span class="preview-filesize">{{ fileSizes()['promoPhotoFile'] }}</span> }
            </div>
            <div class="preview-actions">
              <button type="button" class="btn-preview btn-replace" (click)="promoPhotoInput.click()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></button>
              <button type="button" class="btn-preview btn-remove" (click)="removeFile.emit('promoPhotoFile')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg></button>
            </div>
            <input type="file" #promoPhotoInput accept="image/*" hidden (change)="onFileSelect($event, 'promoPhotoFile')" />
          </div>
        } @else {
          <div class="file-drop-zone compact" [class.drag-over]="dragStates()['promoPhotoFile']"
            (dragover)="onDragOver($event, 'promoPhotoFile')" (dragleave)="onDragLeave($event, 'promoPhotoFile')" (drop)="onDrop($event, 'promoPhotoFile')" (click)="promoPhotoInput.click()">
            <input type="file" #promoPhotoInput accept="image/*" hidden (change)="onFileSelect($event, 'promoPhotoFile')" />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span class="drop-text">Arrastrá tu archivo o hacé click</span>
            <span class="drop-hint">JPG, PNG — Máx. 5MB</span>
          </div>
        }
      </div>

      <!-- CANCIÓN INÉDITA -->
      @if (data().category === 'musica' && data().subcategory === 'cancion_inedita') {
        <div class="file-section-divider">
          <h3 class="section-subtitle">Archivos para Canción Inédita</h3>
        </div>

        <div class="upload-grid-2col">
          <!-- LETRA -->
          <div class="upload-card">
            <div class="upload-card-header">
              <span class="upload-card-label">Letra</span>
              <span class="upload-card-required">*</span>
            </div>
            @if (data().lyricsFileName) {
              <div class="upload-preview">
                <div class="preview-placeholder preview-doc"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <div class="preview-info">
                  <span class="preview-filename">{{ data().lyricsFileName }}</span>
                  @if (fileSizes()['lyricsFile']) { <span class="preview-filesize">{{ fileSizes()['lyricsFile'] }}</span> }
                </div>
                <div class="preview-actions">
                  <button type="button" class="btn-preview btn-replace" (click)="lyricsInput.click()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></button>
                  <button type="button" class="btn-preview btn-remove" (click)="removeFile.emit('lyricsFile')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg></button>
                </div>
                <input type="file" #lyricsInput accept=".pdf,.doc,.docx,.txt" hidden (change)="onFileSelect($event, 'lyricsFile')" />
              </div>
            } @else {
              <div class="file-drop-zone compact" [class.drag-over]="dragStates()['lyricsFile']"
                (dragover)="onDragOver($event, 'lyricsFile')" (dragleave)="onDragLeave($event, 'lyricsFile')" (drop)="onDrop($event, 'lyricsFile')" (click)="lyricsInput.click()">
                <input type="file" #lyricsInput accept=".pdf,.doc,.docx,.txt" hidden (change)="onFileSelect($event, 'lyricsFile')" />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="drop-text">Subir archivo</span>
                <span class="drop-hint">PDF, DOC, TXT — Máx. 10MB</span>
              </div>
            }
          </div>

          <!-- PARTITURA -->
          <div class="upload-card">
            <div class="upload-card-header">
              <span class="upload-card-label">Partitura</span>
              <span class="upload-card-required">*</span>
            </div>
            @if (data().scoreFileName) {
              <div class="upload-preview">
                <div class="preview-placeholder preview-doc"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
                <div class="preview-info">
                  <span class="preview-filename">{{ data().scoreFileName }}</span>
                  @if (fileSizes()['scoreFile']) { <span class="preview-filesize">{{ fileSizes()['scoreFile'] }}</span> }
                </div>
                <div class="preview-actions">
                  <button type="button" class="btn-preview btn-replace" (click)="scoreInput.click()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></button>
                  <button type="button" class="btn-preview btn-remove" (click)="removeFile.emit('scoreFile')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg></button>
                </div>
                <input type="file" #scoreInput accept=".pdf,.png,.jpg,.jpeg" hidden (change)="onFileSelect($event, 'scoreFile')" />
              </div>
            } @else {
              <div class="file-drop-zone compact" [class.drag-over]="dragStates()['scoreFile']"
                (dragover)="onDragOver($event, 'scoreFile')" (dragleave)="onDragLeave($event, 'scoreFile')" (drop)="onDrop($event, 'scoreFile')" (click)="scoreInput.click()">
                <input type="file" #scoreInput accept=".pdf,.png,.jpg,.jpeg" hidden (change)="onFileSelect($event, 'scoreFile')" />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="drop-text">Subir archivo</span>
                <span class="drop-hint">PDF, PNG, JPG — Máx. 5MB</span>
              </div>
            }
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
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    .step-desc { font-size: 0.95rem; color: #94a3b8; margin-bottom: 1.25rem; line-height: 1.5; }

    .file-hint {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.875rem;
      font-size: 0.8rem;
      color: #eab308;
      background: rgba(234, 179, 8, 0.08);
      border: 1px solid rgba(234, 179, 8, 0.15);
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }
    .file-hint svg { flex-shrink: 0; }

    .upload-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem; }

    .upload-card { border: 1.5px solid rgba(255, 255, 255, 0.1); border-radius: 0.625rem; background: rgba(255, 255, 255, 0.03); overflow: hidden; transition: border-color 0.25s ease; margin-bottom: 0.75rem; }
    .upload-card-header { display: flex; align-items: center; gap: 0.3rem; padding: 0.625rem 0.875rem 0; }
    .upload-card-label { font-size: 0.7rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }
    .upload-card-required { color: #ef4444; font-size: 0.7rem; }

    .file-drop-zone.compact { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.35rem; padding: 1.5rem; margin: 0.375rem 0.5rem 0.5rem; border: 2px dashed rgba(96, 165, 250, 0.35); border-radius: 0.5rem; background: rgba(96, 165, 250, 0.06); transition: all 0.25s ease; cursor: pointer; }
    .file-drop-zone.compact:hover { border-color: rgba(96, 165, 250, 0.6); background: rgba(96, 165, 250, 0.1); }
    .file-drop-zone.compact.drag-over { border-color: #60a5fa; background: rgba(96, 165, 250, 0.15); }

    .file-drop-zone.compact svg { color: #60a5fa; }
    .file-drop-zone.compact:hover svg { color: #93c5fd; }
    .drop-text { font-size: 0.85rem; color: #e2e8f0; font-weight: 500; }
    .drop-hint { font-size: 0.7rem; color: #94a3b8; }

    .upload-preview { padding: 0.5rem 0.625rem; display: flex; align-items: center; gap: 0.625rem; animation: fadeIn 0.3s ease; }

    .preview-image { width: 52px; height: 52px; object-fit: cover; border-radius: 0.375rem; border: 1px solid rgba(255, 255, 255, 0.08); flex-shrink: 0; }

    .preview-placeholder { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; background: rgba(76, 139, 230, 0.06); border: 1px solid rgba(76, 139, 230, 0.12); border-radius: 0.375rem; color: #4c8be6; flex-shrink: 0; }
    .preview-doc { background: rgba(234, 179, 8, 0.06); border-color: rgba(234, 179, 8, 0.12); color: #eab308; }

    .preview-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
    .preview-filename { font-size: 0.78rem; font-weight: 500; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .preview-filesize { font-size: 0.65rem; color: #64748b; }

    .preview-actions { display: flex; gap: 0.25rem; flex-shrink: 0; }
    .btn-preview { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 0.375rem; cursor: pointer; transition: all 0.2s ease; background: transparent; padding: 0; }
    .btn-replace { color: #94a3b8; }
    .btn-replace:hover { color: #e2e8f0; border-color: rgba(255, 255, 255, 0.15); background: rgba(255, 255, 255, 0.04); }
    .btn-remove { color: #ef4444; }
    .btn-remove:hover { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.06); }
    .btn-preview:active { transform: scale(0.9); }

    .file-section-divider { margin: 1rem 0 0.5rem; }
    .section-subtitle { font-size: 0.8rem; font-weight: 600; color: #4c8be6; margin: 0; padding-top: 0.75rem; border-top: 1px solid rgba(255, 255, 255, 0.06); }

    @media (max-width: 640px) {
      .upload-grid-2col { grid-template-columns: 1fr; }
      .btn-preview { width: 36px; height: 36px; }
      .preview-image { width: 44px; height: 44px; }
      .preview-placeholder { width: 44px; height: 44px; }
      .file-drop-zone.compact { padding: 0.75rem; }
      .upload-card-header { padding: 0.4rem 0.625rem 0; }
      .upload-card-label { font-size: 0.6rem; }
    }

    @media (max-width: 480px) {
      .btn-preview { width: 34px; height: 34px; }
      .preview-image { width: 40px; height: 40px; }
      .preview-placeholder { width: 40px; height: 40px; }
      .preview-filename { font-size: 0.72rem; }
      .file-drop-zone.compact { padding: 0.625rem; }
      .drop-text { font-size: 0.72rem; }
      .drop-hint { font-size: 0.6rem; }
    }
  `]
})
export class InscripcionStep6Component {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();

  fileSelected = output<{ fieldName: string; file: File }>();
  removeFile = output<string>();

  dragStates = signal<Record<string, boolean>>({});
  previews = signal<Record<string, string>>({});
  fileSizes = signal<Record<string, string>>({});

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
      this.processFile(files[0], fieldName);
    }
  }

  onFileSelect(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0], fieldName);
    }
  }

  private processFile(file: File, fieldName: string): void {
    this.fileSelected.emit({ fieldName, file });
    this.fileSizes.update(s => ({ ...s, [fieldName]: this.formatSize(file.size) }));
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previews.update(s => ({ ...s, [fieldName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      this.previews.update(s => ({ ...s, [fieldName]: '' }));
    }
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
