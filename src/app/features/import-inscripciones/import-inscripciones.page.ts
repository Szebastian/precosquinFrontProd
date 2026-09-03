/**
 * Excel-based bulk inscription import page.
 *
 * Responsibilities (thin orchestrator):
 *  - Manage UI step flow and state signals
 *  - Delegate parsing, normalization, validation, and import to ExcelImportService
 *  - Render step-based template
 *
 * Business logic lives in ExcelImportService + excel-import.models.
 */

import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

import { ALL_FIELDS, REQUIRED_FIELDS, ColumnMapping, ParsedRow, ImportResult, BackendParseResult, BackendMissingField } from './excel-import.models';
import { ExcelImportService } from './excel-import.service';

@Component({
  selector: 'app-import-inscripciones-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './import-inscripciones.page.html',
  styleUrls: ['./import-inscripciones.page.scss'],
})
export class ImportInscripcionesPageComponent implements OnInit, OnDestroy {

  private readonly importService = inject(ExcelImportService);
  private readonly http = inject(HttpClient);
  private readonly destroy$ = new Subject<void>();
  private readonly dniSubject$ = new Subject<string>();

  /* ── Province / Locality data ── */
  readonly provincias = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut',
    'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
    'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
    'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
    'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
  ];

  readonly localidadesPorProvincia: Record<string, string[]> = {
    'Chubut': ['Puerto Pirámides','Puerto Madryn','Trelew','Rawson','Gaiman','Dolavon','Comodoro Rivadavia','Rada Tilly','Caleta Olivia','Esquel','Trevelin','El Bolsón','Lago Puelo','El Hoyo'],
    'Río Negro': ['Bariloche','Viedma','Cipolletti','General Roca','El Bolsón','Villa Regina'],
    'Neuquén': ['Neuquén','San Martín de los Andes','Villa La Angostura','Zapala','Añelo','Plottier'],
    'La Pampa': ['Santa Rosa','General Pico','Catriló','Winifreda'],
    'Buenos Aires': ['La Plata','Mar del Plata','Bahía Blanca','Tandil','Olavarría','Dolores','Chascomús','Pinamar','Villa Gesell','Necochea'],
    'CABA': ['Ciudad Autónoma de Buenos Aires'],
    'Córdoba': ['Córdoba','Villa Carlos Paz','Río Cuarto','Villa María','Cosquín','Alta Gracia','Mina Clavero'],
    'Santa Fe': ['Rosario','Santa Fe','Rafaela','Venado Tuerto','Reconquista'],
    'Entre Ríos': ['Paraná','Concordia','Colón','Gualeguaychú'],
    'Mendoza': ['Mendoza','San Rafael','San Martín','Luján de Cuyo','Tunuyán'],
    'Salta': ['Salta','Cafayate','Orán','Tartagal','Metán'],
    'Tucumán': ['San Miguel de Tucumán','Concepción','Bella Vista','Tafí Viejo'],
    'Misiones': ['Posadas','Puerto Iguazú','Eldorado','Oberá'],
    'Corrientes': ['Corrientes','Goya','Mercedes','Paso de los Libres'],
    'Chaco': ['Resistencia','Saenz Peña','Villa Ángela','Charata'],
    'Formosa': ['Formosa','Clorinda','Pirané','Las Lomitas'],
    'San Juan': ['San Juan','Chimbas','Santa Lucía','Rivadavia'],
    'San Luis': ['San Luis','Villa Mercedes','Merlo'],
    'La Rioja': ['La Rioja','Chilecito','Villa Unión'],
    'Catamarca': ['San Fernando del Valle de Catamarca','Belén','Tinogasta'],
    'Santiago del Estero': ['Santiago del Estero','La Banda','Añatuya'],
    'Santa Cruz': ['Río Gallegos','Caleta Olivia','El Calafate','Perito Moreno'],
    'Tierra del Fuego': ['Ushuaia','Río Grande','Tolhuin'],
    'Jujuy': ['San Salvador de Jujuy','San Pedro','Tilcara','Purmamarca','Humahuaca'],
  };

  /* ── Step flow ── */
  readonly step = signal(1);

  /* ── Step 1: Upload ── */
  readonly isDragover = signal(false);
  readonly fileName = signal('');
  readonly parseError = signal('');
  private _rawRows = signal<Record<string, unknown>[]>([]);
  private _excelColumns = signal<string[]>([]);

  /** Expose row count to template (mapping info card). */
  readonly rawRowCount = computed(() => this._rawRows().length);

  /* ── Step 2: Mapping ── */
  readonly columnMappings = signal<ColumnMapping[]>([]);

  /** Expose column names to template. */
  readonly excelColumns = computed(() => this._excelColumns());

  /* ── Step 3: Preview ── */
  readonly previewRows = signal<ParsedRow[]>([]);
  readonly currentPage = signal(0);
  readonly pageSize = 50;

  /* ── Backend parse result (alternative flow) ── */
  readonly backendResult = signal<BackendParseResult | null>(null);
  readonly isBackendParsing = signal(false);
  readonly uploadProgress = signal(0);
  readonly uploadPhase = signal<'idle' | 'uploading' | 'parsing' | 'done' | 'error'>('idle');

  /* ── Editable form data (copied from backend result) ── */
  readonly editFirstName   = signal('');
  readonly editLastName    = signal('');
  readonly editDni         = signal('');
  readonly editBirthDate   = signal('');
  readonly editAddress     = signal('');
  readonly editLocality    = signal('');
  readonly editProvince    = signal('');
  readonly editPhone       = signal('');
  readonly editEmail       = signal('');
  readonly editInstrumentType  = signal('');
  readonly editInstrumentName  = signal('');
  readonly editArtisticName    = signal('');
  readonly editBiography       = signal('');
  readonly editPresentation    = signal('');
  readonly editTechnicalNeeds  = signal('');
  readonly editInstrumentos    = signal<{instrumento: string; necesita: string}[]>([]);
  readonly editTemas           = signal<{title: string; rhythm: string; author: string}[]>([]);

  /* ── Group members (conjunto) ── */
  readonly editMembers = signal<{fullName: string; dni: string; role: string}[]>([]);

  /* ── Accompanying persons ── */
  readonly editAccompanyingPersons = signal<{fullName: string; dni: string}[]>([]);

  /* ── Equipment checkboxes (riderTecnico.backline) ── */
  readonly editBackline = signal<string[]>([]);
  readonly editMonitorCount = signal('0');

  readonly backlineOptions = [
    'Guitarra eléctrica', 'Guitarra acústica', 'Bajo', 'Batería',
    'Acordeón', 'Teclado', 'Percusión menor',
  ];

  /* ── Dance-specific fields ── */
  readonly editProposalName     = signal('');
  readonly editChoreographerName = signal('');
  readonly editDanceStyle       = signal('');
  readonly editDanceList        = signal('');
  readonly editWorkTitle        = signal('');

  /* ── Accompaniment (melodic soloists) ── */
  readonly editHasAccompaniment    = signal(false);
  readonly editAccompanimentInstrument = signal('');
  readonly editAccompanimentMusician   = signal('');

  readonly isDanza = computed(() => this.editCategory() === 'danza');
  readonly isMalambo = computed(() =>
    this.editSubcategory() === 'malambo_masculino' || this.editSubcategory() === 'malambo_femenino',
  );
  readonly isPareja = computed(() =>
    this.editSubcategory() === 'pareja_tradicional' || this.editSubcategory() === 'pareja_estilizada',
  );
  readonly isConjuntoBaila = computed(() => this.editSubcategory() === 'conjunto_bile');
  readonly isConjunto = computed(() =>
    ['conjunto_vocal', 'conjunto_instrumental', 'conjunto_malambo', 'conjunto_bile',
     'pareja_tradicional', 'pareja_estilizada', 'duo_vocal'].includes(this.editSubcategory()),
  );
  readonly maxMembers = computed(() => {
    const sub = this.editSubcategory();
    if (sub === 'conjunto_bile') return 40;
    if (sub === 'conjunto_malambo') return 8;
    if (sub === 'pareja_tradicional' || sub === 'pareja_estilizada') return 2;
    if (sub === 'duo_vocal') return 2;
    return 10;
  });

  /* ── Role options for members ── */
  readonly roleOptions = [
    'Bailarín', 'Cantante', 'Guitarrista', 'Baterista', 'Bajista',
    'Tecladista', 'Violinista', 'Acordeonista', 'Percusionista', 'Corista', 'Otro',
  ];

  /* ── Category / Subcategory data ── */
  readonly editCategory    = signal('musica');
  readonly editSubcategory = signal('solista_instrumental');

  readonly subcategoriesByCategory: Record<string, { id: string; name: string }[]> = {
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
      { id: 'conjunto_bile', name: 'Conjunto de Baile Folklórico' },
    ],
  };

  readonly currentSubcategories = computed(() =>
    this.subcategoriesByCategory[this.editCategory()] || [],
  );

  readonly isSolistaInstrumental = computed(() =>
    this.editSubcategory() === 'solista_instrumental',
  );

  readonly melodicoInstruments = [
    'Guitarra criolla', 'Guitarra española', 'Bandoneón', 'Acordeón',
    'Violín', 'Charango', 'Quena', 'Siku', 'Erke', 'Caja', 'Bombo',
    'Piano', 'Flauta traversa', 'Clarete', 'Saxofón', 'Trompeta',
    'Arpa criolla', 'Bouzouki', 'Mandolina', 'Otro',
  ];

  readonly armonicoInstruments = [
    'Guitarra criolla', 'Guitarra española', 'Guitarra eléctrica',
    'Bandoneón', 'Acordeón', 'Piano', 'Arpa criolla',
    'Bombo', 'Batería', 'Otro',
  ];

  readonly currentInstrumentList = computed(() =>
    this.editInstrumentType() === 'melodico' ? this.melodicoInstruments
    : this.editInstrumentType() === 'armonico' ? this.armonicoInstruments
    : [],
  );

  /* ── DNI validation ── */
  readonly dniChecking = signal(false);
  readonly dniBackendError = signal('');

  /* ── Duplicate DNI modal ── */
  readonly showDniDuplicateModal = signal(false);
  readonly duplicateDniData = signal<{
    dni: string;
    full_name: string;
    status: string;
    email: string;
    category: string;
    subcategory: string;
    created_at: string;
  } | null>(null);

  /* ── Filtered localities ── */
  readonly localidadesFiltradas = computed(() => {
    const prov = this.editProvince();
    return prov ? (this.localidadesPorProvincia[prov] || []) : [];
  });

  /* ── Step 4: Import ── */
  readonly isImporting = signal(false);
  readonly importProgress = signal(0);
  readonly importTotal = signal(0);
  readonly importResult = signal<ImportResult | null>(null);

  /* ── Expose to template ── */
  readonly requiredFields = REQUIRED_FIELDS;
  readonly optionalFields = ALL_FIELDS.filter(f => !f.required);

  /* ── Computed ── */
  readonly mappedCount = computed(() =>
    this.columnMappings().filter(m => m.fieldKey).length,
  );

  readonly allRequiredMapped = computed(() =>
    REQUIRED_FIELDS.every(f => this.columnMappings().some(m => m.fieldKey === f.key)),
  );

  readonly missingRequiredLabels = computed(() =>
    REQUIRED_FIELDS
      .filter(f => !this.columnMappings().some(m => m.fieldKey === f.key))
      .map(f => f.label)
      .join(', '),
  );

  readonly validRows = computed(() =>
    this.previewRows().filter(r => r._errors.length === 0),
  );

  readonly rowsWithErrors = computed(() =>
    this.previewRows().filter(r => r._errors.length > 0),
  );

  readonly totalPages = computed(() =>
    Math.ceil(this.previewRows().length / this.pageSize),
  );

  /* ── Lifecycle ── */
  ngOnInit(): void {
    this.dniSubject$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(dni => this.checkDniBackend(dni));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /* ── DNI validation ── */
  onDniChange(value: string): void {
    const raw = value.replace(/\D/g, '').slice(0, 8);
    this.editDni.set(raw);
    this.dniBackendError.set('');

    if (raw.length >= 7) {
      this.dniChecking.set(true);
      this.dniSubject$.next(raw);
    } else {
      this.dniChecking.set(false);
    }
  }

  private checkDniBackend(dni: string): void {
    this.http.get<{ exists: boolean; full_name?: string; status?: string; email?: string; category?: string; subcategory?: string; created_at?: string }>(
      `${environment.apiUrl}/inscriptions/check-dni`,
      { params: { dni } },
    ).pipe(timeout(5000)).subscribe({
      next: (res) => {
        this.dniChecking.set(false);
        if (res.exists) {
          this.duplicateDniData.set({
            dni,
            full_name: res.full_name || 'Desconocido',
            status: res.status || 'Desconocido',
            email: res.email || '',
            category: res.category || '',
            subcategory: res.subcategory || '',
            created_at: res.created_at || '',
          });
          this.showDniDuplicateModal.set(true);
        } else {
          this.dniBackendError.set('');
        }
      },
      error: (err) => {
        console.error('Error checking DNI:', err);
        this.dniChecking.set(false);
        this.dniBackendError.set('');
      },
    });
  }

  /* ── Duplicate DNI modal actions ── */
  onDniModalEdit(): void {
    this.showDniDuplicateModal.set(false);
    this.duplicateDniData.set(null);
    // User stays on the form to edit the DNI or other data
  }

  onDniModalAccept(): void {
    this.showDniDuplicateModal.set(false);
    this.duplicateDniData.set(null);
    // User accepts the duplicate and continues
  }

  onDniModalReject(): void {
    this.showDniDuplicateModal.set(false);
    this.duplicateDniData.set(null);
    // Reset everything and go back to step 1
    this.resetAll();
  }

  /* ── Backend parse helpers ── */
  isFieldMissing(fieldKey: string): boolean {
    const result = this.backendResult();
    return result?.missing_fields.some(f => f.field_key === fieldKey) ?? false;
  }

  getMissingBySection(section: string): string[] {
    const result = this.backendResult();
    return result?.missing_fields.filter(f => f.section === section).map(f => f.label) ?? [];
  }

  hasMissingFields(): boolean {
    const result = this.backendResult();
    return (result?.missing_fields.length ?? 0) > 0;
  }

  /** Check if required field is still empty after editing */
  isRequiredEmpty(fieldKey: string): boolean {
    const val = this.getEditValue(fieldKey);
    return !val || !val.trim();
  }

  getEditValue(fieldKey: string): string {
    switch (fieldKey) {
      case 'firstName':      return this.editFirstName();
      case 'lastName':       return this.editLastName();
      case 'dni':            return this.editDni();
      case 'birthDate':      return this.editBirthDate();
      case 'address':        return this.editAddress();
      case 'locality':       return this.editLocality();
      case 'province':       return this.editProvince();
      case 'phone':          return this.editPhone();
      case 'email':          return this.editEmail();
      case 'instrumentName': return this.editInstrumentName();
      default:               return '';
    }
  }

  setEditValue(fieldKey: string, value: string): void {
    switch (fieldKey) {
      case 'firstName':      this.editFirstName.set(value); break;
      case 'lastName':       this.editLastName.set(value); break;
      case 'dni':            this.editDni.set(value); break;
      case 'birthDate':      this.editBirthDate.set(value); break;
      case 'address':        this.editAddress.set(value); break;
      case 'locality':       this.editLocality.set(value); break;
      case 'province':       this.editProvince.set(value); break;
      case 'phone':          this.editPhone.set(value); break;
      case 'email':          this.editEmail.set(value); break;
      case 'instrumentName': this.editInstrumentName.set(value); break;
    }
  }

  /** Count how many required fields are still empty */
  readonly emptyRequiredCount = computed(() => {
    const keys = ['firstName', 'lastName', 'dni', 'birthDate', 'address', 'locality', 'province', 'phone', 'email', 'instrumentName'];
    return keys.filter(k => this.isRequiredEmpty(k)).length;
  });

  /* ── Instrumentos list management ── */
  addInstrumento(): void {
    this.editInstrumentos.update(items => [...items, { instrumento: '', necesita: '' }]);
  }

  removeInstrumento(index: number): void {
    this.editInstrumentos.update(items => items.filter((_, i) => i !== index));
  }

  updateInstrumento(index: number, field: 'instrumento' | 'necesita', value: string): void {
    this.editInstrumentos.update(items =>
      items.map((item, i) => i === index ? { ...item, [field]: value } : item),
    );
  }

  /* ── Temas list management ── */
  addTema(): void {
    this.editTemas.update(items => [...items, { title: '', rhythm: '', author: '' }]);
  }

  removeTema(index: number): void {
    this.editTemas.update(items => items.filter((_, i) => i !== index));
  }

  updateTema(index: number, field: 'title' | 'rhythm' | 'author', value: string): void {
    this.editTemas.update(items =>
      items.map((item, i) => i === index ? { ...item, [field]: value } : item),
    );
  }

  /* ── Members list management ── */
  addMember(): void {
    if (this.editMembers().length >= this.maxMembers()) return;
    this.editMembers.update(items => [...items, { fullName: '', dni: '', role: '' }]);
  }

  removeMember(index: number): void {
    this.editMembers.update(items => items.filter((_, i) => i !== index));
  }

  updateMember(index: number, field: 'fullName' | 'dni' | 'role', value: string): void {
    this.editMembers.update(items =>
      items.map((item, i) => i === index ? { ...item, [field]: value } : item),
    );
  }

  /* ── Accompanying persons list management ── */
  addAccompanyingPerson(): void {
    this.editAccompanyingPersons.update(items => [...items, { fullName: '', dni: '' }]);
  }

  removeAccompanyingPerson(index: number): void {
    this.editAccompanyingPersons.update(items => items.filter((_, i) => i !== index));
  }

  updateAccompanyingPerson(index: number, field: 'fullName' | 'dni', value: string): void {
    this.editAccompanyingPersons.update(items =>
      items.map((item, i) => i === index ? { ...item, [field]: value } : item),
    );
  }

  /* ── Backline (equipment checkboxes) ── */
  toggleBackline(option: string): void {
    this.editBackline.update(list =>
      list.includes(option) ? list.filter(i => i !== option) : [...list, option],
    );
  }

  readonly importPercent = computed(() =>
    this.importTotal() > 0 ? (this.importProgress() / this.importTotal()) * 100 : 0,
  );

  readonly paginatedRows = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.previewRows().slice(start, start + this.pageSize);
  });

  readonly visiblePreviewFields = computed(() => {
    const mapped = this.columnMappings().filter(m => m.fieldKey).map(m => m.fieldKey);
    return [...new Set(mapped)];
  });

  /* ══════════════════════════════════════════
   *  Step 1 — File upload
   * ══════════════════════════════════════════ */

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragover.set(true);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragover.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }

  onFileSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.processFile(file);
    input.value = '';
  }

  private processFile(file: File): void {
    this.fileName.set(file.name);
    this.parseError.set('');
    this.backendResult.set(null);

    // Try backend parsing first (structured Excel form)
    this.tryBackendParse(file);
  }

  private tryBackendParse(file: File): void {
    this.isBackendParsing.set(true);
    this.uploadPhase.set('uploading');
    this.uploadProgress.set(0);

    this.importService.parseExcelWithBackend$(file).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const pct = Math.round((event.loaded / event.total) * 100);
          this.uploadProgress.set(pct);
          if (pct >= 100) {
            this.uploadPhase.set('parsing');
          }
        } else if (event.type === HttpEventType.Response) {
          this.uploadProgress.set(100);
          this.uploadPhase.set('done');
          const result = event.body!;
          this.backendResult.set(result);
          this.populateEditable(result);
          this.step.set(4);
    this.isBackendParsing.set(false);
    this.uploadProgress.set(0);
    this.uploadPhase.set('idle');
    this.dniChecking.set(false);
    this.dniBackendError.set('');
        }
      },
      error: () => {
        this.uploadPhase.set('error');
        this.isBackendParsing.set(false);
        // Fallback: client-side SheetJS parsing
        this.processFileClientSide(file);
      },
    });
  }

  private populateEditable(result: BackendParseResult): void {
    const s = result.solista;
    this.editFirstName.set(s.nombre);
    this.editLastName.set(s.apellido);
    this.editDni.set(s.dni);
    this.editBirthDate.set(s.fecha_nacimiento);
    this.editAddress.set(s.direccion);
    this.editLocality.set(s.ciudad);
    this.editProvince.set(s.provincia);
    this.editPhone.set(s.telefono);
    this.editEmail.set(s.correo_electronico);
    this.editCategory.set('musica');
    this.editSubcategory.set('solista_instrumental');
    this.editInstrumentType.set(s.tipo_instrumento);
    this.editInstrumentName.set(s.instrumento_que_tocan);
    this.editArtisticName.set('');
    this.editBiography.set('');
    this.editTechnicalNeeds.set(
      result.instrumentos.map(i => `${i.instrumento}: ${i.necesita}`).join(', '),
    );
    this.editInstrumentos.set(
      result.instrumentos.map(i => ({ instrumento: i.instrumento, necesita: i.necesita })),
    );
    this.editTemas.set(
      result.temas.map(t => ({ title: t.nombre_del_tema, rhythm: t.ritmo, author: t.autor })),
    );
    // Validate DNI against Supabase after populating from Excel
    const dni = s.dni?.replace(/\D/g, '').slice(0, 8) || '';
    if (dni.length >= 7) {
      this.dniChecking.set(true);
      this.checkDniBackend(dni);
    }
  }

  private processFileClientSide(file: File): void {
    try {
      const workbook = this.importService.parseWorkbook(file);
      const rows = this.importService.sheetToObjects(workbook);
      const columns = this.importService.extractColumns(rows);

      this._rawRows.set(rows);
      this._excelColumns.set(columns);
      this.columnMappings.set(this.importService.autoDetect(columns));
      this.step.set(2);
    } catch (err: unknown) {
      this.parseError.set(err instanceof Error ? err.message : 'Error al leer el archivo');
    }
  }

  /* ══════════════════════════════════════════
   *  Step 2 — Column mapping
   * ══════════════════════════════════════════ */

  getColumnMapping(col: string): string {
    return this.columnMappings().find(m => m.excelCol === col)?.fieldKey ?? '';
  }

  setColumnMapping(col: string, fieldKey: string): void {
    const updated = this.columnMappings().map(m =>
      m.excelCol === col ? { ...m, fieldKey } : m,
    );
    this.columnMappings.set(updated);
  }

  getPreviewValue(col: string): string {
    const firstRow = this._rawRows()[0];
    if (!firstRow) return '';
    return String(firstRow[col] ?? '').substring(0, 50);
  }

  getFieldLabel(key: string): string {
    return ALL_FIELDS.find(f => f.key === key)?.label ?? key;
  }

  autoMapColumns(): void {
    const columns = this._excelColumns();
    this.columnMappings.set(this.importService.autoDetect(columns));
  }

  /* ══════════════════════════════════════════
   *  Step 3 — Normalize & preview
   * ══════════════════════════════════════════ */

  normalizeAndPreview(): void {
    const mappings = this.columnMappings();
    const rawRows = this._rawRows();

    const rows = this.importService.normalizeRows(rawRows, mappings);
    this.importService.validateRows(rows);

    this.previewRows.set(rows);
    this.currentPage.set(0);
    this.step.set(3);
  }

  /* ══════════════════════════════════════════
   *  Step 4 — Import
   * ══════════════════════════════════════════ */

  async startImport(): Promise<void> {
    const valid = this.validRows();
    if (!valid.length) return;

    this.isImporting.set(true);
    this.importProgress.set(0);
    this.importTotal.set(valid.length);

    // Progress tracking: increment as each row completes
    const progressRows = valid.map((row, i) =>
      this.importService.importValidRows([row]).then(result => {
        this.importProgress.set(i + 1);
        return result;
      }),
    );

    const results = await Promise.all(progressRows);
    const merged: ImportResult = {
      total: 0,
      success: 0,
      failed: 0,
      errors: [],
    };
    for (const r of results) {
      merged.total += r.total;
      merged.success += r.success;
      merged.failed += r.failed;
      merged.errors.push(...r.errors);
    }

    this.importResult.set(merged);
    this.isImporting.set(false);
    this.step.set(4);
  }

  async importFromBackend(): Promise<void> {
    const result = this.backendResult();
    if (!result) return;

    this.isImporting.set(true);
    try {
      const payload = this.buildEditedPayload();
      const importResult = await this.importService.importEditedPayload(payload);
      this.importResult.set(importResult);
      this.backendResult.set(null);
    } catch (err: unknown) {
      this.parseError.set(err instanceof Error ? err.message : 'Error al importar desde backend');
    } finally {
      this.isImporting.set(false);
    }
  }

  private buildEditedPayload(): Record<string, unknown> {
    const firstName = this.editFirstName();
    const lastName  = this.editLastName();
    return {
      first_name:       firstName,
      last_name:        lastName,
      full_name:        [firstName, lastName].filter(Boolean).join(' ').trim(),
      dni:              this.editDni(),
      birth_date:       this.editBirthDate(),
      address:          this.editAddress(),
      locality:         this.editLocality(),
      province:         this.editProvince(),
      phone:            this.editPhone(),
      email:            this.editEmail(),
      category:         this.editCategory(),
      subcategory:      this.editSubcategory(),
      instrument_type:  this.editInstrumentType(),
      instrument_name:  this.editInstrumentName(),
      artistic_name:    this.editArtisticName(),
      biography:        this.editBiography(),
      presentation:     this.editPresentation(),
      technical_needs:  this.editTechnicalNeeds(),
      status:           'PENDIENTE',
      themes:           this.editTemas(),
      instruments:      this.editInstrumentos(),
      members:          this.editMembers(),
      accompanying_persons: this.editAccompanyingPersons(),
      backline:         this.editBackline(),
      monitor_count:    this.editMonitorCount(),
      // Dance fields
      proposal_name:    this.editProposalName(),
      choreographer_name: this.editChoreographerName(),
      dance_style:      this.editDanceStyle(),
      dance_list:       this.editDanceList(),
      work_title:       this.editWorkTitle(),
      // Accompaniment
      has_accompaniment: this.editHasAccompaniment(),
      accompaniment_instrument: this.editAccompanimentInstrument(),
      accompaniment_musician:   this.editAccompanimentMusician(),
    };
  }

  /* ── Form validation helpers ── */
  isFieldEmpty(value: string): boolean {
    return !value || !value.trim();
  }

  /* ══════════════════════════════════════════
   *  Reset
   * ══════════════════════════════════════════ */

  resetAll(): void {
    this.step.set(1);
    this.fileName.set('');
    this.parseError.set('');
    this._rawRows.set([]);
    this._excelColumns.set([]);
    this.columnMappings.set([]);
    this.previewRows.set([]);
    this.currentPage.set(0);
    this.importResult.set(null);
    this.backendResult.set(null);
    this.isBackendParsing.set(false);
    this.editFirstName.set('');
    this.editLastName.set('');
    this.editDni.set('');
    this.editBirthDate.set('');
    this.editAddress.set('');
    this.editLocality.set('');
    this.editProvince.set('');
    this.editPhone.set('');
    this.editEmail.set('');
    this.editInstrumentType.set('');
    this.editInstrumentName.set('');
    this.editArtisticName.set('');
    this.editCategory.set('musica');
    this.editSubcategory.set('solista_instrumental');
    this.editBiography.set('');
    this.editPresentation.set('');
    this.editTechnicalNeeds.set('');
    this.editInstrumentos.set([]);
    this.editTemas.set([]);
    this.editMembers.set([]);
    this.editAccompanyingPersons.set([]);
    this.editBackline.set([]);
    this.editMonitorCount.set('0');
    this.editProposalName.set('');
    this.editChoreographerName.set('');
    this.editDanceStyle.set('');
    this.editDanceList.set('');
    this.editWorkTitle.set('');
    this.editHasAccompaniment.set(false);
    this.editAccompanimentInstrument.set('');
    this.editAccompanimentMusician.set('');
  }
}
