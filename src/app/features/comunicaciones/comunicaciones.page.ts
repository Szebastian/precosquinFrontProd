import { Component, OnInit, signal, computed, inject, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscriptionsService, Inscription } from '../../core/services/inscriptions.service';
import { ComunicacionesService, EmailTemplate, SendEmailRequest, ScheduleEmailRequest, EmailJob } from './comunicaciones.service';
import { EmailListsService, EmailContact, EmailList } from './email-lists.service';
import { EmailTemplatesService, EmailTemplateRecord } from './email-templates.service';
import { ToastService } from '../../shared/components/toast/toast.service';

interface EmailTemplateOption {
  id: EmailTemplate;
  label: string;
  icon: string;
  description: string;
  defaultSubject: string;
  defaultBody: string;
}

@Component({
  selector: 'app-comunicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunicaciones.page.html',
  styleUrls: ['./comunicaciones.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ComunicacionesPageComponent implements OnInit {
  @ViewChild('csvInput') csvInput!: ElementRef<HTMLInputElement>;

  private inscriptionsService = inject(InscriptionsService);
  private comunicacionesService = inject(ComunicacionesService);
  private emailListsService = inject(EmailListsService);
  private emailTemplatesService = inject(EmailTemplatesService);
  private toast = inject(ToastService);

  // Data
  allInscriptions = signal<Inscription[]>([]);
  savedLists = signal<EmailList[]>([]);
  savedTemplates = signal<EmailTemplateRecord[]>([]);
  emailJobs = signal<EmailJob[]>([]);
  loading = signal(true);
  loadingLists = signal(false);
  loadingJobs = signal(false);
  loadingTemplates = signal(false);
  sending = signal(false);
  sendResult = signal<{ sent: number; failed: number } | null>(null);

  // Steps
  currentStep = signal(1);
  sourceTab = signal<'inscripciones' | 'manual' | 'csv' | 'guardadas'>('inscripciones');

  // Filters (inscripciones)
  statusFilter = signal('');
  categoryFilter = signal('');
  subcategoryFilter = signal('');
  searchQuery = signal('');
  selectedIds = signal<Set<string>>(new Set());

  // Manual entry
  manualEmails = signal('');

  // CSV
  csvFileName = signal('');
  parsingCsv = signal(false);

  // Saved lists
  newListName = signal('');
  savingList = signal(false);
  editingGroup = signal<EmailList | null>(null);

  // Saved templates
  newTemplateName = signal('');
  savingTemplate = signal(false);
  editingTemplateId = signal<string | null>(null);

  // Editor
  selectedTemplate = signal<EmailTemplate>('personalizado');
  subject = signal('');
  body = signal('');

  // Schedule
  scheduleMode = signal<'now' | 'scheduled'>('now');
  scheduledDate = signal('');
  scheduledTime = signal('');

  // Logo
  emailLogoUrl = signal<string | null>(null);
  uploadingLogo = signal(false);

  // Unified recipients
  manualRecipients = computed(() => {
    const text = this.manualEmails();
    if (!text.trim()) return [];
    const lines = text.replace(/\r/g, '').split(/[\n,;]+/).map(l => l.trim()).filter(l => l && l.includes('@'));
    return lines.map(email => ({ email, name: undefined, category: undefined, subcategory: undefined, status: undefined }));
  });

  allRecipients = computed<EmailContact[]>(() => {
    const fromInscripciones = this.sourceTab() === 'inscripciones'
      ? this.filteredInscriptions()
          .filter(i => this.selectedIds().size === 0 || this.selectedIds().has(i.id))
          .map(i => ({
            email: i.email,
            name: i.full_name,
            category: i.category,
            subcategory: i.subcategory,
            status: i.status
          }))
      : [];
    const fromManual = this.manualRecipients();
    return [...fromInscripciones, ...fromManual];
  });

  recipientCount = computed(() => this.allRecipients().length);

  canSend = computed(() =>
    this.recipientCount() > 0 &&
    this.subject().trim().length > 0 &&
    this.body().trim().length > 0 &&
    !this.sending()
  );

  // Template options
  readonly templates: EmailTemplateOption[] = [
    {
      id: 'inscripcion_confirmada',
      label: 'Inscripción Confirmada',
      icon: 'check-circle',
      description: 'Notificar cuando una inscripción fue aprobada',
      defaultSubject: '¡Tu inscripción en Pre-Cosquín fue aprobada!',
      defaultBody: `Hola {nombre},

¡Buenas noticias! Tu inscripción al Pre-Cosquín Puerto Pirámides fue aprobada.

Categoría: {categoria}
Subcategoría: {subcategoria}

Te contactaremos pronto con los próximos pasos.

¡Éxitos!
Equipo Pre-Cosquín`
    },
    {
      id: 'notificacion_masiva',
      label: 'Notificación Masiva',
      icon: 'mail',
      description: 'Newsletter o recordatorio general',
      defaultSubject: 'Noticias del Pre-Cosquín Puerto Pirámides',
      defaultBody: `Hola {nombre},

Te compartimos las últimas novedades del festival Pre-Cosquín Puerto Pirámides 2026.

[Escribí acá el contenido del mensaje]

Saludos,
Equipo Pre-Cosquín`
    },
    {
      id: 'recordatorio_fechas',
      label: 'Recordatorio de Fechas',
      icon: 'calendar',
      description: 'Recordar fechas importantes del festival',
      defaultSubject: 'Recordatorio: Fechas importantes del Pre-Cosquín',
      defaultBody: `Hola {nombre},

Te recordamos las fechas importantes del Pre-Cosquín Puerto Pirámides 2026:

• Presentación: 5 y 6 de Septiembre
• Lugar: Puerto Pirámides, Chubut

No olvides preparar tu presentación.

¡Te esperamos!
Equipo Pre-Cosquín`
    },
    {
      id: 'sponsor',
      label: 'Email a Sponsors',
      icon: 'star',
      description: 'Comunicación con patrocinadores',
      defaultSubject: 'Pre-Cosquín Puerto Pirámides - Comunicación Sponsor',
      defaultBody: `Estimado/a {nombre},

Nos comunicamos con usted en relación al Pre-Cosquín Puerto Pirámides 2026.

[Contenido para el sponsor]

Saludos cordiales,
Organización Pre-Cosquín`
    },
    {
      id: 'personalizado',
      label: 'Personalizado',
      icon: 'edit',
      description: 'Escribir asunto y cuerpo libremente',
      defaultSubject: '',
      defaultBody: ''
    }
  ];

  // Computed
  availableSubcategories = computed(() => {
    const cat = this.categoryFilter();
    const subs = new Set<string>();
    for (const ins of this.allInscriptions()) {
      if (!cat || ins.category === cat) subs.add(ins.subcategory);
    }
    return Array.from(subs).sort();
  });

  filteredInscriptions = computed(() => {
    let result = this.allInscriptions();
    const status = this.statusFilter();
    const cat = this.categoryFilter();
    const sub = this.subcategoryFilter();
    const q = this.searchQuery().toLowerCase();
    if (status) result = result.filter(i => i.status === status);
    if (cat) result = result.filter(i => i.category === cat);
    if (sub) result = result.filter(i => i.subcategory === sub);
    if (q) {
      result = result.filter(i =>
        i.full_name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.stage_name && i.stage_name.toLowerCase().includes(q))
      );
    }
    return result;
  });

  variables = [
    { key: '{nombre}', desc: 'Nombre del artista' },
    { key: '{categoria}', desc: 'Categoría (Música/Danza)' },
    { key: '{subcategoria}', desc: 'Subcategoría' },
    { key: '{estado}', desc: 'Estado de inscripción' },
    { key: '{email}', desc: 'Email del artista' },
  ];

  // === Selection ===

  selectedCount = computed(() => this.selectedIds().size);
  allFilteredSelected = computed(() => {
    const filtered = this.filteredInscriptions();
    const sel = this.selectedIds();
    return filtered.length > 0 && filtered.every(i => sel.has(i.id));
  });

  toggleSelect(id: string): void {
    this.selectedIds.update(ids => {
      const next = new Set(ids);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  toggleSelectAll(): void {
    if (this.allFilteredSelected()) {
      this.selectedIds.set(new Set());
    } else {
      const ids = new Set(this.filteredInscriptions().map(i => i.id));
      this.selectedIds.set(ids);
    }
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  ngOnInit(): void {
    this.loadInscriptions();
    this.loadSavedLists();
    this.loadTemplates();
    this.loadJobs();
  }

  // === Data Loading ===

  loadInscriptions(): void {
    this.loading.set(true);
    this.inscriptionsService.getInscriptions({ page_size: 100 }).subscribe({
      next: (res) => { this.allInscriptions.set(res.data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Error', 'No se pudieron cargar las inscripciones'); }
    });
  }

  loadSavedLists(): void {
    this.loadingLists.set(true);
    this.emailListsService.getLists().subscribe({
      next: (lists) => { this.savedLists.set(lists); this.loadingLists.set(false); },
      error: () => { this.loadingLists.set(false); }
    });
  }

  loadJobs(): void {
    this.loadingJobs.set(true);
    this.comunicacionesService.getJobs().subscribe({
      next: (res) => { this.emailJobs.set(res.data || []); this.loadingJobs.set(false); },
      error: () => { this.loadingJobs.set(false); }
    });
  }

  loadTemplates(): void {
    this.loadingTemplates.set(true);
    this.emailTemplatesService.getTemplates().subscribe({
      next: (tpls) => { this.savedTemplates.set(tpls); this.loadingTemplates.set(false); },
      error: () => { this.loadingTemplates.set(false); }
    });
  }

  saveCurrentAsTemplate(): void {
    const name = this.newTemplateName().trim();
    if (!name) {
      this.toast.warning('Nombre requerido', 'Escribí un nombre para la plantilla');
      return;
    }
    if (!this.subject().trim() || !this.body().trim()) {
      this.toast.warning('Campos vacíos', 'Escribí un asunto y contenido');
      return;
    }
    this.savingTemplate.set(true);
    const editId = this.editingTemplateId();

    const onSuccess = () => {
      this.savingTemplate.set(false);
      this.newTemplateName.set('');
      this.editingTemplateId.set(null);
      this.toast.success(editId ? 'Actualizada' : 'Guardada', `"${name}" guardada correctamente`);
      this.loadTemplates();
    };
    const onError = () => {
      this.savingTemplate.set(false);
      this.toast.error('Error', 'No se pudo guardar la plantilla');
    };

    if (editId) {
      this.emailTemplatesService.updateTemplate(editId, name, this.subject(), this.body()).subscribe({ next: onSuccess, error: onError });
    } else {
      this.emailTemplatesService.saveTemplate(name, this.subject(), this.body()).subscribe({ next: onSuccess, error: onError });
    }
  }

  loadTemplateToEditor(tpl: EmailTemplateRecord): void {
    this.subject.set(tpl.subject);
    this.body.set(tpl.body);
    this.selectedTemplate.set('personalizado');
    this.editingTemplateId.set(tpl.id);
    this.newTemplateName.set(tpl.name);
    this.toast.info('Plantilla cargada', `"${tpl.name}" cargada en el editor`);
  }

  deleteSavedTemplate(id: string, name: string): void {
    this.emailTemplatesService.deleteTemplate(id).subscribe({
      next: () => {
        this.savedTemplates.update(tpls => tpls.filter(t => t.id !== id));
        if (this.editingTemplateId() === id) this.editingTemplateId.set(null);
        this.toast.success('Eliminada', `"${name}" eliminada`);
      },
      error: () => this.toast.error('Error', 'No se pudo eliminar')
    });
  }

  // === Filters ===

  getCountByStatus(status: string): number {
    return this.allInscriptions().filter(i => i.status === status).length;
  }

  clearFilters(): void {
    this.statusFilter.set('');
    this.categoryFilter.set('');
    this.subcategoryFilter.set('');
    this.searchQuery.set('');
  }

  // === Manual Entry ===

  onManualEmailsChange(text: string): void {
    this.manualEmails.set(text);
  }

  // === CSV ===

  triggerCsvUpload(): void {
    this.csvInput.nativeElement.click();
  }

  onCsvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.parsingCsv.set(true);
    this.csvFileName.set(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length === 0) {
        this.parsingCsv.set(false);
        this.toast.warning('CSV vacío', 'El archivo no contiene datos');
        return;
      }

      const header = lines[0].toLowerCase();
      const hasHeader = header.includes('email') || header.includes('correo');
      const startIdx = hasHeader ? 1 : 0;
      const emails: EmailContact[] = [];

      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols[0] && cols[0].includes('@')) {
          emails.push({
            email: cols[0],
            name: cols[1] || undefined,
            category: cols[2] || undefined,
          });
        }
      }

      if (emails.length === 0) {
        this.toast.warning('Sin emails', 'No se encontraron emails válidos en el CSV');
      } else {
        this.toast.success('CSV procesado', `${emails.length} email(s) cargado(s)`);
        this.manualEmails.set(emails.map(e => e.email).join('\n'));
        this.sourceTab.set('manual');
      }
      this.parsingCsv.set(false);
      input.value = '';
    };
    reader.readAsText(file);
  }

  // === Saved Lists ===

  loadSavedList(list: EmailList): void {
    const emails = (list.emails || []).map(e => e.email).join('\n');
    this.manualEmails.set(emails);
    this.sourceTab.set('manual');
    this.toast.success('Lista cargada', `"${list.name}" — ${(list.emails || []).length} email(s)`);
  }

  saveCurrentList(): void {
    const name = this.newListName().trim();
    if (!name) {
      this.toast.warning('Nombre requerido', 'Escribí un nombre para el grupo');
      return;
    }
    if (this.allRecipients().length === 0) {
      this.toast.warning('Sin destinatarios', 'Agregá al menos un email primero');
      return;
    }

    this.savingList.set(true);
    const editing = this.editingGroup();

    if (editing) {
      this.emailListsService.updateList(editing.id, name, this.allRecipients()).subscribe({
        next: (list) => {
          this.savedLists.update(lists => lists.map(l => l.id === editing.id ? list : l));
          this.newListName.set('');
          this.editingGroup.set(null);
          this.savingList.set(false);
          this.toast.success('Grupo actualizado', `"${name}" actualizado correctamente`);
        },
        error: () => {
          this.savingList.set(false);
          this.toast.error('Error', 'No se pudo actualizar el grupo');
        }
      });
    } else {
      this.emailListsService.saveList(name, this.allRecipients(), this.sourceTab()).subscribe({
        next: (list) => {
          this.savedLists.update(lists => [list, ...lists]);
          this.newListName.set('');
          this.savingList.set(false);
          this.toast.success('Grupo guardado', `"${name}" guardado correctamente`);
        },
        error: () => {
          this.savingList.set(false);
          this.toast.error('Error', 'No se pudo guardar el grupo');
        }
      });
    }
  }

  editGroup(list: EmailList): void {
    this.editingGroup.set(list);
    this.newListName.set(list.name);
    const emails = (list.emails || []).map(e => e.email).join('\n');
    this.manualEmails.set(emails);
    this.sourceTab.set('manual');
    this.toast.info('Editando grupo', `"${list.name}" — modificá los emails y guardá`);
  }

  cancelEditGroup(): void {
    this.editingGroup.set(null);
    this.newListName.set('');
  }

  deleteSavedList(id: string, name: string): void {
    this.emailListsService.deleteList(id).subscribe({
      next: () => {
        this.savedLists.update(lists => lists.filter(l => l.id !== id));
        this.toast.success('Eliminada', `"${name}" eliminada`);
      },
      error: () => this.toast.error('Error', 'No se pudo eliminar la lista')
    });
  }

  // === Templates ===

  selectTemplate(template: EmailTemplate): void {
    this.selectedTemplate.set(template);
    const opt = this.templates.find(t => t.id === template);
    if (opt) {
      this.subject.set(opt.defaultSubject);
      this.body.set(opt.defaultBody);
    }
  }

  getTemplateName(): string {
    return this.templates.find(t => t.id === this.selectedTemplate())?.label || '';
  }

  insertVariable(variable: string): void {
    this.body.update(v => v + variable);
  }

  // === Preview ===

  getPreviewBody(): string {
    let text = this.body();
    const sample = this.allRecipients()[0];
    if (sample) {
      text = text.replace(/\{nombre\}/g, sample.name || 'Artista');
      text = text.replace(/\{categoria\}/g, sample.category || '');
      text = text.replace(/\{subcategoria\}/g, this.formatSubcategory(sample.subcategory || ''));
      text = text.replace(/\{estado\}/g, this.formatStatus(sample.status || ''));
      text = text.replace(/\{email\}/g, sample.email || '');
    } else {
      text = text.replace(/\{nombre\}/g, 'Nombre del Artista');
      text = text.replace(/\{categoria\}/g, 'Música');
      text = text.replace(/\{subcategoria\}/g, 'Canto Sureño');
      text = text.replace(/\{estado\}/g, 'Aprobada');
      text = text.replace(/\{email\}/g, 'artista@email.com');
    }
    return text;
  }

  getPreviewSubject(): string {
    let text = this.subject();
    const sample = this.allRecipients()[0];
    if (sample) {
      text = text.replace(/\{nombre\}/g, sample.name || 'Artista');
      text = text.replace(/\{categoria\}/g, sample.category || '');
    }
    return text;
  }

  // === Logo ===

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.warning('Formato inválido', 'Seleccioná una imagen (JPG, PNG, SVG)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.toast.warning('Archivo muy grande', 'El logo no debe superar 2MB');
      return;
    }

    this.uploadingLogo.set(true);
    this.comunicacionesService.uploadLogo(file).subscribe({
      next: (url) => {
        this.emailLogoUrl.set(url);
        this.uploadingLogo.set(false);
        this.toast.success('Logo cargado', 'Se incluirá al pie de cada correo');
      },
      error: () => {
        this.uploadingLogo.set(false);
        this.toast.error('Error', 'No se pudo subir el logo');
      }
    });
  }

  removeLogo(): void {
    this.emailLogoUrl.set(null);
  }

  // === Send ===

  requestSend(): void {
    if (this.scheduleMode() === 'scheduled') {
      if (!this.scheduledDate() || !this.scheduledTime()) {
        this.toast.warning('Fecha requerida', 'Seleccioná fecha y hora para el envío programado');
        return;
      }
      this.sendScheduled();
    } else {
      this.sendImmediate();
    }
  }

  private sendImmediate(): void {
    this.sending.set(true);
    this.sendResult.set(null);

    const request: SendEmailRequest = {
      recipients: this.allRecipients(),
      subject: this.subject(),
      body: this.body(),
      template: this.selectedTemplate(),
      logo_url: this.emailLogoUrl() ?? undefined
    };

    this.comunicacionesService.sendEmail(request).subscribe({
      next: (res) => {
        this.sending.set(false);
        this.sendResult.set({ sent: res.sent, failed: res.failed });
        if (res.failed === 0) {
          this.toast.success('Enviado', `${res.sent} correo(s) enviado(s) exitosamente`);
        } else {
          this.toast.warning('Envío parcial', `${res.sent} enviados, ${res.failed} fallidos`);
        }
      },
      error: (err) => {
        this.sending.set(false);
        const msg = err.error?.message || 'Error al enviar. Verificá que el servicio de correo esté configurado.';
        this.toast.error('Error al enviar', msg);
      }
    });
  }

  private sendScheduled(): void {
    this.sending.set(true);
    this.sendResult.set(null);

    const dt = `${this.scheduledDate()}T${this.scheduledTime()}:00`;

    const request: ScheduleEmailRequest = {
      recipients: this.allRecipients(),
      subject: this.subject(),
      body: this.body(),
      template: this.selectedTemplate(),
      scheduled_at: dt,
      logo_url: this.emailLogoUrl() ?? undefined
    };

    this.comunicacionesService.scheduleEmail(request).subscribe({
      next: (res) => {
        this.sending.set(false);
        this.toast.success('Programado', `Envío programado para el ${this.formatDateTime(dt)}`);
        this.loadJobs();
        this.currentStep.set(1);
        this.resetEditor();
      },
      error: (err) => {
        this.sending.set(false);
        const msg = err.error?.message || 'Error al programar. El endpoint puede no estar configurado aún.';
        this.toast.error('Error al programar', msg);
      }
    });
  }

  private resetEditor(): void {
    this.subject.set('');
    this.body.set('');
    this.selectedTemplate.set('personalizado');
    this.manualEmails.set('');
    this.csvFileName.set('');
    this.scheduleMode.set('now');
    this.scheduledDate.set('');
    this.scheduledTime.set('');
    this.statusFilter.set('');
    this.categoryFilter.set('');
    this.subcategoryFilter.set('');
    this.searchQuery.set('');
    this.sendResult.set(null);
  }

  // === Helpers ===

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente', EN_REVISION: 'En Revisión', APROBADA: 'Aprobada',
      RECHAZADA: 'Rechazada', CONTRATO_FIRMADO: 'Contrato Firmado',
    };
    return map[status] || status;
  }

  formatSubcategory(sub: string): string {
    const map: Record<string, string> = {
      canto_sureno: 'Canto Sureño', canto_norteno: 'Canto Norteño',
      instrumento_sureno: 'Instrumento Sureño', instrumento_norteno: 'Instrumento Norteño',
      conjunto_sureno: 'Conjunto Sureño', conjunto_norteno: 'Conjunto Norteño',
      malambo_masculino: 'Malambo Masculino', malambo_femenino: 'Malambo Femenino',
      conjunto_malambo: 'Conjunto de Malambo', pareja_tradicional: 'Pareja Tradicional',
      pareja_estilizada: 'Pareja Estilizada', conjunto_baile: 'Conjunto de Baile',
    };
    return map[sub] || sub;
  }

  formatDateTime(iso: string): string {
    try {
      return new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  getJobStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pendiente', scheduled: 'Programado', sending: 'Enviando',
      completed: 'Completado', failed: 'Fallido', cancelled: 'Cancelado'
    };
    return map[status] || status;
  }
}
