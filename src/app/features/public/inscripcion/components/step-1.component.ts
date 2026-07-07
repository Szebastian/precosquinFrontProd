import { Component, input, signal, output, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InscripcionData } from '../inscripcion.page';
import { environment } from '../../../../../environments/environment';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, timeout } from 'rxjs';

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
              <span class="field-error">{{ firstNameError() }}</span>
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
              <span class="field-error">{{ lastNameError() }}</span>
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
              maxlength="8"
              [(ngModel)]="data().dni" (ngModelChange)="validateDni()" />
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
            <span class="field-error">{{ dniError() }}</span>
          } @else {
            <span class="minimal-hint">Solo números, 7 u 8 dígitos. Ej: 42.567.891</span>
          }
        </div>
      </div>

      <div class="question-group">
        <div class="form-field-group flex flex-col items-start w-full">
          <label class="minimal-label" for="birthDate">¿Cuándo naciste? *</label>
          <div class="date-picker-row">
            <div class="date-col">
              <select class="date-select" [class.input-error]="birthDateError()"
                [(ngModel)]="birthDay" (ngModelChange)="syncBirthDate(); validateBirthDate()">
                <option value="" disabled>Día</option>
                @for (d of days; track d) {
                  <option [value]="d">{{ d }}</option>
                }
              </select>
            </div>
            <div class="date-col">
              <select class="date-select" [class.input-error]="birthDateError()"
                [(ngModel)]="birthMonth" (ngModelChange)="syncBirthDate(); validateBirthDate()">
                <option value="" disabled>Mes</option>
                @for (m of months; track m.value) {
                  <option [value]="m.value">{{ m.label }}</option>
                }
              </select>
            </div>
            <div class="date-col">
              <select class="date-select" [class.input-error]="birthDateError()"
                [(ngModel)]="birthYear" (ngModelChange)="syncBirthDate(); validateBirthDate()">
                <option value="" disabled>Año</option>
                @for (y of years; track y) {
                  <option [value]="y">{{ y }}</option>
                }
              </select>
            </div>
          </div>
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
              <span class="field-error">{{ birthDateError() }}</span>
            }
            @if (ageError()) {
              <span class="field-error">{{ ageError() }}</span>
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
              <span class="field-error">{{ addressError() }}</span>
            }
          </div>
          <div class="form-field-group flex flex-col items-start w-full">
            <label class="minimal-label" for="locality">¿En qué localidad? *</label>
            <input type="text" id="locality" name="locality" required class="minimal-input"
              placeholder="Tu ciudad o pueblo"
              [class.input-error]="localityError()"
              [class.input-valid]="data().locality.length >= 2 && !localityError()"
              [(ngModel)]="data().locality" (ngModelChange)="validateLocality()" />
            @if (localityError()) {
              <span class="field-error">{{ localityError() }}</span>
            }
          </div>
        </div>
      </div>

      <div class="question-group">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <div class="form-field-group flex flex-col items-start w-full">
            <label class="minimal-label" for="province">¿De qué provincia sos? *</label>
            <select id="province" name="province" required class="minimal-input"
              [class.input-error]="provinceError()"
              [class.input-valid]="data().province.length > 0 && !provinceError()"
              [(ngModel)]="data().province" (ngModelChange)="validateProvince()">
              <option value="">Elegí tu provincia</option>
              @for (prov of provincias; track prov) {
                <option [value]="prov">{{ prov }}</option>
              }
            </select>
            @if (provinceError()) {
              <span class="field-error">{{ provinceError() }}</span>
            }
          </div>
          <div class="form-field-group flex flex-col items-start w-full">
            <label class="minimal-label" for="phone">¿Cuál es tu teléfono? *</label>
            <input type="tel" id="phone" name="phone" required class="minimal-input"
              placeholder="+54 11 1234-5678"
              [class.input-error]="phoneError()"
              [class.input-valid]="phoneValid() && !phoneError()"
              [(ngModel)]="data().phone" (ngModelChange)="validatePhone()" />
            @if (phoneError()) {
              <span class="field-error">{{ phoneError() }}</span>
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
            <span class="field-error">{{ emailError() }}</span>
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

    @media (max-width: 640px) {
      .date-picker-row { flex-direction: column; gap: 0.5rem; }
      .date-select { font-size: 1.15rem; }
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

  birthDay = signal<string>('');
  birthMonth = signal<string>('');
  birthYear = signal<string>('');

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

  ngOnInit(): void {
    const fullNameParts = this.data().fullName.split(' ');
    this.firstName.set(fullNameParts[0] || '');
    this.lastName.set(fullNameParts.slice(1).join(' ') || '');

    if (this.data().birthDate) {
      const parts = this.data().birthDate.split('-');
      if (parts.length === 3) {
        this.birthYear.set(parts[0]);
        this.birthMonth.set(parts[1]);
        this.birthDay.set(parts[2]);
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
      this.onBirthDateChange();
    }
  }

  updateFullName(): void {
    (this.data() as any).fullName = `${this.firstName()} ${this.lastName()}`.trim();
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

  validateLocality(): void {
    const v = this.data().locality.trim();
    this.localityError.set(v.length === 0 ? 'La localidad es obligatoria' : v.length < 2 ? 'Mínimo 2 caracteres' : '');
  }

  validateProvince(): void {
    this.provinceError.set(this.data().province.length === 0 ? 'Seleccioná una provincia' : '');
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
      && this.data().locality.trim().length >= 2
      && this.data().province.length > 0
      && this.phoneValid()
      && email.length > 0
      && this.isValidEmailFormat(email)
      && !this.hasAnyError();
  }
}
