import { Component, input, signal, computed, output, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionData, Instrument } from '../inscripcion.page';
import { StagePlotComponent } from './stage-plot/stage-plot.component';

@Component({
  selector: 'app-inscripcion-step-5',
  standalone: true,
  imports: [CommonModule, FormsModule, StagePlotComponent],
  template: `
    <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
      <p class="step-desc" style="margin-top: 0;">Contanos sobre tu equipo técnico y las condiciones de tu instrumento</p>

      <div class="optional-banner">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span>Este paso es <strong>opcional</strong>. Completá solo lo que necesites. El equipo técnico definitivo se define en los ensayos.</span>
      </div>

      <!-- ANNEX I - Technical Rules -->
      <div class="annex-section">
        <div class="annex-header clickable-section" (click)="toggleSection('annex')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <h3>Anexo I - Recomendaciones Técnicas</h3>
          <span class="chevron" [class.rotated]="!sectionCollapsed['annex']"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
        </div>
        @if (!sectionCollapsed['annex']) {
          <div class="section-body">
            <p class="annex-desc">Revisá las siguientes recomendaciones antes de presentarte en Cosquín</p>

        <!-- Instrument Condition Checklist -->
        <div class="checklist-section">
          <h4 class="checklist-title">Estado del instrumento</h4>
          <div class="checklist-items">
            @for (item of instrumentChecklist; track item.id) {
              <label class="checklist-item" [class.completed]="item.checked()">
                <input type="checkbox" [checked]="item.checked()" (change)="item.toggle()" />
                <div class="checklist-check">
                  @if (item.checked()) {
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  }
                </div>
                <span class="checklist-text">{{ item.text }}</span>
              </label>
            }
          </div>
          <div class="checklist-progress">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="checklistProgress"></div>
            </div>
            <span class="progress-text">{{ checklistProgress }}% completado</span>
          </div>
          </div>
          </div> <!-- /annex section-body -->
        }

      <!-- SONIDO -->
      <div class="rider-section">
        <div class="rider-section-header clickable-section" (click)="toggleSection('sonido')">
          <span class="section-number">1</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
          </svg>
          <h3>Sonido</h3>
          <span class="chevron" [class.rotated]="!sectionCollapsed['sonido']"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
        </div>
        @if (!sectionCollapsed['sonido']) {
          <div class="section-body">

        <div class="form-group">
          <label class="form-label">¿Qué equipamiento llevás?</label>
          <div class="rider-chips">
            @for (item of backlineOptions; track item) {
              <label class="rider-chip" [class.selected]="data().riderTecnico.sonido.backline.includes(item)">
                <input type="checkbox" [checked]="data().riderTecnico.sonido.backline.includes(item)" (change)="onBacklineChange.emit(item)" />
                {{ item }}
              </label>
            }
          </div>
        </div>
        </div> <!-- /sonido section-body -->
        }
      </div>

      <!-- CONEXIONES -->
      <div class="rider-section">
        <div class="rider-section-header clickable-section" (click)="toggleSection('conexiones')">
          <span class="section-number">2</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M2 12h20"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
          <h3>Conexiones</h3>
          <span class="chevron" [class.rotated]="!sectionCollapsed['conexiones']"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
        </div>
        @if (!sectionCollapsed['conexiones']) {
          <div class="section-body">

        <div class="form-group">
          <label class="form-label">Cables y conectores</label>
          <input type="text" class="form-input" placeholder="Ej: cable jack 6m, adaptador XLR a Jack"
            [ngModel]="cablesInput()" (ngModelChange)="onCablesChange($event)" name="cables" />
          <div class="field-help">Separá los items con comas</div>
        </div>

        <div class="form-group">
          <label class="form-label">DI Boxes necesarios</label>
          <select class="form-input" [(ngModel)]="data().riderTecnico.sonido.diBoxes" name="diBoxes">
            <option [ngValue]="null">No requiere</option>
            <option [ngValue]="1">1 DI Box</option>
            <option [ngValue]="2">2 DI Boxes</option>
            <option [ngValue]="3">3 DI Boxes</option>
            <option [ngValue]="4">4 DI Boxes</option>
          </select>
        </div>
        </div> <!-- /conexiones section-body -->
        }
      </div>

      <!-- TÉCNICAS ESPECÍFICAS -->
      <div class="rider-section">
        <div class="rider-section-header clickable-section" (click)="toggleSection('equipo')">
          <span class="section-number">3</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h3>Equipo Técnico</h3>
          <span class="chevron" [class.rotated]="!sectionCollapsed['equipo']"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
        </div>
        @if (!sectionCollapsed['equipo']) {
          <div class="section-body">
            <div class="form-group">
              <label class="form-label" for="riderTecnico">Describe tu equipo técnico necesario</label>
              <textarea id="riderTecnico" class="form-textarea" rows="5" maxlength="500"
                [(ngModel)]="data().riderTecnico.otros" name="otrosTecnicos"
                placeholder="Ej: Necesito micrófono para el bajo, cable jack de 10 metros, y un adaptador XLR macho a hembra."></textarea>
              <span class="char-count">{{ (data().riderTecnico.otros || '').length }} / 500</span>
            </div>
          </div>
        }
      </div>

      <!-- MICRÓFONO - Technical Tips -->
      @if (data().subcategory === 'solista_vocal' || data().subcategory === 'duo_vocal' || data().subcategory === 'expresion_oral_folclorica') {
        <div class="rider-section tips-section">
          <div class="rider-section-header clickable-section" (click)="toggleSection('consejos')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <h3>Consejos para micrófono de mano</h3>
            <span class="chevron" [class.rotated]="!sectionCollapsed['consejos']"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
          </div>
          @if (!sectionCollapsed['consejos']) {
            <div class="section-body">
              <div class="tips-list">
                <div class="tip-item">
                  <span class="tip-icon">1</span>
                  <p>Usá un micrófono estándar (Shure SM58 o similar) para los ensayos</p>
                </div>
                <div class="tip-item">
                  <span class="tip-icon">2</span>
                  <p>Sujetá el micrófono por la base cónica, sin obstruir la rejilla</p>
                </div>
                <div class="tip-item">
                  <span class="tip-icon">3</span>
                  <p>La distancia recomendada es de 4 a 5 cm de la boca</p>
                </div>
                <div class="tip-item">
                  <span class="tip-icon">4</span>
                  <p>No bajes el micrófono enfrentado con los retornos (especialmente al saludar)</p>
                </div>
              </div>
            </div> <!-- /section-body -->
          }
        </div> <!-- /rider-section tips-section -->
      }

      <!-- STAGE PLOT -->
      <div class="rider-section">
        <div class="rider-section-header clickable-section" (click)="toggleSection('stageplot')">
          <span class="section-number">4</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <h3>Stage Plot (Posición en Escenario)</h3>
          <span class="chevron" [class.rotated]="!sectionCollapsed['stageplot']"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
        </div>
        @if (!sectionCollapsed['stageplot']) {
          <div class="section-body">
            <app-stage-plot
              [initialInstruments]="data().riderTecnico.stagePlotInstruments"
              (instrumentsChange)="onStagePlotInstrumentsChange($event)">
            </app-stage-plot>
          </div>
        }
      </div>

      <!-- MONITOR MIXES -->
      <div class="rider-section">
        <div class="rider-section-header clickable-section" (click)="toggleSection('monitors')">
          <span class="section-number">5</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
          <h3>Monitor Mix (Contenido de Monitores)</h3>
          <span class="chevron" [class.rotated]="!sectionCollapsed['monitors']"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
        </div>
        @if (!sectionCollapsed['monitors']) {
          <div class="section-body">
            <p class="section-hint">¿Cuántos monitores necesitás y qué querés escuchar en cada uno?</p>
            <div class="form-group">
              <label class="form-label">Cantidad de monitores / retornos</label>
              <select class="form-input" [(ngModel)]="data().riderTecnico.monitorCount" name="monitorCount" (ngModelChange)="onMonitorCountChange($event)">
                <option [ngValue]="0">No requiero monitores</option>
                <option [ngValue]="1">1 monitor</option>
                <option [ngValue]="2">2 monitores</option>
                <option [ngValue]="3">3 monitores</option>
                <option [ngValue]="4">4 monitores</option>
              </select>
            </div>
            @for (mix of data().riderTecnico.monitorMixes; track $index; let i = $index) {
              <div class="monitor-mix-card">
                <h4 class="mix-title">Monitor {{ i + 1 }}</h4>
                <div class="mix-chips">
                  @for (opt of monitorMixOptions; track opt) {
                    <label class="rider-chip" [class.selected]="mix.items.includes(opt)">
                      <input type="checkbox" [checked]="mix.items.includes(opt)" (change)="toggleMonitorMixItem(i, opt)" />
                      {{ opt }}
                    </label>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .step-content { min-height: 200px; }
    .slide-left { animation: slideLeft 0.3s ease-out; }
    .slide-right { animation: slideRight 0.3s ease-out; }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    .step-desc { font-size: 0.95rem; color: #94a3b8; margin-bottom: 1.5rem; line-height: 1.5; }

    .optional-banner {
      display: flex; align-items: flex-start; gap: 0.5rem;
      padding: 0.75rem 1rem; border-radius: 0.5rem;
      background: rgba(96, 165, 250, 0.08);
      border: 1px solid rgba(96, 165, 250, 0.2);
      color: #cbd5e1; font-size: 0.8rem; line-height: 1.4;
      margin-bottom: 1.5rem;
    }
    .optional-banner svg { flex-shrink: 0; margin-top: 1px; color: #60a5fa; }
    .optional-banner strong { color: #93c5fd; font-weight: 600; }

    .clickable-section { cursor: pointer; user-select: none; }
    .clickable-section:hover { opacity: 0.9; }
    .chevron { margin-left: auto; color: #64748b; transition: transform 0.2s ease; flex-shrink: 0; }
    .chevron.rotated { transform: rotate(180deg); }
    .section-body { animation: fadeIn 0.2s ease; }

    /* Annex Section */
    .annex-section {
      background: rgba(59, 130, 246, 0.08);
      border: 1.5px solid rgba(59, 130, 246, 0.25);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .annex-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; color: #60a5fa; }
    .annex-header h3 { margin: 0; font-size: 0.85rem; font-weight: 600; color: #e2e8f0; }
    .annex-desc { font-size: 0.75rem; color: #94a3b8; margin: 0 0 1rem; }

    /* Checklist */
    .checklist-section { margin-top: 1rem; }
    .checklist-title { font-size: 0.7rem; font-weight: 700; color: #e2e8f0; margin: 0 0 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
    .checklist-items { display: flex; flex-direction: column; gap: 0.35rem; }
    .checklist-item {
      display: flex; align-items: flex-start; gap: 0.75rem;
      padding: 0.5rem 0.75rem; border-radius: 8px;
      cursor: pointer; transition: background 0.15s ease;
    }
    .checklist-item:hover { background: rgba(255, 255, 255, 0.04); }
    .checklist-item input[type="checkbox"] { display: none; }
    .checklist-check {
      width: 20px; height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 5px; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: all 0.2s ease; margin-top: 1px;
    }
    .checklist-item.completed .checklist-check { background: #22c55e; border-color: #22c55e; color: #fff; }
    .checklist-text { font-size: 0.8rem; color: #e2e8f0; line-height: 1.5; }
    .checklist-item.completed .checklist-text { color: #94a3b8; text-decoration: line-through; }

    .checklist-progress { margin-top: 0.75rem; display: flex; align-items: center; gap: 0.75rem; }
    .progress-bar { flex: 1; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: #22c55e; border-radius: 3px; transition: width 0.3s ease; }
    .progress-text { font-size: 0.7rem; color: #94a3b8; white-space: nowrap; font-weight: 500; }

    /* Rider Sections */
    .rider-section {
      background: rgba(255, 255, 255, 0.04);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1rem;
      transition: border-color 0.2s ease;
    }
    .rider-section:hover { border-color: rgba(255, 255, 255, 0.15); }
    .rider-section-header {
      display: flex; align-items: center; gap: 0.75rem;
      margin-bottom: 1rem; color: #93c5fd;
    }
    .rider-section-header h3 {
      margin: 0; font-size: 0.9rem; font-weight: 600; color: #f1f5f9;
    }

    .section-number {
      width: 24px; height: 24px; border-radius: 6px;
      background: rgba(96, 165, 250, 0.15);
      color: #60a5fa; font-size: 0.7rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .form-group { margin-bottom: 1rem; }
    .form-row { display: grid; grid-template-columns: 1fr; gap: 1rem; }
    .form-label {
      font-size: 0.7rem; font-weight: 700; color: #cbd5e1;
      text-transform: uppercase; letter-spacing: 0.06em;
      margin-bottom: 0.4rem; display: block;
    }
    .form-input {
      width: 100%; padding: 0.625rem 0.875rem; font-size: 0.9rem;
      color: #f1f5f9; background: rgba(0, 0, 0, 0.2);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 0.5rem; outline: none;
      transition: border-color 0.2s ease; box-sizing: border-box;
    }
    .form-input:focus { border-color: #60a5fa; box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.15); }
    .form-input::placeholder { color: #64748b; }
    .form-input option { background: #1a1d23; color: #f1f5f9; }
    .form-textarea {
      width: 100%; padding: 0.625rem 0.875rem; font-size: 0.9rem;
      color: #f1f5f9; background: rgba(0, 0, 0, 0.2);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 0.5rem; outline: none;
      transition: border-color 0.2s ease; min-height: 100px;
      resize: vertical; font-family: inherit; box-sizing: border-box;
    }
    .form-textarea:focus { border-color: #60a5fa; box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.15); }
    .form-textarea::placeholder { color: #64748b; }
    .field-help { font-size: 0.7rem; color: #94a3b8; margin-top: 0.35rem; }
    .char-count { display: block; text-align: right; font-size: 0.7rem; color: #64748b; margin-top: 4px; }

    .rider-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .rider-chip {
      display: inline-flex; align-items: center;
      padding: 8px 14px;
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      border-radius: 999px; font-size: 0.8rem; color: #e2e8f0;
      cursor: pointer; transition: all 0.15s ease;
      background: rgba(255, 255, 255, 0.04);
    }
    .rider-chip input { display: none; }
    .rider-chip:hover {
      border-color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.08);
    }
    .rider-chip.selected {
      border-color: #60a5fa;
      background: rgba(96, 165, 250, 0.15);
      color: #93c5fd;
      font-weight: 600;
    }

    /* Tips Section */
    .tips-section { border-color: rgba(34, 197, 94, 0.25); background: rgba(34, 197, 94, 0.06); }
    .tips-section .rider-section-header { color: #4ade80; }
    .tips-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .tip-item { display: flex; align-items: flex-start; gap: 0.75rem; }
    .tip-icon {
      width: 24px; height: 24px; border-radius: 50%;
      background: rgba(34, 197, 94, 0.2); color: #4ade80;
      font-size: 0.75rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .tip-item p { margin: 0; font-size: 0.8rem; color: #e2e8f0; line-height: 1.5; }

    /* Wireless Notice */
    .wireless-section { border-color: rgba(234, 179, 8, 0.25); background: rgba(234, 179, 8, 0.06); }
    .wireless-section .rider-section-header { color: #facc15; }
    .wireless-notice {
      display: flex; gap: 0.75rem; padding: 0.75rem 1rem;
      background: rgba(234, 179, 8, 0.08);
      border: 1px solid rgba(234, 179, 8, 0.2);
      border-radius: 8px;
    }
    .wireless-notice svg { color: #facc15; flex-shrink: 0; margin-top: 2px; }
    .wireless-notice strong { font-size: 0.8rem; color: #fde047; display: block; margin-bottom: 0.25rem; }
    .wireless-notice p { margin: 0; font-size: 0.75rem; color: #cbd5e1; line-height: 1.5; }

    /* Amp Notice */
    .amp-notice {
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
    }
    .amp-notice p { margin: 0 0 0.5rem; font-size: 0.8rem; color: #e2e8f0; line-height: 1.5; }
    .amp-notice p:last-child { margin-bottom: 0; }
    .amp-warning { color: #f87171 !important; font-weight: 600; font-size: 0.75rem !important; }

    /* Input List */
    .section-hint { font-size: 0.8rem; color: #94a3b8; margin-bottom: 1rem; }
    .inputlist-table-wrapper {
      overflow-x: auto; margin-top: 0.5rem;
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
    }
    .inputlist-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    .inputlist-table th {
      text-align: left; padding: 0.625rem 0.75rem;
      color: #94a3b8; font-weight: 700; font-size: 0.7rem;
      text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.03);
    }
    .inputlist-table td { padding: 0.5rem 0.625rem; }
    .channel-num { color: #60a5fa; font-weight: 700; width: 30px; font-size: 0.8rem; }
    .inputlist-table .table-input {
      padding: 0.4rem 0.5rem !important; font-size: 0.8rem !important;
      border-radius: 0.375rem !important; min-width: 0;
    }
    .cell-center { text-align: center; width: 50px; }
    .cell-center input[type="checkbox"] { width: 16px; height: 16px; accent-color: #4ade80; cursor: pointer; }
    .cell-actions { width: 30px; }

    /* Stage Plot */
    .stage-plot-wrapper { text-align: center; }
    .stage-front-label, .stage-back-label {
      font-size: 0.65rem; font-weight: 700; color: #94a3b8;
      text-transform: uppercase; letter-spacing: 0.1em;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 6px; margin-bottom: 0.75rem;
    }
    .stage-back-label { margin-top: 0.75rem; margin-bottom: 0; }
    .stage-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; max-width: 400px; margin: 0 auto; }
    .stage-spot {
      aspect-ratio: 1.6; border: 2px dashed rgba(255, 255, 255, 0.12);
      border-radius: 8px; background: rgba(255, 255, 255, 0.03);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s ease; color: transparent;
    }
    .stage-spot:hover { border-color: rgba(74, 222, 128, 0.4); background: rgba(74, 222, 128, 0.06); }
    .stage-spot.selected {
      border-color: #4ade80; border-style: solid;
      background: rgba(74, 222, 128, 0.12); color: #4ade80;
      box-shadow: 0 0 16px rgba(74, 222, 128, 0.2);
    }
    .spot-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); }
    .stage-spot:hover .spot-dot { background: rgba(74, 222, 128, 0.4); }
    .stage-selected-label { margin-top: 0.75rem; font-size: 0.85rem; color: #94a3b8; }
    .stage-selected-label strong { color: #4ade80; }

    /* Monitor Mixes */
    .monitor-mix-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem;
    }
    .mix-title { font-size: 0.8rem; font-weight: 600; color: #f1f5f9; margin: 0 0 0.75rem; }
    .mix-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }

    .inputlist-presets { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .btn-preset {
      background: rgba(96, 165, 250, 0.1);
      border: 1px solid rgba(96, 165, 250, 0.3);
      color: #93c5fd;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-preset:hover {
      background: rgba(96, 165, 250, 0.2);
      border-color: rgba(96, 165, 250, 0.5);
    }

    /* Section Divider */
    .section-divider {
      height: 1px;
      background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.06), transparent);
      margin: 0.5rem 0;
    }

    @media (max-width: 640px) {
      .rider-section { padding: 1rem; margin-bottom: 0.75rem; }
      .annex-section { padding: 1rem; }
      .rider-section-header { margin-bottom: 0.75rem; }
      .rider-section-header h3 { font-size: 0.8rem; }
      .rider-chips { gap: 6px; }
      .rider-chip { min-height: 38px; padding: 6px 12px; font-size: 0.75rem; }
      .form-row { gap: 0.75rem; margin-bottom: 1rem; }
      .form-input { padding: 0.6rem 0.75rem; font-size: 0.85rem; }
      .form-textarea { min-height: 80px; font-size: 0.85rem; }
      .char-count { font-size: 0.65rem; }
      .checklist-item { padding: 0.5rem; }
      .checklist-text { font-size: 0.75rem; }
    }

    @media (max-width: 480px) {
      .rider-section { padding: 0.75rem; }
      .annex-section { padding: 0.75rem; }
      .rider-chip { min-height: 36px; padding: 5px 10px; font-size: 0.72rem; }
      .form-input { padding: 0.5rem 0.625rem; font-size: 0.8rem; }
      .form-textarea { min-height: 70px; font-size: 0.8rem; }
      .tip-item { gap: 0.5rem; }
      .tip-icon { width: 20px; height: 20px; font-size: 0.65rem; }
      .inputlist-table-wrapper { border: none; overflow: visible; }
      .inputlist-table thead { display: none; }
      .inputlist-table tbody { display: flex; flex-direction: column; gap: 0.75rem; }
      .inputlist-table tr { display: flex; flex-direction: column; gap: 0.4rem; padding: 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; }
      .inputlist-table td { padding: 0; }
      .inputlist-table td::before { content: attr(data-label); font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
      .channel-num { width: auto; font-size: 0.75rem; }
      .stage-grid { grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
    }
  `]
})
export class InscripcionStep5Component implements OnInit {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
  cablesInput = signal('');

