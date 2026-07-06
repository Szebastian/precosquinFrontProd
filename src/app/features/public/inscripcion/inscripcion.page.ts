import { Component, signal, computed, inject, OnDestroy, OnInit, HostListener, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate, query, animateChild } from '@angular/animations';
import { environment } from '../../../../environments/environment';
import { InscripcionConstanciaComponent } from './components/constancia.component';
import { InscripcionStep1Component } from './components/step-1.component';
import { InscripcionStep2Component } from './components/step-2.component';
import { InscripcionStep3Component } from './components/step-3.component';
import { InscripcionStep4Component } from './components/step-4.component';
import { InscripcionStep5Component } from './components/step-5.component';
import { InscripcionStep6Component } from './components/step-6.component';
import { InscripcionStep7Component } from './components/step-7.component';
import { CircularProgressComponent } from '../../../shared/components/circular-progress/circular-progress.component';

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

interface Member {
  fullName: string;
  dni: string;
  age: number | null;
  role: string;
}

interface ThemeRow {
  title: string;
  rhythm: string;
  author: string;
}

interface RiderTecnico {
  sonido: {
    microfonos: string[];
    monitores: string;
    consola: string;
    diBoxes: number | null;
    cables: string[];
    backline: string[];
  };
  escenario: {
    metrosLineales: number | null;
    fondoEscenario: string;
    pisos: string[];
  };
  otros: string;
}

export interface InscripcionData {
  fullName: string;
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
  technicalNeeds: string;
  riderTecnico: RiderTecnico;
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
}

