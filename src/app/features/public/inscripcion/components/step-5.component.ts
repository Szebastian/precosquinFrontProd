import { Component, input, signal, computed, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionData } from '../inscripcion.page';

@Component({
  selector: 'app-inscripcion-step-5',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
      <div class="step-title-row">
        <span class="optional-badge">Opcional</span>
      </div>
      <p class="step-desc" style="margin-top: 0;">      Contanos qué necesitás para sonar bien. Si no necesitás nada especial, podés seguir adelante.</p>

      <!-- SONIDO -->
      <div class="rider-section">
        <div class="rider-section-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          <h3>Sonido</h3>
        </div>

        <div class="form-group">
          <label class="form-label">¿Qué microfonos necesitás?</label>
          <div class="rider-chips">
            @for (mic of micOptions; track mic) {
              <label class="rider-chip" [class.selected]="data().riderTecnico.sonido.microfonos.includes(mic)">
                <input type="checkbox" [checked]="data().riderTecnico.sonido.microfonos.includes(mic)" (change)="onMicChange.emit(mic)" />
                {{ mic }}
              </label>
            }
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">¿Cuántos monitores necesitás?</label>
            <select class="form-input" [(ngModel)]="data().riderTecnico.sonido.monitores" name="monitores">
              <option value="">No requiere</option>
              <option value="1">1 monitor</option>
              <option value="2">2 monitores</option>
              <option value="3">3 monitores</option>
              <option value="4">4 monitores</option>
              <option value="custom">Más de 4 (especificar en observaciones)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">DI Boxes</label>
            <input type="number" class="form-input" [(ngModel)]="data().riderTecnico.sonido.diBoxes" name="diBoxes" placeholder="Cantidad" min="0" max="20" />
          </div>
        </div>

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
      </div>

      <!-- ESCENARIO -->
      <div class="rider-section">
        <div class="rider-section-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
          <h3>Escenario</h3>
        </div>

        <div class="form-group">
          <label class="form-label">¿Qué tipo de piso preferís?</label>
          <div class="rider-chips">
            @for (piso of pisoOptions; track piso) {
              <label class="rider-chip" [class.selected]="data().riderTecnico.escenario.pisos.includes(piso)">
                <input type="checkbox" [checked]="data().riderTecnico.escenario.pisos.includes(piso)" (change)="onPisoChange.emit(piso)" />
                {{ piso }}
              </label>
            }
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="cables">¿Necesitás cables o conectores?</label>
          <input type="text" id="cables" class="form-input" [ngModel]="cablesInput()" (ngModelChange)="onCablesChange($event)" name="cables"
            placeholder="Ej: cable XLR 10m, jack 1/4" />
          <span class="form-hint">Separá con coma si son varios</span>
        </div>
      </div>

      <!-- OTROS -->
      <div class="rider-section">
        <div class="rider-section-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <h3>¿Algo más?</h3>
        </div>

        <div class="form-group">
          <label class="form-label" for="otrosRider">Contanos algo más</label>
          <textarea id="otrosRider" class="form-textarea" rows="3" maxlength="300"
            [(ngModel)]="data().riderTecnico.otros" name="otrosRider"
            placeholder="Si te falta algo, decinos acá"></textarea>
          <span class="char-count">{{ (data().riderTecnico.otros || '').length }} / 300</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-content { min-height: 200px; }
    .slide-left { animation: slideLeft 0.3s ease-out; }
    .slide-right { animation: slideRight 0.3s ease-out; }
    .rider-section { background: rgba(255, 255, 255, 0.03); border: 1.5px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-xl); padding: var(--space-5); margin-bottom: var(--space-5); }
    .rider-section-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); color: var(--brand-400); }
    .rider-section-header h3 { margin: 0; font-size: var(--text-sm); font-weight: var(--weight-semibold); color: #e2e8f0; }
    .rider-chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .rider-chip { display: inline-flex; align-items: center; padding: 8px var(--space-3); border: 1.5px solid rgba(255, 255, 255, 0.12); border-radius: var(--radius-full); font-size: var(--text-xs); color: #cbd5e1; cursor: pointer; transition: all var(--transition-fast); background: rgba(255, 255, 255, 0.03); }
    .rider-chip input { display: none; }
    .rider-chip:hover { border-color: rgba(255, 255, 255, 0.25); background: rgba(255, 255, 255, 0.06); }
    .rider-chip.selected { border-color: var(--brand-400); background: rgba(99, 102, 241, 0.2); color: var(--brand-300); font-weight: var(--weight-medium); }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    .char-count { display: block; text-align: right; font-size: 0.7rem; color: #475569; margin-top: 4px; }
  `]
})
export class InscripcionStep5Component implements OnInit {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
  cablesInput = signal('');

  goToStep = output<number>();
  onMicChange = output<string>();
  onBacklineChange = output<string>();
  onPisoChange = output<string>();

  get micOptions() {
    return ['Dinámico (SM58)', 'Condensador de solista', 'Inalámbrico', 'Overhead', 'Para acordeón/guitarra', 'Para percusión'];
  }

  get backlineOptions() {
    return ['Guitarra eléctrica', 'Guitarra acústica', 'Bajo', 'Batería', 'Acordeón', 'Teclado', 'Percusión menor'];
  }

  get pisoOptions() {
    return ['Madera', 'Marley', 'Cemento', 'Hierba / tierra', 'Sin preferencia'];
  }

  ngOnInit() {
    this.cablesInput.set(this.data().riderTecnico.sonido.cables.join(', '));
  }

  onCablesChange(value: string): void {
    this.cablesInput.set(value);
    (this.data() as any).riderTecnico.sonido.cables = value.split(',').map((s: string) => s.trim()).filter((s: string) => s);
  }
}
