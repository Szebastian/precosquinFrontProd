import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InscriptionsService, Inscription } from '../../core/services/inscriptions.service';
import { AuthService } from '../../core/auth/auth.service';
import { ExportService } from '../../core/services/export.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inscripciones-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscripciones-list.page.html',
  styleUrls: ['./inscripciones-list.page.scss']
})
export class InscripcionesListPageComponent implements OnInit, OnDestroy {
  private inscriptionsService = inject(InscriptionsService);
  auth = inject(AuthService);
  private router = inject(Router);
  private exportService = inject(ExportService);
  private keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') this.closeLightbox(); };

  allInscriptions = signal<Inscription[]>([]);
  loading = signal(true);
  statusFilter = signal('');
  categoryFilter = signal('');
  subcategoryFilter = signal('');
  searchQuery = signal('');
  expandedId = signal<string | null>(null);
  updatingId = signal<string | null>(null);

  rejectModalOpen = signal(false);
  rejectTargetId = signal<string | null>(null);
  rejectTargetName = signal('');
  rejectReason = signal('');

  selectedIds = signal<Set<string>>(new Set());
  deletingBulk = signal(false);
  documentUrls = signal<Record<string, string>>({});
  heroOrientations = signal<Record<string, 'landscape' | 'portrait'>>({});
  uploadingDoc = signal<string | null>(null);
  lightboxUrl = signal<string | null>(null);
  exportModalOpen = signal(false);
  exportCategoryFilter = signal('');
  exportStatusFilter = signal('');
  exporting = signal(false);

