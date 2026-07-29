import { Component, signal, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesService } from '../../../../core/services/messages.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="contact-overlay" (click)="close.emit()">
      <div class="contact-card" (click)="$event.stopPropagation()">
        <button type="button" class="contact-close" (click)="close.emit()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        @if (sent()) {
          <div class="contact-success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
            </svg>
            <h3 class="success-title">Mensaje enviado</h3>
            <p class="success-text">Te responderemos a la brevedad. Revisá tu casilla de correo.</p>
            <button type="button" class="contact-btn contact-btn-primary" (click)="close.emit()">Cerrar</button>
          </div>
        } @else {
          <div class="contact-header">
            <h3 class="contact-title">Contactanos</h3>
            <p class="contact-subtitle">¿Tenés consultas? Escribinos y te responderemos pronto.</p>
          </div>

          <form class="contact-form" (submit)="onSubmit($event)">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nombre *</label>
                <input type="text" class="form-input" placeholder="Tu nombre" [ngModel]="name()" (ngModelChange)="name.set($event)" name="name" required />
              </div>
              <div class="form-group">
                <label class="form-label">Email *</label>
                <input type="email" class="form-input" placeholder="tu@email.com" [ngModel]="email()" (ngModelChange)="email.set($event)" name="email" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input type="tel" class="form-input" placeholder="Opcional" [ngModel]="phone()" (ngModelChange)="phone.set($event)" name="phone" />
              </div>
              <div class="form-group">
                <label class="form-label">Asunto *</label>
                <select class="form-input" [ngModel]="subject()" (ngModelChange)="subject.set($event)" name="subject" required>
                  <option value="">Seleccioná un asunto</option>
                  <option value="Consulta general">Consulta general</option>
                  <option value="Inscripción">Inscripción</option>
                  <option value="Acompañantes">Acompañantes</option>
                  <option value="Rider técnico">Rider técnico</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Mensaje *</label>
              <textarea class="form-input form-textarea" placeholder="Escribí tu mensaje..." [ngModel]="message()" (ngModelChange)="message.set($event)" name="message" rows="4" required></textarea>
            </div>

            @if (error()) {
              <div class="form-error">{{ error() }}</div>
            }

            <div class="form-actions">
              <button type="button" class="contact-btn contact-btn-ghost" (click)="close.emit()">Cancelar</button>
              <button type="submit" class="contact-btn contact-btn-primary" [disabled]="sending() || !name() || !email() || !subject() || !message()">
                @if (sending()) {
                  <span class="btn-spinner"></span>
                  Enviando...
                } @else {
                  Enviar mensaje
                }
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .contact-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }
    .contact-card {
      background: #fff;
      border-radius: 16px;
      padding: 28px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      position: relative;
    }
    .contact-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      transition: all 0.15s;
    }
    .contact-close:hover { background: #f1f5f9; color: #475569; }
    .contact-header { margin-bottom: 20px; }
    .contact-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0; }
    .contact-subtitle { font-size: 0.85rem; color: #64748b; margin: 4px 0 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { margin-bottom: 14px; }
    .form-label { display: block; font-size: 0.75rem; font-weight: 600; color: #374151; margin-bottom: 4px; }
    .form-input {
      width: 100%;
      padding: 9px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.85rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s;
      box-sizing: border-box;
      background: #fff;
    }
    .form-input:focus { border-color: #3b82f6; }
    .form-input::placeholder { color: #94a3b8; }
    .form-textarea { resize: vertical; min-height: 80px; }
    .form-error { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; font-size: 0.8rem; color: #991b1b; margin-bottom: 12px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
    .contact-btn {
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .contact-btn-primary { background: #2563eb; color: #fff; }
    .contact-btn-primary:hover { background: #1d4ed8; }
    .contact-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .contact-btn-ghost { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    .contact-btn-ghost:hover { background: #e2e8f0; }
    .btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .contact-success { text-align: center; padding: 20px 0; }
    .success-title { font-size: 1.2rem; font-weight: 700; color: #0f172a; margin: 16px 0 8px; }
    .success-text { font-size: 0.85rem; color: #64748b; margin: 0 0 20px; line-height: 1.5; }
  `]
})
export class ContactFormComponent {
  inscriptionId = input<string | null>(null);
  close = output<void>();

  private messagesService = inject(MessagesService);

  name = signal('');
  email = signal('');
  phone = signal('');
  subject = signal('');
  message = signal('');
  sending = signal(false);
  sent = signal(false);
  error = signal('');

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.sending()) return;

    this.sending.set(true);
    this.error.set('');

    this.messagesService.sendMessage({
      name: this.name(),
      email: this.email(),
      phone: this.phone() || undefined,
      subject: this.subject(),
      message: this.message(),
      inscription_id: this.inscriptionId() || undefined,
    }).subscribe({
      next: () => {
        this.sending.set(false);
        this.sent.set(true);
      },
      error: (err: any) => {
        this.sending.set(false);
        this.error.set(err.error?.detail || 'Error al enviar el mensaje. Intentá de nuevo.');
      }
    });
  }
}
