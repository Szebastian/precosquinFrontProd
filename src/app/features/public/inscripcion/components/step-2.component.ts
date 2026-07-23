import { Component, input, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionData, MELODIC_INSTRUMENTS, HARMONIC_INSTRUMENTS } from '../inscripcion.page';
import { subcategoriesByCategory, groupSubcategories } from '../inscripcion.page';

@Component({
  selector: 'app-inscripcion-step-2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
      <p class="step-desc" style="margin-top: 0;">Elegí en qué querés competir</p>

      <!-- CATEGORÍA -->
      <span class="section-label">¿Qué vas a presentar? *</span>
      @if (!data().category) {
        <div class="field-hint">Seleccioná una categoría para continuar</div>
      }
      <div class="category-cards">
        <label class="category-card" [class.selected]="data().category === 'musica'">
          <input type="radio" name="category" value="musica" [(ngModel)]="data().category" (ngModelChange)="onCategoryChange()" />
          <div class="category-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <div class="category-info">
            <span class="category-name">Música</span>
            <span class="category-count">{{ musicaCount() }} subcategorías</span>
          </div>
        </label>
        <label class="category-card" [class.selected]="data().category === 'danza'">
          <input type="radio" name="category" value="danza" [(ngModel)]="data().category" (ngModelChange)="onCategoryChange()" />
          <div class="category-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="5" r="3"/><path d="M12 8v4l-3 5"/><path d="M12 12l3 5"/><path d="M9 22l3-5 3 5"/>
            </svg>
          </div>
          <div class="category-info">
            <span class="category-name">Danza</span>
            <span class="category-count">{{ danzaCount() }} subcategorías</span>
          </div>
        </label>
      </div>

      <!-- SUBCATEGORÍA -->
      @if (data().category) {
        <div class="subcategory-section">
          <span class="section-label">¿En cuál categoría? *</span>
          <div class="subcategory-grid">
            @for (sub of currentSubcategories; track sub.id) {
              <label class="subcategory-chip" [class.selected]="data().subcategory === sub.id">
                <input type="radio" name="subcategory" [value]="sub.id" [(ngModel)]="data().subcategory" (ngModelChange)="onSubcategoryChange()" />
                {{ sub.name }}
              </label>
            }
          </div>
        </div>
      }

      <!-- SOLISTA INSTRUMENTAL - Art. 31 -->
      @if (data().subcategory === 'solista_instrumental') {
        <div class="instrument-section" @fadeIn>
          <div class="regulation-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Art. 31 - Reglamento Precosquín
          </div>

          <!-- Tipo de instrumento -->
          <span class="section-label">¿Qué tipo de instrumento tocás? *</span>
          @if (!data().instrumentType) {
            <div class="field-hint">Elegí si tu instrumento es melódico o armónico</div>
          }
          <div class="instrument-type-cards">
            <label class="instrument-type-card" [class.selected]="data().instrumentType === 'melodico'">
              <input type="radio" name="instrumentType" value="melodico" [(ngModel)]="data().instrumentType" (ngModelChange)="onInstrumentTypeChange()" />
              <div class="instrument-type-icon melodico">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <div class="instrument-type-info">
                <span class="instrument-type-name">Melódico</span>
                <span class="instrument-type-desc">Produce una nota a la vez</span>
                <span class="instrument-type-rule">Podés tener 1 acompañamiento armónico</span>
              </div>
            </label>
            <label class="instrument-type-card" [class.selected]="data().instrumentType === 'armonico'">
              <input type="radio" name="instrumentType" value="armonico" [(ngModel)]="data().instrumentType" (ngModelChange)="onInstrumentTypeChange()" />
              <div class="instrument-type-icon armonico">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 18v2"/><path d="M18 18v2"/><path d="M12 6v12"/>
                </svg>
              </div>
              <div class="instrument-type-info">
                <span class="instrument-type-name">Armónico</span>
                <span class="instrument-type-desc">Permite acordes simultáneos</span>
                <span class="instrument-type-rule">Presentación en solitario</span>
              </div>
            </label>
          </div>

          <!-- Instrumento específico -->
          @if (data().instrumentType) {
            <div class="specific-instrument-section">
              <span class="section-label">¿Qué instrumento tocás? *</span>
              <div class="instrument-chips">
                @for (inst of currentInstrumentList; track inst) {
                  <label class="instrument-chip" [class.selected]="data().instrumentName === inst">
                    <input type="radio" name="instrumentName" [value]="inst" [(ngModel)]="data().instrumentName" />
                    {{ inst }}
                  </label>
                }
              </div>
              @if (data().instrumentName === 'Otro') {
                <div class="other-instrument-input">
                  <input type="text" class="form-input" placeholder="Escribí tu instrumento"
                    [(ngModel)]="data().instrumentName" name="otherInstrument" />
                </div>
              }
            </div>
          }

          <!-- ACOMPAÑAMIENTO (solo para melódicos) -->
          @if (data().instrumentType === 'melodico' && data().instrumentName) {
            <div class="accompaniment-section">
              <div class="accompaniment-header">
                <span class="section-label">¿Vas a tener acompañamiento? *</span>
                <span class="accompaniment-optional">Opcional</span>
              </div>

              <label class="toggle-label">
                <input type="checkbox" [(ngModel)]="data().hasAccompaniment" (ngModelChange)="onAccompanimentToggle()" />
                <span class="toggle-switch"></span>
                <span class="toggle-text">Sí, voy a tener un músico acompañante</span>
              </label>

              @if (data().hasAccompaniment) {
                <div class="accompaniment-form">
                  <div class="rule-notice">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <div>
                      <strong>Reglas del acompañamiento:</strong>
                      <ul>
                        <li>Solo 1 músico acompañante</li>
                        <li>Debe ser instrumento armónico</li>
                        <li>Sin participación melódica destacada</li>
                        <li>Solo función de base armónica</li>
                      </ul>
                    </div>
                  </div>

                  <span class="section-label">¿Qué instrumento toca el acompañante? *</span>
                  <div class="instrument-chips">
                    @for (inst of harmonicInstruments; track inst) {
                      <label class="instrument-chip" [class.selected]="data().accompanimentInstrument === inst">
                        <input type="radio" name="accompanimentInstrument" [value]="inst" [(ngModel)]="data().accompanimentInstrument" />
                        {{ inst }}
                      </label>
                    }
                  </div>

                  <span class="section-label">Nombre del acompañante *</span>
                  <input type="text" class="form-input" placeholder="Nombre y apellido"
                    [(ngModel)]="data().accompanimentMusician" name="accompanimentMusician" />
                </div>
              }
            </div>
          }

          <!-- REGLAS GENERALES -->
          <div class="rules-summary">
            <h4>Reglas generales para Solista Instrumental</h4>
            <ul>
              <li>La presentación debe ser puramente instrumental</li>
              <li>Un (1) único instrumento para el solista</li>
              <li>No se permiten pistas ni bases pregrabadas</li>
              <li>No se permite cambio de instrumento durante la presentación</li>
            </ul>
          </div>
        </div>
      }

      <!-- DANZA - Estilo del Malambo -->
      @if (isDanza() && data().subcategory) {
        <div class="danza-section" @fadeIn>
          <div class="danza-info-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>{{ getDanzaInfo() }}</span>
          </div>

          @if (needsDanceStyle()) {
            <div class="dance-style-selector">
              <span class="section-label">Estilo del Malambo *</span>
              <div class="dance-style-cards">
                <label class="dance-style-card" [class.selected]="data().danceStyle === 'norteno'">
                  <input type="radio" name="danceStyle" value="norteno" [(ngModel)]="data().danceStyle" />
                  <div class="dance-style-info">
                    <span class="dance-style-name">Norteño</span>
                    <span class="dance-style-desc">Ritmo enérgico del norte</span>
                  </div>
                </label>
                <label class="dance-style-card" [class.selected]="data().danceStyle === 'sureno'">
                  <input type="radio" name="danceStyle" value="sureno" [(ngModel)]="data().danceStyle" />
                  <div class="dance-style-info">
                    <span class="dance-style-name">Sureño</span>
                    <span class="dance-style-desc">Ritmo melancólico del sur</span>
                  </div>
                </label>
              </div>
            </div>
          }
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
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .step-desc { font-size: 0.95rem; color: #94a3b8; margin-bottom: 1.75rem; line-height: 1.5; }

    .section-label { font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem; display: block; }

    .field-hint { font-size: 0.8rem; color: #eab308; margin-bottom: 0.75rem; padding: 0.5rem 0.75rem; background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.15); border-radius: 0.5rem; }

    .category-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
    .category-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; border: 1.5px solid rgba(255, 255, 255, 0.08); border-radius: 0.75rem; background: rgba(255, 255, 255, 0.02); cursor: pointer; transition: all 0.25s ease; }
    .category-card input[type="radio"] { display: none; }
    .category-card:hover { border-color: rgba(255, 255, 255, 0.15); background: rgba(255, 255, 255, 0.04); }
    .category-card.selected { border-color: #4c8be6; background: rgba(76, 139, 230, 0.08); box-shadow: 0 0 20px rgba(76, 139, 230, 0.08); }
    .category-card.selected .category-icon { background: rgba(76, 139, 230, 0.15); color: #7eb5f7; }
    .category-card.selected .category-name { color: #e2e8f0; }
    .category-icon { width: 48px; height: 48px; border-radius: 0.625rem; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); color: #64748b; flex-shrink: 0; transition: all 0.25s ease; }
    .category-card.selected .category-icon svg { stroke: #7eb5f7; }
    .category-info { display: flex; flex-direction: column; gap: 0.15rem; }
    .category-name { font-size: 1rem; font-weight: 600; color: #cbd5e1; transition: color 0.25s ease; }
    .category-count { font-size: 0.75rem; color: #475569; }

    .subcategory-section { animation: fadeIn 0.35s ease-out; margin-bottom: 2rem; }
    .subcategory-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .subcategory-chip { display: inline-flex; align-items: center; padding: 0.6rem 1.1rem; border: 1.5px solid rgba(255, 255, 255, 0.08); border-radius: 9999px; background: transparent; color: #94a3b8; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; }
    .subcategory-chip input[type="radio"] { display: none; }
    .subcategory-chip:hover { border-color: rgba(255, 255, 255, 0.18); color: #e2e8f0; background: rgba(255, 255, 255, 0.03); }
    .subcategory-chip.selected { border-color: #4c8be6; background: rgba(76, 139, 230, 0.1); color: #7eb5f7; font-weight: 600; }

    /* Solista Instrumental Section */
    .instrument-section { animation: fadeIn 0.4s ease-out; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.06); }

    .regulation-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.875rem; font-size: 0.75rem; font-weight: 600; color: #60a5fa; background: rgba(76, 139, 230, 0.1); border: 1px solid rgba(76, 139, 230, 0.2); border-radius: 9999px; margin-bottom: 1.25rem; }
    .regulation-badge svg { color: #60a5fa; }

    .instrument-type-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; }
    .instrument-type-card { display: flex; align-items: flex-start; gap: 0.875rem; padding: 1rem; border: 1.5px solid rgba(255, 255, 255, 0.08); border-radius: 0.75rem; background: rgba(255, 255, 255, 0.02); cursor: pointer; transition: all 0.25s ease; }
    .instrument-type-card input[type="radio"] { display: none; }
    .instrument-type-card:hover { border-color: rgba(255, 255, 255, 0.15); background: rgba(255, 255, 255, 0.04); }
    .instrument-type-card.selected { border-color: #4c8be6; background: rgba(76, 139, 230, 0.08); }
    .instrument-type-card.selected .instrument-type-icon { background: rgba(76, 139, 230, 0.15); color: #7eb5f7; }
    .instrument-type-icon { width: 44px; height: 44px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); color: #64748b; flex-shrink: 0; transition: all 0.25s ease; }
    .instrument-type-icon.melodico { color: #a78bfa; }
    .instrument-type-icon.armonico { color: #34d399; }
    .instrument-type-card.selected .instrument-type-icon.melodico { background: rgba(167, 139, 250, 0.15); color: #a78bfa; }
    .instrument-type-card.selected .instrument-type-icon.armonico { background: rgba(52, 211, 153, 0.15); color: #34d399; }
    .instrument-type-info { display: flex; flex-direction: column; gap: 0.15rem; }
    .instrument-type-name { font-size: 0.9rem; font-weight: 600; color: #e2e8f0; }
    .instrument-type-desc { font-size: 0.75rem; color: #94a3b8; }
    .instrument-type-rule { font-size: 0.7rem; color: #60a5fa; font-weight: 500; }

    .specific-instrument-section { margin-bottom: 1.5rem; }
    .instrument-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .instrument-chip { display: inline-flex; align-items: center; padding: 0.5rem 0.875rem; border: 1.5px solid rgba(255, 255, 255, 0.08); border-radius: 9999px; background: transparent; color: #94a3b8; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; }
    .instrument-chip input[type="radio"] { display: none; }
    .instrument-chip:hover { border-color: rgba(255, 255, 255, 0.18); color: #e2e8f0; }
    .instrument-chip.selected { border-color: #4c8be6; background: rgba(76, 139, 230, 0.1); color: #7eb5f7; font-weight: 600; }

    .other-instrument-input { margin-top: 0.75rem; }
    .other-instrument-input .form-input { max-width: 300px; }

    .form-input { width: 100%; padding: 0.625rem 0.875rem; font-size: 0.9rem; color: #f1f5f9; background: rgba(255, 255, 255, 0.04); border: 1.5px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; outline: none; transition: border-color 0.2s ease; }
    .form-input:focus { border-color: #4c8be6; box-shadow: 0 0 0 2px rgba(76, 139, 230, 0.12); }
    .form-input::placeholder { color: #475569; }

    /* Accompaniment */
    .accompaniment-section { margin-bottom: 1.5rem; padding: 1rem; background: rgba(76, 139, 230, 0.04); border: 1px solid rgba(76, 139, 230, 0.12); border-radius: 0.75rem; }
    .accompaniment-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .accompaniment-optional { font-size: 0.65rem; font-weight: 600; color: #94a3b8; background: rgba(255, 255, 255, 0.06); padding: 0.2rem 0.5rem; border-radius: 9999px; }

    .toggle-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; padding: 0.5rem 0; }
    .toggle-label input[type="checkbox"] { display: none; }
    .toggle-switch { position: relative; width: 44px; height: 24px; background: rgba(255, 255, 255, 0.1); border-radius: 12px; transition: background 0.2s ease; flex-shrink: 0; }
    .toggle-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #94a3b8; border-radius: 50%; transition: all 0.2s ease; }
    .toggle-label input:checked + .toggle-switch { background: #4c8be6; }
    .toggle-label input:checked + .toggle-switch::after { left: 22px; background: #fff; }
    .toggle-text { font-size: 0.85rem; color: #cbd5e1; }

    .accompaniment-form { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(76, 139, 230, 0.15); animation: fadeIn 0.3s ease-out; }

    .rule-notice { display: flex; gap: 0.75rem; padding: 0.75rem; background: rgba(234, 179, 8, 0.06); border: 1px solid rgba(234, 179, 8, 0.15); border-radius: 0.5rem; margin-bottom: 1rem; }
    .rule-notice svg { color: #eab308; flex-shrink: 0; margin-top: 2px; }
    .rule-notice strong { font-size: 0.8rem; color: #fbbf24; display: block; margin-bottom: 0.35rem; }
    .rule-notice ul { margin: 0; padding-left: 1rem; list-style: disc; }
    .rule-notice li { font-size: 0.75rem; color: #94a3b8; line-height: 1.5; }

    /* Rules Summary */
    .rules-summary { margin-top: 1.5rem; padding: 1rem; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 0.75rem; }
    .rules-summary h4 { font-size: 0.8rem; font-weight: 600; color: #e2e8f0; margin: 0 0 0.5rem; }
    .rules-summary ul { margin: 0; padding-left: 1.25rem; list-style: disc; }
    .rules-summary li { font-size: 0.75rem; color: #94a3b8; line-height: 1.6; }

    /* Danza Section */
    .danza-section { animation: fadeIn 0.4s ease-out; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.06); }
    .danza-info-banner { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.875rem 1rem; background: rgba(76, 139, 230, 0.06); border: 1px solid rgba(76, 139, 230, 0.15); border-radius: 0.75rem; margin-bottom: 1.5rem; font-size: 0.8rem; color: #94a3b8; line-height: 1.5; }
    .danza-info-banner svg { color: #60a5fa; flex-shrink: 0; margin-top: 2px; }

    .dance-style-selector { margin-top: 1rem; }
    .dance-style-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .dance-style-card { display: flex; align-items: center; gap: 0.875rem; padding: 1rem; border: 1.5px solid rgba(255, 255, 255, 0.08); border-radius: 0.75rem; background: rgba(255, 255, 255, 0.02); cursor: pointer; transition: all 0.25s ease; }
    .dance-style-card input[type="radio"] { display: none; }
    .dance-style-card:hover { border-color: rgba(255, 255, 255, 0.15); background: rgba(255, 255, 255, 0.04); }
    .dance-style-card.selected { border-color: #4c8be6; background: rgba(76, 139, 230, 0.08); }
    .dance-style-info { display: flex; flex-direction: column; gap: 0.15rem; }
    .dance-style-name { font-size: 0.9rem; font-weight: 600; color: #e2e8f0; }
    .dance-style-desc { font-size: 0.75rem; color: #94a3b8; }

    @media (max-width: 640px) {
      .category-cards { grid-template-columns: 1fr; }
      .category-card { padding: 1rem; }
      .subcategory-chip { font-size: 0.8rem; padding: 0.5rem 0.9rem; min-height: 38px; }
      .field-hint { font-size: 0.75rem; padding: 0.4rem 0.625rem; }
      .section-label { font-size: 0.65rem; }
      .instrument-type-cards { grid-template-columns: 1fr; }
      .instrument-type-card { padding: 0.875rem; }
      .instrument-chip { min-height: 36px; }
    }

    @media (max-width: 480px) {
      .category-card { padding: 0.875rem; gap: 0.75rem; }
      .category-icon { width: 40px; height: 40px; }
      .category-name { font-size: 0.9rem; }
      .subcategory-chip { font-size: 0.75rem; padding: 0.45rem 0.75rem; min-height: 36px; }
      .instrument-type-card { gap: 0.625rem; }
      .instrument-type-icon { width: 38px; height: 38px; }
      .instrument-type-name { font-size: 0.85rem; }
      .instrument-chip { font-size: 0.75rem; padding: 0.4rem 0.7rem; }
    }
  `]
})
export class InscripcionStep2Component {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
  goToStep = output<number>();
  subcategoryChanged = output<void>();

  melodicInstruments = MELODIC_INSTRUMENTS;
  harmonicInstruments = HARMONIC_INSTRUMENTS;

  onCategoryChange(): void {
    (this.data() as any).category = this.data().category;
    (this.data() as any).subcategory = '';
    this.resetInstrumentFields();
    this.resetDanceFields();
    this.subcategoryChanged.emit();
  }

  onSubcategoryChange(): void {
    this.resetInstrumentFields();
    this.resetDanceFields();
    this.subcategoryChanged.emit();
  }

  onInstrumentTypeChange(): void {
    (this.data() as any).instrumentName = '';
    (this.data() as any).hasAccompaniment = false;
    (this.data() as any).accompanimentInstrument = '';
    (this.data() as any).accompanimentMusician = '';
  }

  onAccompanimentToggle(): void {
    if (!this.data().hasAccompaniment) {
      (this.data() as any).accompanimentInstrument = '';
      (this.data() as any).accompanimentMusician = '';
    }
  }

  private resetInstrumentFields(): void {
    (this.data() as any).instrumentType = '';
    (this.data() as any).instrumentName = '';
    (this.data() as any).hasAccompaniment = false;
    (this.data() as any).accompanimentInstrument = '';
    (this.data() as any).accompanimentMusician = '';
  }

  private resetDanceFields(): void {
    (this.data() as any).danceStyle = '';
    (this.data() as any).danceThemes = [{ title: '' }, { title: '' }, { title: '' }];
    (this.data() as any).danceMp3File = null;
    (this.data() as any).danceMp3FileName = '';
    (this.data() as any).workTitle = '';
    (this.data() as any).assistantsCount = 0;
  }

  isDanza(): boolean {
    return this.data().category === 'danza';
  }

  needsDanceStyle(): boolean {
    return ['malambo_masculino', 'malambo_femenino'].includes(this.data().subcategory);
  }

  getDanzaInfo(): string {
    switch (this.data().subcategory) {
      case 'malambo_masculino':
      case 'malambo_femenino':
        return 'Malambo solista. Necesitás 4 músicos acompañantes y planta de sonido.';
      case 'conjunto_malambo':
        return 'Conjunto de malambo: mínimo 4 y máximo 8 integrantes. Necesitás 4 músicos acompañantes y planta de sonido.';
      case 'pareja_tradicional':
        return 'Pareja de baile tradicional: 2 bailarines. 3 danzas con música MP3. Necesitás 4 músicos acompañantes, planta de sonido y 2 asistentes.';
      case 'pareja_estilizada':
        return 'Pareja de baile estilizada: 2 bailarines. 3 danzas con música MP3. Necesitás 4 músicos acompañantes y planta de sonido.';
      case 'conjunto_baile':
        return 'Conjunto de baile folklórico: mínimo 8 integrantes (hasta 40). 1 obra con archivo MP3.';
      default:
        return '';
    }
  }

  subcategories = computed(() => subcategoriesByCategory[this.data().category] || []);
  groupSubcategories = groupSubcategories;
  musicaCount = computed(() => subcategoriesByCategory['musica']?.length || 0);
  danzaCount = computed(() => subcategoriesByCategory['danza']?.length || 0);

  get currentSubcategories() {
    return subcategoriesByCategory[this.data().category] || [];
  }

  get currentInstrumentList(): string[] {
    return this.data().instrumentType === 'melodico' ? this.melodicInstruments : this.harmonicInstruments;
  }
}
