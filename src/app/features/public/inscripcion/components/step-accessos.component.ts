import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionData, AccompanyingPerson } from '../inscripcion.page';

@Component({
  selector: 'app-inscripcion-step-accessos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
      <p class="step-desc" style="margin-top: 0;">Registrá a las personas que te acompañan</p>

      @for (person of data().accompanyingPersons; track $index; let i = $index) {
        <div class="person-card">
          <div class="person-header">
            <h3 class="person-number">Persona {{ i + 1 }}</h3>
            <button type="button" class="btn-remove" (click)="removePerson.emit(i)" title="Eliminar persona">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="form-row">
            <div class="form-group" style="flex: 2;">
              <label class="form-label">Nombre completo *</label>
              <input type="text" class="form-input" [ngModel]="person.fullName"
                (ngModelChange)="person.fullName = $event"
                [name]="'personName_' + i"
                placeholder="Ej: Juan García" />
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">DNI *</label>
              <input type="text" class="form-input" [ngModel]="person.dni"
                (ngModelChange)="person.dni = $event"
                [name]="'personDni_' + i"
                placeholder="Ej: 42.567.891" maxlength="10" />
            </div>
          </div>
        </div>
      }

      @if (data().accompanyingPersons.length === 0) {
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <p>No se registraron personas acompañantes</p>
          <span>Podés agregar personas que te acompañen para habilitar su ingreso</span>
        </div>
      }

      <button type="button" class="btn-add" (click)="addPerson.emit()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        Agregar persona
      </button>

      <p class="step-note">Si no llevás acompañantes, podés continuar directamente.</p>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .person-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1rem;
      transition: border-color 0.2s;
    }
    .person-card:hover { border-color: rgba(255, 255, 255, 0.15); }

    .person-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .person-number {
      font-size: 0.85rem;
      font-weight: 600;
      color: #93c5fd;
      margin: 0;
    }

    .btn-remove {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
    }
    .btn-remove:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

    .form-row { display: flex; gap: 1rem; }
    .form-group { margin-bottom: 0; }

    .form-label {
      display: block;
      font-size: 0.7rem;
      font-weight: 700;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.4rem;
    }

    .form-input {
      width: 100%;
      padding: 0.7rem 0.9rem;
      background: rgba(0, 0, 0, 0.2);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      color: #f1f5f9;
      font-size: 0.9rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .form-input:focus {
      outline: none;
      border-color: #60a5fa;
      box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.15);
    }
    .form-input::placeholder { color: rgba(255, 255, 255, 0.25); }

    .empty-state {
      text-align: center;
      padding: 2rem 1rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 1rem;
    }
    .empty-state p { font-size: 0.95rem; margin: 0.75rem 0 0.25rem; color: rgba(255, 255, 255, 0.6); }
    .empty-state span { font-size: 0.8rem; color: rgba(255, 255, 255, 0.35); }

    .btn-add {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(96, 165, 250, 0.1);
      border: 1.5px dashed rgba(96, 165, 250, 0.3);
      border-radius: 10px;
      color: #93c5fd;
      padding: 0.7rem 1.2rem;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 1rem;
      width: 100%;
      justify-content: center;
    }
    .btn-add:hover {
      background: rgba(96, 165, 250, 0.15);
      border-color: rgba(96, 165, 250, 0.5);
    }

    .step-note {
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.35);
      margin: 0.5rem 0 0;
      font-style: italic;
    }

    @media (max-width: 640px) {
      .form-row { flex-direction: column; gap: 0; }
    }
  `]
})
export class InscripcionStepAccessosComponent {
  data = input.required<InscripcionData>();
  lastDirection = input<'left' | 'right'>('left');
  addPerson = output<void>();
  removePerson = output<number>();
}
