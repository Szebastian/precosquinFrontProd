import { Component, input, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionData } from '../inscripcion.page';

export interface Member {
  fullName: string;
  dni: string;
  age: number | null;
  role: string;
}

@Component({
  selector: 'app-inscripcion-step-1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
      <div class="form-group">
        <label class="form-label" for="fullName">Nombre y apellido *</label>
        <input type="text" id="fullName" name="fullName" required class="form-input"
          [(ngModel)]="data().fullName" placeholder="Ej: Juan Carlos Gómez" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="dni">DNI *</label>
          <input type="text" id="dni" name="dni" required class="form-input"
            [(ngModel)]="data().dni" placeholder="12345678" maxlength="8" />
          <span class="form-hint">Solo números, 7 u 8 dígitos</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="birthDate">Fecha de nacimiento *</label>
          <input type="date" id="birthDate" name="birthDate" required class="form-input"
            [(ngModel)]="data().birthDate" (ngModelChange)="onBirthDateChange()" />
          <span class="form-hint">Debés tener al menos 16 años</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="age">Edad</label>
          <input type="text" id="age" name="age" class="form-input form-input-readonly"
            [value]="data().age !== null ? data().age + ' años' : '—'" readonly />
        </div>
        <div class="form-group">
          <label class="form-label" for="address">Domicilio *</label>
          <input type="text" id="address" name="address" required class="form-input"
            [(ngModel)]="data().address" placeholder="Calle, número, piso, depto" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="locality">Localidad *</label>
          <input type="text" id="locality" name="locality" required class="form-input"
            [(ngModel)]="data().locality" placeholder="Ej: Puerto Pirámides" />
        </div>
        <div class="form-group">
          <label class="form-label" for="province">Provincia *</label>
          <select id="province" name="province" required class="form-input"
            [(ngModel)]="data().province">
            <option value="">Seleccionar provincia</option>
            @for (prov of provincias; track prov) {
              <option [value]="prov">{{ prov }}</option>
            }
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="phone">Teléfono de contacto *</label>
          <input type="tel" id="phone" name="phone" required class="form-input"
            [(ngModel)]="data().phone" placeholder="+54 11 1234-5678" />
          <span class="form-hint">Con código de país y área</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="email">Correo electrónico *</label>
          <input type="email" id="email" name="email" required class="form-input"
            [(ngModel)]="data().email" placeholder="tu&#64;ejemplo.com" />
          <span class="form-hint">Recibirás confirmación en este email</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-content { min-height: 200px; }
    .slide-left { animation: slideLeft 0.3s ease-out; }
    .slide-right { animation: slideRight 0.3s ease-out; }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class InscripcionStep1Component {
  data = input.required<InscripcionData>();
  provincias = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut',
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
    'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
    'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
    'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  lastDirection = input.required<'left' | 'right'>();

  onBirthDateChange(): void {
    if (this.data().birthDate) {
      const age = this.calculateAge(this.data().birthDate);
      if (age !== null && age >= 16) {
        (this.data as any).age = age;
      }
    }
  }

  calculateAge(birthDate: string): number | null {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  }
}
