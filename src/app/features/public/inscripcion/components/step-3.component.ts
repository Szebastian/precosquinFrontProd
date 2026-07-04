import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionData } from '../inscripcion.page';
import { subcategoriesByCategory, groupSubcategories } from '../inscripcion.page';

@Component({
  selector: 'app-inscripcion-step-3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
      <h2 class="step-title">Integrantes del Grupo</h2>
      <p class="step-desc">Agregá los datos de cada integrante</p>

      @for (member of data().members; track $index; let i = $index) {
        <div class="member-card">
          <div class="member-header">
            <h3 class="member-number">Integrante {{ i + 1 }}</h3>
            @if (data().members.length > 1) {
              <button type="button" class="btn-remove" (click)="removeMember.emit(i)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
                Quitar
              </button>
            }
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nombre completo *</label>
              <input type="text" class="form-input" [(ngModel)]="member.fullName" placeholder="Nombre y apellido" [name]="'memberName' + i" required />
            </div>
            <div class="form-group">
              <label class="form-label">DNI *</label>
              <input type="text" class="form-input" [(ngModel)]="member.dni" placeholder="12345678" [name]="'memberDni' + i" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Edad</label>
              <input type="number" class="form-input" [(ngModel)]="member.age" placeholder="Ej: 25" [name]="'memberAge' + i" min="0" max="120" />
            </div>
            <div class="form-group">
              <label class="form-label">Función *</label>
              <select class="form-input" [(ngModel)]="member.role" [name]="'memberRole' + i" required>
                <option value="">Seleccionar función</option>
                @for (role of roles; track role) {
                  <option [value]="role">{{ role }}</option>
                }
              </select>
            </div>
          </div>
        </div>
      }

      <button type="button" class="btn btn-add-member" (click)="addMember.emit()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14"/><path d="M5 12h14"/>
        </svg>
        Agregar Integrante
      </button>
    </div>
  `,
  styles: [`
    .step-content { min-height: 200px; }
    .slide-left { animation: slideLeft 0.3s ease-out; }
    .slide-right { animation: slideRight 0.3s ease-out; }
    .member-card { background: rgba(255, 255, 255, 0.03); border: 1.5px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-xl); padding: var(--space-5); margin-bottom: var(--space-4); }
    .member-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); }
    .member-number { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--brand-400); margin: 0; }
    .btn-remove { display: inline-flex; align-items: center; gap: var(--space-1); font-size: var(--text-xs); color: var(--danger-600); background: none; border: none; cursor: pointer; font-weight: var(--weight-medium); padding: var(--space-1) var(--space-2); border-radius: var(--radius-md); transition: all var(--transition-fast); }
    .btn-remove:hover { background: rgba(239, 68, 68, 0.1); }
    .btn-add-member { display: inline-flex; align-items: center; gap: var(--space-2); padding: 0.625rem 1.25rem; font-size: var(--text-sm); font-weight: var(--weight-medium); border-radius: var(--radius-lg); border: 2px dashed rgba(99, 102, 241, 0.4); background: rgba(99, 102, 241, 0.05); color: var(--brand-400); cursor: pointer; transition: all var(--transition-fast); }
    .btn-add-member:hover { border-color: var(--brand-400); background: rgba(99, 102, 241, 0.1); }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class InscripcionStep3Component {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
  addMember = output<void>();
  removeMember = output<number>();

  roles = [
    'Cantante', 'Guitarrista', 'Bailarín', 'Baterista', 'Bajista', 'Tecladista',
    'Violinista', 'Acordeonista', 'Percusionista', 'Corista', 'Otro'
  ];
}
