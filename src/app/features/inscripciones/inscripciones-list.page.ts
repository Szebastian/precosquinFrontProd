import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscriptionsService, Inscription } from '../../core/services/inscriptions.service';

@Component({
  selector: 'app-inscripciones-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inscripciones-list.page.html',
  styleUrls: ['./inscripciones-list.page.scss']
})
export class InscripcionesListPageComponent implements OnInit {
  private inscriptionsService = inject(InscriptionsService);

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
}