  goToStep = output<number>();
  onBacklineChange = output<string>();

  backlineOptions = ['Guitarra eléctrica', 'Guitarra acústica', 'Bajo', 'Batería', 'Acordeón', 'Teclado', 'Percusión menor'];

  sectionCollapsed: Record<string, boolean> = {
    annex: true,
    sonido: false,
    conexiones: false,
    equipo: false,
    consejos: false,
    stageplot: false,
    monitors: false,
  };

  toggleSection(key: string): void {
    this.sectionCollapsed[key] = !this.sectionCollapsed[key];
  }

  monitorMixOptions = ['Voz principal', 'Voz secundaria', 'Guitarra', 'Bajo', 'Teclado', 'Percusión', 'Otro instrumento', 'Click / Track', 'Tambor (todos)', 'Coros'];

  onStagePlotInstrumentsChange(instruments: Instrument[]): void {
    (this.data() as any).riderTecnico.stagePlotInstruments = instruments;
  }

  onMonitorCountChange(count: number): void {
    const mixes = (this.data() as any).riderTecnico.monitorMixes;
    while (mixes.length < count) {
      mixes.push({ label: `Monitor ${mixes.length + 1}`, items: [] });
    }
    while (mixes.length > count) {
      mixes.pop();
    }
  }

  toggleMonitorMixItem(mixIndex: number, item: string): void {
    const items = (this.data() as any).riderTecnico.monitorMixes[mixIndex].items;
    const idx = items.indexOf(item);
    if (idx >= 0) {
      items.splice(idx, 1);
    } else {
      items.push(item);
    }
  }