export const subcategoriesByCategory: Record<string, { id: string; name: string }[]> = {
  musica: [
    { id: 'solista_vocal', name: 'Solista Vocal' },
    { id: 'duo_vocal', name: 'Dúo Vocal' },
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

const provincias = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut',
  'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
  'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
  'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
  'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
];

const micOptions = ['Dinámico (SM58)', 'Condensador de solista', 'Inalámbrico', 'Overhead', 'Para acordeón/guitarra', 'Para percusión'];
const backlineOptions = ['Guitarra eléctrica', 'Guitarra acústica', 'Bajo', 'Batería', 'Acordeón', 'Teclado', 'Percusión menor'];
const pisoOptions = ['Madera', 'Marley', 'Cemento', 'Hierba / tierra', 'Sin preferencia'];

@Component({
  selector: 'app-inscripcion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InscripcionConstanciaComponent, InscripcionStep1Component, InscripcionStep2Component, InscripcionStep3Component, InscripcionStep4Component, InscripcionStep5Component, InscripcionStep6Component, InscripcionStep7Component, CircularProgressComponent],
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
    <div class="public-page form-layout">
      @if (currentStep() < 8) {
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
            <ul class="sidebar-steps-list">
              @for (step of steps; track step.number) {
                <li [class.active]="currentStep() === step.number" [class.completed]="currentStep() > step.number">
                  <span class="step-marker"></span>
                  <span class="step-label-sidebar">{{ step.label }}</span>
                </li>
              }
            </ul>
          </div>

          <div class="sidebar-quote">
            <p>"La música es el lenguaje universal del alma."</p>
            <div class="quote-author">
              <span>— Precosquin 2027</span>
            </div>
          </div>
        </div>

        <div class="form-main-content">
          <div class="w-full max-w-4xl mx-auto px-4 py-8"> <!-- Added wrapper for width and centering -->
            <div class="form-card animate-scale-in">
              <div class="form-header">
                <span class="question-counter">PREGUNTA {{ currentStep() }} / {{ steps.length }}</span>
                <h1>{{ stepTitles[currentStep() - 1] }}</h1>
              </div>

            <form (submit)="onSubmit($event)" class="inscription-form">

            <div [@stepSlide]="currentStep()" class="step-animated-wrapper">
            @if (currentStep() === 1) {
              <app-inscripcion-step-1
                [data]="data"
                [lastDirection]="lastDirection()" />
            }
            @if (currentStep() === 2) {
              <app-inscripcion-step-2
                [data]="data"
                [lastDirection]="lastDirection()" />
            }
            @if (currentStep() === 3) {
              <app-inscripcion-step-3
                [data]="data"
                [lastDirection]="lastDirection()"
                (addMember)="addMember()"
                (removeMember)="removeMember($event)" />
            }
            @if (currentStep() === 4) {
              <app-inscripcion-step-4
                [data]="data"
                [lastDirection]="lastDirection()" />
            }
            @if (currentStep() === 5) {
              <app-inscripcion-step-5
                [data]="data"
                [lastDirection]="lastDirection()"
                (goToStep)="goToStep($event)"
                (onMicChange)="toggleMic($event)"
                (onBacklineChange)="toggleBackline($event)"
                (onPisoChange)="togglePiso($event)" />
            }
            @if (currentStep() === 6) {
              <app-inscripcion-step-6
                [data]="data"
                [lastDirection]="lastDirection()"
                (fileSelected)="handleFileSelected($event)" />
            }
            @if (currentStep() === 7) {
              <app-inscripcion-step-7
                [data]="data"
                [lastDirection]="lastDirection()" />
            }

            @if (submitted() && currentStep() === 8) {
              <div class="step-content success-content animate-scale-in">
                <div class="success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2>Inscripción Enviada</h2>
                <p>Generando tu constancia...</p>
              </div>
            }

            @if (submitted() && currentStep() === 8 && inscriptionResult()) {
              <app-inscripcion-constancia
                [result]="inscriptionResult()!"
                [data]="data"
                [subcategoryName]="getSubcategoryName(data.subcategory)"
                (printRequested)="printConstancia()"
                (resetRequested)="resetForm()" />
            }
            </div>
            </form>

            @if (!submitted()) {
              <div class="next-section" @fadeIn>
                @if (currentStep() < 7) {
                  <button type="button" class="btn-next-large" (click)="nextStep()" [disabled]="!canProceed()">
                    SIGUIENTE
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
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
                          <span class="spinner"></span> {{ submittingText() }}
                        } @else {
                          Sí, enviar
                        }
                      </button>
                    </div>
                  }
                }
                @if (error()) {
                  <span class="form-error">{{ error() }}</span>
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
                  @if (currentStep() < 7) {
                    <span class="enter-hint">
                      Presioná <kbd>ENTER</kbd> para continuar
                    </span>
                  }
                </div>
                <div class="bottom-nav-right">
                  <a routerLink="/" class="save-link">Guardar y continuar más tarde</a>
                </div>
              </div>
            }
        </div>
      </div>
      </div>
      }
      @else if (currentStep() === 8) {
        <app-inscripcion-constancia
          [result]="inscriptionResult()!"
          [data]="data"
          [subcategoryName]="getSubcategoryName(data.subcategory)"
          (printRequested)="printConstancia()"
          (resetRequested)="resetForm()" />
      }
    </div>
  `
})

export class InscripcionPageComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  

  currentStep = signal(1);

  readonly steps = [
    { number: 1, label: 'Datos Generales' },
    { number: 2, label: 'Experiencia Artística' },
    { number: 3, label: 'Integrantes del Grupo' },
    { number: 4, label: 'Requerimientos Técnicos' },
    { number: 5, label: 'Rider Técnico' },
    { number: 6, label: 'Material de Difusión' },
    { number: 7, label: 'Declaración Jurada' },
  ];

  readonly stepTitles = [
    '¿Cuáles son tus datos personales?',
    '¿Qué categoría querés?',
    '¿Quiénes son los integrantes?',
    '¿Qué necesitás para actuar?',
    'Detallá tu rider técnico',
    'Adjuntá archivos',
    'Revisá y confirmá tu inscripción',
  ];
  submitted = signal(false);
  submitting = signal(false);
  error = signal('');
  inscriptionResult = signal<InscripcionResult | null>(null);
  filePreviews: Record<string, string> = {};
  showConfirmSubmit = signal(false);
  submittingText = signal('Enviando inscripción...');
  lastDirection = signal<'left' | 'right'>('left');

  private draftKey = 'precosquin_inscripcion_draft';

  provincias = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut',
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
    'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
    'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
    'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
  ];



  data: InscripcionData = {
    fullName: '',
    dni: '',
    birthDate: '',
    age: null,
    address: '',
    locality: '',
    province: '',
    phone: '',
    email: '',
    category: '',
    subcategory: '',
    members: [],
    artisticName: '',
    themes: [
      { title: '', rhythm: '', author: '' },
      { title: '', rhythm: '', author: '' },
      { title: '', rhythm: '', author: '' },
      { title: '', rhythm: '', author: '' },
      { title: '', rhythm: '', author: '' },
      { title: '', rhythm: '', author: '' },
    ],
    technicalNeeds: '',
    riderTecnico: {
      sonido: {
        microfonos: [],
        monitores: '',
        consola: '',
        diBoxes: null,
        cables: [],
        backline: [],
      },
      escenario: {
        metrosLineales: null,
        fondoEscenario: '',
        pisos: [],
      },
      otros: '',
    },
    proposalName: '',
    choreographerName: '',
    style: '',
    danceList: '',
    biography: '',
    dniFrontFile: null,
    dniBackFile: null,
    promoPhotoFile: null,
    lyricsFile: null,
    scoreFile: null,
    dniFrontName: '',
    dniBackName: '',
    promoPhotoName: '',
    lyricsFileName: '',
    scoreFileName: '',
    acceptRegulations: false,
    acceptImageRights: false,
    acceptDataTruth: false,
  };

  private subcategoriesByCategory: Record<string, { id: string; name: string }[]> = {
    musica: [
      { id: 'solista_vocal', name: 'Solista Vocal' },
      { id: 'duo_vocal', name: 'Dúo Vocal' },
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

  private groupSubcategories = [
    'duo_vocal', 'conjunto_vocal', 'conjunto_instrumental',
    'conjunto_malambo', 'pareja_tradicional', 'pareja_estilizada', 'conjunto_baile',
  ];

  micOptions = ['Dinámico (SM58)', 'Condensador de solista', 'Inalámbrico', 'Overhead', 'Para acordeón/guitarra', 'Para percusión'];
  backlineOptions = ['Guitarra eléctrica', 'Guitarra acústica', 'Bajo', 'Batería', 'Acordeón', 'Teclado', 'Percusión menor'];
  pisoOptions = ['Madera', 'Marley', 'Cemento', 'Hierba / tierra', 'Sin preferencia'];

  cablesInput = '';

  ngOnInit(): void {
    this.loadDraft();
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
    const target = event.target as HTMLElement;
    const isTextArea = target.tagName === 'TEXTAREA';
    if (event.key === 'Enter' && !isTextArea && !this.submitted() && !this.submitting() && this.currentStep() < 8) {
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
      localStorage.setItem(this.draftKey, JSON.stringify(draft));
    } catch {}
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

  resetForm(): void {
    this.clearDraft();
    this.data = {
      fullName: '', dni: '', birthDate: '', age: null, address: '',
      locality: '', province: '', phone: '', email: '',
      category: '', subcategory: '', members: [],
      artisticName: '', themes: [
        { title: '', rhythm: '', author: '' },
        { title: '', rhythm: '', author: '' },
        { title: '', rhythm: '', author: '' },
        { title: '', rhythm: '', author: '' },
        { title: '', rhythm: '', author: '' },
        { title: '', rhythm: '', author: '' },
      ],
      technicalNeeds: '',
        riderTecnico: {
        sonido: { microfonos: [], monitores: '', consola: '', diBoxes: null, cables: [], backline: [] },
        escenario: { metrosLineales: null, fondoEscenario: '', pisos: [] },
        otros: '',
      },
      proposalName: '', choreographerName: '', style: '', danceList: '', biography: '',
      dniFrontFile: null, dniBackFile: null, promoPhotoFile: null, lyricsFile: null, scoreFile: null,
      dniFrontName: '', dniBackName: '', promoPhotoName: '', lyricsFileName: '', scoreFileName: '',
      acceptRegulations: false, acceptImageRights: false, acceptDataTruth: false,
    };
    this.currentStep.set(1);
    this.submitted.set(false);
    this.submitting.set(false);
    this.inscriptionResult.set(null);
    this.showConfirmSubmit.set(false);
    this.filePreviews = {};
  }

  private validateDni(dni: string): boolean {
    return /^\d{7,8}$/.test(dni);
  }

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toggleMic(mic: string): void {
    const idx = this.data.riderTecnico.sonido.microfonos.indexOf(mic);
    if (idx >= 0) {
      this.data.riderTecnico.sonido.microfonos.splice(idx, 1);
    } else {
      this.data.riderTecnico.sonido.microfonos.push(mic);
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

  togglePiso(piso: string): void {
    const idx = this.data.riderTecnico.escenario.pisos.indexOf(piso);
    if (idx >= 0) {
      this.data.riderTecnico.escenario.pisos.splice(idx, 1);
    } else {
      this.data.riderTecnico.escenario.pisos.push(piso);
    }
  }

  hasRiderData(): boolean {
    const r = this.data.riderTecnico;
    return !!(
      r.sonido.microfonos.length > 0 ||
      r.sonido.monitores ||
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
    (this.data as any)[fieldName] = file;
    const nameMap: Record<string, string> = {
      dniFrontFile: 'dniFrontName', dniBackFile: 'dniBackName',
      promoPhotoFile: 'promoPhotoName', lyricsFile: 'lyricsFileName', scoreFile: 'scoreFileName',
    };
    (this.data as any)[nameMap[fieldName]] = file.name;

    if (file.type.startsWith('image/')) {
      if (this.filePreviews[fieldName]) URL.revokeObjectURL(this.filePreviews[fieldName]);
      this.filePreviews[fieldName] = URL.createObjectURL(file);
    }
  }

  subcategories = computed(() => this.subcategoriesByCategory[this.data.category] || []);

  subcategoryName = computed(() => {
    const subs = this.subcategoriesByCategory[this.data.category] || [];
    const found = subs.find(s => s.id === this.data.subcategory);
    return found?.name || '';
  });

  isGroupType = computed(() => this.groupSubcategories.includes(this.data.subcategory));

  visibleSteps = computed(() => this.steps.filter(step => step.number < 8));

  onCategoryChange(): void {
    this.data.subcategory = '';
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
    this.data.members.push({ fullName: '', dni: '', age: null, role: '' });
  }

  removeMember(index: number): void {
    this.data.members.splice(index, 1);
  }

  ngOnDestroy(): void {
    Object.values(this.filePreviews).forEach(url => URL.revokeObjectURL(url));
  }

  getFilledThemesCount(): number {
    return this.data.themes.filter(t => t.title || t.rhythm || t.author).length;
  }

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 1:
        return !!(
          this.data.fullName &&
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
        return !!(this.data.category && this.data.subcategory);
      case 3:
        return this.isGroupType() ? this.data.members.length >= 1 : true;
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return true;
      case 7:
        return this.data.acceptRegulations && this.data.acceptImageRights && this.data.acceptDataTruth;
      default:
        return false;
    }
  }

  nextStep(): void {
    if (this.canProceed() && this.currentStep() < 7) {
      let next = this.currentStep() + 1;
      if (next === 3 && !this.isGroupType()) {
        next = 4;
      }
      this.lastDirection.set('left');
      this.currentStep.set(next);
      this.saveDraft();
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
    }
  }

  goToStep(step: number): void {
    if (step === 3 && !this.isGroupType()) {
      this.currentStep.set(4);
    } else {
      this.currentStep.set(step);
    }
  }

  getSubcategoryName(id: string): string {
    const all = [
      ...this.subcategoriesByCategory['musica'],
      ...this.subcategoriesByCategory['danza'],
    ];
    return all.find(s => s.id === id)?.name || id;
  }



  printConstancia(): void {
    window.print();
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.canProceed()) return;

    this.submitting.set(true);
    this.error.set('');

    const payload: Record<string, any> = {
      'full_name': this.data.fullName,
      'stage_name': this.data.artisticName || null,
      'email': this.data.email,
      'phone': this.data.phone,
      'category': this.data.category,
      'subcategory': this.data.subcategory,
      'dni': this.data.dni || null,
      'birth_date': this.data.birthDate || null,
      'age': this.data.age,
      'address': this.data.address || null,
      'locality': this.data.locality || null,
      'province': this.data.province || null,
      'bio': this.data.biography || null,
      'rider_tecnico': this.hasRiderData() ? this.data.riderTecnico : null,
      'proposal_name': this.data.proposalName || null,
      'choreographer_name': this.data.choreographerName || null,
      'style': this.data.style || null,
      'dance_list': this.data.danceList || null,
      'themes': this.data.category === 'musica'
        ? this.data.themes.filter(t => t.title || t.rhythm || t.author)
        : null,
      'members': this.isGroupType() ? this.data.members : null,
    };

    this.http.post<InscripcionResult>(`${environment.apiUrl}/inscriptions/`, payload).subscribe({
      next: (result: InscripcionResult) => {
        this.inscriptionResult.set(result);
        this.clearDraft();
        this.uploadFiles(result.id);
      },
      error: (err: any) => {
        this.submitting.set(false);
        this.error.set(err.error?.detail || 'Error al enviar la inscripción. Intentá de nuevo.');
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

    if (files.length === 0) {
      this.submitting.set(false);
      this.submitted.set(true);
      this.currentStep.set(8);
      return;
    }

    let uploaded = 0;
    const total = files.length;

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
            this.submitting.set(false);
            this.submitted.set(true);
            this.currentStep.set(8);
          }
        },
        error: () => {
          uploaded++;
          if (uploaded === total) {
            this.submitting.set(false);
            this.submitted.set(true);
            this.currentStep.set(8);
          }
        },
      });
    }
  }
}
