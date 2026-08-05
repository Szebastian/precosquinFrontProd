import { Component, input, output, signal, computed, effect, ElementRef, ViewChild, AfterViewChecked, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  InscripcionData, Member, ThemeRow, DanceTheme, BandMember,
  AccompanyingPerson, MELODIC_INSTRUMENTS, HARMONIC_INSTRUMENTS,
  subcategoriesByCategory, groupSubcategories, Instrument
} from '../inscripcion.page';
import { StagePlotComponent } from './stage-plot/stage-plot.component';
import { ContactFormComponent } from './contact-form.component';
import { environment } from '../../../../../environments/environment';

export interface TfQuestion {
  id: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'radio' | 'radio-cards' | 'checkbox' | 'info' | 'date-parts' | 'file' | 'members' | 'themes' | 'dance-themes' | 'band-members' | 'stage-plot' | 'accompanying' | 'declarations' | 'checklist';
  label?: string;
  sublabel?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string; desc?: string }[];
  visibleIf?: (data: InscripcionData) => boolean;
  validate?: (data: InscripcionData) => string;
}

@Component({
  selector: 'app-typeform-flow',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StagePlotComponent, ContactFormComponent],
  template: `
    <!-- TOP BAR -->
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
        <span class="tf-counter">{{ currentVisibleIndex() + 1 }} / {{ visibleQuestions().length }}</span>
      </div>
    </div>
    <div class="tf-progress">
      <div class="tf-progress-fill" [style.width.%]="progressPercent()"></div>
    </div>

    <!-- QUESTION AREA -->
    <div class="tf-viewport">
      @if (isSubmitting()) {
        <!-- SUBMITTING OVERLAY -->
        <div class="tf-submitting-screen">
          <div class="tf-submitting-card">
            <span class="tf-submitting-spinner"></span>
            <h2 class="tf-submitting-title">Enviando inscripción...</h2>
            <p class="tf-submitting-sub">No cierres esta ventana</p>
          </div>
        </div>
      } @else if (submitSuccess()) {
        <!-- SUCCESS SCREEN -->
        <div class="tf-success-screen">
          <div class="tf-success-card">
            <div class="tf-success-icon">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 class="tf-success-title">¡Inscripción enviada!</h2>
            <p class="tf-success-sub">Tu inscripción fue registrada exitosamente.</p>
            <p class="tf-success-id">N° <strong>{{ inscriptionId() }}</strong></p>
            <div class="tf-success-email-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <p>Te enviamos la constancia de inscripción a tu correo electrónico.</p>
            </div>
            <p class="tf-success-detail">Revisá tu casilla de entrada (y la carpeta de spam) para encontrar el comprobante con todos los datos de tu inscripción.</p>
            <div class="tf-success-actions">
              <button type="button" class="tf-btn-contact" (click)="showContactForm.set(true)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                Contactanos
              </button>
              <a routerLink="/" class="tf-btn-primary tf-btn-primary--active tf-success-home">Volver al inicio</a>
            </div>
          </div>
        </div>

        @if (showContactForm()) {
          <app-contact-form [inscriptionId]="inscriptionId()" (close)="showContactForm.set(false)" />
        }
      } @else if (currentQ(); as q) {
        <div class="tf-stage" [class.tf-stage--top]="currentQ().type === 'declarations'">
          <div class="tf-content">
            <span class="tf-label-num">{{ currentVisibleIndex() + 1 }}</span>
            @if (q.label) {
              <h2 class="tf-label">{{ q.label }}</h2>
            }
            @if (q.sublabel && q.type !== 'info') {
              <p class="tf-sublabel">{{ q.sublabel }}</p>
            }

            <!-- INPUT AREA -->
            <div class="tf-input-area">

            <!-- TEXT / EMAIL / TEL / NUMBER -->
            @if (q.type === 'text' || q.type === 'email' || q.type === 'tel' || q.type === 'number') {
              <div class="tf-input-wrap">
                <input #tfInput
                  class="tf-input"
                  [type]="q.type === 'number' ? 'number' : q.type"
                  [placeholder]="q.placeholder || ''"
                  [class.tf-input--error]="fieldError()"
                  [(ngModel)]="currentValue"
                  (ngModelChange)="onInput($event)"
                  (keydown.enter)="onEnterKey($event)"
                  autocomplete="off" />
                <div class="tf-input-line"></div>
                @if (fieldError()) {
                  <span class="tf-field-error">{{ fieldError() }}</span>
                }
              </div>
              @if (currentQ()!.type !== 'declarations') {
                <div class="tf-input-hint">
                  <kbd>Enter</kbd> para continuar
                </div>
              }
            }

            <!-- TEXTAREA -->
            @if (q.type === 'textarea') {
              <div class="tf-input-wrap">
                <textarea #tfInput
                  class="tf-textarea"
                  [placeholder]="q.placeholder || ''"
                  maxlength="500"
                  [class.tf-input--error]="fieldError()"
                  [(ngModel)]="currentValue"
                  (ngModelChange)="onInput($event)"></textarea>
                <span class="tf-char-count">{{ (currentValue() || '').length }} / 500</span>
                @if (fieldError()) {
                  <span class="tf-field-error">{{ fieldError() }}</span>
                }
              </div>
            }

            <!-- SELECT -->
            @if (q.type === 'select') {
              <div class="tf-input-wrap">
                <select #tfInput class="tf-select"
                  [(ngModel)]="currentValue"
                  (ngModelChange)="onInput($event)"
                  (keydown.enter)="onEnterKey($event)">
                  <option value="" disabled selected>{{ q.placeholder || 'Elegí una opción' }}</option>
                  @for (opt of q.options || []; track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
                @if (fieldError()) {
                  <span class="tf-field-error">{{ fieldError() }}</span>
                }
              </div>
            }

            <!-- RADIO -->
            @if (q.type === 'radio') {
              <div class="tf-radio-group">
                @for (opt of q.options || []; track opt.value) {
                  <button type="button" class="tf-radio-btn"
                    [class.tf-radio-btn--selected]="currentValue() === opt.value"
                    (click)="onRadioSelect(opt.value)">
                    <span class="tf-radio-dot"></span>
                    <div class="tf-radio-text">
                      <span class="tf-radio-label">{{ opt.label }}</span>
                      @if (opt.desc) {
                        <span class="tf-radio-desc">{{ opt.desc }}</span>
                      }
                    </div>
                    @if (currentValue() === opt.value) {
                      <svg class="tf-radio-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    }
                  </button>
                }
              </div>
              @if (fieldError()) {
                <span class="tf-field-error">{{ fieldError() }}</span>
              }
            }

            <!-- RADIO-CARDS -->
            @if (q.type === 'radio-cards') {
              <div class="tf-cards-grid">
                @for (opt of q.options || []; track opt.value) {
                  <button type="button" class="tf-card-option"
                    [class.tf-card-option--selected]="currentValue() === opt.value"
                    (click)="onRadioSelect(opt.value)">
                    <span class="tf-card-title">{{ opt.label }}</span>
                    @if (opt.desc) {
                      <span class="tf-card-desc">{{ opt.desc }}</span>
                    }
                  </button>
                }
              </div>
              @if (fieldError()) {
                <span class="tf-field-error">{{ fieldError() }}</span>
              }
            }

            <!-- CHECKBOX (single) -->
            @if (q.type === 'checkbox') {
              <div class="tf-checkbox-wrap">
                <button type="button" class="tf-checkbox-btn"
                  [class.tf-checkbox-btn--checked]="currentValue() === 'true'"
                  (click)="onCheckboxToggle()">
                  @if (currentValue() === 'true') {
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  } @else {
                    <span class="tf-checkbox-empty"></span>
                  }
                  <span>{{ q.placeholder }}</span>
                </button>
              </div>
            }

            <!-- CHECKLIST (multi-select) -->
            @if (q.type === 'checklist') {
              <div class="tf-checklist">
                @for (opt of q.options || []; track opt.value) {
                  <button type="button" class="tf-checklist-item"
                    [class.tf-checklist-item--checked]="isEquipmentChecked(opt.value)"
                    (click)="toggleEquipment(opt.value)">
                    @if (isEquipmentChecked(opt.value)) {
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    } @else {
                      <span class="tf-checkbox-empty"></span>
                    }
                    <span>{{ opt.label }}</span>
                  </button>
                }
              </div>
            }

            <!-- STAGE PLOT -->
            @if (q.type === 'stage-plot') {
              <div class="tf-stage-plot-wrap">
                <app-stage-plot
                  [initialInstruments]="stagePlotInstruments()"
                  (instrumentsChange)="onStagePlotChange($event)">
                </app-stage-plot>
              </div>
            }

            <!-- ACCOMPANYING PERSONS -->
            @if (q.type === 'accompanying') {
              <div class="tf-accompanying">
                <div class="tf-accompanying-header">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4c8be6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <h3 class="tf-accompanying-title">¿Quiénes te acompañan?</h3>
                </div>
                <p class="tf-accompanying-subtitle">Registrá a las personas que van a acompañarte en la presentación</p>
                @if (data().accompanyingPersons.length === 0) {
                  <div class="tf-accompanying-empty">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>No se registraron personas acompañantes</span>
                  </div>
                }
                @for (person of data().accompanyingPersons; track person; let i = $index) {
                  <div class="tf-accompanying-card">
                    <div class="tf-accompanying-card-header">
                      <span class="tf-accompanying-card-number">{{ i + 1 }}</span>
                      <span class="tf-accompanying-card-label">Persona {{ i + 1 }}</span>
                      <button type="button" class="tf-btn-remove" (click)="onRemoveAccompanying(i)" title="Eliminar persona">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    <div class="tf-accompanying-fields">
                      <div class="tf-field">
                        <label class="tf-field-label">Nombre y apellido *</label>
                        <input type="text" class="tf-input" placeholder="Ej: María González"
                          [ngModel]="person.fullName"
                          (ngModelChange)="onAccompanyingNameInput(i, $event)" />
                      </div>
                      <div class="tf-field">
                        <label class="tf-field-label">DNI *</label>
                        <input type="text" class="tf-input tf-input-narrow" placeholder="Ej: 12345678"
                          [ngModel]="person.dni"
                          (ngModelChange)="onAccompanyingDniInput(i, $event)" />
                      </div>
                    </div>
                  </div>
                }
                <button type="button" class="tf-btn-add-accompanying" (click)="onAddAccompanying()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Agregar persona
                </button>
              </div>
            }

            <!-- DATE-PARTS -->
            @if (q.type === 'date-parts') {
              <div class="tf-date-parts">
                <select class="tf-date-select" [(ngModel)]="dateDay" (ngModelChange)="syncDate()">
                  <option value="" disabled>Día</option>
                  @for (d of days; track d) { <option [value]="d">{{ d }}</option> }
                </select>
                <select class="tf-date-select" [(ngModel)]="dateMonth" (ngModelChange)="syncDate()">
                  <option value="" disabled>Mes</option>
                  @for (m of months; track m.value) { <option [value]="m.value">{{ m.label }}</option> }
                </select>
                <select class="tf-date-select" [(ngModel)]="dateYear" (ngModelChange)="syncDate()">
                  <option value="" disabled>Año</option>
                  @for (y of years; track y) { <option [value]="y">{{ y }}</option> }
                </select>
              </div>
              @if (data().age !== null && data().age! >= 16) {
                <span class="tf-age-badge">{{ data().age }} años</span>
              }
              @if (fieldError()) {
                <span class="tf-field-error">{{ fieldError() }}</span>
              }
            }

            <!-- INFO -->
            @if (q.type === 'info') {
              <div class="tf-info-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>{{ q.sublabel }}</span>
              </div>
            }

            <!-- DECLARATIONS -->
            @if (q.type === 'declarations') {
              <div class="tf-declarations">

                <!-- 1. DATOS DEL TITULAR -->
                <div class="tf-decl-section">
                  <div class="tf-decl-section-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4c8be6" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span class="tf-decl-section-title">Datos del Titular</span>
                  </div>
                  <div class="tf-decl-detail-grid">
                    <div class="tf-decl-field">
                      <span class="tf-decl-field-label">Nombre completo</span>
                      <span class="tf-decl-field-value">{{ data().firstName || '-' }} {{ data().lastName || '' }}</span>
                    </div>
                    <div class="tf-decl-field">
                      <span class="tf-decl-field-label">DNI</span>
                      <span class="tf-decl-field-value">{{ data().dni || '-' }}</span>
                    </div>
                    <div class="tf-decl-field">
                      <span class="tf-decl-field-label">Email</span>
                      <span class="tf-decl-field-value">{{ data().email || '-' }}</span>
                    </div>
                    <div class="tf-decl-field">
                      <span class="tf-decl-field-label">Teléfono</span>
                      <span class="tf-decl-field-value">{{ data().phone || '-' }}</span>
                    </div>
                    <div class="tf-decl-field">
                      <span class="tf-decl-field-label">Rubro</span>
                      <span class="tf-decl-field-value">{{ data().category === 'musica' ? 'Música' : 'Danza' }}</span>
                    </div>
                    <div class="tf-decl-field">
                      <span class="tf-decl-field-label">Subcategoría</span>
                      <span class="tf-decl-field-value">{{ getSubcategoryName() }}</span>
                    </div>
                  </div>
                </div>

                <!-- 2. FICHA TÉCNICA & SONIDO -->
                @if (hasTechnicalData()) {
                  <div class="tf-decl-section">
                    <div class="tf-decl-section-header">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4c8be6" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                      <span class="tf-decl-section-title">Ficha Técnica & Sonido</span>
                    </div>

                    <!-- Stage Plot -->
                    @if (stagePlotInstruments().length > 0) {
                      <div class="tf-decl-tech-block">
                        <span class="tf-decl-tech-label">Ubicación en Escenario (Stage Plan)</span>
                        <div class="tf-decl-stage-canvas">
                          <div class="tf-decl-stage-zone tf-decl-stage-zone--back">
                            <span>FONDO</span>
                          </div>
                          @for (inst of normalizedInstruments(); track inst.id) {
                            <div class="tf-decl-stage-inst" [style.left.%]="inst.nx" [style.top.%]="inst.ny">
                              <img [src]="getInstrumentIcon(inst.type)" class="tf-decl-stage-inst-icon" />
                              <span class="tf-decl-stage-inst-label">{{ getInstrumentLabel(inst.type) }}</span>
                            </div>
                          }
                          <div class="tf-decl-stage-zone tf-decl-stage-zone--front">
                            <span>PÚBLICO</span>
                          </div>
                        </div>
                        <div class="tf-decl-stage-legend">
                          @for (inst of normalizedInstruments(); track inst.id) {
                            <div class="tf-decl-stage-chip">
                              <img [src]="getInstrumentIcon(inst.type)" class="tf-decl-stage-chip-icon" />
                              <span>{{ getInstrumentLabel(inst.type) }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    }

                    <!-- Instrumentos a Utilizar -->
                    @if (data().equipmentDesc.trim()) {
                      <div class="tf-decl-tech-block">
                        <span class="tf-decl-tech-label">Instrumentos a Utilizar</span>
                        <p class="tf-decl-tech-text">{{ data().equipmentDesc }}</p>
                      </div>
                    }

                    <!-- Rider Técnico -->
                    @if (hasRiderData()) {
                      <div class="tf-decl-tech-block">
                        <span class="tf-decl-tech-label">Requerimiento Técnico (Rider)</span>
                        <div class="tf-decl-rider-grid">
                          @if (data().riderTecnico.sonido.microfonos.length > 0) {
                            <div class="tf-decl-rider-item">
                              <span class="tf-decl-rider-key">Micrófonos</span>
                              <span class="tf-decl-rider-val">{{ data().riderTecnico.sonido.microfonos.join(', ') }}</span>
                            </div>
                          }
                          @if (data().riderTecnico.monitorCount) {
                            <div class="tf-decl-rider-item">
                              <span class="tf-decl-rider-key">Monitores</span>
                              <span class="tf-decl-rider-val">{{ data().riderTecnico.monitorCount }}</span>
                            </div>
                          }
                          @if (data().riderTecnico.sonido.diBoxes) {
                            <div class="tf-decl-rider-item">
                              <span class="tf-decl-rider-key">DI Boxes</span>
                              <span class="tf-decl-rider-val">{{ data().riderTecnico.sonido.diBoxes }}</span>
                            </div>
                          }
                          @if (data().riderTecnico.sonido.backline.length > 0) {
                            <div class="tf-decl-rider-item">
                              <span class="tf-decl-rider-key">Backline</span>
                              <span class="tf-decl-rider-val">{{ data().riderTecnico.sonido.backline.join(', ') }}</span>
                            </div>
                          }
                          @if (data().riderTecnico.otros.trim()) {
                            <div class="tf-decl-rider-item tf-decl-rider-item--full">
                              <span class="tf-decl-rider-key">Otros</span>
                              <span class="tf-decl-rider-val">{{ data().riderTecnico.otros }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    }

                    <!-- Descripción del Escenario -->
                    @if (data().stagePlotDesc.trim()) {
                      <div class="tf-decl-tech-block">
                        <span class="tf-decl-tech-label">Descripción del Escenario</span>
                        <p class="tf-decl-tech-text">{{ data().stagePlotDesc }}</p>
                      </div>
                    }
                  </div>
                }

                <!-- 3. ACOMPAÑANTES / INTEGRANTES -->
                <div class="tf-decl-section">
                  <div class="tf-decl-section-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4c8be6" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span class="tf-decl-section-title">Acompañantes / Integrantes</span>
                    <span class="tf-decl-section-count">{{ getPeopleCount() }}</span>
                  </div>

                  <!-- Titular (siempre presente) -->
                  <div class="tf-decl-people-grid">
                    <div class="tf-decl-people-card tf-decl-people-card--titular">
                      <span class="tf-decl-people-num">T</span>
                      <div class="tf-decl-people-info">
                        <span class="tf-decl-people-name">{{ data().firstName || '-' }} {{ data().lastName || '' }}</span>
                        <span class="tf-decl-people-detail">DNI {{ data().dni || '-' }} · Titular</span>
                      </div>
                    </div>
                  </div>

                  @if (data().members.length > 0) {
                    <div class="tf-decl-people-grid">
                      @for (member of data().members; track member; let i = $index) {
                        <div class="tf-decl-people-card">
                          <span class="tf-decl-people-num">{{ i + 1 }}</span>
                          <div class="tf-decl-people-info">
                            <span class="tf-decl-people-name">{{ member.fullName || '-' }}</span>
                            <span class="tf-decl-people-detail">DNI {{ member.dni || '-' }}{{ member.role ? ' · ' + member.role : '' }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  }

                  @if (data().accompanyingPersons.length > 0) {
                    <div class="tf-decl-people-grid">
                      @for (person of data().accompanyingPersons; track person; let i = $index) {
                        <div class="tf-decl-people-card">
                          <span class="tf-decl-people-num">{{ data().members.length + i + 1 }}</span>
                          <div class="tf-decl-people-info">
                            <span class="tf-decl-people-name">{{ person.fullName || '-' }}</span>
                            <span class="tf-decl-people-detail">DNI {{ person.dni || '-' }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- 4. ART. 31 RULES (conditional) -->
                @if (data().subcategory === 'solista_instrumental') {
                  <div class="tf-decl-rules-box">
                    <h4 class="tf-decl-rules-title">Reglas Solista Instrumental — Art. 31</h4>
                    <ul class="tf-decl-rules-list">
                      <li>Presentación puramente instrumental</li>
                      <li>Un (1) único instrumento para el solista</li>
                      <li>No se permiten pistas ni bases pregrabadas</li>
                      <li>No se permite cambio de instrumento durante la presentación</li>
                    </ul>
                  </div>
                }

                <button type="button" class="tf-checkbox-btn tf-checkbox-btn--big" [class.tf-checkbox-btn--checked]="data().acceptRegulations" (click)="toggleDecl('acceptRegulations')">
                  @if (data().acceptRegulations) { <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> } @else { <span class="tf-checkbox-empty tf-checkbox-empty--big"></span> }
                  <span>Acepto el reglamento, autorizo el uso de mi imagen y voz, y declaro que los datos proporcionados son verídicos</span>
                </button>

                <!-- EMAIL VERIFICATION -->
                @if (data().acceptRegulations) {
                  <div class="tf-otp-section" #otpSection>
                    @if (!isEmailVerified()) {
                      <div class="tf-otp-banner">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        <span>Debés verificar tu email antes de enviar</span>
                      </div>

                      @if (!verificationSent()) {
                        <div class="tf-otp-card">
                          <h3 class="tf-otp-title">Verificá tu email</h3>
                          <p class="tf-otp-desc">Te enviaremos un código de verificación a <strong>{{ data().email }}</strong></p>
                          <button type="button" class="tf-btn-primary tf-btn-primary--active" (click)="sendVerification()" [disabled]="sendingCode()">
                            @if (sendingCode()) { Enviando... } @else { Enviar código de verificación }
                          </button>
                        </div>
                      } @else {
                        <div class="tf-otp-card">
                          <h3 class="tf-otp-title">Ingresá el código</h3>
                          <p class="tf-otp-desc">Ingresá el código de 6 dígitos que recibiste en tu email</p>
                          <div class="tf-otp-input-row">
                            <input type="text" class="tf-otp-field" [ngModel]="verificationCode()" (ngModelChange)="verificationCode.set($event)" placeholder="000000" maxlength="6" (keyup.enter)="verifyCode()" />
                            <button type="button" class="tf-btn-primary tf-btn-primary--active tf-otp-verify-btn" (click)="verifyCode()" [disabled]="verifyingCode() || verificationCode().length < 6">
                              @if (verifyingCode()) { Verificando... } @else { Verificar }
                            </button>
                          </div>
                          @if (verificationError()) {
                            <p class="tf-otp-error">{{ verificationError() }}</p>
                          }
                          <p class="tf-otp-contact">¿No recibiste el código? Contactanos a <a href="mailto:info@precosquinpiramides.com">info@precosquinpiramides.com</a></p>
                        </div>
                      }
                    } @else {
                      <div class="tf-otp-card tf-otp-card--success">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                        <span>Email verificado correctamente</span>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- FILE UPLOAD -->
            @if (q.type === 'file') {
              <div class="tf-file-zone">
                <label class="tf-file-drop" (dragover)="$event.preventDefault()" (drop)="$event.preventDefault(); onFileDrop($event, q.id)">
                  <input type="file" accept="image/*,.pdf" (change)="onFileSelect($event, q.id)" hidden />
                  <div class="tf-file-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <span class="tf-file-label">Hacé click o arrastrá tu archivo</span>
                  <span class="tf-file-hint">PDF o imagen, máx. 5MB</span>
                </label>
                @if (getFileForQuestion(q.id)) {
                  <div class="tf-file-loaded">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>{{ getFileForQuestion(q.id) }}</span>
                    <button type="button" class="tf-file-remove" (click)="removeFileForQuestion(q.id)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                }
              </div>
              @if (fieldError()) {
                <span class="tf-field-error">{{ fieldError() }}</span>
              }
            }

          </div><!-- /tf-input-area -->
        </div><!-- /tf-content -->
      </div><!-- /tf-stage -->

        <!-- BOTTOM NAV -->
        <div class="tf-bottom-nav">
          @if (submitError()) {
            <div class="tf-submit-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{{ submitError() }}</span>
            </div>
          }
          <div class="tf-bottom-left">
            @if (currentIdx() === 0) {
              <button type="button" class="tf-btn-ghost" (click)="exitTypeform.emit()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                Volver
              </button>
            } @else if (canGoBack()) {
              <button type="button" class="tf-btn-ghost" (click)="onGoBack()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                Volver
              </button>
            }
          </div>
          <div class="tf-bottom-right">
            @if (isLastQuestion()) {
              @if (isSubmitting()) {
                <button type="button" class="tf-btn-primary tf-btn-submit tf-btn-submit--loading" disabled>
                  <span class="tf-spinner"></span>
                  Enviando inscripción...
                </button>
              } @else {
                <button type="button" class="tf-btn-primary tf-btn-submit" (click)="onSubmit()" [disabled]="!allDeclarationsChecked()">
                  Enviar inscripción
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </button>
              }
            } @else {
              <button type="button" class="tf-btn-primary" [class.tf-btn-primary--active]="inputHasValue()" (click)="goNext()" [disabled]="!isValid()">
                Continuar
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex; flex-direction: column; height: 100vh; height: 100dvh;
      overflow: hidden; background: #111118; color: #e2e8f0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
    }

    /* ===== TOP BAR ===== */
    .tf-topbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      height: 56px; padding: 16px 48px;
      background: #111118; border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .tf-topbar-left { display: flex; align-items: center; gap: 20px; }
    .tf-topbar-right { display: flex; align-items: center; }
    .tf-logo {
      font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 700;
      color: #f1f5f9; letter-spacing: -0.01em;
    }
    .tf-topbar-sep {
      width: 1px; height: 20px; background: rgba(255,255,255,0.1);
    }
    .tf-topbar-home {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.8rem; font-weight: 500; color: #64748b;
      cursor: pointer; transition: color 0.2s; text-decoration: none;
    }
    .tf-topbar-home:hover { color: #94a3b8; }
    .tf-counter {
      font-size: 0.8rem; font-weight: 600; color: #475569;
      font-variant-numeric: tabular-nums; letter-spacing: 0.02em;
    }

    /* ===== PROGRESS ===== */
    .tf-progress {
      position: fixed; top: 56px; left: 0; right: 0; z-index: 99;
      height: 2px; background: rgba(255,255,255,0.04);
    }
    .tf-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4c8be6 0%, #7c5ce6 50%, #a78bfa 100%);
      transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
      border-radius: 0 2px 2px 0;
    }

    /* ===== VIEWPORT ===== */
    .tf-viewport {
      flex: 1; display: flex; flex-direction: column;
      padding: 56px 0 0; overflow-y: auto;
      scroll-behavior: smooth;
    }

    /* ===== STAGE ===== */
    .tf-stage {
      flex: 1; display: flex; align-items: center; justify-content: center;
      width: 100%; padding: 80px 80px 160px;
      animation: tfFadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes tfFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .tf-stage--top { align-items: flex-start; padding-top: 40px; }

    /* ===== CONTENT (centered card) ===== */
    .tf-content {
      width: 100%; max-width: 560px;
      display: flex; flex-direction: column; align-items: flex-start;
    }

    .tf-label-num {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; font-size: 0.8rem; font-weight: 700;
      color: #4c8be6; background: rgba(76, 139, 230, 0.1);
      border: 1px solid rgba(76, 139, 230, 0.2);
      border-radius: 8px; margin-bottom: 16px;
    }
    .tf-label {
      font-size: 2.5rem; font-weight: 700; color: #f8fafc;
      line-height: 1.15; margin: 0; letter-spacing: -0.03em;
    }
    .tf-sublabel {
      font-size: 1rem; color: #64748b; margin-top: 16px; line-height: 1.6;
    }

    /* ===== INPUT AREA ===== */
    .tf-input-area {
      width: 100%; display: flex; flex-direction: column; gap: 16px;
      margin-top: 32px;
    }

    /* ===== INPUT FIELDS ===== */
    .tf-input-wrap { position: relative; }
    .tf-input, .tf-select {
      width: 100%; padding: 20px 0; font-size: 1.5rem; font-weight: 500;
      color: #f8fafc; background: transparent; border: none;
      border-bottom: 2px solid rgba(255,255,255,0.08);
      outline: none; transition: border-color 0.25s; font-family: inherit;
      letter-spacing: -0.01em;
    }
    .tf-input:focus, .tf-select:focus { border-bottom-color: #4c8be6; }
    .tf-input::placeholder { color: #334155; font-weight: 400; }
    .tf-input--error { border-bottom-color: #f87171 !important; }
    .tf-input-line {
      position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
      background: transparent; transition: background 0.25s;
    }
    .tf-input:focus ~ .tf-input-line { background: #4c8be6; }

    .tf-input-hint {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 0.8rem; color: #475569; margin-top: 4px;
    }
    .tf-input-hint kbd {
      display: inline-block; padding: 3px 8px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 5px; font-size: 0.7rem; font-family: inherit; color: #64748b;
    }

    .tf-textarea {
      width: 100%; min-height: 140px; padding: 16px 18px;
      font-size: 1rem; color: #f1f5f9; background: rgba(255,255,255,0.02);
      border: 1.5px solid rgba(255,255,255,0.08); border-radius: 14px;
      outline: none; resize: vertical; font-family: inherit;
      transition: border-color 0.25s, background 0.25s;
    }
    .tf-textarea:focus { border-color: #4c8be6; background: rgba(76, 139, 230, 0.03); }
    .tf-textarea::placeholder { color: #334155; }

    .tf-select {
      appearance: none; cursor: pointer; padding-right: 36px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%23475569' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 4px center;
    }
    .tf-select option { background: #1a1d27; color: #e2e8f0; }

    .tf-field-error { display: block; margin-top: 10px; font-size: 0.85rem; color: #f87171; }
    .tf-char-count { display: block; text-align: right; font-size: 0.75rem; color: #334155; margin-top: 6px; }

    /* ===== RADIO ===== */
    .tf-radio-group { display: flex; flex-direction: column; gap: 10px; }
    .tf-radio-btn {
      display: flex; align-items: center; gap: 14px;
      padding: 16px 20px; background: rgba(255,255,255,0.02);
      border: 1.5px solid rgba(255,255,255,0.06); border-radius: 14px;
      cursor: pointer; transition: all 0.2s ease;
      text-align: left; color: #94a3b8; font-size: 0.95rem; font-family: inherit; width: 100%;
    }
    .tf-radio-btn:hover { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); color: #cbd5e1; }
    .tf-radio-btn:active { transform: scale(0.985); }
    .tf-radio-btn--selected { border-color: #4c8be6; background: rgba(76, 139, 230, 0.06); color: #f1f5f9; }
    .tf-radio-dot {
      width: 22px; height: 22px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.15); flex-shrink: 0;
      position: relative; transition: all 0.25s;
    }
    .tf-radio-btn--selected .tf-radio-dot { border-color: #4c8be6; background: #4c8be6; }
    .tf-radio-btn--selected .tf-radio-dot::after {
      content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 8px; height: 8px; border-radius: 50%; background: #fff;
    }
    .tf-radio-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .tf-radio-label { font-weight: 500; }
    .tf-radio-desc { font-size: 0.8rem; color: #475569; }
    .tf-radio-check { color: #4c8be6; flex-shrink: 0; margin-left: auto; }

    /* ===== RADIO-CARDS ===== */
    .tf-cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .tf-card-option {
      display: flex; flex-direction: column; gap: 6px;
      padding: 24px 20px; background: rgba(255,255,255,0.02);
      border: 1.5px solid rgba(255,255,255,0.06); border-radius: 14px;
      cursor: pointer; transition: all 0.25s ease;
      text-align: left; font-family: inherit;
    }
    .tf-card-option:hover { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); transform: translateY(-2px); }
    .tf-card-option:active { transform: scale(0.98); }
    .tf-card-option--selected { border-color: #4c8be6; background: rgba(76, 139, 230, 0.08); }
    .tf-card-title { font-size: 1.05rem; font-weight: 600; color: #e2e8f0; }
    .tf-card-desc { font-size: 0.8rem; color: #475569; line-height: 1.4; }

    /* ===== CHECKBOX ===== */
    .tf-checkbox-wrap { display: flex; flex-direction: column; gap: 10px; }
    .tf-checkbox-btn {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 16px 20px; background: rgba(255,255,255,0.02);
      border: 1.5px solid rgba(255,255,255,0.06); border-radius: 14px;
      cursor: pointer; transition: all 0.2s;
      text-align: left; color: #64748b; font-size: 0.95rem; font-family: inherit;
      width: 100%; line-height: 1.5;
    }
    .tf-checkbox-btn:hover { border-color: rgba(255,255,255,0.14); color: #94a3b8; }
    .tf-checkbox-btn:active { transform: scale(0.985); }
    .tf-checkbox-btn--checked { border-color: rgba(74, 222, 128, 0.3); background: rgba(74, 222, 128, 0.04); color: #e2e8f0; }
    .tf-checkbox-btn--checked svg { color: #4ade80; flex-shrink: 0; margin-top: 2px; }
    .tf-checkbox-empty {
      display: inline-block; width: 22px; height: 22px; flex-shrink: 0;
      border: 2px solid rgba(255,255,255,0.12); border-radius: 6px;
      transition: all 0.2s; margin-top: 1px;
    }
    .tf-checkbox-btn:hover .tf-checkbox-empty { border-color: rgba(255,255,255,0.25); }

    /* ===== CHECKLIST (multi-select) ===== */
    .tf-checklist { display: flex; flex-direction: column; gap: 8px; }
    .tf-checklist-item {
      display: flex; align-items: center; gap: 14px;
      padding: 16px 20px; background: rgba(255,255,255,0.02);
      border: 1.5px solid rgba(255,255,255,0.06); border-radius: 14px;
      cursor: pointer; transition: all 0.2s ease;
      text-align: left; color: #94a3b8; font-size: 0.95rem; font-family: inherit; width: 100%;
    }
    .tf-checklist-item:hover { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); color: #cbd5e1; }
    .tf-checklist-item:active { transform: scale(0.985); }
    .tf-checklist-item--checked { border-color: rgba(74, 222, 128, 0.3); background: rgba(74, 222, 128, 0.04); color: #e2e8f0; }
    .tf-checklist-item--checked svg { color: #4ade80; flex-shrink: 0; }

    /* ===== STAGE PLOT WRAPPER ===== */
    .tf-stage-plot-wrap {
      width: 100%; border-radius: 14px; overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08); background: #0d1117;
    }

    /* ===== SUBMITTING OVERLAY ===== */
    .tf-submitting-screen {
      display: grid; place-items: center; width: 100%;
      min-height: calc(100vh - 58px); padding: 24px;
      animation: tfFadeIn 0.3s ease;
    }
    .tf-submitting-card {
      display: flex; flex-direction: column; align-items: center; text-align: center;
    }
    .tf-submitting-spinner {
      display: block; width: 48px; height: 48px; margin-bottom: 20px;
      border: 3px solid rgba(255,255,255,0.1); border-top-color: #4ade80;
      border-radius: 50%; animation: tf-spin 0.8s linear infinite;
    }
    .tf-submitting-title { font-size: 1.3rem; font-weight: 700; color: #e2e8f0; margin: 0 0 8px; }
    .tf-submitting-sub { font-size: 0.85rem; color: #64748b; margin: 0; }

    /* ===== SUCCESS SCREEN ===== */
    /* Grid + place-items:center = centra en ambos ejes sin heredar
       el align-items:flex-start del flujo de preguntas (.tf-stage/.tf-content). */
    .tf-success-screen {
      display: grid;
      place-items: center;
      width: 100%;
      min-height: calc(100vh - 58px); /* descuenta topbar */
      padding: 24px;
      animation: tfFadeIn 0.45s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .tf-success-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 100%;
      max-width: 480px;
    }
    .tf-success-icon {
      margin-bottom: 28px;
      animation: successPop 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes successPop {
      0%   { transform: scale(0.4); opacity: 0; }
      65%  { transform: scale(1.12); }
      100% { transform: scale(1);   opacity: 1; }
    }
    .tf-success-title {
      font-size: clamp(1.8rem, 5vw, 2.6rem);
      font-weight: 800;
      color: #f8fafc;
      margin: 0 0 14px;
      letter-spacing: -0.04em;
      line-height: 1.1;
    }
    .tf-success-sub {
      font-size: 1rem;
      color: #94a3b8;
      margin: 0 0 6px;
      line-height: 1.5;
    }
    .tf-success-id {
      font-size: 0.82rem;
      color: #64748b;
      margin: 0 0 18px;
      line-height: 1.4;
      word-break: break-all;
      max-width: 400px;
    }
    .tf-success-id strong {
      color: #4c8be6;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.02em;
    }
    .tf-success-email-info {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 14px 18px;
      margin: 0 0 16px;
      max-width: 400px;
    }
    .tf-success-email-info svg { flex-shrink: 0; }
    .tf-success-email-info p {
      margin: 0;
      font-size: 0.85rem;
      color: #1e40af;
      font-weight: 500;
      line-height: 1.5;
    }
    .tf-success-detail {
      font-size: 0.8rem;
      color: #94a3b8;
      margin: 0 0 36px;
      line-height: 1.7;
      max-width: 400px;
    }
    .tf-success-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
      width: 100%;
    }
    .tf-btn-contact {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid #e2e8f0;
      background: #fff;
      color: #475569;
      transition: all 0.15s;
    }
    .tf-btn-contact:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #1e293b;
    }
    .tf-success-home { text-decoration: none; }

    /* ===== SUBMIT ERROR ===== */
    .tf-submit-error {
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 8px;
      padding: 12px 20px; background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px;
      color: #fca5a5; font-size: 0.85rem; z-index: 101;
      max-width: 500px; text-align: center;
    }
    .tf-submit-error svg { flex-shrink: 0; color: #f87171; }

    /* ===== DATE-PARTS ===== */
    .tf-date-parts { display: flex; gap: 12px; }
    .tf-date-select {
      flex: 1; padding: 14px 14px; font-size: 1rem; color: #f1f5f9;
      background: rgba(255,255,255,0.03); border: 1.5px solid rgba(255,255,255,0.08);
      border-radius: 12px; outline: none; cursor: pointer; font-family: inherit;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23475569' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 12px center;
      transition: border-color 0.2s;
    }
    .tf-date-select:focus { border-color: #4c8be6; }
    .tf-date-select option { background: #1a1d27; color: #e2e8f0; }
    .tf-age-badge {
      display: inline-flex; align-items: center; gap: 4px; margin-top: 10px;
      font-size: 0.8rem; font-weight: 600; color: #4ade80;
      background: rgba(74, 222, 128, 0.08); padding: 5px 14px; border-radius: 9999px;
    }

    /* ===== INFO ===== */
    .tf-info-banner {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 18px 22px; background: rgba(76, 139, 230, 0.04);
      border: 1px solid rgba(76, 139, 230, 0.12); border-radius: 14px;
      font-size: 0.9rem; color: #7cb3f4; line-height: 1.6;
    }
    .tf-info-banner svg { flex-shrink: 0; margin-top: 2px; color: #4c8be6; }

    /* ===== FILE ===== */
    .tf-file-zone { }
    .tf-file-drop {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      padding: 48px 24px; border: 2px dashed rgba(255,255,255,0.08);
      border-radius: 18px; background: rgba(255,255,255,0.01);
      cursor: pointer; transition: all 0.25s; text-align: center;
    }
    .tf-file-drop:hover { border-color: rgba(76, 139, 230, 0.3); background: rgba(76, 139, 230, 0.03); }
    .tf-file-icon { color: #334155; margin-bottom: 4px; }
    .tf-file-label { font-size: 0.9rem; color: #64748b; }
    .tf-file-hint { font-size: 0.75rem; color: #334155; }
    .tf-file-loaded {
      display: flex; align-items: center; gap: 10px; margin-top: 12px;
      padding: 12px 16px; background: rgba(74, 222, 128, 0.05);
      border: 1px solid rgba(74, 222, 128, 0.15); border-radius: 10px;
      font-size: 0.85rem; color: #4ade80;
    }
    .tf-file-loaded svg { flex-shrink: 0; }
    .tf-file-loaded span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tf-file-remove {
      background: none; border: none; color: #475569; cursor: pointer;
      padding: 4px; border-radius: 6px; transition: all 0.2s;
    }
    .tf-file-remove:hover { color: #f87171; background: rgba(248, 113, 113, 0.08); }

    /* ===== DECLARATIONS ===== */
    .tf-declarations { display: flex; flex-direction: column; gap: 16px; }
    .tf-decl-section { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; }
    .tf-decl-section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
    .tf-decl-section-title { font-size: 0.7rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; flex: 1; }
    .tf-decl-section-count { font-size: 0.7rem; color: #64748b; background: rgba(255,255,255,0.04); padding: 2px 8px; border-radius: 10px; }
    .tf-decl-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; }
    .tf-decl-field { display: flex; flex-direction: column; gap: 2px; }
    .tf-decl-field-label { font-size: 0.65rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
    .tf-decl-field-value { font-size: 0.85rem; color: #cbd5e1; line-height: 1.4; }
    .tf-decl-tech-block { margin-bottom: 14px; }
    .tf-decl-tech-block:last-child { margin-bottom: 0; }
    .tf-decl-tech-label { display: block; font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
    .tf-decl-tech-text { font-size: 0.82rem; color: #94a3b8; margin: 0; line-height: 1.6; }
    .tf-decl-rider-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .tf-decl-rider-item { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; }
    .tf-decl-rider-item--full { grid-column: 1 / -1; }
    .tf-decl-rider-key { font-size: 0.6rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .tf-decl-rider-val { font-size: 0.8rem; color: #94a3b8; line-height: 1.4; }
    .tf-decl-people-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .tf-decl-people-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; }
    .tf-decl-people-num { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; background: rgba(76,139,230,0.12); color: #4c8be6; font-size: 0.65rem; font-weight: 700; border-radius: 50%; flex-shrink: 0; }
    .tf-decl-people-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
    .tf-decl-people-name { font-size: 0.82rem; color: #cbd5e1; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tf-decl-people-detail { font-size: 0.7rem; color: #64748b; }
    .tf-decl-people-card--titular { border-color: rgba(76,139,230,0.2); background: rgba(76,139,230,0.04); }
    .tf-decl-people-card--titular .tf-decl-people-num { background: rgba(76,139,230,0.2); }

    /* Stage Plot */
    .tf-decl-stage-section { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; }
    .tf-decl-stage-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .tf-decl-stage-header-title { font-size: 0.7rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; flex: 1; }
    .tf-decl-stage-count { font-size: 0.7rem; color: #64748b; }
    .tf-decl-stage-canvas { position: relative; width: 100%; height: 220px; background: rgba(76,139,230,0.04); border: 1px dashed rgba(76,139,230,0.2); border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .tf-decl-stage-zone { position: absolute; left: 0; right: 0; height: 28px; display: flex; align-items: center; justify-content: center; pointer-events: none; }
    .tf-decl-stage-zone span { font-size: 0.55rem; font-weight: 700; color: rgba(76,139,230,0.35); text-transform: uppercase; letter-spacing: 0.15em; }
    .tf-decl-stage-zone--back { top: 0; background: rgba(76,139,230,0.06); border-bottom: 1px solid rgba(76,139,230,0.1); }
    .tf-decl-stage-zone--front { bottom: 0; background: rgba(100,116,139,0.04); border-top: 1px solid rgba(100,116,139,0.08); }
    .tf-decl-stage-inst { position: absolute; display: flex; flex-direction: column; align-items: center; gap: 2px; transform: translate(-50%, -50%); pointer-events: none; }
    .tf-decl-stage-inst-icon { width: 28px; height: 28px; object-fit: contain; filter: brightness(0) invert(1) drop-shadow(0 1px 3px rgba(0,0,0,0.5)); }
    .tf-decl-stage-inst-label { font-size: 0.5rem; color: #94a3b8; white-space: nowrap; text-shadow: 0 1px 2px rgba(0,0,0,0.6); }
    .tf-decl-stage-legend { display: flex; flex-wrap: wrap; gap: 6px; }
    .tf-decl-stage-chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; font-size: 0.7rem; color: #94a3b8; }
    .tf-decl-stage-chip-icon { width: 14px; height: 14px; object-fit: contain; }
    .tf-decl-rules-box { margin-top: 8px; padding: 14px; background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.15); border-radius: 10px; }
    .tf-decl-rules-title { font-size: 0.75rem; font-weight: 700; color: #f59e0b; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.04em; }
    .tf-decl-rules-list { margin: 0; padding-left: 18px; color: #94a3b8; font-size: 0.82rem; line-height: 1.8; }
    .tf-checkbox-btn--big { padding: 16px 18px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; font-size: 0.88rem; line-height: 1.5; }
    .tf-checkbox-btn--big:hover { border-color: rgba(76,139,230,0.3); background: rgba(76,139,230,0.04); }
    .tf-checkbox-empty--big { width: 24px; height: 24px; border: 2px solid rgba(255,255,255,0.15); border-radius: 6px; flex-shrink: 0; }
    .tf-checkbox-btn--big.tf-checkbox-btn--checked { border-color: rgba(76,139,230,0.4); background: rgba(76,139,230,0.08); }
    .tf-checkbox-btn--big.tf-checkbox-btn--checked .tf-checkbox-empty--big { border-color: #4c8be6; background: #4c8be6; }

    /* ===== OTP SECTION ===== */
    .tf-otp-section {
      display: flex; flex-direction: column; gap: 12px;
      margin-top: 8px; padding: 18px;
      background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px;
      scroll-margin-bottom: 100px;
      animation: tfFadeIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .tf-otp-banner {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px; background: rgba(234,179,8,0.08);
      border: 1px solid rgba(234,179,8,0.2); border-radius: 10px;
      color: #eab308; font-size: 0.82rem; font-weight: 600;
    }
    .tf-otp-banner svg { flex-shrink: 0; }
    .tf-otp-card {
      display: flex; flex-direction: column; align-items: center;
      text-align: center; padding: 20px; gap: 12px;
    }
    .tf-otp-card--success {
      flex-direction: row; justify-content: center;
      background: rgba(74,222,128,0.06); border: 1px solid rgba(74,222,128,0.2);
      border-radius: 10px; padding: 14px; color: #4ade80; font-size: 0.85rem; font-weight: 600;
    }
    .tf-otp-title { font-size: 1rem; font-weight: 700; color: #e2e8f0; margin: 0; }
    .tf-otp-desc { font-size: 0.85rem; color: #94a3b8; margin: 0; line-height: 1.5; }
    .tf-otp-desc strong { color: #e2e8f0; }
    .tf-otp-input-row { display: flex; gap: 10px; align-items: center; justify-content: center; margin: 4px 0; }
    .tf-otp-field {
      width: 140px; height: 48px; text-align: center; font-size: 1.25rem;
      font-weight: 700; letter-spacing: 0.5em;
      background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.12);
      border-radius: 10px; color: #f1f5f9; padding: 0 8px;
      outline: none; transition: border-color 0.25s; font-family: inherit;
    }
    .tf-otp-field:focus { border-color: #4c8be6; }
    .tf-otp-verify-btn { padding: 12px 24px !important; }
    .tf-otp-error {
      background: rgba(239,68,68,0.1); color: #f87171;
      padding: 8px 12px; border-radius: 8px; font-size: 0.78rem;
      margin: 0; border: 1px solid rgba(239,68,68,0.2);
    }
    .tf-otp-contact { font-size: 0.72rem; color: #475569; margin: 0; }
    .tf-otp-contact a { color: #4c8be6; text-decoration: none; }
    .tf-otp-contact a:hover { text-decoration: underline; }

    /* ===== ACCOMPANYING ===== */
    .tf-accompanying { display: flex; flex-direction: column; gap: 16px; }
    .tf-accompanying-header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .tf-accompanying-title { font-size: 1rem; font-weight: 700; color: #e2e8f0; margin: 0; flex: 1; }
    .tf-accompanying-subtitle { font-size: 0.82rem; color: #94a3b8; margin: 0 0 4px; line-height: 1.5; }
    .tf-accompanying-empty { display: flex; align-items: center; gap: 8px; padding: 16px; background: rgba(100,116,139,0.06); border: 1px dashed rgba(100,116,139,0.2); border-radius: 10px; color: #64748b; font-size: 0.85rem; }
    .tf-accompanying-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px; margin-bottom: 8px; }
    .tf-accompanying-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .tf-accompanying-card-number { width: 26px; height: 26px; border-radius: 50%; background: rgba(76,139,230,0.15); color: #4c8be6; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .tf-accompanying-card-label { flex: 1; font-size: 0.8rem; color: #64748b; font-weight: 600; }
    .tf-accompanying-fields { display: grid; grid-template-columns: 1fr 120px; gap: 10px; align-items: end; }
    .tf-accompanying-fields .tf-input { padding: 10px 0; font-size: 0.85rem; border-bottom-width: 1px; }
    .tf-accompanying-fields .tf-input::placeholder { color: #475569; font-weight: 400; font-size: 0.8rem; }
    .tf-field { display: flex; flex-direction: column; gap: 4px; }
    .tf-field-label { font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
    .tf-btn-remove { background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; }
    .tf-btn-remove:hover { color: #f87171; background: rgba(248,113,113,0.1); }
    .tf-btn-add-accompanying { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: rgba(76,139,230,0.1); color: #4c8be6; border: 1px solid rgba(76,139,230,0.2); border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.15s; align-self: flex-start; }
    .tf-btn-add-accompanying:hover { background: rgba(76,139,230,0.2); border-color: rgba(76,139,230,0.35); }

    /* ===== BOTTOM NAV ===== */
    .tf-bottom-nav {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 80px; background: rgba(17, 17, 24, 0.95);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .tf-bottom-left, .tf-bottom-right { display: flex; align-items: center; }
    .tf-btn-ghost {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 18px; background: none; border: 1.5px solid rgba(255,255,255,0.08);
      border-radius: 10px; color: #64748b; font-size: 0.9rem;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .tf-btn-ghost:hover { border-color: rgba(255,255,255,0.18); color: #94a3b8; }
    .tf-btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 16px 36px; border: none; border-radius: 12px;
      font-size: 1rem; font-weight: 600;
      cursor: pointer; transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      font-family: inherit;
      background: rgba(255,255,255,0.06); color: #475569;
      box-shadow: none;
    }
    .tf-btn-primary--active {
      background: #4c8be6; color: #fff;
      box-shadow: 0 4px 24px rgba(76, 139, 230, 0.3);
    }
    .tf-btn-primary--active:hover {
      background: #3b7ad4; transform: translateY(-1px);
      box-shadow: 0 6px 28px rgba(76, 139, 230, 0.4);
    }
    .tf-btn-primary:active { transform: translateY(0); }
    .tf-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
    .tf-btn-submit {
      background: linear-gradient(135deg, #4ade80, #22c55e); color: #fff;
      box-shadow: 0 4px 16px rgba(74, 222, 128, 0.25);
    }
    .tf-btn-submit:hover { background: linear-gradient(135deg, #3bc973, #1daa4e); box-shadow: 0 6px 20px rgba(74, 222, 128, 0.35); }
    .tf-btn-submit--loading { opacity: 0.85; cursor: wait; pointer-events: none; }
    .tf-spinner {
      display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff; border-radius: 50%; animation: tf-spin 0.7s linear infinite; margin-right: 6px;
    }
    @keyframes tf-spin { to { transform: rotate(360deg); } }

    /* ===== RESPONSIVE ===== */
    @media (min-width: 1200px) {
      .tf-content { max-width: 640px; }
      .tf-label { font-size: 3rem; }
      .tf-sublabel { font-size: 1.1rem; }
      .tf-input, .tf-select { font-size: 1.75rem; padding: 24px 0; }
      .tf-input-area { gap: 20px; margin-top: 40px; }
      .tf-label-num { width: 36px; height: 36px; font-size: 0.85rem; margin-bottom: 20px; }
    }
    @media (min-width: 1600px) {
      .tf-content { max-width: 720px; }
      .tf-label { font-size: 3.25rem; }
      .tf-input, .tf-select { font-size: 1.85rem; }
    }
    @media (max-width: 1024px) {
      .tf-stage { padding: 64px 40px 160px; }
      .tf-bottom-nav { padding: 16px 40px; }
    }
    @media (max-width: 768px) {
      .tf-topbar { padding: 16px 24px; }
      .tf-stage { padding: 48px 24px 160px; }
      .tf-content { max-width: 100%; }
      .tf-label { font-size: 1.75rem; }
      .tf-input, .tf-select { font-size: 1.25rem; }
      .tf-bottom-nav { padding: 16px 24px; }
      .tf-btn-primary { padding: 14px 28px; font-size: 0.95rem; }
    }
    @media (max-width: 480px) {
      .tf-topbar { padding: 12px 16px; }
      .tf-logo { font-size: 0.85rem; }
      .tf-stage { padding: 32px 16px 160px; }
      .tf-label { font-size: 1.5rem; }
      .tf-input, .tf-select { font-size: 1.15rem; }
      .tf-radio-btn { padding: 14px 16px; }
      .tf-card-option { padding: 20px 16px; }
      .tf-bottom-nav { padding: 14px 16px; }
      .tf-btn-primary { padding: 12px 24px; font-size: 0.9rem; }
    }
  `]
})
export class TypeformFlowComponent implements AfterViewChecked, OnDestroy {
  data = input.required<InscripcionData>();
  submitted = output<void>();
  isSubmitting = input<boolean>(false);
  submitSuccess = input<boolean>(false);
  submitError = input<string>('');
  inscriptionId = input<string>('');
  inscriptionCreatedAt = input<string>('');
  exitTypeform = output<void>();
  saveDraft = output<void>();
  showContactForm = signal(false);

