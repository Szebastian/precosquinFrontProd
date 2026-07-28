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
  imports: [CommonModule, FormsModule, RouterLink, InscripcionConstanciaComponent, InscripcionStep1Component, InscripcionStep2Component, InscripcionStep3Component, InscripcionStep4Component, InscripcionStep5Component, InscripcionStep6Component, InscripcionStep7Component, InscripcionStepAccessosComponent, CircularProgressComponent, TypeformFlowComponent],
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
      @if (typeformMode()) {
        <!-- TYPEFORM MODE -->
        <app-typeform-flow
          [data]="data"
          [isSubmitting]="submitting()"
          [submitSuccess]="submitted() && !!inscriptionResult()"
          [submitError]="error()"
          [inscriptionId]="inscriptionResult()?.id || ''"
          [inscriptionCreatedAt]="inscriptionResult()?.created_at || ''"
          (submitted)="onTypeformSubmit()"
          (exitTypeform)="typeformMode.set(false)" />
      } @else {
        <!-- CLASSIC MODE or SUBMITTED -->
        @if (currentStep() < 8 && !submitted()) {
          <div class="form-sidebar">
            <nav class="form-nav-vertical">
              <a routerLink="/" class="nav-brand">
                <img src="assets/img/logoballena.webp" alt="Precosquin" class="nav-logo" />
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
                    <app-inscripcion-step-7 [data]="data" [lastDirection]="lastDirection()" (goToStep)="goToStep($event)" (resetForm)="resetForm()" />
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

  private subcategoriesByCategory = subcategoriesByCategory;
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
    this.showConfirmSubmit.set(false);
    this.showConstanciaModal.set(false);
    this.uploadFailedFiles.set([]);
    this.filePreviews = {};
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
        return this.data.acceptRegulations && this.data.acceptImageRights && this.data.acceptDataTruth
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
        if (!this.data.acceptRegulations) missing.push('Aceptar reglamento');
        if (!this.data.acceptImageRights) missing.push('Aceptar derechos de imagen');
        if (!this.data.acceptDataTruth) missing.push('Declarar veracidad de datos');
        if (!this.data.acceptNoPriorWin) missing.push('Declarar no haber ganado anteriormente');
        if (!this.data.acceptNotJurorOrg) missing.push('Declarar no ser jurado ni parte de la organización');
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
    <img src="assets/img/logoballena.webp" alt="Precosquín">
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

    if (files.length === 0) {
      this.submitting.set(false);
      this.submitted.set(true);
      this.showConstanciaModal.set(true);
      return;
    }

    let uploaded = 0;
    const total = files.length;
    const failed: string[] = [];
    this.uploadProgress.set(`subiendo 0/${total}`);

    const fileLabels: Record<string, string> = {
      dni_front: 'DNI frontal',
      dni_back: 'DNI dorso',
      promo_photo: 'Foto promocional',
      lyrics: 'Letra',
      score: 'Partitura',
      dance_mp3: 'Música danzas',
    };

    for (const { file, type } of files) {
      const formData = new FormData();
      formData.append('file', file);

      this.http.post(
        `${environment.apiUrl}/inscriptions/upload/${inscriptionId}?file_type=${type}`,
        formData
      ).subscribe({
        next: () => {
          uploaded++;
          this.uploadProgress.set(`subiendo ${uploaded}/${total}`);
          if (uploaded === total) {
            this.uploadProgress.set('');
            this.submitting.set(false);
            this.submitted.set(true);
            this.uploadFailedFiles.set(failed);
            this.showConstanciaModal.set(true);
          }
        },
        error: () => {
          failed.push(fileLabels[type] || type);
          uploaded++;
          this.uploadProgress.set(`subiendo ${uploaded}/${total}`);
          if (uploaded === total) {
            this.uploadProgress.set('');
            this.submitting.set(false);
            this.submitted.set(true);
            this.uploadFailedFiles.set(failed);
            this.showConstanciaModal.set(true);
          }
        },
      });
    }
  }

  retryFailedUploads(): void {
    const result = this.inscriptionResult();
    if (!result) return;
    this.uploadFailedFiles.set([]);
    this.showConstanciaModal.set(false);
    this.submitting.set(true);
    this.submittingText.set('Reintentando archivos...');
    this.uploadFiles(result.id);
  }
}
