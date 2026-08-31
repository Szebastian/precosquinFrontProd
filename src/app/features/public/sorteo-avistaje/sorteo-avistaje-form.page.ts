import { Component, signal, computed, inject, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SorteoAvistajeService } from '../../../core/services/sorteo-avistaje.service';

interface SorteoData {
  fullName: string;
  whatsapp: string;
  email: string;
  city: string;
  comprobanteFile: File | null;
  comprobantePreview: string;
  comprobanteObjectUrl: string;
  comprobanteNumero: string;
}

function createEmpty(): SorteoData {
  return {
    fullName: '',
    whatsapp: '+54 9 ',
    email: '',
    city: '',
    comprobanteFile: null,
    comprobantePreview: '',
    comprobanteObjectUrl: '',
    comprobanteNumero: '',
  };
}

@Component({
  selector: 'app-sorteo-avistaje-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sorteo-layout">
      <div class="sorteo-topbar">
        <a routerLink="/" class="topbar-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <span class="topbar-title">Sorteo Avistaje de Ballenas</span>
        <span class="topbar-step">Paso {{ currentStep() + 1 }} de 4</span>
      </div>

      <div class="sorteo-progress">
        <div class="sorteo-progress-fill" [style.width.%]="progressPercent()"></div>
      </div>

      <div class="sorteo-main">
        <div class="sorteo-card">

          <!-- STEP 0: Contact data -->
          @if (currentStep() === 0) {
            <div class="step-content">
              <div class="step-icon">🐋</div>
              <h2 class="step-title">Tus datos de contacto</h2>
              <p class="step-desc">Completá tus datos para participar del sorteo de avistaje de ballenas para 4 personas.</p>

              <div class="form-group">
                <label class="form-label">Nombre y Apellido *</label>
                <input
                  #nameInput
                  type="text"
                  class="form-input"
                  placeholder="Ej: Juan Pérez"
                  [ngModel]="data().fullName"
                  (ngModelChange)="updateField('fullName', $event)"
                  (focus)="clearError('fullName')"
                />
                @if (errors()['fullName']) {
                  <span class="form-error">{{ errors()['fullName'] }}</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">WhatsApp *</label>
                <input
                  type="tel"
                  class="form-input"
                  placeholder="+54 9 280 123-4567"
                  [ngModel]="data().whatsapp"
                  (ngModelChange)="updateField('whatsapp', $event)"
                  (focus)="clearError('whatsapp')"
                />
                @if (errors()['whatsapp']) {
                  <span class="form-error">{{ errors()['whatsapp'] }}</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Correo Electrónico *</label>
                <input
                  type="email"
                  class="form-input"
                  placeholder="tu@email.com"
                  [ngModel]="data().email"
                  (ngModelChange)="updateField('email', $event)"
                  (focus)="clearError('email')"
                />
                @if (errors()['email']) {
                  <span class="form-error">{{ errors()['email'] }}</span>
                }
              </div>

              <div class="form-group">
                <label class="form-label">Ciudad de Residencia *</label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="Ej: Puerto Madryn"
                  [ngModel]="data().city"
                  (ngModelChange)="updateField('city', $event)"
                  (focus)="clearError('city')"
                />
                @if (errors()['city']) {
                  <span class="form-error">{{ errors()['city'] }}</span>
                }
              </div>
            </div>
          }

          <!-- STEP 1: Payment instructions -->
          @if (currentStep() === 1) {
            <div class="step-content">
              <div class="step-icon">🏦</div>
              <h2 class="step-title">Transferí tu aporte</h2>
              <p class="step-desc">Realizá la transferencia desde tu homebanking por el monto indicado y conservá el comprobante.</p>

              <div class="payment-amount">
                <span class="payment-label">Monto a transferir</span>
                <span class="payment-value">$ 30.000</span>
              </div>

              <div class="bank-data">
                <div class="bank-row">
                  <span class="bank-label">Alias</span>
                  <span class="bank-value">PRECOSQUIN.PIRAMIDES</span>
                  <button class="copy-btn" (click)="copyToClipboard('PRECOSQUIN.PIRAMIDES', 'alias')">
                    @if (copiedField() === 'alias') {
                      <span class="copy-feedback">¡Copiado!</span>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      Copiar
                    }
                  </button>
                </div>
                <div class="bank-row">
                  <span class="bank-label">CBU</span>
                  <span class="bank-value bank-cbu">0000003100010001234567</span>
                  <button class="copy-btn" (click)="copyToClipboard('0000003100010001234567', 'cbu')">
                    @if (copiedField() === 'cbu') {
                      <span class="copy-feedback">¡Copiado!</span>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      Copiar
                    }
                  </button>
                </div>
                <div class="bank-row">
                  <span class="bank-label">Titular</span>
                  <span class="bank-value">Pre-Cosquín Pirámides</span>
                </div>
                <div class="bank-row">
                  <span class="bank-label">Banco</span>
                  <span class="bank-value">Mercado Pago</span>
                </div>
              </div>

              <p class="payment-note">Conservá el comprobante de la transferencia. Lo vas a adjuntar en el próximo paso.</p>
            </div>
          }

          <!-- STEP 2: Upload receipt -->
          @if (currentStep() === 2) {
            <div class="step-content">
              <div class="step-icon">📎</div>
              <h2 class="step-title">Subí tu comprobante</h2>
              <p class="step-desc">Adjuntá una foto o captura del comprobante de transferencia.</p>

              @if (!data().comprobantePreview) {
                <div
                  class="dropzone"
                  [class.dropzone-over]="dragOver()"
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onDrop($event)"
                  (click)="fileInput.click()"
                >
                  <input
                    #fileInput
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    (change)="onFileSelect($event)"
                    hidden
                  />
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="dropzone-icon">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span class="dropzone-text">Arrastrá tu archivo aquí</span>
                  <span class="dropzone-sub">o hacé clic para seleccionar</span>
                  <span class="dropzone-hint">JPG, PNG o PDF — Máximo 10MB</span>
                </div>
              } @else {
                <div class="file-preview">
                  @if (data().comprobanteObjectUrl) {
                    <img [src]="data().comprobanteObjectUrl" alt="Comprobante" class="file-thumb" />
                  } @else {
                    <div class="file-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                      <span>{{ data().comprobanteFile?.name }}</span>
                    </div>
                  }
                  <button class="change-file-btn" (click)="fileInput.click()">
                    Cambiar archivo
                  </button>
                  <input #fileInput type="file" accept="image/jpeg,image/png,application/pdf" (change)="onFileSelect($event)" hidden />
                </div>
              }

              @if (uploadError()) {
                <span class="form-error">{{ uploadError() }}</span>
              }

              <div class="form-group" style="margin-top: 1.5rem;">
                <label class="form-label">Número de comprobante / transacción (opcional)</label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="Ej: 12345678"
                  [ngModel]="data().comprobanteNumero"
                  (ngModelChange)="updateField('comprobanteNumero', $event)"
                />
              </div>
            </div>
          }

          <!-- STEP 3: Success -->
          @if (currentStep() === 3) {
            <div class="step-content step-success">
              <div class="success-check">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" class="check-svg">
                  <circle cx="12" cy="12" r="10" class="check-circle"/>
                  <path d="m9 12 2 2 4-4" class="check-mark"/>
                </svg>
              </div>
              <h2 class="step-title">¡Mucha suerte!</h2>
              <p class="step-desc">Tu registro quedó guardado. Descargá tu comprobante de participación y no olvides vernos el día del sorteo por YouTube.</p>

              <button class="download-btn" (click)="downloadTicket()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Descargar Comprobante
              </button>

              <a href="https://www.youtube.com/@PreCosquinPuertoPirámides" target="_blank" class="youtube-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                Miralo por YouTube
              </a>

              <a routerLink="/" class="back-home-link">Volver al inicio</a>
            </div>
          }

        </div>

        @if (currentStep() < 3) {
          <div class="sorteo-nav">
            @if (currentStep() > 0) {
              <button class="nav-btn nav-prev" (click)="prevStep()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
                Anterior
              </button>
            } @else {
              <div></div>
            }
            <button
              class="nav-btn nav-next"
              [disabled]="!canProceed() || submitting()"
              (click)="nextStep()"
            >
              @if (submitting()) {
                <span class="spinner"></span>
              } @else {
                {{ currentStep() === 2 ? 'Finalizar' : 'Continuar' }}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
              }
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .sorteo-layout {
      min-height: 100vh;
      background: #0f172a;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
    }

    .sorteo-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .topbar-back {
      color: #94a3b8;
      text-decoration: none;
      display: flex;
      align-items: center;
      transition: color 0.2s;
    }
    .topbar-back:hover { color: #e2e8f0; }
    .topbar-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #94a3b8;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .topbar-step {
      font-size: 0.75rem;
      color: #64748b;
    }

    .sorteo-progress {
      height: 3px;
      background: rgba(148, 163, 184, 0.1);
      position: sticky;
      top: 57px;
      z-index: 99;
    }
    .sorteo-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #06b6d4);
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sorteo-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      max-width: 640px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 1.5rem 6rem;
    }
    .sorteo-card {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .step-content {
      animation: fadeSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .step-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    .step-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0 0 0.5rem;
    }
    .step-desc {
      font-size: 1rem;
      color: #94a3b8;
      margin: 0 0 2rem;
      line-height: 1.6;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #94a3b8;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .form-input {
      width: 100%;
      padding: 0.875rem 1rem;
      background: #1e293b;
      border: 1.5px solid rgba(148, 163, 184, 0.2);
      border-radius: 12px;
      color: #f1f5f9;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .form-input::placeholder { color: #475569; }
    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    .form-error {
      display: block;
      font-size: 0.8rem;
      color: #f87171;
      margin-top: 0.375rem;
    }

    .payment-amount {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.1));
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 16px;
      padding: 1.5rem;
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .payment-label {
      display: block;
      font-size: 0.8rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.5rem;
    }
    .payment-value {
      font-size: 2.25rem;
      font-weight: 800;
      color: #f1f5f9;
      letter-spacing: -0.02em;
    }
    .bank-data {
      background: #1e293b;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
    }
    .bank-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(148, 163, 184, 0.08);
      gap: 0.75rem;
    }
    .bank-row:last-child { border-bottom: none; }
    .bank-label {
      font-size: 0.8rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      flex-shrink: 0;
      min-width: 60px;
    }
    .bank-value {
      font-size: 0.95rem;
      color: #e2e8f0;
      font-weight: 500;
      font-family: 'SF Mono', 'Fira Code', monospace;
      flex: 1;
      text-align: right;
    }
    .bank-cbu { font-size: 0.85rem; }
    .copy-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #60a5fa;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.375rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      font-family: inherit;
    }
    .copy-btn:hover {
      background: rgba(59, 130, 246, 0.25);
    }
    .copy-feedback {
      color: #22c55e;
      font-weight: 700;
    }
    .payment-note {
      font-size: 0.85rem;
      color: #64748b;
      line-height: 1.6;
      text-align: center;
      margin: 0;
    }

    .dropzone {
      border: 2px dashed rgba(148, 163, 184, 0.25);
      border-radius: 16px;
      padding: 3rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .dropzone:hover, .dropzone-over {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.05);
    }
    .dropzone-icon { color: #475569; margin-bottom: 0.5rem; }
    .dropzone-text { font-size: 1rem; color: #94a3b8; font-weight: 500; }
    .dropzone-sub { font-size: 0.85rem; color: #64748b; }
    .dropzone-hint { font-size: 0.75rem; color: #475569; margin-top: 0.5rem; }

    .file-preview {
      background: #1e293b;
      border: 1px solid rgba(148, 163, 184, 0.15);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .file-thumb {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
    }
    .file-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: #94a3b8;
      font-size: 0.85rem;
    }
    .change-file-btn {
      margin-left: auto;
      background: rgba(148, 163, 184, 0.1);
      border: 1px solid rgba(148, 163, 184, 0.2);
      color: #94a3b8;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-family: inherit;
      transition: all 0.2s;
    }
    .change-file-btn:hover {
      background: rgba(148, 163, 184, 0.15);
      color: #e2e8f0;
    }

    .step-success {
      text-align: center;
      padding-top: 2rem;
    }
    .success-check {
      margin-bottom: 1.5rem;
    }
    .check-svg { overflow: visible; }
    .check-circle {
      stroke-dasharray: 63;
      stroke-dashoffset: 63;
      animation: drawCircle 0.6s ease-out 0.2s forwards;
    }
    .check-mark {
      stroke-dasharray: 12;
      stroke-dashoffset: 12;
      animation: drawCheck 0.4s ease-out 0.7s forwards;
    }
    @keyframes drawCircle {
      to { stroke-dashoffset: 0; }
    }
    @keyframes drawCheck {
      to { stroke-dashoffset: 0; }
    }
    .download-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
      margin-top: 1rem;
      border: none;
      cursor: pointer;
      font-family: inherit;
    }
    .download-btn:hover {
      background: linear-gradient(135deg, #60a5fa, #3b82f6);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
    }
    .youtube-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: #ff0000;
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
      margin-top: 0.75rem;
    }
    .youtube-btn:hover {
      background: #cc0000;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 0, 0, 0.3);
    }
    .back-home-link {
      display: block;
      margin-top: 1.5rem;
      color: #64748b;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    .back-home-link:hover { color: #94a3b8; }

    .sorteo-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(148, 163, 184, 0.08);
      margin-top: auto;
    }
    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.75rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      font-family: inherit;
    }
    .nav-prev {
      background: rgba(148, 163, 184, 0.1);
      color: #94a3b8;
    }
    .nav-prev:hover {
      background: rgba(148, 163, 184, 0.15);
      color: #e2e8f0;
    }
    .nav-next {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
    }
    .nav-next:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
    }
    .nav-next:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 640px) {
      .sorteo-main { padding: 1.5rem 1rem 5rem; }
      .step-title { font-size: 1.4rem; }
      .payment-value { font-size: 1.75rem; }
      .bank-row { flex-wrap: wrap; }
      .bank-value { text-align: left; flex-basis: 100%; margin-top: 0.25rem; }
      .nav-btn { padding: 0.75rem 1.25rem; font-size: 0.9rem; }
    }
  `]
})
export class SorteoAvistajePageComponent implements OnInit, OnDestroy {
  private sorteoService = inject(SorteoAvistajeService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  @ViewChild('nameInput') nameInputRef!: ElementRef<HTMLInputElement>;

  data = signal<SorteoData>(createEmpty());
  currentStep = signal(0);
  errors = signal<Record<string, string>>({});
  submitting = signal(false);
  submitSuccess = signal(false);
  dragOver = signal(false);
  uploadError = signal('');
  copiedField = signal('');
  sorteoId = signal('');

  progressPercent = computed(() => ((this.currentStep() + 1) / 4) * 100);

  @HostListener('document:keydown.enter')
  onEnterKey(): void {
    if (this.submitting() || this.currentStep() === 3) return;
    if (this.canProceed()) {
      this.nextStep();
    }
  }

  ngOnInit(): void {}

  updateField(field: keyof SorteoData, value: string): void {
    this.data.update(d => ({ ...d, [field]: value }));
  }

  clearError(field: string): void {
    this.errors.update(e => { const n = { ...e }; delete n[field]; return n; });
  }

  canProceed(): boolean {
    const d = this.data();
    switch (this.currentStep()) {
      case 0: return !!d.fullName.trim() && !!d.whatsapp.trim() && this.isValidEmail(d.email) && !!d.city.trim();
      case 1: return true;
      case 2: return !!d.comprobanteFile;
      default: return false;
    }
  }

  nextStep(): void {
    if (this.currentStep() === 2) {
      this.submit();
      return;
    }
    if (!this.canProceed()) {
      this.validateCurrentStep();
      return;
    }
    if (this.currentStep() < 3) {
      this.currentStep.update(s => s + 1);
      if (this.currentStep() === 0) {
        setTimeout(() => this.nameInputRef?.nativeElement?.focus(), 100);
      }
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }

  private validateCurrentStep(): void {
    const d = this.data();
    const errs: Record<string, string> = {};
    if (this.currentStep() === 0) {
      if (!d.fullName.trim()) errs['fullName'] = 'Ingresá tu nombre';
      if (!d.whatsapp.trim()) errs['whatsapp'] = 'Ingresá tu WhatsApp';
      if (!this.isValidEmail(d.email)) errs['email'] = 'Ingresá un email válido';
      if (!d.city.trim()) errs['city'] = 'Ingresá tu ciudad';
    }
    this.errors.set(errs);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  copyToClipboard(text: string, field: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedField.set(field);
      setTimeout(() => this.copiedField.set(''), 2000);
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
      input.value = '';
    }
  }

  private processFile(file: File): void {
    this.uploadError.set('');
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      this.uploadError.set('Formato no permitido. Usá JPG, PNG o PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.uploadError.set('El archivo excede 10MB.');
      return;
    }
    this.revokeObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    this.ngZone.run(() => {
      this.data.update(d => ({
        ...d,
        comprobanteFile: file,
        comprobantePreview: file.name,
        comprobanteObjectUrl: file.type.startsWith('image/') ? objectUrl : '',
      }));
      this.cdr.detectChanges();
    });
  }

  private revokeObjectUrl(): void {
    const url = this.data().comprobanteObjectUrl;
    if (url) {
      URL.revokeObjectURL(url);
    }
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  private submit(): void {
    if (!this.canProceed()) return;
    this.submitting.set(true);
    this.errors.set({});

    const payload = {
      ticket_option: '1',
      full_name: this.data().fullName.trim(),
      whatsapp: this.data().whatsapp.trim(),
      email: this.data().email.trim(),
      city: this.data().city.trim(),
      comprobante_numero: this.data().comprobanteNumero.trim() || undefined,
    };

    this.sorteoService.create(payload).subscribe({
      next: (res) => {
        this.sorteoId.set(res.id);
        const file = this.data().comprobanteFile;
        if (file) {
          this.sorteoService.uploadComprobante(res.id, file).subscribe({
            next: () => {
              this.submitting.set(false);
              this.currentStep.set(3);
            },
            error: () => {
              this.submitting.set(false);
              this.currentStep.set(3);
            }
          });
        } else {
          this.submitting.set(false);
          this.currentStep.set(3);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err.error?.detail || 'Error al guardar. Intentá de nuevo.';
        this.errors.set({ submit: msg });
      }
    });
  }

  downloadTicket(): void {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const d = this.data();
      const id = this.sorteoId();
      const ticketNum = `SBA-${id.slice(0, 8).toUpperCase()}`;
      const date = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
      const w = doc.internal.pageSize.getWidth();
      const cx = w / 2;

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, w, doc.internal.pageSize.getHeight(), 'F');

      doc.setDrawColor(6, 182, 212);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, 15, w - 40, 267, 8, 8, 'S');

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('PRE-COSQUIN PUERTO PIRAMIDES', cx, 30, { align: 'center' });

      doc.setFontSize(22);
      doc.setTextColor(34, 211, 238);
      doc.text('SORTEO AVISTAJE DE BALENAS', cx, 42, { align: 'center' });

      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.2);
      doc.line(40, 50, w - 40, 50);

      doc.setFillColor(6, 182, 212);
      doc.roundedRect(cx - 45, 58, 90, 30, 4, 4, 'F');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text('TU NUMERO DE PARTICIPACION', cx, 66, { align: 'center' });
      doc.setFontSize(24);
      doc.text(ticketNum, cx, 79, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('NOMBRE', 35, 105);
      doc.setTextColor(241, 245, 249);
      doc.setFontSize(13);
      doc.text(d.fullName, 35, 113);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(10);
      doc.text('CIUDAD', cx + 10, 105);
      doc.setTextColor(241, 245, 249);
      doc.setFontSize(13);
      doc.text(d.city, cx + 10, 113);

      doc.line(35, 120, w - 35, 120);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(10);
      doc.text('WHATSAPP', 35, 130);
      doc.setTextColor(241, 245, 249);
      doc.setFontSize(13);
      doc.text(d.whatsapp, 35, 138);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(10);
      doc.text('EMAIL', cx + 10, 130);
      doc.setTextColor(241, 245, 249);
      doc.setFontSize(13);
      doc.text(d.email, cx + 10, 138);

      doc.line(35, 145, w - 35, 145);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('FECHA DE REGISTRO', cx, 165, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(241, 245, 249);
      doc.text(date, cx, 173, { align: 'center' });

      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.2);
      doc.line(40, 195, w - 40, 195);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Mirá el sorteo en vivo por', cx, 210, { align: 'center' });
      doc.setTextColor(255, 0, 0);
      doc.setFontSize(10);
      doc.text('YouTube: @PreCosquinPuertoPiramides', cx, 217, { align: 'center' });

      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text('Pre-Cosquin Puerto Piramides - Sorteo Avistaje de Ballenas', cx, 268, { align: 'center' });

      doc.save(`comprobante-sorteo-${ticketNum}.pdf`);
    });
  }
}