  private http = inject(HttpClient);

  verificationSent = signal(false);
  isEmailVerified = signal(false);
  verificationCode = signal('');
  sendingCode = signal(false);
  verifyingCode = signal(false);
  verificationError = signal('');

  @ViewChild('tfInput') tfInputRef!: ElementRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  @ViewChild('otpSection') otpSectionRef?: ElementRef<HTMLElement>;

  questions = signal<TfQuestion[]>([]);
  currentIdx = signal(0);
  animating = signal(false);
  fieldError = signal('');
  currentValue = signal('');

  firstNameValue = signal('');
  lastNameValue = signal('');

  dateDay = signal('');
  dateMonth = signal('');
  dateYear = signal('');

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
    'Chubut': ['Puerto Pirámides', 'Trelew', 'Rawson', 'Gaiman', 'Dolavon', 'Comodoro Rivadavia', 'Rada Tilly', 'Caleta Olivia', 'Cañadón Seco', 'Paso de Indios', 'Los Altares', 'Esquel', 'Trevelin', 'Lago Blanco', 'Río Pico', 'Gobernador Costa', 'Corcovado', 'Cholila', 'Epuyén', 'El Bolsón', 'Lago Puelo', 'El Hoyo', 'Gastre', 'Telsen', 'Languiñéo'],
    'Río Negro': ['Bariloche', 'Viedma', 'Cipolletti', 'General Roca', 'San Carlos de Bariloche', 'El Bolsón', 'Villa Regina', 'Choele Choel', 'Río Colorado'],
    'Neuquén': ['Neuquén', 'San Martín de los Andes', 'Villa La Angostura', 'Zapala', 'Añelo', 'Plottier', 'Cutral Co', 'Rincón de los Sauces'],
    'La Pampa': ['Santa Rosa', 'General Pico', 'Catriló', 'Winifreda', '25 de Mayo', 'Eduardo Castex', 'Quemú Quemú'],
    'Buenos Aires': ['La Plata', 'Mar del Plata', 'Bahía Blanca', 'Tandil', 'Olavarría', 'Dolores', 'Chascomús', 'Pinamar', 'Villa Gesell', 'Necochea', 'Junín', 'Pergamino', 'Azul', 'Lobos', 'Cañuelas', 'San Nicolás', 'Avellaneda', 'Lanús', 'Quilmes', 'Morón', 'La Matanza', 'Florencio Varela', 'Berazategui', 'Esteban Echeverría', 'Almirante Brown', 'Lomas de Zamora'],
    'CABA': ['Ciudad Autónoma de Buenos Aires'],
    'Córdoba': ['Córdoba', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María', 'Cosquín', 'Alta Gracia', 'Jesús María', 'Unquillo', 'Mina Clavero'],
    'Santa Fe': ['Rosario', 'Santa Fe', 'Rafaela', 'Venado Tuerto', 'Reconquista', 'Villa Gobernador Gálvez', 'Cañada de Gómez'],
    'Entre Ríos': ['Paraná', 'Concordia', 'Villa María Grande', 'Colón', 'Federación', 'Villaguay', 'Gualeguaychú'],
    'Mendoza': ['Mendoza', 'San Rafael', 'San Martín', 'Guaymallén', 'Las Heras', 'Luján de Cuyo', 'Tunuyán', 'San Carlos'],
    'Salta': ['Salta', 'San Miguel de Tucumán', 'Jujuy', 'Orán', 'Rivadavia', 'Tartagal', 'Metán', 'Cafayate', 'Purmamarca', 'Tilcara'],
    'Tucumán': ['San Miguel de Tucumán', 'Concepción', 'Bella Vista', 'Tafí Viejo', 'Monteros', 'Chicligasta'],
    'Misiones': ['Posadas', 'Puerto Iguazú', 'Eldorado', 'Oberá', 'San Pedro', 'Apóstoles', 'Leandro N. Alem'],
    'Corrientes': ['Corrientes', 'Resistencia', 'Goya', 'Mercedes', 'Curuzú Cuatiá', 'Paso de los Libres', 'Santo Tomé'],
    'Chaco': ['Resistencia', 'Buenos Aires', 'Saenz Peña', 'Villa Ángela', 'Charata', 'General San Martín'],
    'Formosa': ['Formosa', 'Clorinda', 'Pirané', 'El Colorado', 'Las Lomitas'],
    'San Juan': ['San Juan', 'Chimbas', 'Santa Lucía', 'Rivadavia', 'Zonda', 'Calingasta', 'Jáchal', 'Iglesia'],
    'San Luis': ['San Luis', 'Villa Mercedes', 'Quines', 'Merlo', 'Concarán'],
    'La Rioja': ['La Rioja', 'Chilecito', 'Famatina', 'Villa Unión', 'Anillaco'],
    'Catamarca': ['San Fernando del Valle de Catamarca', 'Belén', 'Tinogasta', 'Andalgalá', 'Santa María'],
    'Santiago del Estero': ['Santiago del Estero', 'La Banda', 'Fermosa', 'Añatuya', 'Quimilí'],
    'Santa Cruz': ['Río Gallegos', 'Caleta Olivia', 'El Calafate', 'Perito Moreno', 'Las Heras', '28 de Noviembre', 'Puerto Deseado'],
    'Tierra del Fuego': ['Ushuaia', 'Río Grande', 'Tolhuin'],
    'Jujuy': ['San Salvador de Jujuy', 'San Pedro', 'Ledesma', 'Santa Catalina', 'Tilcara', 'Purmamarca', 'Humahuaca'],
  };

