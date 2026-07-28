import { Component, input, signal, output, OnInit, inject, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InscripcionData, Member } from '../inscripcion.page';
import { environment } from '../../../../../environments/environment';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, timeout } from 'rxjs';

@Component({
  selector: 'app-inscripcion-step-1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
      <!-- Field Progress Indicator -->
      <div class="step-progress-bar">
        <div class="progress-info">
          <span class="progress-title">Completá tus datos</span>
          <span class="progress-count">{{ completedCount() }}/{{ totalFields() }}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" [style.width.%]="progressPercent()"></div>
        </div>
        <div class="progress-dots">
          @for (field of requiredFields(); track field.key) {
            <div class="progress-dot" [class.completed]="field.valid()" [title]="field.label">
              <div class="dot-circle">
                @if (field.valid()) {
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                }
              </div>
              <span class="dot-label">{{ field.label }}</span>
            </div>
          }
        </div>
      </div>

      <div class="question-group">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <div class="form-field-group flex flex-col items-start w-full">
            <label for="firstName" class="minimal-label">¿Cómo se llama? *</label>
            <input type="text" id="firstName" name="firstName" required
              placeholder="Tu primer nombre" class="minimal-input"
              [class.input-error]="firstNameError()"
              [class.input-valid]="firstName().length >= 2 && !firstNameError()"
              [(ngModel)]="firstName" (ngModelChange)="updateFullName(); validateFirstName()" />
            @if (firstNameError()) {
              <span class="field-error" role="alert">{{ firstNameError() }}</span>
            }
          </div>
          <div class="form-field-group flex flex-col items-start w-full">
            <label for="lastName" class="minimal-label">¿Cuál es tu apellido? *</label>
            <input type="text" id="lastName" name="lastName" required
              placeholder="Tu apellido" class="minimal-input"
              [class.input-error]="lastNameError()"
              [class.input-valid]="lastName().length >= 2 && !lastNameError()"
              [(ngModel)]="lastName" (ngModelChange)="updateFullName(); validateLastName()" />
            @if (lastNameError()) {
              <span class="field-error" role="alert">{{ lastNameError() }}</span>
            }
          </div>
        </div>
      </div>

      <div class="question-group">
        <div class="form-field-group flex flex-col items-start w-full">
            <label for="dni" class="minimal-label">¿Cuál es tu DNI? *</label>
          <div class="input-with-icon">
            <input type="text" id="dni" name="dni" required
              placeholder="42.567.891" class="minimal-input"
              [class.input-error]="dniError()"
              [class.input-valid]="dniValid() && !dniError()"
              maxlength="11"
              [ngModel]="dniDisplay()" (ngModelChange)="onDniInput($event)" />
            @if (dniValid() && !dniError()) {
              <span class="input-icon icon-valid">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            }
            @if (dniError()) {
              <span class="input-icon icon-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </span>
            }
          </div>
          @if (dniError()) {
            <span class="field-error" role="alert">{{ dniError() }}</span>
          } @else {
            <span class="minimal-hint">Solo números, 7 u 8 dígitos. Ej: 42.567.891</span>
          }
        </div>
      </div>

      <div class="question-group">
        <div class="form-field-group flex flex-col items-start w-full">
          <label class="minimal-label" for="birthDate">¿Cuándo naciste? *</label>
          <!-- Desktop: 3 dropdowns -->
          <div class="date-picker-row date-desktop">
            <div class="date-col">
              <label class="date-select-label" for="birthDay">Día</label>
              <select id="birthDay" class="date-select" [class.input-error]="birthDateError()"
                [(ngModel)]="birthDay" (ngModelChange)="syncBirthDate(); validateBirthDate()">
                <option value="" disabled>Día</option>
                @for (d of days; track d) {
                  <option [value]="d">{{ d }}</option>
                }
              </select>
            </div>
            <div class="date-col">
              <label class="date-select-label" for="birthMonth">Mes</label>
              <select id="birthMonth" class="date-select" [class.input-error]="birthDateError()"
                [(ngModel)]="birthMonth" (ngModelChange)="syncBirthDate(); validateBirthDate()">
                <option value="" disabled>Mes</option>
                @for (m of months; track m.value) {
                  <option [value]="m.value">{{ m.label }}</option>
                }
              </select>
            </div>
            <div class="date-col">
              <label class="date-select-label" for="birthYear">Año</label>
              <select id="birthYear" class="date-select" [class.input-error]="birthDateError()"
                [(ngModel)]="birthYear" (ngModelChange)="syncBirthDate(); validateBirthDate()">
                <option value="" disabled>Año</option>
                @for (y of years; track y) {
                  <option [value]="y">{{ y }}</option>
                }
              </select>
            </div>
          </div>
          <!-- Mobile: native date input -->
          <input type="date" class="date-native date-mobile"
            [class.input-error]="birthDateError()"
            [max]="maxDateAttr()"
            [value]="nativeDateValue()"
            (change)="onNativeDateChange($event)" />
          <div class="date-bottom-row">
            @if (data().age !== null) {
              <span class="date-age-badge" [class.age-error]="data().age !== null && data().age! < 16">
                {{ data().age }} años
                @if (data().age! < 16) {
                  — mínimo 16
                }
              </span>
            }
            @if (birthDateError()) {
              <span class="field-error" role="alert">{{ birthDateError() }}</span>
            }
            @if (ageError()) {
              <span class="field-error" role="alert">{{ ageError() }}</span>
            }
          </div>
        </div>
      </div>

      <div class="question-group">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <div class="form-field-group flex flex-col items-start w-full">
            <label class="minimal-label" for="address">¿Dónde vivís? *</label>
            <input type="text" id="address" name="address" required class="minimal-input"
              placeholder="Calle y número"
              [class.input-error]="addressError()"
              [class.input-valid]="data().address.length >= 3 && !addressError()"
              [(ngModel)]="data().address" (ngModelChange)="validateAddress()" />
            @if (addressError()) {
              <span class="field-error" role="alert">{{ addressError() }}</span>
            }
</div>
           <div class="form-field-group flex flex-col items-start w-full">
             <label class="minimal-label" for="province">¿De qué provincia sos? *</label>
             <select id="province" name="province" required class="minimal-input"
               [class.input-error]="provinceError()"
               [class.input-valid]="selectedProvince().length > 0 && !provinceError()"
               [(ngModel)]="selectedProvince" (ngModelChange)="onProvinceChange()">
               <option value="">Elegí tu provincia</option>
               @for (prov of provincias; track prov) {
                 <option [value]="prov">{{ prov }}</option>
               }
             </select>
             @if (provinceError()) {
               <span class="field-error" role="alert">{{ provinceError() }}</span>
             }
           </div>
           <div class="form-field-group flex flex-col items-start w-full">
             <label class="minimal-label" for="locality">¿En qué localidad? *</label>
             <select id="locality" name="locality" required class="minimal-input"
               [class.input-error]="localityError()"
               [class.input-valid]="data().locality.length >= 2 && !localityError()"
               [disabled]="!selectedProvince()"
               [(ngModel)]="data().locality" (ngModelChange)="onLocalityChange($event)">
               <option value="" disabled>{{ selectedProvince() ? 'Elegí tu localidad' : 'Primero elegí una provincia' }}</option>
               @for (loc of localidadesFiltradas(); track loc) {
                 <option [value]="loc">{{ loc }}</option>
               }
             </select>
             @if (localityError()) {
               <span class="field-error" role="alert">{{ localityError() }}</span>
             }
           </div>
         </div>

       <div class="question-group">
          <div class="form-field-group flex flex-col items-start w-full">
            <label class="minimal-label" for="phone">¿Cuál es tu teléfono? *</label>
            <input type="tel" id="phone" name="phone" required class="minimal-input"
              placeholder="+54 11 1234-5678"
              [class.input-error]="phoneError()"
              [class.input-valid]="phoneValid() && !phoneError()"
              [(ngModel)]="data().phone" (ngModelChange)="validatePhone()" />
            @if (phoneError()) {
              <span class="field-error" role="alert">{{ phoneError() }}</span>
            } @else {
              <span class="minimal-hint">Con código de área</span>
            }
          </div>
        </div>
      </div>

      <div class="question-group">
        <div class="form-field-group flex flex-col items-start w-full">
            <label class="minimal-label" for="email">¿Cuál es tu email? *</label>
          <div class="input-with-icon">
            <input type="email" id="email" name="email" required class="minimal-input"
              placeholder="tu&#64;ejemplo.com"
              [class.input-error]="emailError()"
              [class.input-valid]="emailValid() && !emailError() && !emailChecking()"
              [class.input-checking]="emailChecking()"
              [(ngModel)]="data().email" (ngModelChange)="onEmailChange()" />
            @if (emailChecking()) {
              <span class="input-icon icon-checking">
                <span class="spinner-small"></span>
              </span>
            }
            @if (emailValid() && !emailChecking() && !emailError()) {
              <span class="input-icon icon-valid">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            }
            @if (emailError() && !emailChecking()) {
              <span class="input-icon icon-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </span>
            }
          </div>
          @if (emailError()) {
            <span class="field-error" role="alert">{{ emailError() }}</span>
          } @else {
            <span class="minimal-hint">Ahí te mandamos la confirmación</span>
          }
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

    .date-picker-row {
      display: flex;
      gap: 0.75rem;
      width: 100%;
      margin-top: 0.5rem;
    }
    .date-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .date-select-label {
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
      font-weight: 500;
    }
    .date-select {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 2px solid rgba(255, 255, 255, 0.08);
      border-radius: 0;
      color: #f1f5f9;
      font-size: 1.35rem;
      font-weight: 500;
      padding: 0.5rem 0;
      padding-right: 1.5rem;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      cursor: pointer;
      outline: none;
      transition: border-color 0.25s ease;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.25rem center;
    }
    .date-select.input-error {
      border-bottom-color: #f87171 !important;
    }
    .date-select:focus {
      border-bottom-color: #4c8be6;
    }
    .date-select option {
      background: #1a1d23;
      color: #f1f5f9;
      padding: 0.5rem;
    }
    .date-bottom-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.5rem;
      min-height: 1.5rem;
      flex-wrap: wrap;
    }
    .date-age-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.75rem;
      background: rgba(76, 139, 230, 0.12);
      border: 1px solid rgba(76, 139, 230, 0.25);
      border-radius: 9999px;
      color: #7eb5f7;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      width: fit-content;
      animation: fadeIn 0.3s ease;
    }
    .date-age-badge.age-error {
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.25);
      color: #f87171;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

    .input-with-icon {
      position: relative;
      width: 100%;
    }
    .input-with-icon .minimal-input {
      width: 100%;
      padding-right: 2.5rem;
    }
    .input-icon {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }
    .icon-valid { color: #4ade80; }
    .icon-error { color: #f87171; }
    .icon-checking { color: #64748b; }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-top-color: #4c8be6;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .minimal-input.input-error {
      border-bottom-color: #f87171 !important;
    }
    .minimal-input.input-valid {
      border-bottom-color: #4ade80 !important;
    }
    .minimal-input.input-checking {
      border-bottom-color: #4c8be6 !important;
    }

    .field-error {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      color: #f87171;
      margin-top: 0.35rem;
      animation: fadeIn 0.2s ease;
    }

    .step-progress-bar {
      position: sticky;
      top: 0;
      z-index: 20;
      margin-bottom: 2rem;
      padding: 1rem 1.25rem;
      background: rgba(22, 27, 38, 0.95);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 0.75rem;
      margin-left: -2.5rem;
      margin-right: -2.5rem;
      padding-left: 2.5rem;
      padding-right: 2.5rem;
    }
    .progress-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.625rem;
    }
    .progress-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .progress-count {
      font-size: 0.8rem;
      font-weight: 700;
      color: #60a5fa;
      background: rgba(76, 139, 230, 0.1);
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
    }
    .progress-track {
      height: 4px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 1rem;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%);
      border-radius: 2px;
      transition: width 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
      box-shadow: 0 0 8px rgba(34, 197, 94, 0.3);
    }
    .progress-dots {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0;
    }
    .progress-dot {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.375rem;
      flex: 1;
      min-width: 0;
    }
    .dot-circle {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.04);
      border: 2px solid rgba(255, 255, 255, 0.1);
      color: transparent;
      transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
      flex-shrink: 0;
    }
    .progress-dot.completed .dot-circle {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border-color: #22c55e;
      color: #fff;
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
      animation: dotPop 0.35s cubic-bezier(0.25, 0.1, 0.25, 1);
    }
    @keyframes dotPop {
      0% { transform: scale(0.7); }
      60% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    .dot-label {
      font-size: 0.6rem;
      font-weight: 500;
      color: #64748b;
      text-align: center;
      line-height: 1.2;
      transition: color 0.2s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      padding: 0 2px;
    }
    .progress-dot.completed .dot-label {
      color: #4ade80;
      font-weight: 600;
    }

    .date-desktop { display: flex; }
    .date-mobile { display: none; }

    .date-native {
      width: 100%;
      padding: 0.6rem 0;
      font-size: 1.25rem;
      font-family: inherit;
      color: var(--text);
      background: transparent;
      border: none;
      border-bottom: 2px solid rgba(255, 255, 255, 0.12);
      outline: none;
      transition: border-color 0.2s ease;
    }
    .date-native:focus {
      border-bottom-color: #4c8be6;
    }
    .date-native.input-error {
      border-bottom-color: #f87171;
    }

    @media (max-width: 640px) {
      .step-progress-bar {
        padding: 0.75rem 1rem;
        margin-left: -1.5rem;
        margin-right: -1.5rem;
        padding-left: 1rem;
        padding-right: 1rem;
      }
      .progress-info { margin-bottom: 0.5rem; }
      .progress-title { font-size: 0.65rem; }
      .progress-count { font-size: 0.7rem; padding: 0.15rem 0.5rem; }
      .progress-dots { gap: 0; }
      .dot-circle { width: 18px; height: 18px; }
      .dot-label { font-size: 0.5rem; }
      .progress-track { margin-bottom: 0.625rem; }
      .date-picker-row { flex-direction: column; gap: 0.5rem; }
      .date-select { font-size: 1.1rem; }
      .date-desktop { display: none; }
      .date-mobile { display: block; }
      .field-error { font-size: 0.7rem; }
    }

    @media (max-width: 480px) {
      .step-progress-bar {
        padding: 0.5rem 0.75rem;
        margin-left: -1rem;
        margin-right: -1rem;
        padding-left: 0.75rem;
        padding-right: 0.75rem;
      }
      .dot-circle { width: 16px; height: 16px; }
      .dot-label { font-size: 0.45rem; }
      .date-select { font-size: 0.95rem; padding: 0.4rem 0; }
      .date-age-badge { font-size: 0.75rem; padding: 0.2rem 0.6rem; }
      .field-error { font-size: 0.65rem; margin-top: 0.25rem; }
    }
  `]
})
export class InscripcionStep1Component implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();
  private emailSubject$ = new Subject<string>();

  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();

  provincias = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut',
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
    'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
    'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
    'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];

  firstName = signal<string>('');
  lastName = signal<string>('');

  dniDisplay = signal('');
  birthDay = signal<string>('');
  birthMonth = signal<string>('');
  birthYear = signal<string>('');
  nativeDateValue = signal('');
  maxDateAttr = signal('');
  days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  months = [
    { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' }, { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
  ];
  years = Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i));

  readonly localidadesPorProvincia: Record<string, string[]> = {
    'Chubut': [
      'Puerto Pirámides', 'Trelew', 'Rawson', 'Gaiman', 'Dolavon',
      'Comodoro Rivadavia', 'Rada Tilly', 'Caleta Olivia', 'Cañadón Seco',
      'Paso de Indios', 'Los Altares', 'Esquel', 'Trevelin', 'Lago Blanco',
      'Río Pico', 'Gobernador Costa', 'Corcovado', 'Cholila', 'Epuyén',
      'El Bolsón', 'Lago Puelo', 'El Hoyo', 'Gastre', 'Telsen', 'Languiñéo',
    ],
    'Río Negro': [
      'Bariloche', 'Viedma', 'Cipolletti', 'General Roca', 'San Carlos de Bariloche',
      'El Bolsón', 'Villa Regina', 'Choele Choel', 'Río Colorado',
    ],
    'Neuquén': [
      'Neuquén', 'San Martín de los Andes', 'Villa La Angostura', 'Zapala',
      'Añelo', 'Plottier', 'Cutral Co', 'Rincón de los Sauces',
    ],
    'La Pampa': [
      'Santa Rosa', 'General Pico', 'Catriló', 'Winifreda', '25 de Mayo',
      'Eduardo Castex', 'Quemú Quemú',
    ],
    'Buenos Aires': [
      'La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Olavarría',
      'Dolores', 'Chascomús', 'Pinamar', 'Villa Gesell', 'Necochea',
      'Junín', 'Pergamino', 'Azul', 'Lobos', 'Cañuelas', 'San Nicolás',
      'Avellaneda', 'Lanús', 'Quilmes', 'Morón', 'La Matanza', 'Florencio Varela',
      'Berazategui', 'Esteban Echeverría', 'Almirante Brown', 'Lomas de Zamora',
    ],
    'CABA': ['Ciudad Autónoma de Buenos Aires'],
    'Córdoba': [
      'Córdoba', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María', 'Cosquín',
      'Alta Gracia', 'Jesús María', 'Unquillo', 'Mina Clavero',
    ],
    'Santa Fe': [
      'Rosario', 'Santa Fe', 'Rafaela', 'Venado Tuerto', 'Reconquista',
      'Villa Gobernador Gálvez', 'Cañada de Gómez',
    ],
    'Entre Ríos': [
      'Paraná', 'Concordia', 'Villa María Grande', 'Colón', 'Federación',
      'Villaguay', 'Gualeguaychú',
    ],
    'Mendoza': [
      'Mendoza', 'San Rafael', 'San Martín', 'Guaymallén', 'Las Heras',
      'Luján de Cuyo', 'Tunuyán', 'San Carlos',
    ],
    'Salta': [
      'Salta', 'San Miguel de Tucumán', 'Jujuy', 'Orán', 'Rivadavia',
      'Tartagal', 'Metán', 'Cafayate', 'Purmamarca', 'Tilcara',
    ],
    'Tucumán': [
      'San Miguel de Tucumán', 'Concepción', 'Bella Vista', 'Tafí Viejo',
      'Monteros', 'Chicligasta',
    ],
    'Misiones': [
      'Posadas', 'Puerto Iguazú', 'Eldorado', 'Oberá', 'San Pedro',
      'Apóstoles', 'Leandro N. Alem',
    ],
    'Corrientes': [
      'Corrientes', 'Resistencia', 'Goya', 'Mercedes', 'Curuzú Cuatiá',
      'Paso de los Libres', 'Santo Tomé',
    ],
    'Chaco': [
      'Resistencia', 'Buenos Aires', 'Saenz Peña', 'Villa Ángela',
      'Charata', 'General San Martín',
    ],
    'Formosa': [
      'Formosa', 'Clorinda', 'Pirané', 'El Colorado', 'Las Lomitas',
    ],
    'San Juan': [
      'San Juan', 'Chimbas', 'Santa Lucía', 'Rivadavia', 'Zonda',
      'Calingasta', 'Jáchal', 'Iglesia',
    ],
    'San Luis': [
      'San Luis', 'Villa Mercedes', 'Quines', 'Merlo', 'Concarán',
    ],
    'La Rioja': [
      'La Rioja', 'Chilecito', 'Famatina', 'Villa Unión', 'Anillaco',
    ],
    'Catamarca': [
      'San Fernando del Valle de Catamarca', 'Belén', 'Tinogasta',
      'Andalgalá', 'Santa María',
    ],
    'Santiago del Estero': [
      'Santiago del Estero', 'La Banda', 'Frmosa', 'Añatuya', 'Quimilí',
    ],
    'Santa Cruz': [
      'Río Gallegos', 'Caleta Olivia', 'El Calafate', 'Perito Moreno',
      'Las Heras', '28 de Noviembre', 'Puerto Deseado',
    ],
    'Tierra del Fuego': [
      'Ushuaia', 'Río Grande', 'Tolhuin',
    ],
    'Jujuy': [
      'San Salvador de Jujuy', 'San Pedro', 'Ledesma', 'Santa Catalina',
      'Tilcara', 'Purmamarca', 'Humahuaca',
    ],
  };

  firstNameError = signal('');
  lastNameError = signal('');
  dniError = signal('');
  birthDateError = signal('');
  addressError = signal('');
  localityError = signal('');
  provinceError = signal('');
  phoneError = signal('');
  emailError = signal('');
  ageError = signal('');
  emailChecking = signal(false);
  emailValid = signal(false);
  dniValid = signal(false);
  phoneValid = signal(false);
  validated = signal(false);
  selectedProvince = signal('');

  // Required fields for progress indicator
  requiredFields = computed(() => [
    { key: 'firstName', label: 'Nombre', valid: () => this.firstName().trim().length >= 2 && !this.firstNameError() },
    { key: 'lastName', label: 'Apellido', valid: () => this.lastName().trim().length >= 2 && !this.lastNameError() },
    { key: 'dni', label: 'DNI', valid: () => this.dniValid() && !this.dniError() },
    { key: 'birthDate', label: 'Fecha nac.', valid: () => this.birthDay() && this.birthMonth() && this.birthYear() && !this.birthDateError() && (this.data() as any).age !== null && (this.data() as any).age >= 16 && !this.ageError() },
    { key: 'address', label: 'Domicilio', valid: () => this.data().address.trim().length >= 3 && !this.addressError() },
    { key: 'locality', label: 'Localidad', valid: () => this.data().locality.length > 0 && !this.localityError() },
    { key: 'province', label: 'Provincia', valid: () => this.selectedProvince().length > 0 && !this.provinceError() },
    { key: 'phone', label: 'Teléfono', valid: () => this.phoneValid() && !this.phoneError() },
    { key: 'email', label: 'Email', valid: () => this.emailValid() && !this.emailError() && !this.emailChecking() },
  ]);

  completedCount = computed(() => this.requiredFields().filter(f => f.valid()).length);
  totalFields = computed(() => this.requiredFields().length);
  progressPercent = computed(() => Math.round((this.completedCount() / this.totalFields()) * 100));

  localidadesFiltradas = computed(() => {
    const prov = this.selectedProvince();
    return prov ? (this.localidadesPorProvincia[prov] || []) : [];
  });

  ngOnInit(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.maxDateAttr.set(`${yyyy}-${mm}-${dd}`);

    this.selectedProvince.set(this.data().province || '');

    this.firstName.set(this.data().firstName || '');
    this.lastName.set(this.data().lastName || '');

    if (this.data().dni) {
      const raw = this.data().dni.replace(/\D/g, '');
      this.dniDisplay.set(raw.replace(/(\d{2})(\d{0,3})(\d{0,3})/, (_, a, b, c) => [a, b, c].filter(Boolean).join('.')));
    }

    if (this.data().birthDate) {
      const parts = this.data().birthDate.split('-');
      if (parts.length === 3) {
        this.birthYear.set(parts[0]);
        this.birthMonth.set(parts[1]);
        this.birthDay.set(parts[2]);
        this.nativeDateValue.set(this.data().birthDate);
      }
    }

    this.emailSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(email => this.checkEmailBackend(email));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  syncBirthDate(): void {
    const d = this.birthDay();
    const m = this.birthMonth();
    const y = this.birthYear();
    if (d && m && y) {
      (this.data() as any).birthDate = `${y}-${m}-${d.padStart(2, '0')}`;
      this.nativeDateValue.set(this.data().birthDate);
      this.onBirthDateChange();
    }
  }

  onNativeDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      (this.data() as any).birthDate = value;
      this.nativeDateValue.set(value);
      const parts = value.split('-');
      if (parts.length === 3) {
        this.birthYear.set(parts[0]);
        this.birthMonth.set(parts[1]);
        this.birthDay.set(parts[2]);
      }
      this.onBirthDateChange();
      this.validateBirthDate();
    }
  }

  updateFullName(): void {
    (this.data() as any).firstName = this.firstName().trim();
    (this.data() as any).lastName = this.lastName().trim();
  }

  onBirthDateChange(): void {
    if (this.data().birthDate) {
      const age = this.calculateAge(this.data().birthDate);
      if (age !== null) {
        (this.data() as any).age = age;
        this.ageError.set(age < 16 ? 'Debés tener al menos 16 años para inscribirte' : '');
      } else {
        (this.data() as any).age = null;
        this.ageError.set('');
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

  validateFirstName(): void {
    const v = this.firstName().trim();
    this.firstNameError.set(v.length === 0 ? 'El nombre es obligatorio' : v.length < 2 ? 'Mínimo 2 caracteres' : '');
  }

  validateLastName(): void {
    const v = this.lastName().trim();
    this.lastNameError.set(v.length === 0 ? 'El apellido es obligatorio' : v.length < 2 ? 'Mínimo 2 caracteres' : '');
  }

  onDniInput(value: string): void {
    const raw = value.replace(/\D/g, '').slice(0, 8);
    const formatted = raw.replace(/(\d{2})(\d{0,3})(\d{0,3})/, (_, a, b, c) => [a, b, c].filter(Boolean).join('.'));
    this.dniDisplay.set(formatted);
    (this.data() as any).dni = raw;
    this.validateDni();
  }

  validateDni(): void {
    const v = this.data().dni.replace(/\D/g, '');
    (this.data() as any).dni = v;
    if (v.length === 0) {
      this.dniError.set('El DNI es obligatorio');
      this.dniValid.set(false);
    } else if (v.length < 7) {
      this.dniError.set('Mínimo 7 dígitos');
      this.dniValid.set(false);
    } else if (v.length > 8) {
      this.dniError.set('Máximo 8 dígitos');
      this.dniValid.set(false);
    } else {
      this.dniError.set('');
      this.dniValid.set(true);
    }
  }

  validateBirthDate(): void {
    if (!this.birthDay() || !this.birthMonth() || !this.birthYear()) {
      this.birthDateError.set('Completá día, mes y año');
    } else {
      this.birthDateError.set('');
    }
  }

  validateAddress(): void {
    const v = this.data().address.trim();
    this.addressError.set(v.length === 0 ? 'El domicilio es obligatorio' : v.length < 3 ? 'Mínimo 3 caracteres' : '');
  }

  onLocalityChange(value: string): void {
    this.data().locality = value;
    this.validateLocality();
  }

  onProvinceChange(): void {
    this.data().province = this.selectedProvince();
    this.data().locality = '';
    this.validateProvince();
    this.validateLocality();
  }

  validateLocality(): void {
    const v = this.data().locality.trim();
    this.localityError.set(v.length === 0 ? 'La localidad es obligatoria' : '');
  }

  validateProvince(): void {
    this.provinceError.set(this.selectedProvince().length === 0 ? 'Seleccioná una provincia' : '');
  }

  validatePhone(): void {
    const v = this.data().phone.replace(/[^\d+\-\s()]/g, '');
    (this.data() as any).phone = v;
    const digits = v.replace(/\D/g, '');
    if (digits.length === 0) {
      this.phoneError.set('El teléfono es obligatorio');
      this.phoneValid.set(false);
    } else if (digits.length < 8) {
      this.phoneError.set('Mínimo 8 dígitos (con código de área)');
      this.phoneValid.set(false);
    } else {
      this.phoneError.set('');
      this.phoneValid.set(true);
    }
  }

  onEmailChange(): void {
    const v = this.data().email.trim().toLowerCase();
    (this.data() as any).email = v;
    this.emailValid.set(false);

    if (v.length === 0) {
      this.emailError.set('El email es obligatorio');
      this.emailChecking.set(false);
      return;
    }
    if (!this.isValidEmailFormat(v)) {
      this.emailError.set('Ingresá un email válido');
      this.emailChecking.set(false);
      return;
    }

    this.emailError.set('');
    this.emailChecking.set(true);
    this.emailSubject$.next(v);
  }

  private validateEmailSync(): void {
    const v = this.data().email.trim().toLowerCase();
    (this.data() as any).email = v;
    if (v.length === 0) {
      this.emailError.set('El email es obligatorio');
      this.emailValid.set(false);
    } else if (!this.isValidEmailFormat(v)) {
      this.emailError.set('Ingresá un email válido');
      this.emailValid.set(false);
    } else {
      this.emailError.set('');
      this.emailValid.set(true);
    }
  }

  private isValidEmailFormat(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private checkEmailBackend(email: string): void {
    this.http.get<{ exists: boolean; message: string; status?: string }>(
      `${environment.apiUrl}/inscriptions/check-email`,
      { params: { email } }
    ).pipe(timeout(5000)).subscribe({
      next: (res) => {
        this.emailChecking.set(false);
        if (res.exists) {
          this.emailError.set(res.message);
          this.emailValid.set(false);
        } else {
          this.emailError.set('');
          this.emailValid.set(true);
        }
      },
      error: () => {
        this.emailChecking.set(false);
        this.emailError.set('');
        this.emailValid.set(true);
      },
    });
  }

  hasAnyError(): boolean {
    return !!(this.firstNameError() || this.lastNameError() || this.dniError()
      || this.birthDateError() || this.ageError() || this.addressError()
      || this.localityError() || this.provinceError() || this.phoneError()
      || this.emailError());
  }

  runAllValidations(): boolean {
    this.validateFirstName();
    this.validateLastName();
    this.validateDni();
    this.validateBirthDate();
    this.validateAddress();
    this.validateLocality();
    this.validateProvince();
    this.validatePhone();
    this.validateEmailSync();
    this.onBirthDateChange();

    const email = this.data().email.trim().toLowerCase();
    if (this.isValidEmailFormat(email) && !this.emailValid() && !this.emailChecking()) {
      this.emailChecking.set(true);
      this.checkEmailBackend(email);
    }

    this.validated.set(true);
    return !this.hasAnyError();
  }

  isFormValid(): boolean {
    const age = this.data().age;
    const email = this.data().email.trim().toLowerCase();
    return this.firstName().trim().length >= 2
      && this.lastName().trim().length >= 2
      && this.dniValid()
      && this.data().birthDate !== ''
      && age !== null && age >= 16
      && this.data().address.trim().length >= 3
      && this.data().locality.length > 0
      && this.selectedProvince().length > 0
      && this.phoneValid()
      && email.length > 0
      && this.isValidEmailFormat(email)
      && !this.hasAnyError();
  }
}
