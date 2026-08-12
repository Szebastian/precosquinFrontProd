import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StandsService } from '@core/services/stands.service';

interface QuickStandForm {
  business_name: string;
  rubro: string;
  whatsapp: string;
}

@Component({
  selector: 'app-stands-predio-section',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="predio" class="stands-predio-section">
      <!-- Banner promocional dorado -->
      <div class="stands-banner" (click)="openModal()" role="button" tabindex="0"
           (keydown.enter)="openModal()" (keydown.space)="openModal()">
        <div class="stands-banner-inner">
          <div class="stands-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z"/><path d="M9 14h6"/><path d="M9 8h6"/><path d="M9 18h6"/></svg>
          </div>
          <div class="stands-banner-content">
            <h3 class="stands-banner-title">¿Comerciante o emprendedor?</h3>
            <p class="stands-banner-desc">
              Postulá tu stand o puesto paraPre-Cosquín Sede Puerto Pirámides.
            </p>
          </div>
          <div class="stands-banner-cta">
            <span class="stands-cta-text">Postular mi Stand / Puesto</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5 19 12l-7 7"/></svg>
          </div>
        </div>
      </div>

      <!-- Modal -->
      @if (isModalOpen()) {
        <div class="stands-modal-overlay" (click)="closeModal()">
          <div class="stands-modal" (click)="$event.stopPropagation()">
            <div class="stands-modal-header">
              <h3 class="stands-modal-title">Solicitud de Stand / Puesto</h3>
              <button class="stands-modal-close" (click)="closeModal()" aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="stands-modal-body">
              <p class="stands-modal-desc">
                Completá los datos y te contactaremos por WhatsApp para coordinar tu espacio en el predio.
              </p>

              <div class="form-group">
                <label class="form-label">Nombre del emprendimiento / marca</label>
                <input type="text" class="form-input" placeholder="Ej: Mi Emprendimiento"
                       [(ngModel)]="quickForm.business_name" />
              </div>

              <div class="form-group">
                <label class="form-label">Rubro</label>
                <input type="text" class="form-input" placeholder="Ej: Gastronomía, Artesanía, Servicios..."
                       [(ngModel)]="quickForm.rubro" />
              </div>

              <div class="form-group">
                <label class="form-label">WhatsApp de contacto</label>
                <input type="tel" class="form-input" placeholder="+54 9 291 123-4567"
                       [(ngModel)]="quickForm.whatsapp" />
              </div>

              @if (formError()) {
                <div class="form-error">{{ formError() }}</div>
              }
              @if (formSuccess()) {
                <div class="form-success">{{ formSuccess() }}</div>
              }
            </div>
            <div class="stands-modal-footer">
              <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button class="btn-cta" (click)="submitQuickForm()" [disabled]="submitting()">
                @if (submitting()) {
                  <span class="spinner"></span> Enviando...
                } @else {
                  Enviar solicitud
                }
              </button>
            </div>
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    /* ═══ SECTION WRAPPER ═══ */
    .stands-predio-section {
      padding: 24px 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* ═══ BANNER PROMOCIONAL ═══ */
    .stands-banner {
      background: linear-gradient(135deg, #D9A928, #B98B1D);
      border-radius: 20px;
      padding: 24px 28px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 8px 32px rgba(217, 169, 40, 0.35);
      border: none;
      position: relative;
      overflow: hidden;
    }
    .stands-banner:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(217, 169, 40, 0.45);
    }
    .stands-banner::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      pointer-events: none;
    }
    .stands-banner-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      position: relative;
      z-index: 1;
    }
    .stands-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 14px;
      color: #17191C;
      flex-shrink: 0;
    }
    .stands-banner-content {
      flex: 1;
    }
    .stands-banner-title {
      font-family: var(--font-display, 'Playfair Display', serif);
      font-size: 18px;
      font-weight: 700;
      color: #17191C;
      margin: 0 0 4px;
    }
    .stands-banner-desc {
      font-size: 14px;
      color: rgba(23, 25, 28, 0.8);
      margin: 0;
      line-height: 1.4;
    }
    .stands-banner-cta {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.2);
      color: #17191C;
      padding: 10px 18px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .stands-banner:hover .stands-banner-cta {
      background: rgba(255, 255, 255, 0.3);
    }
    .stands-cta-text {
      letter-spacing: 0.04em;
    }

    /* ═══ MODAL OVERLAY ═══ */
    .stands-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 2000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 0 16px 24px;
      animation: fadeIn 0.2s ease;
    }
    .stands-modal {
      background: #fff;
      border-radius: 24px 24px 0 0;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      margin-bottom: 16px;
    }
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* ═══ MODAL HEADER ═══ */
    .stands-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 28px 16px;
      border-bottom: 1px solid #E6DED0;
    }
    .stands-modal-title {
      font-family: var(--font-display, 'Playfair Display', serif);
      font-size: 20px;
      font-weight: 700;
      color: #17191C;
      margin: 0;
    }
    .stands-modal-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      background: #F1EDE4;
      color: #857a68;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .stands-modal-close:hover {
      background: #E6DED0;
      color: #17191C;
    }

    /* ═══ MODAL BODY ═══ */
    .stands-modal-body {
      padding: 20px 28px;
    }
    .stands-modal-desc {
      font-size: 14px;
      color: #6b6152;
      margin: 0 0 20px;
      line-height: 1.5;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 6px;
    }
    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 12px;
      font-size: 15px;
      outline: none;
      transition: all 0.2s;
    }
    .form-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    .form-error {
      padding: 10px 14px;
      background: #fef2f2;
      border: 1px solid #fc8185;
      border-radius: 10px;
      color: #dc2626;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .form-success {
      padding: 10px 14px;
      background: #f0fdf4;
      border: 1px solid #6ee7b7;
      border-radius: 10px;
      color: #16a34a;
      font-size: 13px;
      margin-bottom: 16px;
    }

    /* ═══ MODAL FOOTER ═══ */
    .stands-modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px 24px;
    }
    .btn {
      padding: 12px 24px;
      border-radius: 999px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 44px;
    }
    .btn-secondary {
      background: #F1EDE4;
      color: #6B6152;
      border: none;
    }
    .btn-secondary:hover {
      background: #E6DED0;
    }
    .btn-cta {
      background: linear-gradient(135deg, #D9A928, #B98B1D);
      color: #17191C;
      border: none;
      box-shadow: 0 4px 12px rgba(217, 169, 40, 0.3);
    }
    .btn-cta:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(217, 169, 40, 0.4);
    }
    .btn-cta:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(23, 25, 28, 0.2);
      border-top-color: #17191C;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ═══ RESPONSIVE ═══ */
    @media (max-width: 640px) {
      .stands-predio-section {
        padding: 20px 12px;
      }
      .stands-banner {
        padding: 20px 24px;
      }
      .stands-banner-inner {
        flex-direction: column;
        text-align: center;
      }
      .stands-banner-cta {
        margin-top: 12px;
      }
      .stands-modal {
        border-radius: 20px 20px 0 0;
      }
    }
  `]
})
export class StandsPredioSectionComponent {
  isModalOpen = signal(false);
  formError = signal('');
  formSuccess = signal('');
  submitting = signal(false);

  quickForm: QuickStandForm = {
    business_name: '',
    rubro: '',
    whatsapp: '',
  };

  private standsService = inject(StandsService);

  openModal(): void {
    this.isModalOpen.set(true);
    this.formError.set('');
    this.formSuccess.set('');
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.formError.set('');
    this.formSuccess.set('');
    document.body.style.overflow = '';
  }

  submitQuickForm(): void {
    if (!this.quickForm.business_name.trim() || !this.quickForm.rubro.trim() || !this.quickForm.whatsapp.trim()) {
      this.formError.set('Completá todos los campos');
      return;
    }
    this.formError.set('');
    this.submitting.set(true);

    // Build a minimal stand payload
    const payload = {
      person: {
        full_name: '',
        dni: '',
        phone: this.quickForm.whatsapp,
        email: '',
        locality: '',
        province: '',
        represents_company: 'No' as const,
      },
      info: {
        stand_type: 'COMERCIAL',
        stand_name: this.quickForm.business_name,
        description: '',
        main_products: this.quickForm.rubro,
        instagram: '',
        website: '',
      },
      dates: { days: [], start_time: '' },
      equipment: { space_size: '', brings_structure: 'No' as const, elements: [], table_count: undefined, chair_count: undefined },
      electricity: { needs_electricity: 'No' as const, equipment: [], power_watts: undefined },
      gastronomy: { prepares_food: 'No' as const, food_types: [], uses_gas: 'No' as const, gas_type: '', gas_amount: undefined, has_certification: 'No' as const, certification_doc_url: '' },
      personnel: { count: 0 },
      logistics: { needs_vehicle: 'No' as const, vehicle_type: '', vehicle_plate: '', early_access: 'No' as const, needs_help: 'No' as const },
      docs: { dni_front_url: '', dni_back_url: '', cuit_url: '', logo_url: '', stand_photos: [], social_links: '' },
      observations: `Solicitud express desde landing. Rubro: ${this.quickForm.rubro}`,
    };

    this.standsService.createStand(payload).subscribe({
      next: (result) => {
        this.formSuccess.set(`¡Solicitud recibida! Tu número de referencia es: ${result.id}`);
        this.submitting.set(false);
        this.quickForm = { business_name: '', rubro: '', whatsapp: '' };
        setTimeout(() => this.closeModal(), 2500);
      },
      error: () => {
        this.formError.set('Error al enviar la solicitud. Por favor, intentá más tarde.');
        this.submitting.set(false);
      },
    });
  }
}