  // Annex I Checklist
  instrumentChecklist = [
    { id: 1, text: 'Instrumento en perfectas condiciones de uso', checked: signal(false), toggle: function() { this.checked.set(!this.checked()); } },
    { id: 2, text: 'No modificar el nivel del instrumento en pre-escena', checked: signal(false), toggle: function() { this.checked.set(!this.checked()); } },
    { id: 3, text: 'No modificar ecualización una vez en escena', checked: signal(false), toggle: function() { this.checked.set(!this.checked()); } },
    { id: 4, text: 'Baterías nuevas y accesorios completos', checked: signal(false), toggle: function() { this.checked.set(!this.checked()); } },
    { id: 5, text: 'Conectores de salida ("Jack") firmemente fijados', checked: signal(false), toggle: function() { this.checked.set(!this.checked()); } },
    { id: 6, text: 'Cables de señal de calidad reconocida', checked: signal(false), toggle: function() { this.checked.set(!this.checked()); } },
    { id: 7, text: 'Pedales de efectos en correcto estado', checked: signal(false), toggle: function() { this.checked.set(!this.checked()); } },
    { id: 8, text: 'Conectores de teclado revisados (si aplica)', checked: signal(false), toggle: function() { this.checked.set(!this.checked()); } },
    { id: 9, text: 'Amplificador avisado con anticipación (si aplica)', checked: signal(false), toggle: function() { this.checked.set(!this.checked()); } },
    { id: 10, text: 'Puesta a tierra del equipo normalizada', checked: signal(false), toggle: function() { this.checked.set(!this.checked()); } },
  ];

  checklistProgress = 0;

  constructor() {
    effect(() => {
      const total = this.instrumentChecklist.length;
      const checked = this.instrumentChecklist.filter(item => item.checked()).length;
      this.checklistProgress = Math.round((checked / total) * 100);
    });
  }

  ngOnInit() {
    this.cablesInput.set(this.data().riderTecnico.sonido.cables.join(', '));
  }

  onCablesChange(value: string): void {
    this.cablesInput.set(value);
    (this.data() as any).riderTecnico.sonido.cables = value.split(',').map((s: string) => s.trim()).filter((s: string) => s);
  }
}
