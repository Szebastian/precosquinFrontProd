import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NgClass } from '@angular/common';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, NgClass],
  template: `
    <div class="login-page">
      <div class="login-container animate-scale-in">
        <a routerLink="/" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Volver al inicio
        </a>

        <div class="login-brand">
          <img src="assets/img/logoballena.webp" alt="Precosquin" class="brand-logo-lg" />
          <h1 class="login-title">Precosquin</h1>
          <p class="login-subtitle">Panel de Gestion de Artistas</p>
        </div>

        @if (errorMessage()) {
          <div class="login-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form (submit)="onSubmit($event)" class="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="tu&#64;ejemplo.com"
              class="form-input"
              [ngClass]="{'input-error': emailTouched() && !emailValid(), 'input-valid': emailTouched() && emailValid()}"
              autocomplete="email"
              (blur)="emailTouched.set(true)"
              (input)="onEmailInput($event)"
            />
            @if (emailTouched() && !emailValid()) {
              <span class="field-error">Ingresá un email válido</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Contraseña</label>
            <div class="password-wrapper">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                id="password"
                name="password"
                required
                placeholder="Tu contraseña"
                class="form-input"
                [ngClass]="{'input-error': passwordTouched() && !passwordValid()}"
                autocomplete="current-password"
              (blur)="passwordTouched.set(true)"
              (input)="onPasswordInput($event)"
            />
              <button type="button" class="password-toggle" (click)="showPassword.set(!showPassword())" tabindex="-1">
                @if (showPassword()) {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            @if (passwordTouched() && !passwordValid()) {
              <span class="field-error">La contraseña es requerida</span>
            }
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" name="remember" />
              <span>Recordarme</span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="isLoading()">
            @if (isLoading()) {
              <span class="spinner"></span>
              <span>Ingresando...</span>
            } @else {
              <span>Ingresar</span>
            }
          </button>
        </form>

        <div class="login-footer">
          <p class="text-sm text-muted text-center">
            ¿Olvidaste tu contraseña? <span class="text-disabled">Recuperar</span>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--gray-900) 0%, var(--brand-900) 100%);
      padding: var(--space-4);
    }

    .login-container {
      width: 100%;
      max-width: 400px;
      background-color: #fff;
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-xl);
      padding: var(--space-8);
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-sm);
      color: var(--gray-500);
      text-decoration: none;
      margin-bottom: var(--space-6);
      transition: color var(--transition-fast);
    }

    .back-link:hover { color: var(--brand-600); }

    .login-brand {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .brand-logo-lg {
      height: 120px;
      width: auto;
      margin-bottom: var(--space-4);
      display: block;
      margin-left: auto;
      margin-right: auto;
    }

    .login-title {
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      color: var(--gray-900);
      margin-bottom: var(--space-1);
    }

    .login-subtitle {
      font-size: var(--text-sm);
      color: var(--gray-500);
    }

    .login-error {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-lg);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      margin-bottom: var(--space-6);
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .login-form {
      margin-bottom: var(--space-6);
    }

    .form-group {
      margin-bottom: var(--space-5);
    }

    .form-label {
      display: block;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--gray-700);
      margin-bottom: var(--space-2);
    }

    .form-input {
      width: 100%;
      padding: 0.625rem 0.875rem;
      font-size: var(--text-sm);
      border: 1.5px solid var(--gray-300);
      border-radius: var(--radius-lg);
      background: #fff;
      color: var(--gray-900);
      outline: none;
      transition: all var(--transition-fast);
    }

    .form-input:focus {
      border-color: var(--brand-500);
      box-shadow: 0 0 0 3px rgba(76, 139, 230, 0.15);
    }

    .input-error {
      border-color: #ef4444 !important;
    }

    .input-error:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
    }

    .input-valid {
      border-color: #22c55e !important;
    }

    .input-valid:focus {
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15) !important;
    }

    .field-error {
      display: block;
      font-size: var(--text-xs);
      color: #dc2626;
      margin-top: var(--space-1);
      font-weight: var(--weight-medium);
    }

    .password-wrapper {
      position: relative;
    }

    .password-wrapper .form-input {
      padding-right: 2.75rem;
    }

    .password-toggle {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--gray-400);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast);
    }

    .password-toggle:hover { color: var(--gray-600); }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--gray-600);
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: var(--brand-600);
    }

    .btn-block {
      width: 100%;
      padding: 0.75rem;
      font-size: var(--text-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
    }

    .btn-block:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .login-footer {
      text-align: center;
    }

    .text-brand { color: var(--brand-600); }
    .text-muted { color: var(--gray-500); }
    .text-disabled { color: var(--gray-400); cursor: default; }

    .animate-scale-in {
      animation: scaleIn 0.3s ease;
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class LoginPageComponent {
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  emailTouched = signal(false);
  passwordTouched = signal(false);

  private emailValue = '';
  private passwordValue = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  emailValid(): boolean {
    return this.emailValue.includes('@') && this.emailValue.includes('.');
  }

  passwordValid(): boolean {
    return this.passwordValue.length >= 1;
  }

  onEmailInput(event: Event) {
    this.emailValue = (event.target as HTMLInputElement).value;
  }

  onPasswordInput(event: Event) {
    this.passwordValue = (event.target as HTMLInputElement).value;
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage.set('');

    const form = event.target as HTMLFormElement;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement;

    this.emailValue = emailInput.value;
    this.passwordValue = passwordInput.value;
    this.emailTouched.set(true);
    this.passwordTouched.set(true);

    if (!this.emailValid() || !this.passwordValid()) {
      return;
    }

    this.isLoading.set(true);

    try {
      await this.authService.login(this.emailValue, this.passwordValue);
      this.toastService.success('Bienvenido', 'Has iniciado sesión correctamente');
      this.router.navigate(['/panel/dashboard']);
    } catch (error: any) {
      const msg = error?.message || error?.error?.detail || 'Credenciales incorrectas. Intentá nuevamente.';
      this.errorMessage.set(msg);
      this.toastService.error('Error de autenticación', msg);
    } finally {
      this.isLoading.set(false);
    }
  }
}
