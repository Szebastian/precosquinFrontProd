import { Component, input, output, signal, inject, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-otp-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="otp-container">
      @if (!isVerified()) {
        @if (!codeSent()) {
          <div class="otp-request">
            <div class="otp-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <h2 class="otp-title">Verificá tu email</h2>
            <p class="otp-description">
              Te enviaremos un código de verificación a <strong>{{ email() }}</strong>
              para confirmar tu identidad.
            </p>

            @if (error()) {
              <div class="otp-error">{{ error() }}</div>
            }

            @if (sending()) {
              <div class="otp-sending">
                <span class="spinner spinner--lg"></span>
                <span>Enviando código...</span>
              </div>
            } @else {
              <button
                type="button"
                class="otp-send-btn"
                (click)="sendCode()">
                Enviar código de verificación
              </button>
            }
          </div>
        } @else {
          <div class="otp-input">
            <div class="otp-icon sent">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 class="otp-title">Código enviado</h2>
            <p class="otp-description">
              Revisá tu casilla de email (<strong>{{ email() }}</strong>) e ingresá el código de 6 dígitos.
            </p>

            <div class="otp-code-input">
              <input
                type="text"
                class="otp-field"
                maxlength="6"
                pattern="[0-9]*"
                inputmode="numeric"
                autocomplete="one-time-code"
                [placeholder]="'000000'"
                [value]="code()"
                (input)="onCodeInput($event)"
                (keydown.enter)="verifyCode()"
                #codeInput
              />
            </div>

            @if (error()) {
              <div class="otp-error">{{ error() }}</div>
            }

            <div class="otp-actions">
              <button
                type="button"
                class="otp-verify-btn"
                (click)="verifyCode()"
                [disabled]="code().length !== 6 || verifying()">
                @if (verifying()) {
                  <span class="spinner"></span> Verificando...
                } @else {
                  Verificar código
                }
              </button>
              <button
                type="button"
                class="otp-resend-btn"
                (click)="resendCode()"
                [disabled]="resendCooldown() > 0 || sending()">
                @if (resendCooldown() > 0) {
                  Reenviar en {{ resendCooldown() }}s
                } @else {
                  Reenviar código
                }
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .otp-container { padding: 24px 0; text-align: center; }
    .otp-icon { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #eff6ff, #dbeafe); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #2563eb; }
    .otp-icon.sent { background: linear-gradient(135deg, #f0fdf4, #dcfce7); color: #16a34a; }
    .otp-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin: 0 0 8px; }
    .otp-description { font-size: 0.95rem; color: var(--gray-500); margin: 0 0 32px; line-height: 1.6; }
    .otp-description strong { color: var(--gray-700); font-weight: 600; }
    .otp-send-btn, .otp-verify-btn { width: 100%; padding: 14px 24px; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .otp-send-btn { background: var(--brand-500); color: #fff; }
    .otp-send-btn:hover:not(:disabled) { background: #3a7ad4; transform: translateY(-1px); }
    .otp-send-btn:disabled, .otp-verify-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .otp-verify-btn { background: #16a34a; color: #fff; margin-bottom: 12px; }
    .otp-verify-btn:hover:not(:disabled) { background: #15803d; }
    .otp-code-input { margin: 0 auto 24px; max-width: 280px; }
    .otp-field { width: 100%; padding: 16px; border: 2px solid var(--gray-200); border-radius: 12px; font-size: 1.75rem; font-weight: 700; text-align: center; letter-spacing: 0.5em; font-family: 'SF Mono', 'Fira Code', monospace; color: var(--gray-900); background: var(--gray-50); transition: border-color 0.2s; outline: none; }
    .otp-field:focus { border-color: var(--brand-500); background: #fff; }
    .otp-field::placeholder { color: var(--gray-300); letter-spacing: 0.3em; }
    .otp-error { background: #fef2f2; color: #dc2626; padding: 12px 16px; border-radius: 8px; font-size: 0.875rem; margin-bottom: 16px; border: 1px solid #fecaca; }
    .otp-actions { display: flex; flex-direction: column; gap: 8px; }
    .otp-sending { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; color: var(--brand-500); font-weight: 600; font-size: 0.95rem; }
    .otp-resend-btn { background: none; border: none; color: var(--brand-500); font-size: 0.875rem; font-weight: 500; cursor: pointer; padding: 8px; }
    .otp-resend-btn:hover:not(:disabled) { text-decoration: underline; }
    .otp-resend-btn:disabled { color: var(--gray-400); cursor: not-allowed; }
    .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
    .spinner--lg { width: 20px; height: 20px; border: 2.5px solid rgba(37,99,235,0.2); border-top-color: #2563eb; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class OtpVerifyComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);

  email = input.required<string>();
  autoSend = input<boolean>(false);
  verified = output<void>();

  isVerified = signal(false);
  codeSent = signal(false);
  code = signal('');
  sending = signal(false);
  verifying = signal(false);
  error = signal('');
  resendCooldown = signal(0);

  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (this.autoSend()) {
      this.sendCode();
    }
  }

  sendCode(): void {
    this.sending.set(true);
    this.error.set('');
    this.http.post(`${environment.apiUrl}/inscriptions/send-otp`, { email: this.email() }).subscribe({
      next: () => {
        this.sending.set(false);
        this.codeSent.set(true);
        this.startResendCooldown();
      },
      error: (err) => {
        this.sending.set(false);
        this.error.set(err.error?.detail || 'Error al enviar el código. Intentá de nuevo.');
      }
    });
  }

  verifyCode(): void {
    if (this.code().length !== 6) return;
    this.verifying.set(true);
    this.error.set('');
    this.http.post(`${environment.apiUrl}/inscriptions/verify-otp`, { email: this.email(), code: this.code() }).subscribe({
      next: () => {
        this.verifying.set(false);
        this.isVerified.set(true);
        this.verified.emit();
      },
      error: (err) => {
        this.verifying.set(false);
        this.error.set(err.error?.detail || 'Código incorrecto. Verificá y intentá de nuevo.');
      }
    });
  }

  resendCode(): void {
    this.sendCode();
  }

  onCodeInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6);
    this.code.set(val);
    (event.target as HTMLInputElement).value = val;
  }

  private startResendCooldown(): void {
    this.resendCooldown.set(60);
    this.cooldownTimer = setInterval(() => {
      const curr = this.resendCooldown();
      if (curr <= 1) {
        this.resendCooldown.set(0);
        this.cooldownTimer && clearInterval(this.cooldownTimer);
      } else {
        this.resendCooldown.set(curr - 1);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    this.cooldownTimer && clearInterval(this.cooldownTimer);
  }
}