  private keyHandler = this.onKeydown.bind(this);

  private lastCategory = '';
  private lastSubcategory = '';

  constructor() {
    effect(() => {
      const d = this.data();
      if (d.category !== this.lastCategory || d.subcategory !== this.lastSubcategory) {
        this.lastCategory = d.category;
        this.lastSubcategory = d.subcategory;
        this.rebuildQuestions();
      }
    });
  }

  ngAfterViewChecked(): void {
    this.focusInput();
  }

  ngOnInit(): void {
    document.addEventListener('keydown', this.keyHandler);
    this.initDateParts();
    const d = this.data();
    if (d.firstName) {
      this.firstNameValue.set(d.firstName);
      this.lastNameValue.set(d.lastName || '');
    }
    if (d.riderTecnico?.stagePlotInstruments?.length) {
      this.stagePlotInstruments.set([...d.riderTecnico.stagePlotInstruments]);
    }
    this.rebuildQuestions();
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.keyHandler);
  }

  private initDateParts(): void {
    const d = this.data();
    if (d.birthDate) {
      const parts = d.birthDate.split('-');
      if (parts.length === 3) {
        this.dateYear.set(parts[0]);
        this.dateMonth.set(parts[1]);
        this.dateDay.set(parts[2]);
      }
    }
  }

  syncDate(): void {
    const y = this.dateYear();
    const m = this.dateMonth();
    const d = this.dateDay();
    if (y && m && d) {
      this.data().birthDate = `${y}-${m}-${d}`;
      this.data().age = this.calcAge(`${y}-${m}-${d}`);
    }
  }

  private calcAge(birthDate: string): number | null {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const md = today.getMonth() - birth.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : null;
  }

  visibleQuestions = computed(() => {
    const d = this.data();
    return this.questions().filter(q => !q.visibleIf || q.visibleIf(d));
  });

  currentQ = computed(() => this.visibleQuestions()[this.currentIdx()] || null);
  currentVisibleIndex = computed(() => this.currentIdx());
  progressPercent = computed(() => {
    const total = this.visibleQuestions().length;
    return total > 0 ? Math.round(((this.currentIdx() + 1) / total) * 100) : 0;
  });
  isLastQuestion = computed(() => this.currentIdx() >= this.visibleQuestions().length - 1);
  canGoBack = computed(() => this.currentIdx() > 0);
  inputHasValue = computed(() => {
    const q = this.currentQ();
    if (!q) return false;
    if (q.type === 'checklist' || q.type === 'textarea' || q.type === 'stage-plot' || q.type === 'accompanying') return true;
    if (q.type === 'file') {
      this._fileVersion();
      return !q.required || !!this.getFileForQuestion(q.id);
    }
    if (q.type === 'date-parts') return !!(this.dateDay() && this.dateMonth() && this.dateYear());
    return (this.currentValue() || '').trim().length > 0;
  });

  _fileVersion = signal(0);

  stagePlotInstruments = signal<Instrument[]>([]);

  normalizedInstruments = computed(() => {
    const instruments = this.stagePlotInstruments();
    if (!instruments.length) return [];
    const STAGE_W = 800;
    const STAGE_H = 400;
    return instruments.map(inst => ({
      ...inst,
      nx: Math.min(95, Math.max(5, (inst.x / STAGE_W) * 100)),
      ny: Math.min(95, Math.max(5, (inst.y / STAGE_H) * 100)),
    }));
  });

  getInstrumentIcon(type: string): string {
    const map: Record<string, string> = {
      'guitarra-criolla': 'assets/iconoForm/guitarra.webp', 'guitarron': 'assets/iconoForm/guitarron.webp',
      'charango': 'assets/iconoForm/charango.webp', 'violin': 'assets/iconoForm/violin.webp',
      'violonchelo': 'assets/iconoForm/violonchelo.webp', 'contrabajo': 'assets/iconoForm/contrabajo.webp',
      'quena': 'assets/iconoForm/quena.webp', 'siku': 'assets/iconoForm/siku.webp',
      'sicus': 'assets/iconoForm/sicus.webp', 'flauta-traversa': 'assets/iconoForm/flauta-traversa.webp',
      'erke': 'assets/iconoForm/erke.webp', 'piano': 'assets/iconoForm/teclado.webp',
      'acordeon': 'assets/iconoForm/acordeon.webp', 'bandoneon': 'assets/iconoForm/bandoneon.webp',
      'bombo-leguero': 'assets/iconoForm/bombo-leguero.webp', 'caja-chayera': 'assets/iconoForm/caja-chayera.webp',
      'percusion-menor': 'assets/iconoForm/percusion-menor.webp',       'microfono-alt': 'assets/iconoForm/microfono.webp',
      'monitor-alt': 'assets/iconoForm/altavoz-de-musica.webp', 'amplificador-alt': 'assets/iconoForm/amplificador.webp',
      'energia-alt': 'assets/iconoForm/energia.webp', 'musico-alt': 'assets/iconoForm/usuario.webp',
      'bailarin-alt': 'assets/iconoForm/usuario.webp',
    };
    return map[type] || 'assets/iconoForm/usuario.webp';
  }

  private rebuildQuestions(): void {
    const d = this.data();
    const isGroup = groupSubcategories.includes(d.subcategory);
    const isDanza = d.category === 'danza';
    const isMalambo = ['malambo_masculino', 'malambo_femenino'].includes(d.subcategory);
    const isParejaTradicional = d.subcategory === 'pareja_tradicional';
    const isPareja = ['pareja_tradicional', 'pareja_estilizada'].includes(d.subcategory);
    const isConjuntoBaile = d.subcategory === 'conjunto_baile';
    const isConjuntoMalambo = d.subcategory === 'conjunto_malambo';
    const isSolistaInstrumental = d.subcategory === 'solista_instrumental';
    const isCancionInedita = d.subcategory === 'cancion_inedita';
    const needsMp3 = isPareja || isConjuntoBaile;

    const qs: TfQuestion[] = [
      // --- PERSONAL ---
      {
        id: 'firstName', type: 'text', label: '¿Cómo te llamás?', placeholder: 'Tu nombre', required: true,
        validate: () => {
          const fn = this.firstNameValue().trim();
          return (!fn || fn.length < 2) ? 'Ingresá tu nombre (mínimo 2 caracteres)' : '';
        }
      },
      {
        id: 'lastName', type: 'text', label: '¿Cuál es tu apellido?', placeholder: 'Tu apellido', required: true,
        validate: () => {
          const ln = this.lastNameValue().trim();
          return (!ln || ln.length < 2) ? 'Ingresá tu apellido (mínimo 2 caracteres)' : '';
        }
      },
      {
        id: 'dni', type: 'text', label: '¿Cuál es tu DNI?', placeholder: 'Sin puntos', required: true,
        validate: (d) => { const raw = d.dni.replace(/\D/g, ''); return raw.length < 7 ? 'DNI inválido (mínimo 7 dígitos)' : ''; }
      },
      {
        id: 'birthDate', type: 'date-parts', label: '¿Cuándo naciste?', sublabel: 'Tenés que tener al menos 16 años', required: true,
        validate: (d) => !d.birthDate ? 'Completá tu fecha de nacimiento' : (d.age !== null && d.age < 16) ? 'Tenés que tener al menos 16 años' : ''
      },
      {
        id: 'address', type: 'text', label: '¿Dónde vivís?', placeholder: 'Calle y número', required: true,
        validate: (d) => d.address.trim().length < 3 ? 'Mínimo 3 caracteres' : ''
      },
      {
        id: 'province', type: 'select', label: '¿De qué provincia sos?', required: true,
        options: [
          { value: 'Buenos Aires', label: 'Buenos Aires' }, { value: 'CABA', label: 'CABA' }, { value: 'Catamarca', label: 'Catamarca' },
          { value: 'Chaco', label: 'Chaco' }, { value: 'Chubut', label: 'Chubut' }, { value: 'Córdoba', label: 'Córdoba' },
          { value: 'Corrientes', label: 'Corrientes' }, { value: 'Entre Ríos', label: 'Entre Ríos' }, { value: 'Formosa', label: 'Formosa' },
          { value: 'Jujuy', label: 'Jujuy' }, { value: 'La Pampa', label: 'La Pampa' }, { value: 'La Rioja', label: 'La Rioja' },
          { value: 'Mendoza', label: 'Mendoza' }, { value: 'Misiones', label: 'Misiones' }, { value: 'Neuquén', label: 'Neuquén' },
          { value: 'Río Negro', label: 'Río Negro' }, { value: 'Salta', label: 'Salta' }, { value: 'San Juan', label: 'San Juan' },
          { value: 'San Luis', label: 'San Luis' }, { value: 'Santa Cruz', label: 'Santa Cruz' }, { value: 'Santa Fe', label: 'Santa Fe' },
          { value: 'Santiago del Estero', label: 'Santiago del Estero' }, { value: 'Tierra del Fuego', label: 'Tierra del Fuego' }, { value: 'Tucumán', label: 'Tucumán' },
        ],
        validate: (d) => !d.province ? 'Elegí una provincia' : ''
      },
       {
        id: 'locality', type: 'select', label: '¿De qué ciudad sos?', required: true,
        options: !d.province ? [{ value: '', label: 'Primero seleccioná tu provincia' }] : (this.localidadesPorProvincia[d.province] || []).map(c => ({ value: c, label: c })),
        validate: (d) => !d.locality ? 'Elegí tu ciudad' : ''
      },
      {
        id: 'phone', type: 'tel', label: '¿Cuál es tu teléfono?', sublabel: 'Con código de area', placeholder: 'Ej: 2804872996', required: true,
        validate: (d) => d.phone.replace(/\D/g, '').length < 8 ? 'Mínimo 8 dígitos' : ''
      },
      {
        id: 'email', type: 'email', label: '¿Cuál es tu email?', sublabel: 'Te vamos a enviar la confirmación acá', placeholder: 'tu@email.com', required: true,
        validate: (d) => { const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; return !re.test(d.email) ? 'Email inválido' : ''; }
      },

      // --- CATEGORY ---
      {
        id: 'category', type: 'radio-cards', label: '¿Qué vas a presentar?', required: true,
        options: [
          { value: 'musica', label: 'Música', desc: 'Canto o toco un instrumento' },
          { value: 'danza', label: 'Danza', desc: 'Bailo folklore argentino' },
        ],
        validate: (d) => !d.category ? 'Elegí una categoría' : ''
      },

      // MUSIC SUBCATEGORIES
      {
        id: 'sub_musica', type: 'radio', label: '¿En cuál categoría de música?', required: true,
        visibleIf: (d) => d.category === 'musica',
        options: subcategoriesByCategory['musica'].map(s => ({ value: s.id, label: s.name })),
        validate: (d) => d.category === 'musica' && !d.subcategory ? 'Elegí una subcategoría' : ''
      },

      // DANZA SUBCATEGORIES
      {
        id: 'sub_danza', type: 'radio', label: '¿En cuál categoría de danza?', required: true,
        visibleIf: (d) => d.category === 'danza',
        options: subcategoriesByCategory['danza'].map(s => ({ value: s.id, label: s.name })),
        validate: (d) => d.category === 'danza' && !d.subcategory ? 'Elegí una subcategoría' : ''
      },

      // INFO: Música rules
      {
        id: 'info_musica', type: 'radio',
        label: 'Sin pistas ni bases pregrabadas',
        sublabel: 'Presentación en vivo. Máx. 5 min por tema. Elegí continuar para avanzar.',
        required: true,
        visibleIf: (d) => d.category === 'musica' && !!d.subcategory,
        options: [
          { value: 'ok', label: 'Entendido, continuar' },
        ]
      },

      // SOLISTA INSTRUMENTAL: instrument type
      {
        id: 'instrumentType', type: 'radio', label: '¿Qué tipo de instrumento tocás?',
        sublabel: 'Art. 31 - Reglamento Precosquín · Elegí si tu instrumento es melódico o armónico',
        required: true,
        visibleIf: () => isSolistaInstrumental,
        options: [
          { value: 'melodico', label: 'Melódico', desc: 'Produce una nota a la vez · Podés tener 1 acompañamiento armónico' },
          { value: 'armonico', label: 'Armónico', desc: 'Permite acordes simultáneos · Presentación en solitario' },
        ]
      },

      // SOLISTA INSTRUMENTAL: specific instrument
      {
        id: 'instrumentName', type: 'radio', label: '¿Qué instrumento tocás?', required: true,
        visibleIf: (d) => isSolistaInstrumental && !!d.instrumentType,
        options: d.instrumentType === 'melodico'
          ? MELODIC_INSTRUMENTS.map(i => ({ value: i, label: i }))
          : HARMONIC_INSTRUMENTS.map(i => ({ value: i, label: i }))
      },

      // SOLISTA INSTRUMENTAL: accompaniment
      {
        id: 'hasAccompaniment', type: 'radio', label: '¿Vas a tener acompañamiento?', sublabel: 'Solo para instrumentos melódicos. 1 músico armónico máximo.',
        visibleIf: (d) => isSolistaInstrumental && d.instrumentType === 'melodico' && !!d.instrumentName,
        options: [
          { value: 'true', label: 'Sí' },
          { value: 'false', label: 'No' },
        ]
      },

      // INFO: Danza rules
      {
        id: 'info_danza', type: 'radio',
        label: this.getDanzaInfoText().split('.')[0],
        sublabel: this.getDanzaInfoText(),
        required: true,
        visibleIf: (d) => d.category === 'danza' && !!d.subcategory,
        options: [
          { value: 'ok', label: 'Entendido, continuar' },
        ]
      },

      // DANZA: dance style (malambo)
      {
        id: 'danceStyle', type: 'radio', label: '¿Qué estilo de malambo?', required: true,
        visibleIf: () => isMalambo,
        options: [
          { value: 'norteno', label: 'Norteño', desc: 'Ritmo enérgico del norte' },
          { value: 'sureno', label: 'Sureño', desc: 'Ritmo melancólico del sur' },
        ]
      },

      // PROPOSAL NAME (danza)
      {
        id: 'proposalName', type: 'text', label: '¿Cómo se llama tu propuesta?', placeholder: 'Ej: Zamba del Tropero', required: true,
        visibleIf: (d) => d.category === 'danza' && !!d.subcategory,
        validate: (d) => !d.proposalName.trim() ? 'Ingresá el nombre de la propuesta' : ''
      },

      // CHOREOGRAPHER (danza)
      {
        id: 'choreographerName', type: 'text', label: '¿Quién es el coreógrafo?', placeholder: 'Nombre del coreógrafo', required: true,
        visibleIf: (d) => d.category === 'danza' && !!d.subcategory,
        validate: (d) => !d.choreographerName.trim() ? 'Ingresá el nombre del coreógrafo' : ''
      },

      // STYLE (danza)
      {
        id: 'style', type: 'textarea', label: '¿Qué estilo tiene?', placeholder: 'Contanos del estilo: folklórico, contemporáneo...',
        visibleIf: (d) => d.category === 'danza' && !!d.subcategory
      },

      // DANZA: 3 rondas (parejas)
      {
        id: 'danceRonda1', type: 'text', label: 'Ronda 1 — Nombre de la danza', placeholder: 'Ej: Chacarera', required: true,
        visibleIf: () => isPareja,
        validate: (d) => !d.danceThemes[0]?.title?.trim() ? 'Ingresá el nombre de la danza para la Ronda 1' : ''
      },
      {
        id: 'danceSong1', type: 'text', label: 'Ronda 1 — Nombre de la canción', placeholder: 'Ej: La López Pereyra', required: true,
        visibleIf: () => isPareja,
        validate: (d) => !d.danceThemes[0]?.song?.trim() ? 'Ingresá el nombre de la canción para la Ronda 1' : ''
      },
      {
        id: 'danceRonda2', type: 'text', label: 'Ronda 2 — Nombre de la danza', placeholder: 'Ej: Zamba', required: true,
        visibleIf: () => isPareja,
        validate: (d) => !d.danceThemes[1]?.title?.trim() ? 'Ingresá el nombre de la danza para la Ronda 2' : ''
      },
      {
        id: 'danceSong2', type: 'text', label: 'Ronda 2 — Nombre de la canción', placeholder: 'Ej: Luna tucumana', required: true,
        visibleIf: () => isPareja,
        validate: (d) => !d.danceThemes[1]?.song?.trim() ? 'Ingresá el nombre de la canción para la Ronda 2' : ''
      },
      {
        id: 'danceRonda3', type: 'text', label: 'Ronda 3 (final) — Nombre de la danza', placeholder: 'Ej: Escondido', required: true,
        visibleIf: () => isPareja,
        validate: (d) => !d.danceThemes[2]?.title?.trim() ? 'Ingresá el nombre de la danza para la Ronda 3' : ''
      },
      {
        id: 'danceSong3', type: 'text', label: 'Ronda 3 — Nombre de la canción', placeholder: 'Ej: Pago chico', required: true,
        visibleIf: () => isPareja,
        validate: (d) => !d.danceThemes[2]?.song?.trim() ? 'Ingresá el nombre de la canción para la Ronda 3' : ''
      },

      // WORK TITLE (conjunto baile)
      {
        id: 'workTitle', type: 'text', label: '¿Cómo se llama la obra?', placeholder: 'Nombre de la obra', required: true,
        visibleIf: () => isConjuntoBaile,
        validate: (d) => !d.workTitle.trim() ? 'Ingresá el nombre de la obra' : ''
      },

      // ASSISTANTS (pareja tradicional)
      {
        id: 'assistantsCount', type: 'number', label: '¿Cuántos asistentes van?', sublabel: 'Máximo 2 para pareja tradicional', placeholder: '0', required: true,
        visibleIf: () => isParejaTradicional
      },

       // BIOGRAPHY
       {
         id: 'biography', type: 'textarea', label: 'Contanos sobre vos o tu grupo', sublabel: 'Trayectoria, logros, experiencia...',
         visibleIf: (d) => d.category === 'musica'
       },

       // PRESENTATION INFO (general for all performers)
       {
         id: 'presentation', type: 'textarea', label: 'Contanos sobre tu presentación musical', sublabel: 'Contanos tu propuesta artística, qué vas a presentar y qué la hace especial.',
         required: true,
         visibleIf: (d) => d.category === 'musica',
         validate: (d) => !d.presentation || d.presentation.trim().length < 10 ? 'Contanos más sobre tu presentación (mínimo 10 caracteres)' : ''
       },
       {
         id: 'artisticName', type: 'text', label: '¿Tenés nombre artístico?', placeholder: 'Si lo tenés, ponelo acá',
         visibleIf: (d) => d.category === 'musica'
       },
       {
         id: 'songsList', type: 'textarea', label: '¿Qué temas vas a tocar?', sublabel: 'Por tema: nombre del tema, ritmo y autor o compositor (separá cada uno con un renglón nuevo). Ej: Chacarera · Ritmo chacarero · Autor anónimo',
         required: true,
         visibleIf: (d) => d.category === 'musica',
         validate: (d) => !d.songsList || d.songsList.trim().length < 5 ? 'Listá al menos un tema' : ''
       },

       // MP3 DANZA
      {
        id: 'danceMp3', type: 'file', label: 'Subí la música (MP3)', sublabel: 'Traé un pendrive exclusivo el día de la presentación',
        visibleIf: () => needsMp3
      },

      // DANCE LIST
      {
        id: 'danceList', type: 'textarea', label: '¿Qué danzas incluye?', placeholder: 'Listá las danzas o cuadros...',
        visibleIf: (d) => d.category === 'danza' && !!d.subcategory
      },

      // CANCIÓN INÉDITA: lyrics + score
      {
        id: 'lyricsFile', type: 'file', label: 'Subí la letra de la canción', required: true,
        visibleIf: () => isCancionInedita
      },
      {
        id: 'scoreFile', type: 'file', label: 'Subí la partitura', required: true,
        visibleIf: () => isCancionInedita
      },

      // FILES: DNI + PHOTO
      {
        id: 'dniFrontFile', type: 'file', label: 'Foto del DNI (frente)', required: true,
        visibleIf: () => true
      },
      {
        id: 'dniBackFile', type: 'file', label: 'Foto del DNI (dorso)', required: false,
        visibleIf: () => true
      },
      {
        id: 'promoPhotoFile', type: 'file', label: 'Foto promocional', sublabel: 'Una foto tuya o de tu grupo para difusión', required: true,
        visibleIf: () => true
      },

      // EQUIPO TÉCNICO: equipment selection
      {
        id: 'equipment', type: 'checklist', label: '¿Qué equipamiento llevás?',
        sublabel: 'Seleccioná el equipamiento que vas a llevar. Este paso es opcional. El equipo técnico definitivo se define en los ensayos.',
        visibleIf: () => true,
        options: [
          { value: 'guitarra_electrica', label: 'Guitarra eléctrica' },
          { value: 'guitarra_acustica', label: 'Guitarra acústica' },
          { value: 'bajo', label: 'Bajo' },
          { value: 'bateria', label: 'Batería' },
          { value: 'acordeon', label: 'Acordeón' },
          { value: 'teclado', label: 'Teclado' },
          { value: 'percusion_menor', label: 'Percusión menor' },
        ]
      },

      // EQUIPO TÉCNICO: description
      {
        id: 'equipmentDesc', type: 'textarea', label: 'Describe tu equipo técnico necesario',
        sublabel: 'Ej: Necesito micrófono para el bajo, cable jack de 10 metros, y un adaptador XLR macho a hembra.',
        visibleIf: () => true
      },

       // STAGE PLOT
       {
         id: 'stagePlot', type: 'stage-plot', label: 'Stage Plot',
         sublabel: 'Arrastrá los instrumentos al escenario para diagramar la posición de tu banda. Fondo del escenario arriba, público abajo.',
         visibleIf: () => true
       },

       // ACCOMPANYING PERSONS
       {
         id: 'accompanying', type: 'accompanying', label: '¿Quiénes te acompañan?',
         sublabel: 'Los campos marcados con * son obligatorios. Podés agregar personas que te acompañen para habilitar su ingreso.',
         visibleIf: (d) => d.category === 'musica' || d.category === 'danza',
       },

       // REVIEW + DECLARATIONS
      {
        id: 'declarations', type: 'declarations', label: 'Revisá tu inscripción y aceptá las condiciones',
        visibleIf: () => true
      },
    ];

    this.questions.set(qs);

    // If index is out of bounds after rebuild, clamp it
    const vis = qs.filter(q => !q.visibleIf || q.visibleIf(d));
    if (this.currentIdx() >= vis.length) {
      this.currentIdx.set(Math.max(0, vis.length - 1));
    }
  }

  isValid(): boolean {
    const q = this.currentQ();
    if (!q) return false;
    if (q.validate) {
      const err = q.validate(this.data());
      if (err) return false;
    }
    if (q.type === 'text' || q.type === 'email' || q.type === 'tel' || q.type === 'number' || q.type === 'textarea' || q.type === 'select') {
      if (q.required && !(this.currentValue() || '').trim()) return false;
    }
    if (q.type === 'radio' || q.type === 'radio-cards') {
      if (q.required && !this.currentValue()) return false;
    }
    if (q.type === 'checklist') {
      if (q.required && !this.data().riderTecnico.sonido.backline.length) return false;
    }
    if (q.type === 'stage-plot') {
      if (q.required && !this.data().riderTecnico.stagePlotInstruments.length) return false;
    }
    if (q.type === 'file') {
      if (q.required && !this.getFileForQuestion(q.id)) return false;
    }
    if (q.type === 'declarations') {
      if (q.required && !this.allDeclarationsChecked()) return false;
    }
    return true;
  }

  allDeclarationsChecked(): boolean {
    const d = this.data();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((d.email || '').trim());
    const hasRequired = !!(d.firstName?.trim() && d.lastName?.trim() && emailValid && d.phone?.trim() && d.category && d.subcategory);
    return hasRequired && !!d.acceptRegulations && this.isEmailVerified();
  }

  onInput(value: string): void {
    this.fieldError.set('');
    this.syncDataFromInput(value);
  }

  private syncDataFromInput(value: string): void {
    const q = this.currentQ();
    if (!q) return;
    const d = this.data();

    switch (q.id) {
      case 'firstName': {
        this.firstNameValue.set(value);
        d.firstName = value.trim();
        break;
      }
      case 'lastName': {
        this.lastNameValue.set(value);
        d.lastName = value.trim();
        break;
      }
      case 'dni': d.dni = value; break;
      case 'address': d.address = value; break;
      case 'province': d.province = value; d.locality = ''; this.rebuildQuestions(); break;
      case 'locality': d.locality = value; break;
      case 'phone': d.phone = value; break;
      case 'email': d.email = value; break;
      case 'proposalName': d.proposalName = value; break;
      case 'choreographerName': d.choreographerName = value; break;
      case 'style': d.style = value; break;
      case 'biography': d.biography = value; break;
      case 'workTitle': d.workTitle = value; break;
      case 'assistantsCount': d.assistantsCount = parseInt(value) || 0; break;
      case 'danceList': d.danceList = value; break;
      case 'equipmentDesc': d.equipmentDesc = value; break;
      case 'danceRonda1': if (d.danceThemes[0]) d.danceThemes[0].title = value; break;
      case 'danceSong1': if (d.danceThemes[0]) d.danceThemes[0].song = value; break;
      case 'danceRonda2': if (d.danceThemes[1]) d.danceThemes[1].title = value; break;
      case 'danceSong2': if (d.danceThemes[1]) d.danceThemes[1].song = value; break;
      case 'danceRonda3': if (d.danceThemes[2]) d.danceThemes[2].title = value; break;
       case 'danceSong3': if (d.danceThemes[2]) d.danceThemes[2].song = value; break;
       case 'presentation': d.presentation = value; break;
       case 'artisticName': d.artisticName = value; break;
       case 'songsList': d.songsList = value; break;
     }
  }

  onRadioSelect(value: string): void {
    const q = this.currentQ();
    if (!q) return;
    this.currentValue.set(value);

    const d = this.data();
    switch (q.id) {
      case 'category': d.category = value; d.subcategory = ''; this.rebuildQuestions(); break;
      case 'sub_musica':
      case 'sub_danza': d.subcategory = value; this.rebuildQuestions(); break;
      case 'instrumentType': d.instrumentType = value; d.instrumentName = ''; this.rebuildQuestions(); break;
      case 'instrumentName': d.instrumentName = value; this.rebuildQuestions(); break;
      case 'hasAccompaniment': d.hasAccompaniment = value === 'true'; break;
      case 'danceStyle': d.danceStyle = value; break;
    }
  }

  onCheckboxToggle(): void {
    this.currentValue.set(this.currentValue() === 'true' ? '' : 'true');
  }

  toggleDecl(field: string): void {
    (this.data() as any)[field] = !(this.data() as any)[field];
    if (field === 'acceptRegulations' && (this.data() as any)[field]) {
      setTimeout(() => {
        this.otpSectionRef?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  isEquipmentChecked(value: string): boolean {
    return this.data().riderTecnico.sonido.backline.includes(value);
  }

  toggleEquipment(value: string): void {
    const bl = this.data().riderTecnico.sonido.backline;
    const idx = bl.indexOf(value);
    if (idx >= 0) {
      bl.splice(idx, 1);
    } else {
      bl.push(value);
    }
  }

  onStagePlotChange(instruments: Instrument[]): void {
    this.stagePlotInstruments.set([...instruments]);
    this.data().riderTecnico.stagePlotInstruments = instruments;
  }

  getInstrumentColor(type: string): string {
    if (type.includes('guitar') || type.includes('charango') || type.includes('violin') || type.includes('contrabajo') || type.includes('guitarron')) return '#4c8be6';
    if (type.includes('quena') || type.includes('siku') || type.includes('sicus') || type.includes('flauta') || type.includes('erke')) return '#10b981';
    if (type.includes('piano') || type.includes('acordeon') || type.includes('bandoneon')) return '#8b5cf6';
    if (type.includes('bombo') || type.includes('caja') || type.includes('percusion')) return '#f59e0b';
    return '#64748b';
  }

  getInstrumentAbbr(type: string): string {
    const map: Record<string, string> = {
      'guitarra-criolla': 'GCR', 'guitarron': 'GUE', 'charango': 'CHA', 'violin': 'VIO', 'violonchelo': 'VCO', 'contrabajo': 'CBA',
      'quena': 'QUE', 'siku': 'SIK', 'sicus': 'SIC', 'flauta-traversa': 'FLT', 'erke': 'ERK',
      'piano': 'PIA', 'acordeon': 'ACO', 'bandoneon': 'BAN',
      'bombo-leguero': 'BOM', 'caja-chayera': 'CAJ', 'percusion-menor': 'PER',
      'microfono-alt': 'MIC', 'monitor-alt': 'MON', 'amplificador-alt': 'AMP', 'energia-alt': 'ENE', 'musico-alt': 'MUS', 'bailarin-alt': 'BAI',
    };
    return map[type] || type.substring(0, 3).toUpperCase();
  }

  getInstrumentLabel(type: string): string {
    const map: Record<string, string> = {
      'guitarra-criolla': 'Guitarra', 'guitarron': 'Guitarrón', 'charango': 'Charango', 'violin': 'Violín', 'violonchelo': 'Vchelo', 'contrabajo': 'C.abajo',
      'quena': 'Quena', 'siku': 'Siku', 'sicus': 'Sicus', 'flauta-traversa': 'Flauta', 'erke': 'Erke',
      'piano': 'Piano', 'acordeon': 'Acordeón', 'bandoneon': 'Bandoneón',
      'bombo-leguero': 'Bombo', 'caja-chayera': 'Caja', 'percusion-menor': 'Percusión',
      'microfono-alt': 'Micrófono', 'monitor-alt': 'Monitor', 'amplificador-alt': 'Amplif.', 'energia-alt': 'Energía', 'musico-alt': 'Músico', 'bailarin-alt': 'Bailarín',
    };
    return map[type] || type;
  }

  onAddAccompanying(): void {
    this.data().accompanyingPersons.push({ fullName: '', dni: '' });
  }

  onRemoveAccompanying(index: number): void {
    this.data().accompanyingPersons.splice(index, 1);
  }

  onAccompanyingNameInput(index: number, value: string): void {
    this.data().accompanyingPersons[index].fullName = value;
  }

  onAccompanyingDniInput(index: number, value: string): void {
    this.data().accompanyingPersons[index].dni = value;
  }

  onFileSelect(event: Event, questionId: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.setFileForQuestion(questionId, input.files[0]);
    }
  }

  onFileDrop(event: DragEvent, questionId: string): void {
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.setFileForQuestion(questionId, event.dataTransfer.files[0]);
    }
  }

  private setFileForQuestion(qId: string, file: File): void {
    const d = this.data();
    switch (qId) {
      case 'dniFrontFile': d.dniFrontFile = file; d.dniFrontName = file.name; break;
      case 'dniBackFile': d.dniBackFile = file; d.dniBackName = file.name; break;
      case 'promoPhotoFile': d.promoPhotoFile = file; d.promoPhotoName = file.name; break;
      case 'lyricsFile': d.lyricsFile = file; d.lyricsFileName = file.name; break;
      case 'scoreFile': d.scoreFile = file; d.scoreFileName = file.name; break;
      case 'danceMp3': d.danceMp3File = file; d.danceMp3FileName = file.name; break;
    }
    this._fileVersion.update(v => v + 1);
  }

  getFileForQuestion(qId: string): string {
    const d = this.data();
    switch (qId) {
      case 'dniFrontFile': return d.dniFrontName;
      case 'dniBackFile': return d.dniBackName;
      case 'promoPhotoFile': return d.promoPhotoName;
      case 'lyricsFile': return d.lyricsFileName;
      case 'scoreFile': return d.scoreFileName;
      case 'danceMp3': return d.danceMp3FileName;
      default: return '';
    }
  }

  removeFileForQuestion(qId: string): void {
    const d = this.data();
    switch (qId) {
      case 'dniFrontFile': d.dniFrontFile = null; d.dniFrontName = ''; break;
      case 'dniBackFile': d.dniBackFile = null; d.dniBackName = ''; break;
      case 'promoPhotoFile': d.promoPhotoFile = null; d.promoPhotoName = ''; break;
      case 'lyricsFile': d.lyricsFile = null; d.lyricsFileName = ''; break;
      case 'scoreFile': d.scoreFile = null; d.scoreFileName = ''; break;
      case 'danceMp3': d.danceMp3File = null; d.danceMp3FileName = ''; break;
    }
    this._fileVersion.update(v => v + 1);
  }

  getSubcategoryName(): string {
    const d = this.data();
    const all = [...(subcategoriesByCategory['musica'] || []), ...(subcategoriesByCategory['danza'] || [])];
    return all.find(s => s.id === d.subcategory)?.name || d.subcategory;
  }

  hasTechnicalData(): boolean {
    const d = this.data();
    return !!(d.equipmentDesc?.trim() || d.stagePlotDesc?.trim() ||
      d.riderTecnico?.stagePlotInstruments?.length ||
      d.riderTecnico?.sonido?.microfonos?.length ||
      d.riderTecnico?.sonido?.backline?.length ||
      d.riderTecnico?.monitorCount ||
      d.riderTecnico?.sonido?.diBoxes ||
      d.riderTecnico?.otros?.trim());
  }

  hasRiderData(): boolean {
    const r = this.data().riderTecnico;
    return !!(r?.sonido?.microfonos?.length || r?.sonido?.backline?.length ||
      r?.monitorCount || r?.sonido?.diBoxes || r?.otros?.trim());
  }

  getPeopleCount(): string {
    const d = this.data();
    const total = 1 + d.members.length + d.accompanyingPersons.length;
    return total + (total === 1 ? ' persona' : ' personas');
  }

  getDanzaInfoText(): string {
    const d = this.data();
    const sub = d.subcategory;
    if (['malambo_masculino', 'malambo_femenino'].includes(sub)) return 'Malambo solista. 4 músicos acompañantes y planta de sonido. Sin pistas pregrabadas.';
    if (sub === 'conjunto_malambo') return 'Conjunto de malambo: 4-8 bailarines. 4 músicos acompañantes.';
    if (sub === 'pareja_tradicional') return 'Pareja tradicional: 2 bailarines, 3 rondas con MP3, coreógrafo, 4 músicos, 2 asistentes.';
    if (sub === 'pareja_estilizada') return 'Pareja estilizada: 2 bailarines, 3 rondas con MP3, coreógrafo, 4 músicos.';
    if (sub === 'conjunto_baile') return 'Conjunto de baile: 8-40 integrantes, 2 obras con MP3.';
    return '';
  }

  onEnterKey(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.goNext();
  }

  goNext(): void {
    if (!this.isValid()) {
      const q = this.currentQ();
      if (q?.validate) {
        this.fieldError.set(q.validate(this.data()) || 'Este campo es obligatorio');
      } else {
        this.fieldError.set('Este campo es obligatorio');
      }
      return;
    }
    if (this.isLastQuestion()) return;

    this.animating.set(true);
    setTimeout(() => {
      this.currentIdx.set(this.currentIdx() + 1);
      this.loadValueForCurrentQuestion();
      this.animating.set(false);
    }, 50);
  }

  onGoBack(): void {
    if (this.currentIdx() > 0) {
      this.animating.set(true);
      setTimeout(() => {
        this.currentIdx.set(this.currentIdx() - 1);
        this.loadValueForCurrentQuestion();
        this.animating.set(false);
      }, 50);
    }
  }

  private loadValueForCurrentQuestion(): void {
    const q = this.currentQ();
    if (!q) return;
    const d = this.data();
    this.fieldError.set('');

    switch (q.id) {
      case 'firstName': this.currentValue.set(d.firstName); break;
      case 'lastName': this.currentValue.set(d.lastName); break;
      case 'dni': this.currentValue.set(d.dni); break;
      case 'address': this.currentValue.set(d.address); break;
      case 'province': this.currentValue.set(d.province); break;
      case 'locality': this.currentValue.set(d.locality); break;
      case 'phone': this.currentValue.set(d.phone); break;
      case 'email': this.currentValue.set(d.email); break;
      case 'category': this.currentValue.set(d.category); break;
      case 'sub_musica':
      case 'sub_danza': this.currentValue.set(d.subcategory); break;
      case 'instrumentType': this.currentValue.set(d.instrumentType); break;
      case 'instrumentName': this.currentValue.set(d.instrumentName); break;
      case 'hasAccompaniment': this.currentValue.set(d.hasAccompaniment ? 'true' : ''); break;
      case 'danceStyle': this.currentValue.set(d.danceStyle); break;
      case 'proposalName': this.currentValue.set(d.proposalName); break;
      case 'choreographerName': this.currentValue.set(d.choreographerName); break;
      case 'style': this.currentValue.set(d.style); break;
      case 'workTitle': this.currentValue.set(d.workTitle); break;
      case 'assistantsCount': this.currentValue.set(String(d.assistantsCount || '')); break;
      case 'biography': this.currentValue.set(d.biography); break;
      case 'danceList': this.currentValue.set(d.danceList); break;
      case 'equipmentDesc': this.currentValue.set(d.equipmentDesc); break;
      case 'danceRonda1': this.currentValue.set(d.danceThemes[0]?.title || ''); break;
      case 'danceSong1': this.currentValue.set(d.danceThemes[0]?.song || ''); break;
      case 'danceRonda2': this.currentValue.set(d.danceThemes[1]?.title || ''); break;
      case 'danceSong2': this.currentValue.set(d.danceThemes[1]?.song || ''); break;
      case 'danceRonda3': this.currentValue.set(d.danceThemes[2]?.title || ''); break;
      case 'danceSong3': this.currentValue.set(d.danceThemes[2]?.song || ''); break;
      case 'presentation': this.currentValue.set(d.presentation || ''); break;
      case 'artisticName': this.currentValue.set(d.artisticName || ''); break;
      case 'songsList': this.currentValue.set(d.songsList || ''); break;
      default: this.currentValue.set(''); break;
    }
  }

  private onKeydown(e: KeyboardEvent): void {
    if ((e.target as HTMLElement)?.closest('.tf-viewport')) {
      if (e.key === 'Enter' && !e.shiftKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== 'TEXTAREA') {
          e.preventDefault();
          this.goNext();
        }
      }
    }
  }

  private focusInput(): void {
    const el = this.tfInputRef?.nativeElement;
    if (el) {
      setTimeout(() => el.focus(), 100);
    }
  }

  sendVerification(): void {
    this.sendingCode.set(true);
    this.verificationError.set('');
    this.http.post(`${environment.apiUrl}/inscriptions/send-otp`, { email: this.data().email }).subscribe({
      next: () => {
        this.sendingCode.set(false);
        this.verificationSent.set(true);
      },
      error: (err) => {
        this.sendingCode.set(false);
        this.verificationError.set(err.error?.detail || 'Error al enviar el código. Intentá de nuevo.');
      }
    });
  }

  verifyCode(): void {
    if (!this.verificationCode().trim()) return;
    this.verifyingCode.set(true);
    this.verificationError.set('');
    this.http.post(`${environment.apiUrl}/inscriptions/verify-otp`, { email: this.data().email, code: this.verificationCode() }).subscribe({
      next: () => {
        this.verifyingCode.set(false);
        this.isEmailVerified.set(true);
      },
      error: (err) => {
        this.verifyingCode.set(false);
        this.verificationError.set(err.error?.detail || 'Código incorrecto. Verificá e intentá de nuevo.');
      }
    });
  }

  onSubmit(): void {
    if (!this.allDeclarationsChecked()) return;
    if (!this.isEmailVerified()) return;
    this.submitted.emit();
  }

  downloadConstancia(): void {
    const d = this.data();
    const catLabel = d.category === 'musica' ? 'Música' : 'Danza';
    const subcat = this.getSubcategoryName();
    const id = this.inscriptionId();
    const date = this.inscriptionCreatedAt() ? new Date(this.inscriptionCreatedAt()).toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR');

    const f = (label: string, value: string) =>
      `<div style="margin-bottom:6px"><span style="font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">${label}</span><br><span style="font-size:11px;color:#0f172a;font-weight:500">${value || '-'}</span></div>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Constancia ${id}</title>
    <style>@media print{body{margin:0}}</style></head><body>
    <div style="max-width:600px;margin:0 auto;padding:32px;font-family:Inter,-apple-system,sans-serif">
      <div style="background:linear-gradient(135deg,#1e3a8a,#4c8be6);height:6px;border-radius:6px 6px 0 0"></div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;padding:32px">
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-size:18px;font-weight:800;color:#0f172a">Festival Precosquín 2027</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px">Puerto Pirámides, Chubut</div>
        </div>
        <div style="text-align:center;margin-bottom:20px">
          <div style="font-size:14px;font-weight:700;color:#1e3a8a">Constancia de Inscripción</div>
          <div style="font-size:10px;color:#64748b;margin-top:4px">Fecha: ${date}</div>
        </div>
        <div style="background:#f1f5f9;border-radius:8px;padding:12px 16px;margin-bottom:20px;text-align:center">
          <div style="font-size:9px;color:#64748b;text-transform:uppercase">N° de Inscripción</div>
          <div style="font-size:14px;font-weight:700;color:#2563eb;font-family:'Courier New',monospace;margin-top:2px">${id}</div>
        </div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">
        <div style="font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">Datos Personales</div>
        ${f('Nombre Completo', `${d.firstName} ${d.lastName}`)}
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
          ${f('DNI', d.dni)}${f('Nacimiento', d.birthDate)}${f('Edad', d.age ? d.age + ' años' : '-')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
          ${f('Domicilio', d.address)}${f('Localidad', d.locality)}${f('Provincia', d.province)}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${f('Teléfono', d.phone)}${f('Email', d.email)}
        </div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">
        <div style="font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">Participación</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${f('Categoría', catLabel)}${f('Subcategoría', subcat)}
        </div>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-top:20px">
          <div style="font-size:10px;color:#92400e">Conservá esta constancia como comprobante. Tu inscripción será revisada por el jurado. Recibirás un email con los próximos pasos.</div>
        </div>
      </div>
    </div></body></html>`;

    const win = window.open('', '_blank', 'width=700,height=900');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  }
}
