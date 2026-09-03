import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AcreditacionVisibilityService } from '../../../core/services/acreditacion-visibility.service';

interface Acompaniante {
  nombre: string;
  dni: string;
  rol: string;
}

interface PenaData {
  proyecto: {
    nombreGrupo: string;
    nombreResponsable: string;
    dniResponsable: string;
    telefono: string;
    diaPresentacion: string;
  };
  acompaniantes: Acompaniante[];
}

function createEmpty(): PenaData {
  return {
    proyecto: { nombreGrupo: '', nombreResponsable: '', dniResponsable: '', telefono: '', diaPresentacion: '' },
    acompaniantes: [],
  };
}

const DIAS = [
  { value: 'noche1', label: 'Noche 1 — Sábado 5 de Septiembre' },
  { value: 'noche2', label: 'Noche 2 — Domingo 6 de Septiembre' },
  { value: 'ambas', label: 'Ambas noches' },
];

const ROLES = [
  { value: 'musico', label: 'Músico acompañante' },
  { value: 'asistente', label: 'Asistente de escenario' },
  { value: 'tecnico_chofer', label: 'Técnico / Chofer' },
  { value: 'acompaniante', label: 'Acompañante' },
];

const STEPS = [
  { key: 'proyecto', label: 'Datos del proyecto' },
  { key: 'acompaniantes', label: 'Acompañantes y staff' },
  { key: 'confirmar', label: 'Confirmar' },
];