  totalInscriptions = computed(() => this.allInscriptions().length);
  pendingCount = computed(() => this.allInscriptions().filter(i => i.status === 'PENDIENTE').length);
  reviewCount = computed(() => this.allInscriptions().filter(i => i.status === 'EN_REVISION').length);
  approvedCount = computed(() => this.allInscriptions().filter(i => i.status === 'APROBADA').length);
  rejectedCount = computed(() => this.allInscriptions().filter(i => i.status === 'RECHAZADA').length);

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.statusFilter()) count++;
    if (this.categoryFilter()) count++;
    if (this.subcategoryFilter()) count++;
    if (this.searchQuery()) count++;
    return count;
  });

  selectedCount = computed(() => this.selectedIds().size);
  allVisibleSelected = computed(() => {
    const ids = this.filteredInscriptions().map(i => i.id);
    const sel = this.selectedIds();
    return ids.length > 0 && ids.every(id => sel.has(id));
  });

  availableSubcategories = computed(() => {
    const cat = this.categoryFilter();
    const subs = new Set<string>();
    for (const ins of this.allInscriptions()) {
      if (!cat || ins.category === cat) {
        subs.add(ins.subcategory);
      }
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

  lastUpdate = computed(() => {
    const now = new Date();
    return now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  });

  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(): void {
    this.loading.set(true);
    this.inscriptionsService.getInscriptions({ page_size: 100 }).subscribe({
      next: (res) => {
        this.allInscriptions.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  toggleDetail(id: string): void {
    this.expandedId.update(current => current === id ? null : id);
  }

  clearAllFilters(): void {
    this.statusFilter.set('');
    this.categoryFilter.set('');
    this.subcategoryFilter.set('');
    this.searchQuery.set('');
    this.selectedIds.set(new Set());
  }

  toggleSelect(id: string): void {
    this.selectedIds.update(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  toggleSelectAll(): void {
    const ids = this.filteredInscriptions().map(i => i.id);
    if (this.allVisibleSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(ids));
    }
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  bulkDelete(): void {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;
    if (!confirm(`¿Eliminar ${ids.length} inscripción(es)? Esta acción no se puede deshacer.`)) return;
    this.deletingBulk.set(true);
    this.inscriptionsService.bulkDelete(ids).subscribe({
      next: (res) => {
        this.allInscriptions.update(list => list.filter(i => !ids.includes(i.id)));
        this.selectedIds.set(new Set());
        this.deletingBulk.set(false);
        if (res.not_found.length > 0) {
          alert(`${res.not_found.length} inscripción(es) no fueron encontradas`);
        }
      },
      error: () => {
        this.deletingBulk.set(false);
      }
    });
  }

  updateStatus(id: string, newStatus: string): void {
    this.updatingId.set(id);
    this.inscriptionsService.updateStatus(id, newStatus).subscribe({
      next: () => {
        this.allInscriptions.update(list =>
          list.map(i => i.id === id ? { ...i, status: newStatus } : i)
        );
        this.updatingId.set(null);
      },
      error: () => {
        this.updatingId.set(null);
      }
    });
  }

  openRejectModal(id: string, name: string): void {
    this.rejectTargetId.set(id);
    this.rejectTargetName.set(name);
    this.rejectReason.set('');
    this.rejectModalOpen.set(true);
  }

  closeRejectModal(): void {
    this.rejectModalOpen.set(false);
    this.rejectTargetId.set(null);
    this.rejectTargetName.set('');
    this.rejectReason.set('');
  }

  confirmReject(): void {
    const id = this.rejectTargetId();
    if (!id) return;
    const reason = this.rejectReason().trim() || undefined;
    this.updatingId.set(id);
    this.rejectModalOpen.set(false);
    this.inscriptionsService.updateStatus(id, 'RECHAZADA', reason).subscribe({
      next: () => {
        this.allInscriptions.update(list =>
          list.map(i => i.id === id ? { ...i, status: 'RECHAZADA' } : i)
        );
        this.updatingId.set(null);
      },
      error: () => {
        this.updatingId.set(null);
      }
    });
  }

  deleteInscription(id: string, name: string): void {
    if (!confirm(`¿Eliminar la inscripción de "${name}"? Esta acción no se puede deshacer.`)) return;
    this.updatingId.set(id);
    this.inscriptionsService.deleteInscription(id).subscribe({
      next: () => {
        this.allInscriptions.update(list => list.filter(i => i.id !== id));
        this.updatingId.set(null);
        this.expandedId.set(null);
      },
      error: (err) => {
        this.updatingId.set(null);
        alert('Error al eliminar: ' + (err?.error?.detail || err?.message || 'Error desconocido'));
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      EN_REVISION: 'En Revision',
      APROBADA: 'Aprobada',
      RECHAZADA: 'Rechazada',
      CONTRATO_FIRMADO: 'Contrato Firmado',
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('es-AR', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  loadDocUrl(inscriptionId: string, docType: string, storagePath: string): void {
    const key = `${inscriptionId}_${docType}`;
    if (this.documentUrls()[key]) return;

    this.inscriptionsService.getPublicUrl(storagePath).subscribe({
      next: (res) => {
        if (res.public_url) {
          this.documentUrls.update(urls => ({ ...urls, [key]: res.public_url }));
        }
      },
      error: () => {
        this.inscriptionsService.getSignedUrl(storagePath).subscribe({
          next: (res) => {
            if (res.signed_url) {
              this.documentUrls.update(urls => ({ ...urls, [key]: res.signed_url }));
            }
          },
          error: () => {}
        });
      }
    });
  }

  getFileName(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }

  isImageFile(url: string): boolean {
    if (!url) return false;
    const ext = url.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  }

  triggerFileInput(event: Event, inscriptionId: string, fileType: string): void {
    event.stopPropagation();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = this.getFileAccept(fileType);
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        this.uploadDoc(inscriptionId, fileType, file);
      }
    };
    input.click();
  }

  private getFileAccept(fileType: string): string {
    const map: Record<string, string> = {
      promo_photo: 'image/jpeg,image/png',
      dni_front: 'image/jpeg,image/png',
      dni_back: 'image/jpeg,image/png',
      lyrics: 'application/pdf,.doc,.docx',
      score: 'application/pdf,image/jpeg,image/png',
    };
    return map[fileType] || '*/*';
  }

  onHeroImageLoad(event: Event, inscriptionId: string): void {
    const img = event.target as HTMLImageElement;
    const orientation = img.naturalWidth >= img.naturalHeight ? 'landscape' : 'portrait';
    this.heroOrientations.update(prev => ({ ...prev, [inscriptionId]: orientation }));
  }

  openLightbox(url: string, event: Event): void {
    event.stopPropagation();
    this.lightboxUrl.set(url);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.keyHandler);
  }

  closeLightbox(): void {
    this.lightboxUrl.set(null);
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this.keyHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.keyHandler);
    document.body.style.overflow = '';
  }

  openProfile(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/panel/inscripciones', id]);
  }

  openExportModal(): void {
    this.exportCategoryFilter.set(this.categoryFilter());
    this.exportStatusFilter.set(this.statusFilter());
    this.exportModalOpen.set(true);
  }

  closeExportModal(): void {
    this.exportModalOpen.set(false);
  }

  exportToExcel(): void {
    this.exporting.set(true);
    let data = this.allInscriptions();

    const cat = this.exportCategoryFilter();
    const status = this.exportStatusFilter();
    if (cat) data = data.filter(i => i.category === cat);
    if (status) data = data.filter(i => i.status === status);

    const catLabel = cat || 'todas';
    const statusLabel = status ? this.formatStatus(status) : 'todos';
    const filename = `inscripciones-precosquin-${catLabel}-${statusLabel}`.toLowerCase().replace(/\s+/g, '_');

    this.exportService.exportListToExcel(data, filename, !cat);
    this.exporting.set(false);
    this.exportModalOpen.set(false);
  }

  uploadDoc(inscriptionId: string, fileType: string, file: File): void {
    this.uploadingDoc.set(`${inscriptionId}_${fileType}`);
    const formData = new FormData();
    formData.append('file', file);

    const token = this.auth.session()?.access_token;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${environment.apiUrl}/inscriptions/upload/${inscriptionId}?file_type=${fileType}`, {
      method: 'POST',
      headers,
      body: formData,
    })
    .then(res => {
      if (!res.ok) throw new Error('Error al subir archivo');
      return res.json();
    })
    .then((data: any) => {
      const path = data.path;
      const colMap: Record<string, string> = {
        promo_photo: 'promo_photo_url',
        dni_front: 'dni_front_url',
        dni_back: 'dni_back_url',
        lyrics: 'lyrics_url',
        score: 'score_url',
      };
      const field = colMap[fileType];
      this.allInscriptions.update(list =>
        list.map(i => i.id === inscriptionId ? { ...i, [field]: path } : i)
      );
      const key = `${inscriptionId}_${fileType}`;
      this.inscriptionsService.getPublicUrl(path).subscribe({
        next: (res) => {
          if (res.public_url) {
            this.documentUrls.update(urls => ({ ...urls, [key]: res.public_url }));
          }
        },
        error: () => {}
      });
      this.uploadingDoc.set(null);
    })
    .catch(err => {
      console.error('Upload error:', err);
      this.uploadingDoc.set(null);
      alert('Error al subir: ' + err.message);
    });
  }
}
