import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
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
          <div class="brand-icon-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <h1 class="login-title">Precosquin</h1>
          <p class="login-subtitle">Panel de Gestion de Artistas</p>
        </div>

        <form (submit)="onSubmit($event)" class="login-form">
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="tu&#64;ejemplo.com"
              class="form-input"
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Contrasena</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Tu contrasena"
              class="form-input"
              autocomplete="current-password"
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" name="remember" />
              <span>Recordarme</span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-block">
            Ingresar
          </button>
        </form>

        <div class="login-footer">
          <p class="text-sm text-muted text-center">
            ¿Olvidaste tu contrasena? <a href="#" class="text-brand font-medium">Recuperar</a>
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

    .back-link:hover {
      color: var(--brand-600);
    }

    .login-brand {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .brand-icon-lg {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-xl);
      background-color: var(--brand-600);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
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

    .login-form {
      margin-bottom: var(--space-6);
    }

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
      padding: 0.625rem;
      font-size: var(--text-sm);
    }

    .login-footer {
      text-align: center;
    }

    .text-brand { color: var(--brand-600); }
    .text-muted { color: var(--gray-500); }
  `]
})
export class LoginPageComponent {
  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      await this.authService.login(email, password);
      this.router.navigate(['/panel/dashboard']);
    } catch (error) {
      console.error('Login error:', error);
    }
  }
}