@Component({
  selector: 'app-acreditacion-pena-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="form-layout typeform-mode">
      @if (inscriptionsClosed()) {
        <!-- CLOSED SCREEN -->
        <div class="tf-topbar">
          <div class="tf-topbar-left">
            <span class="tf-logo">Pre-Cosquín</span>
            <span class="tf-topbar-sep"></span>
            <a class="tf-topbar-home" routerLink="/">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Inicio
            </a>
          </div>
        </div>
        <div class="tf-main">
          <div class="tf-card" style="text-align:center; padding:64px 32px;">
            <div style="width:80px; height:80px; margin:0 auto 24px; background:rgba(239,68,68,0.15); border-radius:50%; display:flex; align-items:center; justify-content:center;">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 style="font-size:24px; font-weight:800; color:#f8fafc; margin:0 0 12px;">Acreditaciones Cerradas</h2>
            <p style="font-size:16px; color:#94a3b8; max-width:400px; margin:0 auto 32px; line-height:1.6;">
              El formulario de acreditación de peñas se encuentra cerrado en este momento.
              Si necesitás acreditarte, contactá al organisación del festival.
            </p>
            <a routerLink="/" style="display:inline-flex; align-items:center; gap:8px; padding:12px 24px; background:#0284c7; color:#fff; border-radius:10px; text-decoration:none; font-weight:600; font-size:14px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Volver al inicio
            </a>
          </div>
        </div>
      } @else {
      <div class="tf-topbar">
        <div class="tf-topbar-left">
          <span class="tf-logo">Pre-Cosquín</span>
          <span class="tf-topbar-sep"></span>
          <a class="tf-topbar-home" routerLink="/">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Inicio
          </a>
        </div>
        <div class="tf-topbar-right">
          <span class="tf-counter">{{ currentStep() + 1 }} / {{ STEPS.length }}</span>
        </div>
      </div>
      <div class="tf-progress">
        <div class="tf-progress-fill" [style.width.%]="progressPercent()"></div>
      </div>

      <div class="tf-main">
        <div class="tf-card">
          <div class="tf-header-acreditacion">
            <span class="acreditacion-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              PEÑA OFICIAL — ACREDITACIÓN
            </span>
            <h1 class="acreditacion-title">Acreditación de Integrantes y Staff — Peña Pre-Cosquín</h1>
            <p class="acreditacion-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Formulario exclusivo para artistas confirmados en la grilla de la Peña. Los datos ingresados serán verificados por el personal de control en puerta.
            </p>
          </div>

          <div class="tf-content">
            <span class="tf-label-num">{{ currentStep() + 1 }}</span>
            <h2 class="tf-label">{{ STEPS[currentStep()].label }}</h2>

            @if (currentStep() === 0) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">Nombre del Artista / Grupo / Conjunto <span class="req">*</span></label>
                  <input type="text" class="form-input" [(ngModel)]="data().proyecto.nombreGrupo" placeholder="Ej: Los Hermanos Piramidales" />
                </div>
                <div class="form-group">
                  <label class="form-label">Nombre y Apellido del Responsable <span class="req">*</span></label>
                  <input type="text" class="form-input" [(ngModel)]="data().proyecto.nombreResponsable" placeholder="Ej: Juan Pérez" />
                </div>
                <div class="grid-2col">
                  <div class="form-group">
                    <label class="form-label">DNI del Responsable <span class="req">*</span></label>
                    <input type="text" class="form-input" [(ngModel)]="data().proyecto.dniResponsable" placeholder="12.345.678" maxlength="10" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Teléfono / WhatsApp <span class="req">*</span></label>
                    <input type="tel" class="form-input" [(ngModel)]="data().proyecto.telefono" placeholder="+54 9 2804 12-3456" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Día de presentación <span class="req">*</span></label>
                  <select class="form-select" [(ngModel)]="data().proyecto.diaPresentacion">
                    <option value="">Seleccionar día</option>
                    @for (d of DIAS; track d.value) {
                      <option [value]="d.value">{{ d.label }}</option>
                    }
                  </select>
                </div>
              </div>
            }

            @if (currentStep() === 1) {
              <div class="tf-question">
                <p class="form-hint" style="margin-bottom: 0.5rem;">Agregá a cada músico, asistente, técnico o acompañante que deba ingresar con el grupo. El DNI es obligatorio para el control en puerta.</p>

                @for (p of data().acompaniantes; track $index; let i = $index) {
                  <div class="person-card">
                    <div class="person-header">
                      <span class="person-number">#{{ i + 1 }} — Acompañante</span>
                      <button type="button" class="btn-remove-person" (click)="removeAcompaniante(i)" title="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Nombre y Apellido <span class="req">*</span></label>
                      <input type="text" class="form-input" [(ngModel)]="p.nombre" placeholder="Ej: Ana Gómez" />
                    </div>
                    <div class="grid-2col">
                      <div class="form-group">
                        <label class="form-label">DNI <span class="req">*</span></label>
                        <input type="text" class="form-input" [(ngModel)]="p.dni" placeholder="12.345.678" maxlength="10" />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Rol <span class="req">*</span></label>
                        <select class="form-select" [(ngModel)]="p.rol">
                          <option value="">Seleccionar rol</option>
                          @for (r of ROLES; track r.value) {
                            <option [value]="r.value">{{ r.label }}</option>
                          }
                        </select>
                      </div>
                    </div>
                  </div>
                }

                @if (data().acompaniantes.length === 0) {
                  <div class="empty-accompanying">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <p>Aún no agregaste acompañantes</p>
                    <span>Agregá a todo el staff que ingresará por puerta</span>
                  </div>
                }

                <button type="button" class="btn-add-person" (click)="addAcompaniante()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  Agregar Acompañante / Staff
                </button>

                @if (data().acompaniantes.length > 0) {
                  <div class="acomp-count">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    {{ data().acompaniantes.length }} persona(s) registrada(s)
                  </div>
                }
              </div>
            }

            @if (currentStep() === 2) {
              <div class="tf-question">
                <div class="summary">
                  <div class="summary-group">
                    <h3 class="summary-title">Proyecto</h3>
                    <p><strong>Artista / Grupo:</strong> {{ data().proyecto.nombreGrupo || '(sin completar)' }}</p>
                    <p><strong>Responsable:</strong> {{ data().proyecto.nombreResponsable || '(sin completar)' }} — DNI {{ data().proyecto.dniResponsable || '—' }}</p>
                    <p><strong>Contacto:</strong> {{ data().proyecto.telefono || '(sin completar)' }}</p>
                    <p><strong>Día:</strong> {{ getDiaLabel(data().proyecto.diaPresentacion) }}</p>
                  </div>
                  <div class="summary-group">
                    <h3 class="summary-title">Acompañantes ({{ data().acompaniantes.length }})</h3>
                    @if (data().acompaniantes.length === 0) {
                      <p style="color:#64748b;">Sin acompañantes registrados</p>
                    } @else {
                      @for (p of data().acompaniantes; track $index) {
                        <div class="summary-person">
                          <span class="summary-person-name">{{ p.nombre || '(sin nombre)' }}</span>
                          <span class="summary-person-meta">DNI {{ p.dni || '—' }} · {{ getRolLabel(p.rol) }}</span>
                        </div>
                      }
                    }
                  </div>
                  <div class="acreditacion-alert">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Al confirmar, los datos quedarán registrados para control de acceso en puerta.
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        @if (!submitSuccess()) {
          <div class="nav-section">
            @if (currentStep() > 0) {
              <button type="button" class="btn-back" (click)="prevStep()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                VOLVER
              </button>
            }
            @if (currentStep() < STEPS.length - 1) {
              <div class="next-wrapper">
                <button type="button" class="btn-next-large" (click)="nextStep()" [disabled]="!canProceed()">
                  CONTINUAR
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            } @else {
              <div class="next-wrapper">
                <button type="button" class="btn-next-large btn-submit" (click)="onSubmit()" [disabled]="submitting() || !canProceed()">
                  @if (submitting()) {
                    <span class="spinner"></span> Enviando...
                  } @else {
                    Confirmar Acreditación
                  }
                </button>
              </div>
            }
          </div>
        }
      </div>

      @if (submitSuccess()) {
        <div class="tf-submitting-screen">
          <div class="tf-submitting-card" style="max-width: 560px;">
            <div class="tf-success-icon">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 class="tf-success-title">¡Acreditación confirmada!</h2>
            <p class="tf-success-sub">Tu grupo fue acreditado para la Peña Oficial.</p>

            <div class="tf-success-details" style="text-align:left;">
              <div class="tf-success-row">
                <span class="tf-success-label">Artista / Grupo</span>
                <span class="tf-success-value">{{ data().proyecto.nombreGrupo }}</span>
              </div>
              <div class="tf-success-row">
                <span class="tf-success-label">Responsable</span>
                <span class="tf-success-value">{{ data().proyecto.nombreResponsable }}</span>
              </div>
              <div class="tf-success-row">
                <span class="tf-success-label">DNI Responsable</span>
                <span class="tf-success-value" style="font-family: var(--font-mono, monospace);">{{ data().proyecto.dniResponsable }}</span>
              </div>
              <div class="tf-success-row">
                <span class="tf-success-label">Día</span>
                <span class="tf-success-value">{{ getDiaLabel(data().proyecto.diaPresentacion) }}</span>
              </div>
              <div class="tf-success-row">
                <span class="tf-success-label">Acreditados</span>
                <span class="tf-success-value">{{ data().acompaniantes.length + 1 }} personas</span>
              </div>
              <div class="tf-success-row" style="flex-direction:column; align-items: flex-start; gap:6px;">
                <span class="tf-success-label">Listado puerta</span>
                <div style="display:flex; flex-direction:column; gap:4px; width:100%;">
                  <div style="display:flex; justify-content:space-between; width:100%; font-size:13px; padding:6px 10px; background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.15); border-radius:8px;">
                    <span style="font-weight:700; color:#e2e8f0;">{{ data().proyecto.nombreResponsable }}</span>
                    <span style="color:#94a3b8;">DNI {{ data().proyecto.dniResponsable }} · Responsable</span>
                  </div>
                  @for (p of data().acompaniantes; track $index) {
                    <div style="display:flex; justify-content:space-between; width:100%; font-size:13px; padding:6px 10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:8px;">
                      <span style="font-weight:600; color:#e2e8f0;">{{ p.nombre }}</span>
                      <span style="color:#94a3b8;">DNI {{ p.dni }} · {{ getRolLabel(p.rol) }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <div class="acreditacion-qr-hint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Mostrá esta pantalla en puerta o descargá el PDF para control de acceso.
            </div>

            <div class="tf-success-actions" style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
              <button type="button" class="btn-success-home" (click)="downloadPDF()" style="background:#D9A928; color:#0f172a;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Descargar PDF
              </button>
              <a routerLink="/" class="btn-success-home">Volver al inicio</a>
            </div>
          </div>
        </div>
      }
      }
    </div>
  `,
  styles: [`
    .form-layout.typeform-mode {
      display: block;
      min-height: 100vh;
      background: #0f1219;
      color: #e2e8f0;
      padding-bottom: 80px;
    }
    .tf-topbar { display:flex; align-items:center; justify-content:space-between; padding:16px 24px; border-bottom:1px solid rgba(255,255,255,0.06); }
    .tf-topbar-left { display:flex; align-items:center; gap:12px; }
    .tf-logo { font-family: var(--font-display); font-size:1.1rem; font-weight:700; color:#fff; }
    .tf-topbar-sep { width:4px; height:4px; border-radius:50%; background:rgba(255,255,255,0.2); }
    .tf-topbar-home { display:inline-flex; align-items:center; gap:4px; font-size:0.8rem; font-weight:500; color:rgba(255,255,255,0.4); text-decoration:none; transition:color 0.2s; }
    .tf-topbar-home:hover { color:rgba(255,255,255,0.7); }
    .tf-topbar-right { font-size:0.8rem; color:rgba(255,255,255,0.4); font-weight:700; }
    .tf-progress { height:4px; background:rgba(255,255,255,0.06); overflow:hidden; }
    .tf-progress-fill { height:100%; background:#3b82f6; transition:width 0.3s ease; }
    .tf-main { max-width:560px; margin:32px auto 0; padding:0 24px; }
    .tf-card { background:#161b26; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:40px; box-shadow:0 10px 25px -5px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.2); }
    .tf-header-acreditacion { margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .acreditacion-badge { display:inline-flex; align-items:center; gap:6px; font-size:10px; font-weight:700; letter-spacing:0.12em; color:#60a5fa; background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.2); padding:5px 12px; border-radius:999px; margin-bottom:14px; }
    .acreditacion-title { font-family:var(--font-display); font-size:1.35rem; font-weight:800; color:#f8fafc; margin:0 0 12px; line-height:1.25; }
    .acreditacion-note { display:flex; align-items:flex-start; gap:8px; font-size:13px; color:#94a3b8; background:rgba(59,130,246,0.06); border:1px solid rgba(59,130,246,0.12); border-radius:10px; padding:12px 14px; line-height:1.5; margin:0; }
    .acreditacion-note svg { flex-shrink:0; margin-top:1px; color:#60a5fa; }
    .tf-content { display:flex; flex-direction:column; gap:0; }
    .tf-label-num { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:20px; background:rgba(59,130,246,0.1); color:#60a5fa; font-size:0.75rem; font-weight:700; margin-bottom:16px; border:1px solid rgba(59,130,246,0.2); }
    .tf-label { font-family:var(--font-display); font-size:1.5rem; font-weight:800; color:#f8fafc; margin:0 0 20px; line-height:1.2; }
    .tf-question { display:flex; flex-direction:column; gap:18px; }
    .form-group { display:flex; flex-direction:column; gap:6px; }
    .form-label { font-size:0.9rem; font-weight:600; color:#cbd5e1; }
    .req { color:#f59e0b; }
    .form-hint { font-size:13px; color:#64748b; margin:0; line-height:1.5; }
    .form-input, .form-textarea, .form-select { width:100%; padding:14px 16px; font-size:15px; font-weight:500; color:#f1f5f9; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.12); border-radius:12px; outline:none; transition:border-color 0.2s, background 0.2s; box-sizing:border-box; font-family:inherit; }
    .form-input:hover, .form-textarea:hover, .form-select:hover { border-color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.08); }
    .form-input:focus, .form-textarea:focus, .form-select:focus { border-color:#3b82f6; background:rgba(59,130,246,0.06); box-shadow:0 0 0 3px rgba(59,130,246,0.15); }
    .form-input::placeholder, .form-textarea::placeholder { color:#64748b; }
    .form-select { appearance:none; background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3c/svg%3e"); background-position:right 0.5rem center; background-repeat:no-repeat; background-size:1.5em 1.5em; padding-right:2.5rem; }
    .grid-2col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    @media (max-width:640px) { .grid-2col { grid-template-columns:1fr; } }
    .person-card { background:rgba(255,255,255,0.04); border:1.5px solid rgba(255,255,255,0.1); border-radius:12px; padding:1.25rem; transition:border-color 0.2s; }
    .person-card:hover { border-color:rgba(255,255,255,0.15); }
    .person-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; }
    .person-number { font-size:0.85rem; font-weight:600; color:#60a5fa; }
    .btn-remove-person { background:none; border:none; color:rgba(255,255,255,0.4); cursor:pointer; padding:4px; border-radius:6px; transition:all 0.2s; display:flex; }
    .btn-remove-person:hover { color:#ef4444; background:rgba(239,68,68,0.1); }
    .empty-accompanying { text-align:center; padding:2rem 1rem; color:rgba(255,255,255,0.5); border:1.5px dashed rgba(255,255,255,0.08); border-radius:12px; }
    .empty-accompanying p { font-size:0.95rem; margin:0.75rem 0 0.25rem; color:rgba(255,255,255,0.6); }
    .empty-accompanying span { font-size:0.8rem; color:rgba(255,255,255,0.35); }
    .btn-add-person { display:inline-flex; align-items:center; gap:0.5rem; background:rgba(59,130,246,0.1); border:1.5px dashed rgba(59,130,246,0.3); border-radius:10px; color:#60a5fa; padding:0.7rem 1.2rem; font-size:0.85rem; font-weight:600; cursor:pointer; transition:all 0.2s; width:100%; justify-content:center; }
    .btn-add-person:hover { background:rgba(59,130,246,0.15); border-color:rgba(59,130,246,0.5); }
    .acomp-count { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:#60a5fa; background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.15); padding:6px 12px; border-radius:999px; align-self:flex-start; }
    .summary { display:flex; flex-direction:column; gap:20px; }
    .summary-group h3 { font-size:11px; font-weight:700; color:#60a5fa; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 10px; }
    .summary-group p { font-size:14px; color:#94a3b8; margin:0 0 6px; }
    .summary-group p strong { color:#e2e8f0; }
    .summary-person { display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:8px; margin-bottom:6px; }
    .summary-person-name { font-size:14px; font-weight:600; color:#e2e8f0; }
    .summary-person-meta { font-size:12px; color:#94a3b8; }
    .acreditacion-alert { display:flex; align-items:center; gap:8px; font-size:13px; color:#f59e0b; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.18); border-radius:10px; padding:12px 14px; line-height:1.4; }
    .nav-section { display:flex; flex-direction:column; align-items:center; gap:12px; margin-top:28px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.06); }
    .next-wrapper { width:100%; display:flex; justify-content:center; }
    .btn-back { display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:500; color:#94a3b8; background:transparent; border:none; cursor:pointer; padding:8px 4px; transition:all 0.2s; }
    .btn-back:hover { color:#fff; }
    .btn-next-large { display:inline-flex; align-items:center; justify-content:center; gap:10px; min-width:200px; max-width:400px; width:100%; padding:16px 28px; font-size:15px; font-weight:800; color:#fff; background:#3b82f6; border:none; border-radius:12px; cursor:pointer; text-transform:uppercase; letter-spacing:0.06em; transition:all 0.25s; }
    .btn-next-large:hover:not(:disabled) { background:#2563eb; transform:translateY(-1px); box-shadow:0 8px 24px rgba(59,130,246,0.3); }
    .btn-next-large:disabled { opacity:0.3; cursor:not-allowed; }
    .btn-next-large.btn-submit { background:#D9A928; color:#0f172a; }
    .btn-next-large.btn-submit:hover:not(:disabled) { background:#EAB308; box-shadow:0 8px 24px rgba(217,169,40,0.3); }
    .spinner { width:14px; height:14px; border:2px solid rgba(15,23,42,0.3); border-top-color:#0f172a; border-radius:50%; animation:spin 0.6s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .tf-submitting-screen { position:fixed; inset:0; background:rgba(0,0,0,0.88); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; animation:fadeIn 0.3s ease; overflow-y:auto; }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .tf-submitting-card { background:#161b26; border:1px solid rgba(255,255,255,0.08); border-radius:20px; box-shadow:0 25px 80px rgba(0,0,0,0.6); text-align:center; padding:40px 36px; max-width:440px; width:100%; animation:slideUp 0.4s cubic-bezier(0.22,1,0.36,1); }
    @keyframes slideUp { from { opacity:0; transform:translateY(30px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
    .tf-success-icon { color:#4ade80; margin-bottom:16px; animation:checkPulse 0.6s ease 0.2s both; }
    @keyframes checkPulse { 0% { transform:scale(0.5); opacity:0; } 50% { transform:scale(1.1); } 100% { transform:scale(1); opacity:1; } }
    .tf-success-title { font-family:var(--font-display); font-size:1.5rem; font-weight:800; color:#f8fafc; margin:0 0 8px; }
    .tf-success-sub { font-size:14px; color:#94a3b8; margin:0 0 20px; line-height:1.5; }
    .tf-success-details { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px; margin-bottom:16px; }
    .tf-success-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; }
    .tf-success-row:not(:last-child) { border-bottom:1px solid rgba(255,255,255,0.06); }
    .tf-success-label { font-size:13px; color:#64748b; }
    .tf-success-value { font-size:13px; font-weight:600; color:#e2e8f0; }
    .acreditacion-qr-hint { display:flex; align-items:center; gap:8px; font-size:13px; color:#60a5fa; background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.15); border-radius:10px; padding:12px 14px; margin-bottom:20px; text-align:left; line-height:1.4; }
    .tf-success-actions { display:flex; justify-content:center; }
    .btn-success-home { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:14px 28px; font-size:13px; font-weight:700; color:#fff; background:#3b82f6; border:none; border-radius:12px; text-decoration:none; transition:all 0.25s; cursor:pointer; }
    .btn-success-home:hover { background:#2563eb; transform:translateY(-1px); box-shadow:0 8px 20px rgba(59,130,246,0.3); }
    @media (max-width:640px) { .tf-card { border-radius:12px; padding:24px; } .tf-label { font-size:1.35rem; } .tf-main { padding:0 16px; } .acreditacion-title { font-size:1.15rem; } }
  `]
})
export class AcreditacionPenaFormPageComponent {
  STEPS = STEPS;
  DIAS = DIAS;
  ROLES = ROLES;

  private http = inject(HttpClient);
  private router = inject(Router);
  private acreditacionVisibility = inject(AcreditacionVisibilityService);

  inscriptionsClosed = computed(() => !this.acreditacionVisibility.isOpen());

  data = signal<PenaData>(createEmpty());
  currentStep = signal(0);
  submitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal('');
  submittedId = signal('');

  progressPercent = computed(() => ((this.currentStep() + 1) / STEPS.length) * 100);

  addAcompaniante(): void {
    this.data().acompaniantes.push({ nombre: '', dni: '', rol: '' });
  }

  removeAcompaniante(i: number): void {
    this.data().acompaniantes.splice(i, 1);
  }

  getDiaLabel(v: string): string {
    return DIAS.find(d => d.value === v)?.label || v || '(sin seleccionar)';
  }

  getRolLabel(v: string): string {
    return ROLES.find(r => r.value === v)?.label || v || '(sin rol)';
  }

  canProceed(): boolean {
    const d = this.data();
    if (this.currentStep() === 0) {
      return !!(d.proyecto.nombreGrupo.trim() && d.proyecto.nombreResponsable.trim() && d.proyecto.dniResponsable.trim() && d.proyecto.telefono.trim() && d.proyecto.diaPresentacion);
    }
    if (this.currentStep() === 1) {
      if (d.acompaniantes.length === 0) return true;
      return d.acompaniantes.every(p => p.nombre.trim() && p.dni.trim() && p.rol);
    }
    return true;
  }

  nextStep(): void {
    if (!this.canProceed()) return;
    if (this.currentStep() < STEPS.length - 1) this.currentStep.update(v => v + 1);
  }

  prevStep(): void {
    if (this.currentStep() > 0) this.currentStep.update(v => v - 1);
  }

  onSubmit(): void {
    if (!this.canProceed()) return;
    this.submitting.set(true);
    this.submitError.set('');
    const d = this.data();
    const payload = {
      nombre_grupo: d.proyecto.nombreGrupo,
      nombre_responsable: d.proyecto.nombreResponsable,
      dni_responsable: d.proyecto.dniResponsable,
      telefono: d.proyecto.telefono,
      dia_presentacion: d.proyecto.diaPresentacion,
      acompaniantes: d.acompaniantes,
    };
    this.http.post<{ id: string }>(`${environment.apiUrl}/pena-acreditaciones/`, payload).subscribe({
      next: (res) => {
        this.submittedId.set(res.id);
        try { localStorage.setItem('pena_acreditacion', JSON.stringify(this.data())); } catch {}
        this.submitting.set(false);
        this.submitSuccess.set(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.submitError.set(err.error?.detail || 'Error al enviar la acreditación. Intentá de nuevo.');
        this.submitting.set(false);
      }
    });
  }

  downloadPDF(): void {
    const d = this.data();
    const w = window.open('', '_blank');
    if (!w) return;
    const rows = d.acompaniantes.map((p, i) =>
      '<tr><td style="padding:8px 12px; border:1px solid #e2e8f0;">' + (i + 1) + '</td><td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:600;">' + this.escapeHtml(p.nombre) + '</td><td style="padding:8px 12px; border:1px solid #e2e8f0; font-family: monospace;">' + this.escapeHtml(p.dni) + '</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">' + this.escapeHtml(this.getRolLabel(p.rol)) + '</td></tr>'
    ).join('');
    const respRow = '<tr style="background:#eff6ff;"><td style="padding:8px 12px; border:1px solid #e2e8f0;">—</td><td style="padding:8px 12px; border:1px solid #e2e8f0; font-weight:700;">' + this.escapeHtml(d.proyecto.nombreResponsable) + ' (Responsable)</td><td style="padding:8px 12px; border:1px solid #e2e8f0; font-family: monospace; font-weight:700;">' + this.escapeHtml(d.proyecto.dniResponsable) + '</td><td style="padding:8px 12px; border:1px solid #e2e8f0;">Responsable</td></tr>';
    w.document.write(
      '<html><head><title>Acreditacion Pena - ' + this.escapeHtml(d.proyecto.nombreGrupo) + '</title>' +
      '<style>body{font-family: system-ui, sans-serif; padding:32px; color:#0f172a;} h1{color:#1e293b; font-size:22px; margin-bottom:4px;} .sub{color:#64748b; font-size:13px; margin-bottom:24px;} .badge{display:inline-block; background:#1e293b; color:#f8fafc; padding:6px 14px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:0.06em; margin-bottom:16px;} table{width:100%; border-collapse:collapse; margin-top:16px;} th{background:#1e293b; color:#f8fafc; padding:10px 12px; text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:0.05em;} .footer{margin-top:32px; padding-top:16px; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8; text-align:center;}</style>' +
      '</head><body>' +
      '<div class="badge">PENA OFICIAL — PRE-COSQUIN PUERTO PIRAMIDES</div>' +
      '<h1>' + this.escapeHtml(d.proyecto.nombreGrupo) + '</h1>' +
      '<div class="sub">Responsable: ' + this.escapeHtml(d.proyecto.nombreResponsable) + ' · DNI ' + this.escapeHtml(d.proyecto.dniResponsable) + ' · Tel ' + this.escapeHtml(d.proyecto.telefono) + ' · ' + this.escapeHtml(this.getDiaLabel(d.proyecto.diaPresentacion)) + '</div>' +
      '<table><thead><tr><th>#</th><th>Nombre y Apellido</th><th>DNI</th><th>Rol</th></tr></thead><tbody>' + respRow + rows + '</tbody></table>' +
      '<div style="margin-top:20px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; font-size:12px; color:#475569;"><strong>Nota:</strong> Presentar este listado impreso o en pantalla en el control de acceso. Los datos serán verificados con DNI en puerta.</div>' +
      '<div class="footer">Pre-Cosquín Sede Puerto Pirámides · Peña Oficial · ' + new Date().toLocaleDateString('es-AR') + '</div>' +
      '</body></html>'
    );
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }

  private escapeHtml(s: string): string {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
