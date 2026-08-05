import { Component, signal, computed, inject, OnDestroy, OnInit, HostListener, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { environment } from '../../../../environments/environment';
import { InscripcionConstanciaComponent } from './components/constancia.component';
import { InscripcionStep1Component } from './components/step-1.component';
import { InscripcionStep2Component } from './components/step-2.component';
import { InscripcionStep3Component } from './components/step-3.component';
import { InscripcionStep4Component } from './components/step-4.component';
import { InscripcionStep5Component } from './components/step-5.component';
import { InscripcionStep6Component } from './components/step-6.component';
import { InscripcionStep7Component } from './components/step-7.component';
import { InscripcionStepAccessosComponent } from './components/step-accessos.component';
import { StagePlotComponent } from './components/stage-plot/stage-plot.component';
import { OtpVerifyComponent } from './components/otp-verify.component';
import { CircularProgressComponent } from '../../../shared/components/circular-progress/circular-progress.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { TypeformFlowComponent } from './components/typeform-flow.component';
import { createEmptyInscripcionData } from './utils/inscripcion-defaults';

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export interface InscripcionResult {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  stage_name: string | null;
  category: string;
  subcategory: string;
  status: string;
  created_at: string;
  qr_code_base64?: string;
}

export interface Member {
  fullName: string;
  dni: string;
  age: number | null;
  role: string;
}

export interface ThemeRow {
  title: string;
  rhythm: string;
  author: string;
}

export interface DanceTheme {
  title: string;
  song: string;
}

export interface BandMember {
  fullName: string;
  instrument: string;
}

export interface InputChannel {
  source: string;
  micType: string;
  fxInsert: string;
  monitorMix: string;
  phantom: boolean;
}

export interface MonitorMix {
  label: string;
  items: string[];
}

export interface Instrument {
  id: string;
  type: string;
  x: number;
  y: number;
  label: string;
  channel: string;
  rotation: number;
  centered?: boolean;
}

interface RiderTecnico {
  sonido: {
    microfonos: string[];
    diBoxes: number | null;
    cables: string[];
    backline: string[];
  };
  inputList: InputChannel[];
  monitorCount: number;
  monitorMixes: MonitorMix[];
  stagePlotInstruments: Instrument[];
  otros: string;
}

export interface AccompanyingPerson {
  fullName: string;
  dni: string;
}

export interface InscripcionData {
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  age: number | null;
  address: string;
  locality: string;
  province: string;
  phone: string;
  email: string;
  category: string;
  subcategory: string;
  members: Member[];
  artisticName: string;
  stageName: string;
  themes: ThemeRow[];
  riderTecnico: RiderTecnico;
  equipmentDesc: string;
  stagePlotDesc: string;
  proposalName: string;
  choreographerName: string;
  style: string;
  danceList: string;
  biography: string;
  dniFrontFile: File | null;
  dniBackFile: File | null;
  promoPhotoFile: File | null;
  lyricsFile: File | null;
  scoreFile: File | null;
  dniFrontName: string;
  dniBackName: string;
  promoPhotoName: string;
  lyricsFileName: string;
  scoreFileName: string;
  acceptRegulations: boolean;
  acceptImageRights: boolean;
  acceptDataTruth: boolean;
  acceptNoPriorWin: boolean;
  acceptNotJurorOrg: boolean;
  // Solista Instrumental - Art. 31
  instrumentType: string;
  instrumentName: string;
  hasAccompaniment: boolean;
  accompanimentInstrument: string;
  accompanimentMusician: string;
  // Solista Instrumental - Rules (Art. 31)
  acceptPurelyInstrumental: boolean;
  acceptOneInstrument: boolean;
  acceptNoPrerecorded: boolean;
  acceptNoInstrumentChange: boolean;
  // Presentation
  presentation: string;
  songsList: string;
  technicalNeeds: string;
  // Danza
  danceStyle: string;
  danceThemes: DanceTheme[];
  danceMp3File: File | null;
  danceMp3FileName: string;
  workTitle: string;
  assistantsCount: number;
  bandMembers: BandMember[];
  // Personas que acompañan al artista (acceso a Puerto Pirámides)
  accompanyingPersons: AccompanyingPerson[];
}

// Art. 31 - Instrumentos Melódicos (pueden tener 1 acompañamiento armónico)
export const MELODIC_INSTRUMENTS = [
  'Violín', 'Flauta Traversa', 'Clarinete', 'Saxofón',
  'Trompeta', 'Quena', 'Erke', 'Siku', 'Otro'
];

// Art. 31 - Instrumentos Armónicos
export const HARMONIC_INSTRUMENTS = [
  'Guitarra', 'Piano', 'Bandoneón', 'Acordeón',
  'Charango', 'Arpa', 'Otro'
];

export const subcategoriesByCategory: Record<string, { id: string; name: string }[]> = {
  musica: [
    { id: 'solista_vocal', name: 'Solista Vocal' },
    { id: 'duo_vocal', name: 'Dúo Vocal' },
    { id: 'expresion_oral_folclorica', name: 'Expresión Oral Folclórica' },
    { id: 'conjunto_vocal', name: 'Conjunto Vocal' },
    { id: 'solista_instrumental', name: 'Solista Instrumental' },
    { id: 'conjunto_instrumental', name: 'Conjunto Instrumental' },
    { id: 'cancion_inedita', name: 'Canción Inédita' },
  ],
  danza: [
    { id: 'malambo_masculino', name: 'Solista de Malambo Masculino' },
    { id: 'malambo_femenino', name: 'Solista de Malambo Femenino' },
    { id: 'conjunto_malambo', name: 'Conjunto de Malambo' },
    { id: 'pareja_tradicional', name: 'Pareja de Baile Tradicional' },
    { id: 'pareja_estilizada', name: 'Pareja de Baile Estilizada' },
    { id: 'conjunto_baile', name: 'Conjunto de Baile Folklórico' },
  ],
};

export const groupSubcategories = [
  'duo_vocal', 'conjunto_vocal', 'conjunto_instrumental',
  'conjunto_malambo', 'pareja_tradicional', 'pareja_estilizada', 'conjunto_baile',
];

@Component({
  selector: 'app-inscripcion',
  standalone: true,
imports: [CommonModule, FormsModule, RouterLink, 
InscripcionConstanciaComponent, InscripcionStep1Component, InscripcionStep2Component, InscripcionStep3Component, 
InscripcionStep4Component, InscripcionStep5Component, InscripcionStep6Component, InscripcionStep7Component, 
InscripcionStepAccessosComponent, StagePlotComponent, OtpVerifyComponent, CircularProgressComponent, TypeformFlowComponent],
  styleUrl: './inscripcion.page.scss',
  animations: [
    trigger('stepSlide', [
      transition(':increment', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('280ms cubic-bezier(0.25, 0.1, 0.25, 1)', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':decrement', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('280ms cubic-bezier(0.25, 0.1, 0.25, 1)', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
  template: `
    <div class="public-page form-layout" [class.form-layout--typeform]="typeformMode()">
       @if (!otpVerified()) {
        <!-- STEP 0: CHOICE + EMAIL CHECK + OTP -->
        <div class="form-main-content">
          <div class="w-full max-w-4xl mx-auto px-4 py-8">
            <div class="form-card animate-scale-in">
              <div class="form-header">
                <a routerLink="/" class="back-home-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Inicio
                </a>
                <span class="question-counter">INSCRIPCIÓN</span>
                <h1>Festival Precosquín 2027</h1>
              </div>

              @if (emailAlreadyRegistered()) {
                @if (!otpVerified()) {
                  <!-- EMAIL FOUND → OTP VERIFICATION (auto-send code) -->
                  <app-otp-verify
                    [email]="data.email"
                    [autoSend]="true"
                    (verified)="otpVerified.set(true)" />
                }
              } @else if (!otpCodeSent()) {
<!-- STEP 0a: CHOOSE + ENTER EMAIL -->
                  <div class="tf-welcome">
                    <div class="tf-welcome-content">
                      @if (!registrationChoice()) {
                        <!-- TWO CHOICES -->
                        <span class="tf-welcome-badge" style="background:rgba(37,99,235,0.12);color:#60a5fa;border-color:rgba(37,99,235,0.2)">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                        </span>
                        <h1 class="tf-welcome-title">¿Qué querés hacer?</h1>
                        <p class="tf-welcome-sub">Elegí una opción para continuar</p>
                        <div class="tf-welcome-options" style="margin-top:28px">
                          <button type="button" class="tf-welcome-opt" (click)="startRegistration()">
                            <span class="tf-welcome-opt-num" style="background:linear-gradient(135deg,#eff6ff,#dbeafe);color:#2563eb">1</span>
                            <div class="tf-welcome-opt-body">
                              <span class="tf-welcome-opt-title">Quiero inscribirme</span>
                              <span class="tf-welcome-opt-desc">Nueva inscripción</span>
                            </div>
                            <svg class="tf-welcome-opt-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                          <button type="button" class="tf-welcome-opt" (click)="registrationChoice.set('existing')">
                            <span class="tf-welcome-opt-num" style="background:linear-gradient(135deg,#faf5ff,#e9d5ff);color:#9333ea">2</span>
                            <div class="tf-welcome-opt-body">
                              <span class="tf-welcome-opt-title">Ya estoy registrado</span>
                              <span class="tf-welcome-opt-desc">Consultar mi inscripción</span>
                            </div>
                            <svg class="tf-welcome-opt-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                        </div>
                      } @else if (registrationChoice() === 'existing') {
                        <!-- CHECK STATUS -->
                        <span class="tf-welcome-badge" style="background:rgba(37,99,235,0.12);color:#60a5fa;border-color:rgba(37,99,235,0.2)">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </span>
                        <h1 class="tf-welcome-title">Consultá tu inscripción</h1>
                        <p class="tf-welcome-sub">Ingresá el email con el que te inscribiste</p>
                        @if (otpError()) {
                          <div class="tf-welcome-options" style="margin-top:24px">
                            <div class="tf-welcome-opt" style="border-color:rgba(239,68,68,0.2);background:rgba(239,68,68,0.04)">
                              <span class="tf-welcome-opt-num tf-welcome-opt-num--danger">!</span>
                              <div class="tf-welcome-opt-body">
                                <span class="tf-welcome-opt-title" style="color:#f87171">{{ otpError() }}</span>
                              </div>
                            </div>
                            <div class="tf-welcome-options" style="flex-direction:row;gap:12px;margin-top:16px">
                              <button type="button" class="tf-welcome-opt" style="flex:1" (click)="registrationChoice.set(null)">
                                <span class="tf-welcome-opt-num" style="background:rgba(100,116,139,0.12);color:#64748b"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg></span>
                                <div class="tf-welcome-opt-body"><span class="tf-welcome-opt-title">Volver</span></div>
                              </button>
                              <button type="button" class="tf-welcome-opt tf-welcome-opt--primary" style="flex:1" (click)="registrationChoice.set(null); startRegistration()">
                                <span class="tf-welcome-opt-num" style="background:rgba(37,99,235,0.12);color:#2563eb">1</span>
                                <div class="tf-welcome-opt-body"><span class="tf-welcome-opt-title">Quiero inscribirme</span></div>
                              </button>
                            </div>
                          </div>
                        } @else {
                          <div class="tf-welcome-options" style="margin-top:24px">
                            <label class="modify-field" style="width:100%">
                              <input type="email" class="otp-field" placeholder="tu@email.com" [value]="data.email" (input)="data.email = $any($event.target).value" (keydown.enter)="checkEmailStatus()" style="font-size:1rem;letter-spacing:normal;font-family:inherit" />
                            </label>
                            <button type="button" class="tf-welcome-opt tf-welcome-opt--primary" style="width:100%;margin-top:12px" (click)="checkEmailStatus()" [disabled]="!data.email || checkingEmail()">
                              <span class="tf-welcome-opt-num" style="background:rgba(37,99,235,0.12);color:#2563eb">1</span>
                              <div class="tf-welcome-opt-body">
                                @if (checkingEmail()) { <span class="spinner"></span> Buscando... } @else { <span class="tf-welcome-opt-title">Consultar</span> }
                              </div>
                            </button>
                            <button type="button" class="tf-welcome-reset" (click)="registrationChoice.set(null)" style="margin-top:12px">← Volver</button>
                          </div>
                        }
                      }
                    </div>
                  </div>
              } @else {
                <!-- STEP 0b: ENTER OTP CODE -->
                <app-otp-verify
                  [email]="data.email"
                  (verified)="otpVerified.set(true)" />
              }
            </div>
          </div>
        </div>
      } @else if (emailAlreadyRegistered()) {
        <!-- OTP VERIFIED + EMAIL REGISTERED → WELCOME SCREEN (TYPEFORM STYLE) -->
        @if (!welcomeAction()) {
          <div class="tf-welcome">
            <div class="tf-welcome-content">
              <span class="tf-welcome-badge">✓</span>
              <h1 class="tf-welcome-title">Hola {{ getFirstName() }}</h1>
              <p class="tf-welcome-sub">Encontramos tu inscripción.</p>

              <div class="tf-welcome-status">
                <div class="tf-welcome-status-dot" [attr.data-status]="registeredData()?.status"></div>
                <span>{{ getStatusLabel(registeredData()?.status || '') }}</span>
              </div>

              <p class="tf-welcome-question">¿Qué querés hacer?</p>

              <div class="tf-welcome-options">
                <button type="button" class="tf-welcome-opt" (click)="welcomeAction.set('modify')">
                  <span class="tf-welcome-opt-num">1</span>
                  <div class="tf-welcome-opt-body">
                    <span class="tf-welcome-opt-title">Modificar inscripción</span>
                    <span class="tf-welcome-opt-desc">Editá los datos de tu inscripción</span>
                  </div>
                  <svg class="tf-welcome-opt-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>

                <button type="button" class="tf-welcome-opt" (click)="welcomeAction.set('download')">
                  <span class="tf-welcome-opt-num">2</span>
                  <div class="tf-welcome-opt-body">
                    <span class="tf-welcome-opt-title">Descargar comprobante</span>
                    <span class="tf-welcome-opt-desc">Obtené el PDF de tu inscripción</span>
                  </div>
                  <svg class="tf-welcome-opt-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>

                <button type="button" class="tf-welcome-opt tf-welcome-opt--danger" (click)="welcomeAction.set('cancel')">
                  <span class="tf-welcome-opt-num tf-welcome-opt-num--danger">3</span>
                  <div class="tf-welcome-opt-body">
                    <span class="tf-welcome-opt-title">Cancelar inscripción</span>
                    <span class="tf-welcome-opt-desc">Eliminá tu inscripción de forma permanente</span>
                  </div>
                  <svg class="tf-welcome-opt-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              <button type="button" class="tf-welcome-reset" (click)="resetEmailCheck()">
                ← Consultar otro email
              </button>
            </div>
          </div>
        } @else if (welcomeAction() === 'modify') {
          @if (!isModifying()) {
            <div class="tf-welcome">
              <div class="tf-welcome-content">
                @if (loadingModify()) {
                  <div class="otp-sending" style="color:#94a3b8"><span class="spinner spinner--lg"></span><span>Cargando tu inscripción...</span></div>
                } @else if (modifyError()) {
                  <div class="otp-error" style="max-width:360px;margin:0 auto 16px">{{ modifyError() }}</div>
                  <button type="button" class="tf-welcome-reset" (click)="welcomeAction.set(null)">← Volver</button>
                } @else {
                  <span class="tf-welcome-badge" style="background:rgba(76,139,230,0.12);color:#4c8be6;border-color:rgba(76,139,230,0.2)">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </span>
                  <h1 class="tf-welcome-title">Modificar inscripción</h1>
                  <p class="tf-welcome-sub">Hacé click en la sección que querés editar.</p>
                  <p class="tf-welcome-sub" style="font-size:0.8rem;color:#475569;margin-top:4px">Los archivos (DNI, foto, etc.) no se pueden modificar desde acá.</p>
                  <div class="tf-welcome-options" style="margin-top:28px">
                    <button type="button" class="tf-welcome-opt" (click)="startModify()">
                      <span class="tf-welcome-opt-num">→</span>
                      <div class="tf-welcome-opt-body">
                        <span class="tf-welcome-opt-title">Cargar y editar mi inscripción</span>
                        <span class="tf-welcome-opt-desc">Ver resumen con datos actuales</span>
                      </div>
                      <svg class="tf-welcome-opt-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                  <button type="button" class="tf-welcome-reset" (click)="welcomeAction.set(null)">← Volver</button>
                }
              </div>
            </div>
          } @else if (!modifySection()) {
            <!-- SUMMARY VIEW -->
            <div class="modify-summary">
              <div class="modify-header">
                <button type="button" class="modify-back-btn" (click)="cancelModify(); welcomeAction.set(null)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                  <span>Volver</span>
                </button>
                <span class="question-counter">TU INSCRIPCIÓN</span>
                <h1>Datos de tu inscripción</h1>
                <p class="modify-hint">Hacé click en una sección para editarla</p>
              </div>

              <button type="button" class="modify-section" (click)="modifySection.set('personal')">
                <div class="modify-section-header">
                  <div class="modify-section-icon" style="background:linear-gradient(135deg,#eff6ff,#dbeafe);color:#2563eb">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <span class="modify-section-title">Datos Personales</span>
                  <svg class="modify-section-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                <div class="modify-section-preview">
                  {{ modifyRawData()?.full_name }} · DNI {{ modifyRawData()?.dni || '-' }} · {{ modifyRawData()?.email }}
                </div>
              </button>

              <button type="button" class="modify-section" (click)="modifySection.set('category')">
                <div class="modify-section-header">
                  <div class="modify-section-icon" style="background:linear-gradient(135deg,#faf5ff,#e9d5ff);color:#9333ea">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  </div>
                  <span class="modify-section-title">Categoría y Subcategoría</span>
                  <svg class="modify-section-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                <div class="modify-section-preview">
                  {{ modifyRawData()?.category === 'musica' ? 'Música' : 'Danza' }} › {{ getSubcategoryLabel(modifyRawData()?.subcategory || '') }}
                </div>
              </button>

              <button type="button" class="modify-section" (click)="modifySection.set('artistic')">
                <div class="modify-section-header">
                  <div class="modify-section-icon" style="background:linear-gradient(135deg,#fff7ed,#fed7aa);color:#ea580c">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <span class="modify-section-title">Información Artística</span>
                  <svg class="modify-section-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                <div class="modify-section-preview">
                  {{ modifyRawData()?.artistic_name || modifyRawData()?.proposal_name || modifyRawData()?.stage_name || 'Sin nombre artístico' }}
                </div>
              </button>

              @if (modifyRawData()?.themes?.length || modifyRawData()?.dance_themes?.length) {
                <button type="button" class="modify-section" (click)="modifySection.set('themes')">
                  <div class="modify-section-header">
                    <div class="modify-section-icon" style="background:linear-gradient(135deg,#fefce8,#fef08a);color:#ca8a04">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                    </div>
                    <span class="modify-section-title">{{ modifyRawData()?.category === 'danza' ? 'Temas y Coreografía' : 'Temas Musicales' }}</span>
                    <svg class="modify-section-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                  <div class="modify-section-preview">
                    @for (t of (modifyRawData()?.themes || modifyRawData()?.dance_themes || []); track $index) {
                      {{ t.title || t.song }}{{ $last ? '' : ', ' }}
                    }
                  </div>
                </button>
              }

              @if (modifyRawData()?.members?.length) {
                <button type="button" class="modify-section" (click)="modifySection.set('members')">
                  <div class="modify-section-header">
                    <div class="modify-section-icon" style="background:linear-gradient(135deg,#f0fdf4,#bbf7d0);color:#16a34a">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <span class="modify-section-title">Integrantes</span>
                    <svg class="modify-section-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                  <div class="modify-section-preview">{{ modifyRawData()?.members?.length }} integrante(s)</div>
                </button>
              }

              <button type="button" class="modify-section" (click)="modifySection.set('technical')">
                <div class="modify-section-header">
                  <div class="modify-section-icon" style="background:linear-gradient(135deg,#f8fafc,#e2e8f0);color:#475569">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></svg>
                  </div>
                  <span class="modify-section-title">Equipo Técnico</span>
                  <svg class="modify-section-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                <div class="modify-section-preview">{{ modifyRawData()?.technical_needs || 'Sin requerimientos' }}</div>
              </button>

              <button type="button" class="modify-section" (click)="modifySection.set('contact')">
                <div class="modify-section-header">
                  <div class="modify-section-icon" style="background:linear-gradient(135deg,#ecfdf5,#a7f3d0);color:#059669">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <span class="modify-section-title">Contacto</span>
                  <svg class="modify-section-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                <div class="modify-section-preview">{{ modifyRawData()?.phone || '-' }} · {{ modifyRawData()?.email }}</div>
              </button>

              @if (error()) { <div class="otp-error" style="margin:12px auto;max-width:480px">{{ error() }}</div> }
            </div>
          } @else {
            <!-- EDIT SECTION FORM -->
            <div class="modify-edit">
              <div class="modify-header">
                <button type="button" class="modify-back-btn" (click)="modifySection.set(null)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                  <span>Volver al resumen</span>
                </button>
                <span class="question-counter">EDITANDO</span>
                <h1>
                  @switch (modifySection()) {
                    @case ('personal') { Datos Personales }
                    @case ('category') { Categoría }
                    @case ('artistic') { Información Artística }
                    @case ('themes') { Temas }
                    @case ('members') { Integrantes }
                    @case ('technical') { Equipo Técnico }
                    @case ('contact') { Contacto }
                  }
                </h1>
              </div>

              <div class="modify-edit-fields">
                @if (modifySection() === 'personal') {
                  <label class="modify-field"><span class="modify-label">Nombre</span><input type="text" [value]="data.firstName" (input)="data.firstName = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal" /></label>
                  <label class="modify-field"><span class="modify-label">Apellido</span><input type="text" [value]="data.lastName" (input)="data.lastName = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal" /></label>
                  <label class="modify-field"><span class="modify-label">DNI</span><input type="text" [value]="data.dni" (input)="data.dni = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal" /></label>
                  <label class="modify-field"><span class="modify-label">Fecha de nacimiento</span><input type="date" [value]="data.birthDate" (input)="data.birthDate = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal" /></label>
                  <label class="modify-field"><span class="modify-label">Dirección</span><input type="text" [value]="data.address" (input)="data.address = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal" /></label>
                  <label class="modify-field"><span class="modify-label">Localidad</span><input type="text" [value]="data.locality" (input)="data.locality = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal" /></label>
                  <label class="modify-field"><span class="modify-label">Provincia</span><input type="text" [value]="data.province" (input)="data.province = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal" /></label>
                } @else if (modifySection() === 'category') {
                  <label class="modify-field"><span class="modify-label">Subcategoría</span>
                    <select [value]="data.subcategory" (change)="data.subcategory = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal">
                      <option value="">Seleccionar...</option>
                      @for (sub of (data.category === 'musica' ? subcategoriesByCategory['musica'] : subcategoriesByCategory['danza']); track sub.id) {
                        <option [value]="sub.id">{{ sub.name }}</option>
                      }
                    </select>
                  </label>
                } @else if (modifySection() === 'artistic') {
                  <label class="modify-field"><span class="modify-label">Nombre artístico</span><input type="text" [value]="data.artisticName" (input)="data.artisticName = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal" /></label>
                  <label class="modify-field"><span class="modify-label">Nombre de propuesta</span><input type="text" [value]="data.proposalName" (input)="data.proposalName = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal" /></label>
                  <label class="modify-field"><span class="modify-label">Biografía</span><textarea [value]="data.biography" (input)="data.biography = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal;min-height:80px;resize:vertical" rows="4"></textarea></label>
                } @else if (modifySection() === 'themes') {
                  @if (data.category === 'musica') {
                    <div class="modify-themes-header">
                      <span class="modify-themes-count">{{ data.themes.length }} tema(s) cargado(s)</span>
                      <span class="modify-themes-limit">Máximo 10</span>
                    </div>
                    @for (theme of data.themes; track $index; let i = $index) {
                      <div class="modify-theme-card">
                        <div class="modify-theme-card-header">
                          <span class="modify-theme-badge">{{ i + 1 }}</span>
                          <span class="modify-theme-card-title">Tema {{ i + 1 }}</span>
                          @if (data.themes.length > 1) {
                            <button type="button" class="modify-theme-remove" (click)="removeTheme(i)" title="Quitar tema">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          }
                        </div>
                        <div class="modify-theme-fields">
                          <div class="modify-theme-field">
                            <label class="modify-theme-field-label">Nombre del tema</label>
                            <input type="text" [value]="theme.title" (input)="theme.title = $any($event.target).value" placeholder="Ej: Luna de los Quenes" class="modify-theme-input" />
                          </div>
                          <div class="modify-theme-row">
                            <div class="modify-theme-field">
                              <label class="modify-theme-field-label">Ritmo / Estilo</label>
                              <input type="text" [value]="theme.rhythm" (input)="theme.rhythm = $any($event.target).value" placeholder="Ej: Chacarera" class="modify-theme-input" />
                            </div>
                            <div class="modify-theme-field">
                              <label class="modify-theme-field-label">Autor / Compositor</label>
                              <input type="text" [value]="theme.author" (input)="theme.author = $any($event.target).value" placeholder="Ej: Los Hermanos Ábalos" class="modify-theme-input" />
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                    @if (data.themes.length < 10) {
                      <button type="button" class="modify-theme-add-btn" (click)="addTheme()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Agregar tema
                      </button>
                    }
                  } @else {
                    @for (dt of data.danceThemes; track $index; let i = $index) {
                      <div class="modify-theme-card">
                        <div class="modify-theme-card-header">
                          <span class="modify-theme-badge modify-theme-badge--dance">{{ i + 1 }}</span>
                          <span class="modify-theme-card-title">Ronda {{ i + 1 }}</span>
                          @if (data.danceThemes.length > 1) {
                            <button type="button" class="modify-theme-remove" (click)="removeDanceTheme(i)" title="Quitar ronda">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          }
                        </div>
                        <div class="modify-theme-fields">
                          <div class="modify-theme-field">
                            <label class="modify-theme-field-label">Nombre de la danza</label>
                            <input type="text" [value]="dt.title" (input)="dt.title = $any($event.target).value" placeholder="Ej: Chacarera" class="modify-theme-input" />
                          </div>
                          <div class="modify-theme-field">
                            <label class="modify-theme-field-label">Canción / Tema musical</label>
                            <input type="text" [value]="dt.song" (input)="dt.song = $any($event.target).value" placeholder="Ej: La López" class="modify-theme-input" />
                          </div>
                        </div>
                      </div>
                    }
                    @if (data.danceThemes.length < 3) {
                      <button type="button" class="modify-theme-add-btn" (click)="addDanceTheme()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Agregar ronda
                      </button>
                    }
                  }
                } @else if (modifySection() === 'members') {
                  @for (member of data.members; track $index; let i = $index) {
                    <div class="modify-theme-card">
                      <span class="modify-label">Integrante {{ i + 1 }}</span>
                      <input type="text" [value]="member.fullName" (input)="member.fullName = $any($event.target).value" placeholder="Nombre completo" class="otp-field" style="text-align:left;letter-spacing:normal" />
                      <input type="text" [value]="member.role" (input)="member.role = $any($event.target).value" placeholder="Rol" class="otp-field" style="text-align:left;letter-spacing:normal;margin-top:8px" />
                    </div>
                  }
                  <button type="button" class="otp-resend-btn" style="color:#2563eb;margin-top:8px" (click)="addMember()">+ Agregar integrante</button>
                } @else if (modifySection() === 'technical') {
                  <label class="modify-field"><span class="modify-label">Necesidades técnicas</span><textarea [value]="data.technicalNeeds" (input)="data.technicalNeeds = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal;min-height:80px;resize:vertical" rows="4" placeholder="Ej: Microfonos, monitores, backline..."></textarea></label>
                  @if (data.category === 'musica' && data.subcategory === 'solista_instrumental') {
                    <label class="modify-field"><span class="modify-label">Tipo de instrumento</span>
                      <select [value]="data.instrumentType" (change)="data.instrumentType = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal">
                        <option value="">Seleccionar...</option>
                        <option value="melodico">Melódico</option>
                        <option value="armonico">Armónico</option>
                      </select>
                    </label>
                    <label class="modify-field"><span class="modify-label">Nombre del instrumento</span><input type="text" [value]="data.instrumentName" (input)="data.instrumentName = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal" /></label>
                  }
                  <div class="modify-stage-plot-section">
                    <span class="modify-label">Stage Plot</span>
                    <p class="modify-note" style="margin:0 0 12px">Ubicá los instrumentos y equipo en el escenario.</p>
                    <app-stage-plot
                      [initialInstruments]="data.riderTecnico.stagePlotInstruments"
                      (instrumentsChange)="onStagePlotChange($event)">
                    </app-stage-plot>
                  </div>
                } @else if (modifySection() === 'contact') {
                  <label class="modify-field"><span class="modify-label">Teléfono</span><input type="tel" [value]="data.phone" (input)="data.phone = $any($event.target).value" class="otp-field" style="text-align:left;letter-spacing:normal" /></label>
                  <label class="modify-field"><span class="modify-label">Email</span><input type="email" [value]="data.email" disabled class="otp-field" style="text-align:left;letter-spacing:normal;opacity:0.6" /></label>
                  <p class="modify-note">El email no se puede modificar desde acá.</p>
                }
              </div>

              <div class="modify-edit-footer">
                <button type="button" class="modify-cancel-btn" (click)="modifySection.set(null)">Cancelar</button>
                <button type="button" class="modify-save-btn" (click)="saveSection()" [disabled]="savingSection()">
                  @if (savingSection()) { <span class="spinner"></span> Guardando... } @else { Guardar cambios }
                </button>
              </div>
              @if (error()) { <div class="otp-error" style="margin:12px auto;max-width:480px">{{ error() }}</div> }
            </div>
          }
        } @else if (welcomeAction() === 'download') {
          <div class="tf-welcome">
            <div class="tf-welcome-content">
              <span class="tf-welcome-badge" style="background:rgba(34,197,94,0.12);color:#4ade80;border-color:rgba(34,197,94,0.2)">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
              <h1 class="tf-welcome-title">Tu comprobante</h1>
              <p class="tf-welcome-sub">Descargá tu constancia o recibila por email.</p>
              <div class="tf-welcome-options" style="margin-top:28px">
                <button type="button" class="tf-welcome-opt" (click)="openConstancia()">
                  <span class="tf-welcome-opt-num">1</span>
                  <div class="tf-welcome-opt-body">
                    <span class="tf-welcome-opt-title">Descargar / Imprimir PDF</span>
                    <span class="tf-welcome-opt-desc">Se abre en una nueva pestaña</span>
                  </div>
                  <svg class="tf-welcome-opt-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <button type="button" class="tf-welcome-opt" (click)="resendConstanciaEmail()">
                  <span class="tf-welcome-opt-num">2</span>
                  <div class="tf-welcome-opt-body">
                    <span class="tf-welcome-opt-title">Enviar por correo</span>
                    <span class="tf-welcome-opt-desc">Recibí el comprobante en tu email</span>
                  </div>
                  <svg class="tf-welcome-opt-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
              <button type="button" class="tf-welcome-reset" (click)="welcomeAction.set(null)">← Volver</button>
            </div>
          </div>
        } @else if (welcomeAction() === 'cancel') {
          @if (!cancelConfirm()) {
            <div class="tf-welcome">
              <div class="tf-welcome-content">
                <span class="tf-welcome-badge" style="background:rgba(239,68,68,0.12);color:#f87171;border-color:rgba(239,68,68,0.2)">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </span>
                <h1 class="tf-welcome-title" style="color:#f87171">¿Estás seguro?</h1>
                <p class="tf-welcome-sub">Esta acción eliminará tu inscripción de forma permanente.</p>
                <p class="tf-welcome-sub" style="font-size:0.85rem;color:#64748b;margin-top:4px">Podrás volver a inscribirte realizando un nuevo registro.</p>
                <div class="tf-welcome-options" style="margin-top:28px">
                  <button type="button" class="tf-welcome-opt tf-welcome-opt--danger" (click)="cancelConfirm.set(true)">
                    <span class="tf-welcome-opt-num tf-welcome-opt-num--danger">✕</span>
                    <div class="tf-welcome-opt-body">
                      <span class="tf-welcome-opt-title">Eliminar inscripción</span>
                      <span class="tf-welcome-opt-desc">No se puede deshacer</span>
                    </div>
                  </button>
                </div>
                <button type="button" class="tf-welcome-reset" (click)="welcomeAction.set(null)">← Cancelar</button>
              </div>
            </div>
          } @else {
            <div class="tf-welcome">
              <div class="tf-welcome-content">
                @if (!cancelling()) {
                  <span class="tf-welcome-badge" style="background:rgba(239,68,68,0.12);color:#f87171;border-color:rgba(239,68,68,0.2)">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </span>
                  <h1 class="tf-welcome-title" style="color:#f87171">Última confirmación</h1>
                  <p class="tf-welcome-sub" style="max-width:360px">Se eliminará tu inscripción y recibirás un correo de confirmación.</p>
                  <div class="tf-welcome-options" style="margin-top:28px">
                    <button type="button" class="tf-welcome-opt tf-welcome-opt--danger" (click)="cancelInscription()">
                      <span class="tf-welcome-opt-num tf-welcome-opt-num--danger">✕</span>
                      <div class="tf-welcome-opt-body">
                        <span class="tf-welcome-opt-title">Sí, eliminar mi inscripción</span>
                        <span class="tf-welcome-opt-desc">No se puede deshacer</span>
                      </div>
                    </button>
                  </div>
                  <button type="button" class="tf-welcome-reset" (click)="cancelConfirm.set(false)">← No, volver</button>
                } @else {
                  <div class="otp-sending" style="color:#94a3b8"><span class="spinner spinner--lg"></span><span>Eliminando inscripción...</span></div>
                }
              </div>
            </div>
          }
        }
      } @else if (typeformMode()) {
        <!-- TYPEFORM MODE -->
        @defer (on idle) {
          <app-typeform-flow
            [data]="data"
            [isSubmitting]="submitting()"
            [submitSuccess]="submitted() && !!inscriptionResult()"
            [submitError]="error()"
            [inscriptionId]="inscriptionResult()?.id || ''"
            [inscriptionCreatedAt]="inscriptionResult()?.created_at || ''"
            (submitted)="onTypeformSubmit()"
            (exitTypeform)="otpVerified.set(false)" />
        } @loading (minimum 500ms) {
          <div style="padding: 40px; text-align: center; color: #64748b;">Cargando formulario...</div>
        }
      } @else {
        <!-- CLASSIC MODE or SUBMITTED -->
        @if (currentStep() < 8 && !submitted()) {
          <div class="form-sidebar">
            <nav class="form-nav-vertical">
              <a routerLink="/" class="nav-brand">
                <img src="assets/img/logoballena.webp" alt="Precosquin" class="nav-logo" loading="lazy" />
                <span>Precosquin</span>
              </a>
            </nav>

            <div class="sidebar-progress-section">
              <app-circular-progress
                [progress]="getProgressPercentage()"
                [currentStep]="currentStep()"
                [totalSteps]="steps.length">
              </app-circular-progress>
              <div class="mobile-step-name">
                <span class="step-label">{{ steps[currentStep() - 1].label }}</span>
                <span class="step-sublabel">Paso {{ currentStep() }} de {{ steps.length }}</span>
              </div>
              <ul class="sidebar-steps-list">
                @for (step of steps; track step.number) {
                  <li [class.active]="currentStep() === step.number"
                      [class.completed]="currentStep() > step.number"
                      [class.clickable]="currentStep() > step.number"
                      [attr.tabindex]="currentStep() > step.number ? 0 : -1"
                      [attr.role]="currentStep() > step.number ? 'button' : null"
                      (click)="currentStep() > step.number ? goToStep(step.number) : null"
                      (keydown.enter)="currentStep() > step.number ? goToStep(step.number) : null">
                    <span class="step-marker">
                      @if (currentStep() > step.number) {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      }
                    </span>
                    <span class="step-label-sidebar">{{ step.label }}</span>
                  </li>
                }
              </ul>
            </div>

            <div class="sidebar-quote">
              <p>"La música es el lenguaje universal del alma."</p>
              <div class="quote-author">
                <span> — Precosquin 2027</span>
              </div>
            </div>
          </div>
        }

        <div class="form-main-content" #formMainContent>
          <div class="w-full max-w-4xl mx-auto px-4 py-8">
            <div class="form-card animate-scale-in">
              <div class="form-header">
                <a routerLink="/" class="back-home-link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Inicio
                </a>
                <span class="question-counter">PREGUNTA {{ currentStep() }} / {{ steps.length }}</span>
                <h1>{{ stepTitles[currentStep() - 1] }}</h1>
                <p class="required-legend">Los campos marcados con <span class="required-asterisk">*</span> son obligatorios</p>
              </div>

              <form (submit)="onSubmit($event)" class="inscription-form">
                <div [@stepSlide]="currentStep()" class="step-animated-wrapper" aria-live="polite" aria-atomic="true">
                  @if (currentStep() === 1) {
                    <app-inscripcion-step-1 [data]="data" [lastDirection]="lastDirection()" />
                  }
                  @if (currentStep() === 2) {
                    <app-inscripcion-step-2 [data]="data" [lastDirection]="lastDirection()" (subcategoryChanged)="onSubcategoryChange()" />
                  }
                  @if (currentStep() === 3) {
                    <app-inscripcion-step-3 [data]="data" [lastDirection]="lastDirection()" (addMember)="addMember()" (removeMember)="removeMember($event)" />
                  }
                  @if (currentStep() === 4) {
                    <app-inscripcion-step-4 [data]="data" [lastDirection]="lastDirection()" (fileSelected)="handleFileSelected($event)" (addBandMember)="addBandMember()" (removeBandMember)="removeBandMember($event)" />
                  }
                  @if (currentStep() === 5) {
                    <app-inscripcion-step-5 [data]="data" [lastDirection]="lastDirection()" (goToStep)="goToStep($event)" (onBacklineChange)="toggleBackline($event)" />
                  }
                  @if (currentStep() === 6) {
                    <app-inscripcion-step-6 [data]="data" [lastDirection]="lastDirection()" (fileSelected)="handleFileSelected($event)" (removeFile)="handleFileRemove($any($event))" />
                  }
                  @if (currentStep() === 7) {
                    <app-inscripcion-step-accessos [data]="data" [lastDirection]="lastDirection()" (addPerson)="addAccompanyingPerson()" (removePerson)="removeAccompanyingPerson($event)" />
                  }
                  @if (currentStep() === 8) {
                    <app-inscripcion-step-7 [data]="data" [lastDirection]="lastDirection()" (goToStep)="goToStep($event)" (resetForm)="resetForm()" (verified)="emailVerified.set($event)" />
                  }
                </div>
              </form>
            </div>

            @if (currentStep() < 8 && !atBottom()) {
              <button type="button" class="next-question-arrow" id="nextQuestionBtn" (click)="scrollToNextQuestion()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            }

            @if (!submitted()) {
              <div class="next-section" @fadeIn #nextSection>
                @if (currentStep() < 8) {
                  <button type="button" class="btn-next-large" (click)="nextStep()" [disabled]="!canProceed()">
                    SIGUIENTE
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                  @if (!canProceed() && getMissingFieldsMessage()) {
                    <div class="missing-fields-hint">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {{ getMissingFieldsMessage() }}
                    </div>
                  }
                } @else {
                  @if (!showConfirmSubmit()) {
                    <button type="button" class="btn-next-large btn-submit" (click)="showConfirmSubmit.set(true)" [disabled]="!canProceed() || submitting()">
                      ENVIAR INSCRIPCIÓN
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    </button>
                  } @else {
                    <div class="confirm-group">
                      <span class="confirm-text">¿Confirmás el envío?</span>
                      <button type="button" class="btn-cancel" (click)="showConfirmSubmit.set(false)">Cancelar</button>
                      <button type="submit" class="btn-confirm" (click)="onSubmit($event)" [disabled]="submitting()">
                        @if (submitting()) {
                          <span class="spinner"></span> {{ uploadProgress() || submittingText() }}
                        } @else {
                          Sí, enviar
                        }
                      </button>
                    </div>
                  }
                }
                @if (error()) {
                  <span class="form-error" role="alert">{{ error() }}</span>
                  @if (error() && errorStatus() !== 409) {
                    <button type="button" class="retry-post-btn" (click)="onSubmit($event)">Reintentar</button>
                  }
                }
              </div>

              <div class="bottom-nav-bar">
                <div class="bottom-nav-left">
                  @if (currentStep() > 1) {
                    <button type="button" class="btn-ghost" (click)="prevStep()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
                      Anterior
                    </button>
                  }
                </div>
                <div class="bottom-nav-center">
                  @if (showSavedIndicator()) {
                    <span class="saved-indicator">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Guardado
                    </span>
                  } @else if (currentStep() < 8) {
                    <span class="enter-hint">
                      Presioná <kbd>ENTER</kbd> para continuar
                    </span>
                  }
                </div>
                <div class="bottom-nav-right">
                  <a href="mailto:inscripciones@precosquin.com" class="help-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    ¿Necesitás ayuda?
                  </a>
                  <button type="button" class="save-link" (click)="saveDraftAndExit()">Guardar y continuar más tarde</button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>

    @if (showConstanciaModal() && inscriptionResult()) {
      <div class="constancia-modal-overlay" (click)="closeConstanciaModal()">
        <div class="constancia-modal" (click)="$event.stopPropagation()">
          <button type="button" class="constancia-modal-close" #modalClose (click)="closeConstanciaModal()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          @if (uploadFailedFiles().length > 0) {
            <div class="upload-warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <strong>Algunos archivos no se subieron:</strong>
                <span>{{ uploadFailedFiles().join(', ') }}</span>
              </div>
              <button type="button" class="retry-btn" (click)="retryFailedUploads()">Reintentar</button>
            </div>
          }
          <app-inscripcion-constancia
            [result]="inscriptionResult()!"
            [data]="data"
            [subcategoryName]="getSubcategoryName(data.subcategory)"
            (printRequested)="printConstancia()"
            (resetRequested)="resetForm()" />
        </div>
      </div>
    }
  `
})

export class InscripcionPageComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  
  @ViewChild(InscripcionStep1Component) step1Component?: InscripcionStep1Component;
  @ViewChild('nextSection') nextSectionRef?: ElementRef<HTMLElement>;
  @ViewChild('modalClose') modalCloseRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('formMainContent') formMainContentRef?: ElementRef<HTMLDivElement>;

  currentStep = signal(1);

  readonly steps = [
    { number: 1, label: 'Tus datos' },
    { number: 2, label: 'Tu arte' },
    { number: 3, label: 'Tu grupo' },
    { number: 4, label: 'Tu show' },
    { number: 5, label: 'Equipo técnico' },
    { number: 6, label: 'Archivos' },
    { number: 7, label: 'Acceso' },
    { number: 8, label: 'Confirmar' },
  ];

  readonly stepTitles = [
    '¿Cómo te llamás?',
    '¿Qué vas a presentar?',
    '¿Quiénes van en el grupo?',
    '¿Qué necesitás para sonar bien?',
    'Contanos de tu equipo técnico',
    'Mandanos los archivos',
    '¿Quiénes te acompañan?',
    'Revisá todo antes de enviar',
  ];
submitted = signal(false);
  submitting = signal(false);
  error = signal('');
  emailVerified = signal(false);
  errorStatus = signal(0);
  inscriptionResult = signal<InscripcionResult | null>(null);
  filePreviews: Record<string, string> = {};
  showConfirmSubmit = signal(false);
  submittingText = signal('Enviando inscripción...');
  lastDirection = signal<'left' | 'right'>('left');
  showConstanciaModal = signal(false);
  atBottom = signal(false);
  uploadFailedFiles = signal<string[]>([]);
  uploadProgress = signal('');
  validationErrors = signal<string[]>([]);
  showSavedIndicator = signal(false);
  typeformMode = signal(true);
  otpVerified = signal(false);
  otpCodeSent = signal(false);
  emailAlreadyRegistered = signal(false);
  checkingEmail = signal(false);
  otpError = signal('');
  registrationChoice = signal<'new' | 'existing' | null>(null);
  registeredData = signal<{inscription_id: string; status: string; full_name: string; category: string; subcategory: string; created_at: string} | null>(null);
  welcomeAction = signal<'modify' | 'download' | 'cancel' | null>(null);
  cancelConfirm = signal(false);
  cancelling = signal(false);
  isModifying = signal(false);
  modifySection = signal<string | null>(null);
  loadingModify = signal(false);
  modifyError = signal('');
  savingSection = signal(false);
  modifyRawData = signal<any>(null);
  private observer?: IntersectionObserver;
  private modalTrapCleanup?: () => void;

  private modalFocusEffect = effect(() => {
    if (this.showConstanciaModal()) {
      setTimeout(() => {
        this.modalCloseRef?.nativeElement?.focus();
        this.trapFocusInModal();
      });
    }
  });

  private trapFocusInModal(): void {
    const modal = document.querySelector('.constancia-modal') as HTMLElement;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    this.modalTrapCleanup = () => modal.removeEventListener('keydown', handleTab);
  }

  private draftKey = 'precosquin_inscripcion_draft';

  data: InscripcionData = createEmptyInscripcionData();

  subcategoriesByCategory = subcategoriesByCategory;
  private groupSubcategories = groupSubcategories;

  micOptions = ['Dinámico (SM58)', 'Condensador de solista', 'Inalámbrico', 'Overhead', 'Para acordeón/guitarra', 'Para percusión'];
  backlineOptions = ['Guitarra eléctrica', 'Guitarra acústica', 'Bajo', 'Batería', 'Acordeón', 'Teclado', 'Percusión menor'];

  cablesInput = '';

  ngOnInit(): void {
    this.loadDraft();
    setTimeout(() => {
      const nextEl = this.nextSectionRef?.nativeElement;
      if (nextEl) {
        this.observer = new IntersectionObserver(
          ([entry]) => {
            this.atBottom.set(entry.isIntersecting);
          },
          { threshold: 0.1 }
        );
        this.observer.observe(nextEl);
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent): void {
    if (this.currentStep() > 1 && !this.submitted()) {
      this.saveDraft();
      e.returnValue = '';
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.showConstanciaModal()) {
      this.closeConstanciaModal();
      return;
    }
    if (!window.matchMedia('(hover: hover)').matches) return;
    const target = event.target as HTMLElement;
    const tag = target.tagName;
    const isTextInput = tag === 'INPUT' && ['text', 'email', 'tel', 'number', 'search', 'url', 'password'].includes((target as HTMLInputElement).type);
    if (event.key === 'Enter' && isTextInput && !this.submitted() && !this.submitting() && this.currentStep() < 8) {
      event.preventDefault();
      if (this.canProceed()) {
        this.nextStep();
      }
    }
  }

  saveDraft(): void {
    try {
      const draft = { ...this.data, _step: this.currentStep(), _timestamp: Date.now() };
      delete (draft as any).dniFrontFile;
      delete (draft as any).dniBackFile;
      delete (draft as any).promoPhotoFile;
      delete (draft as any).lyricsFile;
      delete (draft as any).scoreFile;
      delete (draft as any).danceMp3File;
      localStorage.setItem(this.draftKey, JSON.stringify(draft));
      this.showSavedIndicator.set(true);
      setTimeout(() => this.showSavedIndicator.set(false), 2500);
    } catch {}
  }

  saveDraftAndExit(): void {
    this.saveDraft();
    this.toast.success('Borrador guardado', 'Podés continuar después desde este mismo navegador.');
    this.router.navigate(['/']);
  }

  checkEmailAndSendOtp(): void {
    if (!this.data.email) return;
    this.checkingEmail.set(true);
    this.otpError.set('');
    this.http.get<{ exists: boolean }>(`${environment.apiUrl}/inscriptions/check-email?email=${encodeURIComponent(this.data.email)}`).subscribe({
      next: (res) => {
        this.checkingEmail.set(false);
        if (res.exists) {
          this.emailAlreadyRegistered.set(true);
        } else {
          this.otpCodeSent.set(true);
          this.sendOtpCode();
        }
      },
      error: () => {
        this.checkingEmail.set(false);
        this.otpCodeSent.set(true);
        this.sendOtpCode();
      }
    });
  }

  sendOtpCode(): void {
    this.otpError.set('');
    this.http.post(`${environment.apiUrl}/inscriptions/send-otp`, { email: this.data.email }).subscribe({
      next: () => {},
      error: (err) => {
        this.otpError.set(err.error?.detail || 'Error al enviar el código. Intentá de nuevo.');
      }
    });
  }

  resetEmailCheck(): void {
    this.emailAlreadyRegistered.set(false);
    this.otpCodeSent.set(false);
    this.otpError.set('');
    this.otpVerified.set(false);
    this.registeredData.set(null);
    this.welcomeAction.set(null);
    this.cancelConfirm.set(false);
    this.cancelling.set(false);
    this.data.email = '';
  }

  startRegistration(): void {
    this.otpVerified.set(true);
  }

  checkEmailStatus(): void {
    if (!this.data.email) return;
    this.checkingEmail.set(true);
    this.otpError.set('');
    this.http.get<any>(`${environment.apiUrl}/inscriptions/check-email?email=${encodeURIComponent(this.data.email)}`).subscribe({
      next: (res) => {
        this.checkingEmail.set(false);
        if (res.exists) {
          this.registeredData.set({
            inscription_id: res.inscription_id,
            status: res.status,
            full_name: res.full_name,
            category: res.category,
            subcategory: res.subcategory,
            created_at: res.created_at,
          });
          this.emailAlreadyRegistered.set(true);
        } else {
          this.otpError.set('No encontramos una inscripción asociada a ese correo.');
        }
      },
      error: () => {
        this.checkingEmail.set(false);
        this.otpError.set('Error al consultar. Intentá de nuevo.');
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDIENTE': 'Recibida — Pendiente de revisión',
      'EN_REVISION': 'En revisión administrativa',
      'NECESITA_CORRECCION': 'Necesita correcciones',
      'APROBADA': 'Aprobada — ¡Felicitaciones!',
      'RECHAZADA': 'No aprobada',
      'ACREDITADA': 'Acreditada',
    };
    return labels[status] || status;
  }

  getFirstName(): string {
    const name = this.registeredData()?.full_name || '';
    return name.split(' ')[0] || 'PARTICIPANTE';
  }

  openConstancia(): void {
    const id = this.registeredData()?.inscription_id;
    if (id) {
      window.open(`${environment.apiUrl}/inscriptions/${id}/constancia-html`, '_blank');
    }
  }

  resendConstanciaEmail(): void {
    const id = this.registeredData()?.inscription_id;
    if (!id) return;
    this.http.post(`${environment.apiUrl}/inscriptions/${id}/resend-constancia`, { email: this.data.email }).subscribe({
      next: () => {
        this.toast.success('Constancia enviada a tu correo');
      },
      error: () => {
        this.toast.error('Error al enviar. Intentá de nuevo.');
      }
    });
  }

  cancelInscription(): void {
    const id = this.registeredData()?.inscription_id;
    if (!id) return;
    this.cancelling.set(true);
    this.http.post(`${environment.apiUrl}/inscriptions/${id}/cancel`, { email: this.data.email }).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.toast.success('Inscripción cancelada correctamente');
        this.resetEmailCheck();
      },
      error: () => {
        this.cancelling.set(false);
        this.toast.error('Error al cancelar. Intentá de nuevo.');
      }
    });
  }

  startModify(): void {
    const id = this.registeredData()?.inscription_id;
    if (!id) return;
    this.loadingModify.set(true);
    this.modifyError.set('');
    this.http.get<any>(`${environment.apiUrl}/inscriptions/${id}/get-public?email=${encodeURIComponent(this.data.email)}`).subscribe({
      next: (ins) => {
        this.loadingModify.set(false);
        this.modifyRawData.set(ins);
        this.mapInscriptionToData(ins);
        this.isModifying.set(true);
        this.modifySection.set(null);
      },
      error: () => {
        this.loadingModify.set(false);
        this.modifyError.set('Error al cargar los datos. Intentá de nuevo.');
      }
    });
  }

  private mapInscriptionToData(ins: any): void {
    this.data.firstName = ins.first_name || '';
    this.data.lastName = ins.last_name || '';
    this.data.dni = ins.dni || '';
    this.data.birthDate = ins.birth_date || '';
    this.data.age = ins.age || null;
    this.data.address = ins.address || '';
    this.data.locality = ins.locality || '';
    this.data.province = ins.province || '';
    this.data.phone = ins.phone || '';
    this.data.email = ins.email || '';
    this.data.category = ins.category || '';
    this.data.subcategory = ins.subcategory || '';
    this.data.stageName = ins.stage_name || '';
    this.data.artisticName = ins.artistic_name || '';
    this.data.proposalName = ins.proposal_name || '';
    this.data.choreographerName = ins.choreographer_name || '';
    this.data.style = ins.style || '';
    this.data.danceList = ins.dance_list || '';
    this.data.biography = ins.bio || '';
    this.data.presentation = ins.presentation || '';
    this.data.songsList = ins.songs_list || '';
    this.data.technicalNeeds = ins.technical_needs || '';
    this.data.instrumentType = ins.instrument_type || '';
    this.data.instrumentName = ins.instrument_name || '';
    this.data.hasAccompaniment = ins.has_accompaniment || false;
    this.data.accompanimentInstrument = ins.accompaniment_instrument || '';
    this.data.accompanimentMusician = ins.accompaniment_musician || '';
    this.data.acceptNoPriorWin = ins.accept_no_prior_win || false;
    this.data.acceptNotJurorOrg = ins.accept_not_juror_org || false;
    this.data.acceptRegulations = ins.accept_regulations || false;
    this.data.acceptPurelyInstrumental = ins.accept_purely_instrumental || false;
    this.data.acceptOneInstrument = ins.accept_one_instrument || false;
    this.data.acceptNoPrerecorded = ins.accept_no_prerecorded || false;
    this.data.acceptNoInstrumentChange = ins.accept_no_instrument_change || false;
    this.data.danceStyle = ins.dance_style || '';
    this.data.workTitle = ins.work_title || '';
    this.data.assistantsCount = ins.assistants_count || 0;
    if (ins.members && Array.isArray(ins.members)) {
      this.data.members = ins.members.map((m: any) => ({
        fullName: m.fullName || m.full_name || '',
        dni: m.dni || '',
        age: m.age || null,
        role: m.role || '',
      }));
    }
    if (ins.themes && Array.isArray(ins.themes)) {
      this.data.themes = ins.themes.map((t: any) => ({
        title: t.title || '',
        rhythm: t.rhythm || '',
        author: t.author || '',
      }));
    }
    if (ins.dance_themes && Array.isArray(ins.dance_themes)) {
      this.data.danceThemes = ins.dance_themes.map((d: any) => ({
        title: d.title || '',
        song: d.song || '',
      }));
    }
    if (ins.band_members && Array.isArray(ins.band_members)) {
      this.data.bandMembers = ins.band_members.map((b: any) => ({
        fullName: b.fullName || b.full_name || '',
        instrument: b.instrument || '',
      }));
    }
    if (ins.accompanying_persons && Array.isArray(ins.accompanying_persons)) {
      this.data.accompanyingPersons = ins.accompanying_persons.map((a: any) => ({
        fullName: a.fullName || a.full_name || '',
        dni: a.dni || '',
      }));
    }
    if (ins.rider_tecnico && typeof ins.rider_tecnico === 'object') {
      this.data.riderTecnico = ins.rider_tecnico;
    }
    this.data.dniFrontName = ins.dni_front_url || '';
    this.data.dniBackName = ins.dni_back_url || '';
    this.data.promoPhotoName = ins.promo_photo_url || '';
  }

  saveModification(): void {
    const id = this.registeredData()?.inscription_id;
    if (!id) return;
    this.submitting.set(true);
    this.error.set('');

    const payload: any = {
      email: this.data.email,
      first_name: this.data.firstName,
      last_name: this.data.lastName,
      full_name: `${this.data.firstName} ${this.data.lastName}`.trim(),
      phone: this.data.phone,
      dni: this.data.dni,
      birth_date: this.data.birthDate,
      age: this.data.age,
      address: this.data.address,
      locality: this.data.locality,
      province: this.data.province,
      stage_name: this.data.stageName || `${this.data.firstName} ${this.data.lastName}`.trim(),
      category: this.data.category,
      subcategory: this.data.subcategory,
      artistic_name: this.data.artisticName,
      proposal_name: this.data.proposalName,
      choreographer_name: this.data.choreographerName,
      style: this.data.style,
      dance_list: this.data.danceList,
      bio: this.data.biography,
      presentation: this.data.presentation,
      songs_list: this.data.songsList,
      themes: this.data.themes,
      members: this.data.members,
      accompanying_persons: this.data.accompanyingPersons,
      rider_tecnico: this.data.riderTecnico,
      dance_style: this.data.danceStyle,
      dance_themes: this.data.danceThemes,
      work_title: this.data.workTitle,
      assistants_count: this.data.assistantsCount,
      band_members: this.data.bandMembers,
      instrument_type: this.data.instrumentType,
      instrument_name: this.data.instrumentName,
      has_accompaniment: this.data.hasAccompaniment,
      accompaniment_instrument: this.data.accompanimentInstrument,
      accompaniment_musician: this.data.accompanimentMusician,
      technical_needs: this.data.technicalNeeds,
    };

    this.http.put<any>(`${environment.apiUrl}/inscriptions/${id}/update-public`, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Inscripción actualizada correctamente');
        this.isModifying.set(false);
        this.welcomeAction.set(null);
        this.typeformMode.set(true);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.detail || 'Error al guardar. Intentá de nuevo.');
      }
    });
  }

  cancelModify(): void {
    this.isModifying.set(false);
    this.modifySection.set(null);
    this.modifyRawData.set(null);
  }

  saveSection(): void {
    const id = this.registeredData()?.inscription_id;
    if (!id) return;
    this.savingSection.set(true);
    this.error.set('');
    const payload: any = {
      email: this.data.email,
      first_name: this.data.firstName,
      last_name: this.data.lastName,
      full_name: `${this.data.firstName} ${this.data.lastName}`.trim(),
      phone: this.data.phone,
      dni: this.data.dni,
      birth_date: this.data.birthDate,
      age: this.data.age,
      address: this.data.address,
      locality: this.data.locality,
      province: this.data.province,
      stage_name: this.data.stageName || `${this.data.firstName} ${this.data.lastName}`.trim(),
      artistic_name: this.data.artisticName,
      proposal_name: this.data.proposalName,
      choreographer_name: this.data.choreographerName,
      style: this.data.style,
      dance_list: this.data.danceList,
      bio: this.data.biography,
      presentation: this.data.presentation,
      songs_list: this.data.songsList,
      themes: this.data.themes,
      members: this.data.members,
      accompanying_persons: this.data.accompanyingPersons,
      rider_tecnico: this.data.riderTecnico,
      dance_style: this.data.danceStyle,
      dance_themes: this.data.danceThemes,
      work_title: this.data.workTitle,
      assistants_count: this.data.assistantsCount,
      band_members: this.data.bandMembers,
      instrument_type: this.data.instrumentType,
      instrument_name: this.data.instrumentName,
      has_accompaniment: this.data.hasAccompaniment,
      accompaniment_instrument: this.data.accompanimentInstrument,
      accompaniment_musician: this.data.accompanimentMusician,
      technical_needs: this.data.technicalNeeds,
    };
    this.http.put<any>(`${environment.apiUrl}/inscriptions/${id}/update-public`, payload).subscribe({
      next: () => {
        this.savingSection.set(false);
        this.toast.success('Cambios guardados correctamente');
        this.modifySection.set(null);
        this.startModify();
      },
      error: (err) => {
        this.savingSection.set(false);
        this.error.set(err.error?.detail || 'Error al guardar. Intentá de nuevo.');
      }
    });
  }

  getSubcategoryLabel(id: string): string {
    const all = [...subcategoriesByCategory['musica'], ...subcategoriesByCategory['danza']];
    return all.find(s => s.id === id)?.name || id;
  }

  formatDateShort(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  loadDraft(): void {
    try {
      const raw = localStorage.getItem(this.draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || !draft._timestamp) return;
      const daysSince = (Date.now() - draft._timestamp) / (1000 * 60 * 60 * 24);
      if (daysSince > 7) {
        localStorage.removeItem(this.draftKey);
        return;
      }
      Object.keys(this.data).forEach(key => {
        if (draft[key] !== undefined && !(this.data as any)[key]?.constructor?.name?.includes('File')) {
          (this.data as any)[key] = draft[key];
        }
      });
      if (draft._step) this.currentStep.set(draft._step);
    } catch {}
  }

  clearDraft(): void {
    localStorage.removeItem(this.draftKey);
  }

  getProgressPercentage(): number {
    const total = 7;
    const current = this.currentStep();
    return Math.round(((current - 1) / (total - 1)) * 100);
  }

  scrollToNextQuestion(): void {
    const groups = document.querySelectorAll('.question-group');
    if (!groups.length) return;
    const viewMid = window.innerHeight / 2;
    for (const group of groups) {
      const rect = group.getBoundingClientRect();
      if (rect.top > viewMid) {
        group.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    const last = groups[groups.length - 1];
    if (last) {
      last.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

resetForm(): void {
    this.clearDraft();
    this.data = createEmptyInscripcionData();
    this.currentStep.set(1);
    this.submitted.set(false);
    this.submitting.set(false);
    this.inscriptionResult.set(null);
    this.emailVerified.set(false);
    this.showConfirmSubmit.set(false);
    this.showConstanciaModal.set(false);
  }

  closeConstanciaModal(): void {
    this.showConstanciaModal.set(false);
    this.modalTrapCleanup?.();
  }

  validateDni(dni: string): boolean {
    return /^\d{7,8}$/.test(dni);
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  hasRiderData(): boolean {
    const r = this.data.riderTecnico;
    return !!(
      r.sonido.microfonos.length > 0 ||
      r.sonido.diBoxes ||
      r.sonido.backline.length > 0 ||
      r.otros
    );
  }

  dragOverStates: Record<string, boolean> = {};

  handleFileSelected(event: { fieldName: string; file: File }): void {
    this.processFile(event.file, event.fieldName);
  }

  private processFile(file: File, fieldName: string): void {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const docTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const isImage = imageTypes.includes(file.type);
    const isDoc = docTypes.includes(file.type);
    const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;

    if (!isImage && !isDoc) {
      this.error.set('Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, WebP) o documentos (PDF, DOC, TXT).');
      return;
    }
    if (file.size > maxSize) {
      this.error.set(`El archivo excede el tamaño máximo de ${isImage ? '5MB' : '10MB'}.`);
      return;
    }

    this.error.set('');
    this.errorStatus.set(0);
    (this.data as any)[fieldName] = file;
    const nameMap: Record<string, string> = {
      dniFrontFile: 'dniFrontName', dniBackFile: 'dniBackName',
      promoPhotoFile: 'promoPhotoName', lyricsFile: 'lyricsFileName', scoreFile: 'scoreFileName',
      danceMp3File: 'danceMp3FileName',
    };
    (this.data as any)[nameMap[fieldName]] = file.name;

    if (file.type.startsWith('image/')) {
      if (this.filePreviews[fieldName]) URL.revokeObjectURL(this.filePreviews[fieldName]);
      this.filePreviews[fieldName] = URL.createObjectURL(file);
    }
  }

  toggleBackline(item: string): void {
    const idx = this.data.riderTecnico.sonido.backline.indexOf(item);
    if (idx >= 0) {
      this.data.riderTecnico.sonido.backline.splice(idx, 1);
    } else {
      this.data.riderTecnico.sonido.backline.push(item);
    }
  }

  handleFileRemove(fieldName: string): void {
    const nameMap: Record<string, string> = {
      dniFrontFile: 'dniFrontName', dniBackFile: 'dniBackName',
      promoPhotoFile: 'promoPhotoName', lyricsFile: 'lyricsFileName', scoreFile: 'scoreFileName',
      danceMp3File: 'danceMp3FileName',
    };
    (this.data as any)[fieldName] = null;
    (this.data as any)[nameMap[fieldName]] = '';
    if (this.filePreviews[fieldName]) {
      URL.revokeObjectURL(this.filePreviews[fieldName]);
      delete this.filePreviews[fieldName];
    }
  }

  subcategories = computed(() => this.subcategoriesByCategory[this.data.category] || []);

  subcategoryName = computed(() => {
    const subs = this.subcategoriesByCategory[this.data.category] || [];
    const found = subs.find(s => s.id === this.data.subcategory);
    return found?.name || '';
  });

  isGroupType = computed(() => this.groupSubcategories.includes(this.data.subcategory));

  isDanza = computed(() => this.data.category === 'danza');

  needsDanceStyle(): boolean {
    return ['malambo_masculino', 'malambo_femenino'].includes(this.data.subcategory);
  }

  needsDanceThemes(): boolean {
    return ['pareja_tradicional', 'pareja_estilizada'].includes(this.data.subcategory);
  }

  needsDanceMp3(): boolean {
    return ['pareja_tradicional', 'pareja_estilizada', 'conjunto_baile'].includes(this.data.subcategory);
  }

  needsWorkTitle(): boolean {
    return this.data.subcategory === 'conjunto_baile';
  }

  needsAssistants(): boolean {
    return this.data.subcategory === 'pareja_tradicional';
  }

  needsMusiciansInfo(): boolean {
    return ['malambo_masculino', 'malambo_femenino', 'conjunto_malambo', 'pareja_tradicional', 'pareja_estilizada'].includes(this.data.subcategory);
  }

  maxMembersForSubcategory(): number {
    if (this.data.subcategory === 'conjunto_baile') return 40;
    if (this.data.subcategory === 'conjunto_malambo') return 8;
    if (this.data.subcategory === 'conjunto_vocal') return 8;
    if (this.data.subcategory === 'conjunto_instrumental') return 10;
    if (['pareja_tradicional', 'pareja_estilizada'].includes(this.data.subcategory)) return 2;
    return 10;
  }

  needsBandMembers(): boolean {
    return this.data.subcategory === 'pareja_tradicional';
  }

  needsChoreographer(): boolean {
    return this.data.category === 'danza';
  }

  addBandMember(): void {
    this.data.bandMembers.push({ fullName: '', instrument: '' });
  }

  removeBandMember(index: number): void {
    this.data.bandMembers.splice(index, 1);
  }

  visibleSteps = computed(() => this.steps.filter(step => step.number < 8));

  onCategoryChange(): void {
    this.data.subcategory = '';
    this.resetDanceFields();
  }

  onSubcategoryChange(): void {
    this.resetDanceFields();
    this.preselectDanceTechRider();
  }

  private preselectDanceTechRider(): void {
    const sub = this.data.subcategory;
    const needsMusicians = ['malambo_masculino', 'malambo_femenino', 'conjunto_malambo', 'pareja_tradicional', 'pareja_estilizada'].includes(sub);
    if (!needsMusicians) return;

    if (this.data.riderTecnico.stagePlotInstruments.length === 0) {
      for (let i = 0; i < 4; i++) {
        this.data.riderTecnico.stagePlotInstruments.push({
          id: `musician-${i}`,
          type: 'musico-alt',
          x: 0,
          y: 0,
          label: `Músico ${i + 1}`,
          channel: '',
          rotation: 0,
          centered: true,
        });
      }
    }

    if (this.data.riderTecnico.inputList.length === 0) {
      for (let i = 0; i < 4; i++) {
        this.data.riderTecnico.inputList.push({
          source: `Músico ${i + 1}`,
          micType: '',
          fxInsert: '',
          monitorMix: '',
          phantom: false,
        });
      }
    }
  }

  private resetDanceFields(): void {
    this.data.danceStyle = '';
    this.data.danceThemes = [{ title: '', song: '' }, { title: '', song: '' }, { title: '', song: '' }];
    this.data.danceMp3File = null;
    this.data.danceMp3FileName = '';
    this.data.workTitle = '';
    this.data.assistantsCount = 0;
    this.data.bandMembers = [];
  }

  onBirthDateChange(): void {
    this.data.age = this.calculateAge(this.data.birthDate);
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

  addTheme(): void {
    if (this.data.themes.length >= 10) return;
    this.data.themes.push({ title: '', rhythm: '', author: '' });
  }

  removeTheme(index: number): void {
    if (this.data.themes.length <= 1) return;
    this.data.themes.splice(index, 1);
  }

  addDanceTheme(): void {
    if (this.data.danceThemes.length >= 3) return;
    this.data.danceThemes.push({ title: '', song: '' });
  }

  removeDanceTheme(index: number): void {
    if (this.data.danceThemes.length <= 1) return;
    this.data.danceThemes.splice(index, 1);
  }

  onStagePlotChange(instruments: Instrument[]): void {
    this.data.riderTecnico.stagePlotInstruments = instruments;
  }

  addMember(): void {
    if (this.data.members.length >= this.maxMembersForSubcategory()) return;
    const defaultRole = this.data.category === 'danza' ? 'Bailarín' : '';
    this.data.members.push({ fullName: '', dni: '', age: null, role: defaultRole });
  }

  removeMember(index: number): void {
    this.data.members.splice(index, 1);
  }

  addAccompanyingPerson(): void {
    this.data.accompanyingPersons.push({ fullName: '', dni: '' });
  }

  removeAccompanyingPerson(index: number): void {
    this.data.accompanyingPersons.splice(index, 1);
  }

  ngOnDestroy(): void {
    Object.values(this.filePreviews).forEach(url => URL.revokeObjectURL(url));
    this.observer?.disconnect();
  }

  getFilledThemesCount(): number {
    return this.data.themes.filter(t => t.title || t.rhythm || t.author).length;
  }

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 1:
        return this.step1Component ? this.step1Component.isFormValid() : !!(
          this.data.firstName && this.data.lastName &&
          this.validateDni(this.data.dni) &&
          this.data.birthDate &&
          this.data.age !== null && this.data.age >= 16 &&
          this.data.address &&
          this.data.locality &&
          this.data.province &&
          this.data.phone &&
          this.validateEmail(this.data.email)
        );
      case 2:
        return !!(
          this.data.category && this.data.subcategory
          && (!this.needsDanceStyle() || this.data.danceStyle)
        );
      case 3:
        if (!this.isGroupType()) return true;
        const minMembers = this.data.subcategory === 'conjunto_baile' ? 8
          : this.data.subcategory === 'conjunto_malambo' ? 4
          : this.data.subcategory === 'conjunto_vocal' ? 3
          : ['pareja_tradicional', 'pareja_estilizada'].includes(this.data.subcategory) ? 2
          : 1;
        return this.data.members.length >= minMembers
          && this.data.members.every(m => m.fullName.trim() && m.dni.trim() && m.role);
      case 4:
        if (this.needsChoreographer()) {
          return !!this.data.choreographerName.trim();
        }
        return true;
      case 5:
        return true;
      case 6:
        return !!(
          this.data.dniFrontFile && this.data.dniBackFile && this.data.promoPhotoFile
          && (this.data.subcategory !== 'cancion_inedita' || (this.data.lyricsFile && this.data.scoreFile))
          && (!this.needsDanceMp3() || this.data.danceMp3File)
        );
      case 7:
        return true;
      case 8:
        return this.emailVerified() && this.data.acceptRegulations && this.data.acceptImageRights && this.data.acceptDataTruth
          && this.data.acceptNoPriorWin && this.data.acceptNotJurorOrg;
      default:
        return false;
    }
  }

  getMissingFieldsMessage(): string {
    switch (this.currentStep()) {
      case 1: {
        const missing: string[] = [];
         if (!this.data.firstName || this.data.firstName.trim().length < 2) missing.push('Nombre');
         if (!this.data.lastName || this.data.lastName.trim().length < 2) missing.push('Apellido');
        if (!this.data.dni || this.data.dni.length < 7) missing.push('DNI');
        if (!this.data.birthDate) missing.push('Fecha de nacimiento');
        if (this.data.age !== null && this.data.age < 16) missing.push('Debés tener al menos 16 años');
        if (!this.data.address || this.data.address.trim().length < 3) missing.push('Domicilio');
        if (!this.data.locality) missing.push('Localidad');
        if (!this.data.province) missing.push('Provincia');
        if (!this.data.phone) missing.push('Teléfono');
        if (!this.data.email || !this.validateEmail(this.data.email)) missing.push('Email válido');
        return missing.length ? `Faltan completar: ${missing.join(', ')}` : '';
      }
      case 2: {
        const missing: string[] = [];
        if (!this.data.category) missing.push('Categoría');
        if (!this.data.subcategory) missing.push('Subcategoría');
        if (this.needsDanceStyle() && !this.data.danceStyle) missing.push('Estilo del malambo');
        return missing.length ? `Faltan completar: ${missing.join(', ')}` : '';
      }
      case 3: {
        if (!this.isGroupType()) return '';
        const minMembers = this.data.subcategory === 'conjunto_baile' ? 8
          : this.data.subcategory === 'conjunto_malambo' ? 4
          : this.data.subcategory === 'conjunto_vocal' ? 3
          : ['pareja_tradicional', 'pareja_estilizada'].includes(this.data.subcategory) ? 2
          : 1;
        const missing: string[] = [];
        if (this.data.members.length < minMembers) missing.push(`Mínimo ${minMembers} integrantes`);
        this.data.members.forEach((m, i) => {
          if (!m.fullName.trim()) missing.push(`Nombre del integrante ${i + 1}`);
          if (!m.dni.trim()) missing.push(`DNI del integrante ${i + 1}`);
          if (!m.role) missing.push(`Rol del integrante ${i + 1}`);
        });
        return missing.length ? `Faltan completar: ${missing.join(', ')}` : '';
      }
      case 4: {
        const missing: string[] = [];
        if (this.needsChoreographer() && !this.data.choreographerName.trim()) missing.push('Nombre del coreógrafo');
        return missing.length ? `Faltan completar: ${missing.join(', ')}` : '';
      }
      case 6: {
        const missing: string[] = [];
        if (!this.data.dniFrontFile) missing.push('DNI frontal');
        if (!this.data.dniBackFile) missing.push('DNI dorso');
        if (!this.data.promoPhotoFile) missing.push('Foto promocional');
        if (this.data.subcategory === 'cancion_inedita') {
          if (!this.data.lyricsFile) missing.push('Letra de la canción');
          if (!this.data.scoreFile) missing.push('Partitura');
        }
        if (this.needsDanceMp3() && !this.data.danceMp3File) missing.push('Música MP3 de danzas');
        return missing.length ? `Faltan subir: ${missing.join(', ')}` : '';
      }
case 8: {
        const missing: string[] = [];
        if (!this.emailVerified()) missing.push('Verificar email');
        if (!this.data.acceptRegulations) missing.push('Aceptar reglamento');
        if (!this.data.acceptImageRights) missing.push('Aceptar derechos de imagen');
        if (!this.data.acceptDataTruth) missing.push('Declarar veracidad de datos');
        if (!this.data.acceptNoPriorWin) missing.push('Declarar no haber ganado anteriormente');
        if (!this.data.acceptNotJurorOrg) missing.push('Declarar no ser jurado ni parte de la organizaci�n');
        return missing.length ? `Faltan completar: ${missing.join(', ')}` : '';
      }
      default:
        return '';
    }
  }

  nextStep(): void {
    if (this.currentStep() === 1 && this.step1Component) {
      const valid = this.step1Component.runAllValidations();
      if (!valid) return;
    }
    if (this.canProceed() && this.currentStep() < 8) {
      let next = this.currentStep() + 1;
      if (next === 3 && !this.isGroupType()) {
        next = 4;
      }
      this.lastDirection.set('left');
      this.currentStep.set(next);
      this.saveDraft();
      this.focusFirstInput();
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      let prev = this.currentStep() - 1;
      if (prev === 3 && !this.isGroupType()) {
        prev = 2;
      }
      this.lastDirection.set('right');
      this.currentStep.set(prev);
      this.focusFirstInput();
    }
  }

  goToStep(step: number): void {
    if (step === 3 && !this.isGroupType()) {
      this.currentStep.set(4);
    } else {
      this.currentStep.set(step);
    }
    this.focusFirstInput();
  }

  private focusFirstInput(): void {
    setTimeout(() => {
      this.formMainContentRef?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
      const el = document.querySelector('.step-content input:not([type="hidden"]), .step-content select') as HTMLElement;
      el?.focus();
    });
  }

  getSubcategoryName(id: string): string {
    const all = [
      ...this.subcategoriesByCategory['musica'],
      ...this.subcategoriesByCategory['danza'],
    ];
    return all.find(s => s.id === id)?.name || id;
  }



  printConstancia(): void {
    const el = document.getElementById('constancia');
    if (!el) { window.print(); return; }

    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) { window.print(); return; }

    const d = this.data;
    const subcat = this.getSubcategoryName(d.subcategory);
    const catLabel = d.category === 'musica' ? 'Música' : 'Danza';
    const result = this.inscriptionResult()!;
    const createdDate = formatDate(result.created_at);

    const f = (label: string, value: string, cls = '') =>
      `<div class="field"><span class="label">${label}</span><span class="value ${cls}">${value || '-'}</span></div>`;

    let bodyHtml = '';
    bodyHtml += f('N° de Inscripción', result.id, 'constancia-id');
    bodyHtml += f('Fecha de Inscripción', createdDate);

    bodyHtml += '<hr class="divider">';
    bodyHtml += '<div class="section-title">Datos Personales</div>';
    bodyHtml += f('Nombre Completo', `${d.firstName} ${d.lastName}`.trim(), 'constancia-name');
    bodyHtml += `<div class="grid-3">${f('DNI', d.dni)}${f('Nacimiento', d.birthDate)}${f('Edad', d.age !== null ? d.age + ' años' : '-')}</div>`;
    bodyHtml += `<div class="grid-3">${f('Domicilio', d.address)}${f('Localidad', d.locality)}${f('Provincia', d.province)}</div>`;
    bodyHtml += `<div class="grid-2">${f('Teléfono', d.phone)}${f('Email', d.email)}</div>`;
    bodyHtml += '<hr class="divider">';
    bodyHtml += '<div class="section-title">Participación</div>';
    bodyHtml += `<div class="grid-2">${f('Categoría', catLabel, 'constancia-category')}${f('Subcategoría', subcat, 'constancia-category')}</div>`;
    if (d.category === 'musica' && d.artisticName) bodyHtml += f('Nombre Artístico', d.artisticName);
    if (d.category === 'danza') {
      if (d.proposalName) bodyHtml += f('Nombre de la Propuesta', d.proposalName);
      if (d.style) bodyHtml += f('Estilo', d.style);
    }

    if (d.category === 'musica' && d.instrumentType) {
      bodyHtml += '<hr class="divider">';
      bodyHtml += '<div class="section-title">Detalles del Instrumento (Art. 31)</div>';
      bodyHtml += `<div class="grid-2">${f('Tipo', d.instrumentType === 'melodico' ? 'Melódico' : 'Armónico')}${f('Instrumento', d.instrumentName)}</div>`;
      if (d.hasAccompaniment) {
        bodyHtml += `<div class="grid-2">${f('Acompañamiento', d.accompanimentInstrument)}${f('Músico Acompañante', d.accompanimentMusician)}</div>`;
      }
    }

    if (d.members.length > 0) {
      bodyHtml += '<hr class="divider">';
      bodyHtml += '<div class="section-title">Integrantes</div>';
      d.members.forEach((m, i) => {
        bodyHtml += `<div class="grid-3">${f('Nombre', m.fullName)}${f('Rol', m.role)}${f('DNI', m.dni)}</div>`;
      });
    }

    if (d.themes.length > 0) {
      bodyHtml += '<hr class="divider">';
      bodyHtml += '<div class="section-title">Temas / Obras</div>';
      d.themes.forEach((t, i) => {
        bodyHtml += `<div class="grid-3">${f('Tema ' + (i + 1), t.title)}${f('Ritmo', t.rhythm)}${f('Autor', t.author)}</div>`;
      });
    }

    const r = d.riderTecnico;
    const hasInputList = r.inputList.length > 0;
    const hasStagePlot = r.stagePlotInstruments.length > 0;
    const hasMonitors = r.monitorCount > 0 && r.monitorMixes.length > 0;
    const hasSonido = r.sonido.microfonos.length > 0 || r.sonido.diBoxes || r.sonido.backline.length > 0;

    if (hasInputList || hasStagePlot || hasMonitors || hasSonido || r.otros) {
      bodyHtml += '<hr class="divider">';
      bodyHtml += '<div class="section-title">Rider Técnico</div>';

      if (hasInputList) {
        bodyHtml += '<div class="subsection">Canales de Entrada</div>';
        bodyHtml += '<table class="data-table"><thead><tr><th>#</th><th>Fuente</th><th>Micrófono / DI</th><th>Phantom</th></tr></thead><tbody>';
        r.inputList.forEach((ch, i) => {
          bodyHtml += `<tr><td>${i + 1}</td><td>${ch.source || '-'}</td><td>${ch.micType || '-'}</td><td>${ch.phantom ? 'Sí' : 'No'}</td></tr>`;
        });
        bodyHtml += '</tbody></table>';
      }

      if (hasStagePlot) {
        bodyHtml += '<div class="subsection">Stage Plot (Posiciones en Escenario)</div>';
        const typeColors: Record<string, string> = {
          'drums': '#ef4444', 'guitar': '#3b82f6', 'bass': '#8b5cf6',
          'keyboard': '#10b981', 'microphone': '#f59e0b', 'amp': '#6b7280',
          'monitor': '#06b6d4', 'micstand': '#ec4899', 'musician': '#1e293b',
          'di-box': '#f97316', 'ac-power': '#eab308'
        };
        const typeShort: Record<string, string> = {
          'drums': 'BAT', 'guitar': 'GTR', 'bass': 'BAJ',
          'keyboard': 'TEC', 'microphone': 'MIC', 'amp': 'AMP',
          'monitor': 'MON', 'micstand': 'MT', 'musician': 'MUS',
          'di-box': 'DI', 'ac-power': 'ENE'
        };
        const typeLabels: Record<string, string> = {
          'drums': 'Batería', 'guitar': 'Guitarra', 'bass': 'Bajo',
          'keyboard': 'Teclado', 'microphone': 'Micrófono', 'amp': 'Amplificador',
          'monitor': 'Monitor', 'micstand': 'Mic Tripie', 'musician': 'Músico',
          'di-box': 'DI Box', 'ac-power': 'Energía'
        };

        const pad = 50;
        let maxX = 200, maxY = 200;
        r.stagePlotInstruments.forEach(inst => {
          if (inst.x + pad > maxX) maxX = inst.x + pad;
          if (inst.y + pad * 2 > maxY) maxY = inst.y + pad * 2;
        });
        const svgW = Math.max(maxX + pad, 300);
        const svgH = Math.max(maxY + pad, 200);

        let svg = `<div class="stage-plot-svg"><svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:100%;">`;

        svg += `<rect x="0" y="0" width="${svgW}" height="${svgH}" rx="6" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>`;
        for (let i = 1; i < 4; i++) {
          const lx = (svgW / 4) * i;
          const ly = (svgH / 4) * i;
          svg += `<line x1="${lx}" y1="0" x2="${lx}" y2="${svgH}" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="4,4"/>`;
          svg += `<line x1="0" y1="${ly}" x2="${svgW}" y2="${ly}" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="4,4"/>`;
        }
        svg += `<rect x="0" y="0" width="${svgW}" height="24" fill="#1e3a8a" rx="6"/>`;
        svg += `<rect x="0" y="20" width="${svgW}" height="4" fill="#1e3a8a"/>`;
        svg += `<text x="${svgW/2}" y="16" text-anchor="middle" fill="white" font-size="9" font-weight="700" font-family="sans-serif">FONDO DEL ESCENARIO</text>`;
        svg += `<rect x="0" y="${svgH-22}" width="${svgW}" height="22" fill="#e0e7ff"/>`;
        svg += `<rect x="0" y="${svgH-22}" width="${svgW}" height="1.5" fill="#93c5fd"/>`;
        svg += `<text x="${svgW/2}" y="${svgH-7}" text-anchor="middle" fill="#1e3a8a" font-size="9" font-weight="700" font-family="sans-serif">PÚBLICO</text>`;

        const stageTop = 30;
        r.stagePlotInstruments.forEach(inst => {
          const px = inst.x;
          const py = stageTop + inst.y;
          const color = typeColors[inst.type] || '#64748b';
          const short = typeShort[inst.type] || '•';
          const fullLbl = typeLabels[inst.type] || inst.type;
          const extra = [inst.label, inst.channel].filter(Boolean).join(' ');

          svg += `<circle cx="${px}" cy="${py}" r="16" fill="${color}"/>`;
          svg += `<text x="${px}" y="${py + 1}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="7" font-weight="700" font-family="sans-serif">${short}</text>`;

          const labelY = py + 24;
          svg += `<rect x="${px - 28}" y="${labelY - 8}" width="56" height="14" rx="3" fill="white" stroke="${color}" stroke-width="0.7"/>`;
          svg += `<text x="${px}" y="${labelY + 1}" text-anchor="middle" fill="${color}" font-size="7" font-weight="600" font-family="sans-serif">${fullLbl}</text>`;

          if (extra) {
            svg += `<text x="${px}" y="${labelY + 12}" text-anchor="middle" fill="#64748b" font-size="6" font-family="sans-serif">${extra}</text>`;
          }
        });

        svg += '</svg></div>';
        bodyHtml += svg;
      }

      if (hasMonitors) {
        bodyHtml += '<div class="subsection">Monitores</div>';
        bodyHtml += f('Cantidad de Monitores', r.monitorCount + '');
        r.monitorMixes.forEach(mix => {
          bodyHtml += f(mix.label, mix.items.join(', ') || 'Sin mezcla configurada');
        });
      }

      if (hasSonido) {
        bodyHtml += '<div class="subsection">Sonido y Backline</div>';
        if (r.sonido.microfonos.length > 0) bodyHtml += f('Micrófocos / Accesorios', r.sonido.microfonos.join(', '));
        if (r.sonido.diBoxes) bodyHtml += f('DI Boxes', r.sonido.diBoxes + '');
        if (r.sonido.cables.length > 0) bodyHtml += f('Cables / Conexiones', r.sonido.cables.join(', '));
        if (r.sonido.backline.length > 0) bodyHtml += f('Backline Propio', r.sonido.backline.join(', '));
      }

      if (r.otros) {
        bodyHtml += f('Otros Requerimientos', r.otros);
      }
    }

    if (d.accompanyingPersons.length > 0) {
      bodyHtml += '<hr class="divider">';
      bodyHtml += '<div class="section-title">Acompañantes</div>';
      d.accompanyingPersons.forEach(p => {
        bodyHtml += `<div class="grid-2">${f('Nombre', p.fullName)}${f('DNI', p.dni)}</div>`;
      });
    }

    win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Constancia - ${d.firstName} ${d.lastName}</title>
<style>
  @page { size: A4 portrait; margin: 15mm 12mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #0f172a; background: white; }
  .card { border: 2px solid #1e3a8a; }
  .top-bar { height: 3mm; background: #1e3a8a; }
  .header { display: flex; flex-direction: column; align-items: center; gap: 3mm; padding: 8mm 10mm 5mm; border-bottom: 2px solid #1e3a8a; }
  .header img { height: 12mm; }
  .event-name { font-size: 14pt; font-weight: 700; color: #0f172a; }
  .badge { background: #dcfce7; color: #166534; padding: 4px 14px; border-radius: 999px; font-size: 9pt; font-weight: 700; }
  .title-row { display: flex; justify-content: space-between; align-items: center; padding: 4mm 10mm; border-bottom: 1px solid #cbd5e1; }
  .title { font-size: 16pt; font-weight: 800; }
  .fecha { font-size: 9pt; color: #475569; }
  .body { padding: 5mm 10mm 6mm; display: flex; flex-direction: column; gap: 2.5mm; }
  .field { display: flex; flex-direction: column; gap: 0.5mm; }
  .label { font-size: 7.5pt; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
  .value { font-size: 10pt; color: #0f172a; font-weight: 500; line-height: 1.3; }
  .constancia-name { font-size: 12pt; font-weight: 800; color: #0f172a; }
  .constancia-id { font-family: 'Courier New', monospace; font-size: 9pt; font-weight: 700; color: #1e3a8a; }
  .constancia-category { font-weight: 700; color: #1e3a8a; }
  .section-title { font-size: 10pt; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.08em; padding-top: 1mm; padding-bottom: 1mm; border-bottom: 1px solid #93c5fd; }
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 0.5mm 0; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3mm; }
  .note { padding: 3mm 4mm; background: #eff6ff; border: 1px solid #3b82f6; border-radius: 4px; font-size: 8pt; color: #334155; line-height: 1.4; }
  .subsection { font-size: 9pt; font-weight: 700; color: #334155; margin-top: 1.5mm; padding-bottom: 0.5mm; border-bottom: 1px dashed #93c5fd; }
  .data-table { width: 100%; border-collapse: collapse; font-size: 8pt; margin-top: 1mm; }
  .data-table th { background: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 7pt; letter-spacing: 0.05em; padding: 1.5mm 2mm; text-align: left; border-bottom: 1px solid #cbd5e1; }
  .data-table td { padding: 1.5mm 2mm; border-bottom: 1px solid #e2e8f0; color: #0f172a; vertical-align: top; }
  .data-table.stage-grid td { border: 1px solid #cbd5e1; padding: 2mm; font-size: 7.5pt; min-width: 50mm; height: 15mm; }
  .data-table.stage-grid th { background: #e0e7ff; color: #1e3a8a; font-size: 7.5pt; }
  .data-table.stage-grid .fondo-label { background: #f1f5f9; color: #64748b; text-align: center; font-style: italic; font-size: 7pt; }
  .stage-plot-svg { margin-top: 1.5mm; text-align: center; }
  .stage-plot-svg svg { border: 1px solid #cbd5e1; border-radius: 4px; }
  .footer { padding: 4mm 10mm; border-top: 1px solid #cbd5e1; text-align: center; font-size: 7pt; color: #94a3b8; }
  @media print {
    body { margin: 0; }
    .card { border: none; }
    .top-bar { background: #1e3a8a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .badge { background: #dcfce7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .note { background: #eff6ff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="card">
  <div class="top-bar"></div>
  <div class="header">
    <img src="assets/img/logoballena.webp" alt="Precosquín" loading="lazy">
    <div class="event-name">Festival Precosquín 2027</div>
    <div class="badge">✓ Inscripción Registrada</div>
  </div>
  <div class="title-row">
    <div class="title">Constancia de Inscripción</div>
    <div class="fecha">Fecha: ${createdDate}</div>
  </div>
  <div class="body">
    ${bodyHtml}
    <div class="note">Conservá esta constancia como comprobante. Tu inscripción será revisada por el jurado. Recibirás un email con los próximos pasos.</div>
  </div>
  <div class="footer">Festival Precosquín 2027 — precosquin.com</div>
</div>
</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 600);
  }

  onTypeformSubmit(): void {
    const validationError = this.validateRequiredFields();
    if (validationError) {
      this.error.set(validationError);
      return;
    }
    this.submitPayload();
  }

  private validateRequiredFields(): string {
    const d = this.data;
    const missing: string[] = [];
     if (!d.firstName?.trim()) missing.push('Nombre');
     if (!d.lastName?.trim()) missing.push('Apellido');
    if (!d.email?.trim()) missing.push('Email');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) missing.push('Email válido');
    if (!d.phone?.trim()) missing.push('Teléfono');
    if (!d.category) missing.push('Categoría');
    if (!d.subcategory) missing.push('Subcategoría');
    if (missing.length) {
      return `Faltan completar campos requeridos: ${missing.join(', ')}`;
    }
    return '';
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.canProceed()) return;
    this.submitPayload();
  }

  private submitPayload(): void {
    this.submitting.set(true);
    this.error.set('');
    this.errorStatus.set(0);

    const str = (v: any) => (v && String(v).trim()) ? String(v).trim() : null;
    const payload: Record<string, any> = {
      'full_name': str(this.data.firstName && this.data.lastName ? `${this.data.firstName} ${this.data.lastName}` : this.data.firstName || this.data.lastName || ''),
      'stage_name': str(this.data.artisticName),
      'email': str(this.data.email),
      'phone': str(this.data.phone),
      'category': this.data.category,
      'subcategory': this.data.subcategory,
      'dni': str(this.data.dni),
      'birth_date': str(this.data.birthDate),
      'age': this.data.age ?? null,
      'address': str(this.data.address),
      'locality': str(this.data.locality),
      'province': str(this.data.province),
      'bio': str(this.data.biography),
      'rider_tecnico': this.hasRiderData() ? this.data.riderTecnico : null,
      'proposal_name': str(this.data.proposalName),
      'choreographer_name': str(this.data.choreographerName),
      'style': str(this.data.style),
      'dance_list': str(this.data.danceList),
      'themes': this.data.category === 'musica'
        ? this.data.themes.filter(t => t.title || t.rhythm || t.author)
        : null,
      'members': this.isGroupType() ? this.data.members : null,
      'accompanying_persons': this.data.accompanyingPersons.length > 0 ? this.data.accompanyingPersons : null,
      // Danza
      'dance_style': str(this.data.danceStyle),
      'dance_themes': this.needsDanceThemes() ? this.data.danceThemes.filter(t => t.title || t.song) : null,
      'work_title': str(this.data.workTitle),
      'assistants_count': this.data.assistantsCount || null,
      'band_members': this.needsBandMembers() && this.data.bandMembers.length > 0 ? this.data.bandMembers : null,
      // Declaraciones de elegibilidad
      'accept_regulations': this.data.acceptRegulations,
      'accept_no_prior_win': this.data.acceptNoPriorWin,
      'accept_not_juror_org': this.data.acceptNotJurorOrg,
    };

    this.http.post<InscripcionResult>(`${environment.apiUrl}/inscriptions/`, payload).subscribe({
      next: (result: InscripcionResult) => {
        this.inscriptionResult.set(result);
        this.clearDraft();
        this.submitted.set(true);
        this.submitting.set(false);
        this.uploadFiles(result.id);
      },
      error: (err: any) => {
        this.submitting.set(false);
        this.showConfirmSubmit.set(false);
        this.errorStatus.set(err.status || 0);
        if (err.status === 409) {
          this.error.set('Ya existe una inscripción con esos datos. Si creés que es un error, contactanos.');
        } else if (err.status === 422 && Array.isArray(err.error?.detail)) {
          const details = err.error.detail.map((d: any) => {
            const field = d.loc && d.loc.length > 1 ? d.loc[1] : '';
            return `${field ? `'${field}': ` : ''}${d.msg}`;
          }).join(', ');
          this.error.set(`Error de validación: ${details}`);
        } else {
          this.error.set(typeof err.error?.detail === 'string' ? err.error.detail : 'Error al enviar la inscripción. Intentá de nuevo.');
        }
      },
    });
  }

  private uploadFiles(inscriptionId: string): void {
    const files: { file: File; type: string }[] = [];

    if (this.data.dniFrontFile) files.push({ file: this.data.dniFrontFile, type: 'dni_front' });
    if (this.data.dniBackFile) files.push({ file: this.data.dniBackFile, type: 'dni_back' });
    if (this.data.promoPhotoFile) files.push({ file: this.data.promoPhotoFile, type: 'promo_photo' });
    if (this.data.lyricsFile) files.push({ file: this.data.lyricsFile, type: 'lyrics' });
    if (this.data.scoreFile) files.push({ file: this.data.scoreFile, type: 'score' });
    if (this.data.danceMp3File) files.push({ file: this.data.danceMp3File, type: 'dance_mp3' });

    if (files.length === 0) return;

    let uploaded = 0;
    const total = files.length;
    const failed: string[] = [];

    for (const { file, type } of files) {
      const formData = new FormData();
      formData.append('file', file);

      this.http.post(
        `${environment.apiUrl}/inscriptions/upload/${inscriptionId}?file_type=${type}`,
        formData
      ).subscribe({
        next: () => {
          uploaded++;
          if (uploaded === total) {
            this.uploadFailedFiles.set(failed);
          }
        },
        error: () => {
          failed.push(type);
          uploaded++;
          if (uploaded === total) {
            this.uploadFailedFiles.set(failed);
          }
        },
      });
    }
  }

  retryFailedUploads(): void {
    const result = this.inscriptionResult();
    if (!result) return;
    this.uploadFailedFiles.set([]);
    this.uploadFiles(result.id);
  }
}
