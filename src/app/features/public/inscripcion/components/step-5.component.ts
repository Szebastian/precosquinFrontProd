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
      <p class="step-desc" style="margin-top: 0;">Contanos qué necesitás para sonar bien. Si no necesitás nada especial, podés seguir adelante.</p>

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



      <!-- OTROS -->
        <div class="rider-section">
          <div class="rider-section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4 0a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m22 21-3-3m-4-9a4 4 0 0 0-8 0"/></svg>
            <h3>Equipo Técnico</h3>
          </div>

          <div class="form-group">
            <label class="form-label" for="riderTecnico">Describe tu equipo técnico necesario</label>
            <textarea id="riderTecnico" class="form-textarea" rows="5" maxlength="500"
              [(ngModel)]="data().technicalNeeds" name="riderTecnico"
              placeholder="Ej: Necesito microfono para la bateria."></textarea>
            <div class="tech-input-help">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 16h-1v-4h-1m-1-4h2M13 8h-1v4h-1m-1-4h2M9 8v.6a2.4 2.4 0 0 0-.8 1.6M15 8v.6a2.4 2.4 0 0 1 .8 1.6M9 16v4m6-4v4m-6-4v.6a2.4 2.4 0 0 1 1.8 1.6m-1.2 2.4a2.4 2.4 0 0 1-1.8-1.6" />
              </svg>
              <span>Describe lo que necesitas, no lo que tienes. Los ilustradores te ayudarán.</span>
            </div>
            <span class="char-count">{{ (data().technicalNeeds || '').length }} / 500</span>
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
    .technical-team-info { background: rgba(76, 139, 230, 0.08); border: 1px solid rgba(76, 139, 230, 0.15); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-4); }
    .tech-help-text { font-size: var(--text-sm); color: #cbd5e1; margin: 0 0 var(--space-3); line-height: 1.5; }
    .tech-help-text strong { color: #93c5fd; }
    .tech-help-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-2); }
    .tech-help-list li { font-size: var(--text-xs); color: #94a3b8; padding-left: var(--space-5); position: relative; }
    .tech-help-list li::before { content: "✓"; position: absolute; left: 0; color: #4ade80; font-weight: 600; }
    .tech-input-help { display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-3); padding: var(--space-2) var(--space-3); background: rgba(99, 102, 241, 0.1); border-radius: var(--radius-md); }
    .tech-input-help svg { color: #818cf8; flex-shrink: 0; }
    .tech-input-help span { font-size: var(--text-xs); color: #a5b4fc; }
  `]
})
export class InscripcionStep5Component implements OnInit {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
  cablesInput = signal('');

  goToStep = output<number>();
  onMicChange = output<string>();
  onBacklineChange = output<string>();


  get micOptions() {
    return ['Dinámico (SM58)', 'Condensador de solista', 'Inalámbrico', 'Overhead', 'Para acordeón/guitarra', 'Para percusión'];
  }

  get backlineOptions() {
    return ['Guitarra eléctrica', 'Guitarra acústica', 'Bajo', 'Batería', 'Acordeón', 'Teclado', 'Percusión menor'];
  }



  ngOnInit() {
    this.cablesInput.set(this.data().riderTecnico.sonido.cables.join(', '));
  }

  onCablesChange(value: string): void {
    this.cablesInput.set(value);
    (this.data() as any).riderTecnico.sonido.cables = value.split(',').map((s: string) => s.trim()).filter((s: string) => s);
  }

  // Helper to format numerical values for display
  formatNumberInput(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value);
  }
}
