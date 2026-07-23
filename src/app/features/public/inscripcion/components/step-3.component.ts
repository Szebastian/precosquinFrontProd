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
      <p class="step-desc" style="margin-top: 0;">Sumá a cada persona que integra tu grupo</p>

      <!-- Info de cantidad por subcategoría -->
      @if (getMembersInfo()) {
        <div class="members-info-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>{{ getMembersInfo() }}</span>
        </div>
      }

      @for (member of data().members; track $index; let i = $index) {
        <div class="member-card" [class.incomplete]="!member.fullName.trim() || !member.dni.trim() || !member.role">
          <div class="member-header">
            <h3 class="member-number">Persona {{ i + 1 }}</h3>
            @if (!member.fullName.trim() || !member.dni.trim() || !member.role) {
              <span class="member-incomplete-badge">Incompleto</span>
            }
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
              <input type="number" class="form-input" [(ngModel)]="member.age" placeholder="25" [name]="'memberAge' + i" min="0" max="120" />
            </div>
            <div class="form-group">
              <label class="form-label">¿Qué rol cumple? *</label>
              <select class="form-input" [(ngModel)]="member.role" [name]="'memberRole' + i" required>
                <option value="">Elegí un rol</option>
                @for (role of roles; track role) {
                  <option [value]="role">{{ role }}</option>
                }
              </select>
            </div>
          </div>
        </div>
      }

      <button type="button" class="btn btn-add-member" (click)="addMember.emit()" [disabled]="data().members.length >= getMaxMembers()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14"/><path d="M5 12h14"/>
        </svg>
        @if (data().members.length >= getMaxMembers()) {
          Máximo {{ getMaxMembers() }} personas
        } @else {
          Agregar otra persona
        }
      </button>
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
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
    .form-label { font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.35rem; display: block; }
    .form-input, .form-textarea { width: 100%; padding: 0.7rem 0.875rem; font-size: 0.95rem; color: #f1f5f9; background: transparent; border: 1.5px solid rgba(255, 255, 255, 0.08); border-radius: 0.5rem; outline: none; transition: border-color 0.2s ease; }
    .form-input:focus, .form-textarea:focus { border-color: #4c8be6; box-shadow: 0 0 0 2px rgba(76, 139, 230, 0.12); }
    .form-input::placeholder, .form-textarea::placeholder { color: #475569; }
    .form-input option { background: #1a1d23; color: #f1f5f9; }

    .member-card { background: rgba(255, 255, 255, 0.02); border: 1.5px solid rgba(255, 255, 255, 0.08); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem; transition: border-color 0.2s ease; }
    .member-card.incomplete { border-color: rgba(234, 179, 8, 0.3); }
    .member-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
    .member-number { font-size: 0.8rem; font-weight: 600; color: #4c8be6; margin: 0; }
    .member-incomplete-badge { font-size: 0.65rem; font-weight: 600; color: #eab308; background: rgba(234, 179, 8, 0.1); padding: 0.2rem 0.5rem; border-radius: 9999px; }
    .btn-remove { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: #ef4444; background: none; border: none; cursor: pointer; font-weight: 500; padding: 0.25rem 0.5rem; border-radius: 0.375rem; transition: all 0.2s ease; }
    .btn-remove:hover { background: rgba(239, 68, 68, 0.1); }
    .btn-add-member { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; font-size: 0.875rem; font-weight: 500; border-radius: 0.625rem; border: 1.5px dashed rgba(76, 139, 230, 0.35); background: rgba(76, 139, 230, 0.04); color: #4c8be6; cursor: pointer; transition: all 0.2s ease; }
    .btn-add-member:hover:not(:disabled) { border-color: #4c8be6; background: rgba(76, 139, 230, 0.08); }
    .btn-add-member:active:not(:disabled) { transform: scale(0.98); }
    .btn-add-member:disabled { opacity: 0.4; cursor: not-allowed; border-color: rgba(255, 255, 255, 0.08); background: transparent; color: #64748b; }

    .members-info-banner { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.875rem 1rem; background: rgba(76, 139, 230, 0.06); border: 1px solid rgba(76, 139, 230, 0.15); border-radius: 0.75rem; margin-bottom: 1.5rem; font-size: 0.8rem; color: #94a3b8; line-height: 1.5; }
    .members-info-banner svg { color: #60a5fa; flex-shrink: 0; margin-top: 2px; }

    @media (max-width: 640px) {
      .form-row { grid-template-columns: 1fr; }
      .member-card { padding: 1rem; }
      .btn-remove { min-height: 44px; min-width: 44px; font-size: 0.8rem; }
      .btn-add-member { min-height: 44px; width: 100%; justify-content: center; }
      .form-input { padding: 0.6rem 0.75rem; font-size: 0.9rem; }
    }

    @media (max-width: 480px) {
      .member-card { padding: 0.875rem; }
      .member-number { font-size: 0.75rem; }
      .form-label { font-size: 0.65rem; }
      .form-input { padding: 0.5rem 0.625rem; font-size: 0.85rem; }
    }
  `]
})
export class InscripcionStep3Component {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
  addMember = output<void>();
  removeMember = output<number>();

  roles = [
    'Bailarín', 'Cantante', 'Guitarrista', 'Baterista', 'Bajista', 'Tecladista',
    'Violinista', 'Acordeonista', 'Percusionista', 'Corista', 'Otro'
  ];

  getMaxMembers(): number {
    const sub = this.data().subcategory;
    if (sub === 'conjunto_baile') return 40;
    if (sub === 'conjunto_malambo') return 8;
    if (sub === 'pareja_tradicional' || sub === 'pareja_estilizada') return 2;
    return 10;
  }

  getMembersInfo(): string {
    const sub = this.data().subcategory;
    switch (sub) {
      case 'conjunto_malambo':
        return 'Conjunto de malambo: mínimo 4 y máximo 8 integrantes.';
      case 'pareja_tradicional':
      case 'pareja_estilizada':
        return 'Pareja: necesitás exactamente 2 bailarines.';
      case 'conjunto_baile':
        return 'Conjunto de baile folklórico: mínimo 8, hasta 40 integrantes.';
      default:
        return '';
    }
  }
}
