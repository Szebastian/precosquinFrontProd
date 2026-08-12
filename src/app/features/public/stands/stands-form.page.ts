import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StandsService, StandCreate } from '../../../core/services/stands.service';

interface StandData {
  person: {
    full_name: string;
    dni: string;
    phone: string;
    email: string;
    locality: string;
    province: string;
    represents_company: 'Si' | 'No';
  };
  info: {
    stand_type: string;
    stand_name: string;
    description: string;
    main_products: string;
    instagram: string;
    website: string;
  };
  dates: {
    days: string[];
    start_time: string;
  };
  equipment: {
    space_size: string;
    brings_structure: 'Si' | 'No';
    elements: string[];
    table_count: number | null;
    chair_count: number | null;
  };
  electricity: {
    needs_electricity: 'Si' | 'No';
    equipment: string;
    power_watts: number | null;
  };
   gastronomy: {
    prepares_food: 'Si' | 'No';
    food_types: string[];
    uses_gas: 'Si' | 'No';
    gas_type: string;
    gas_amount: number | null;
    has_certification: 'Si' | 'No';
    certification_doc_url: string;
  };
  personnel: {
    count: number;
  };
  logistics: {
    needs_vehicle: 'Si' | 'No';
    vehicle_type: string;
    vehicle_plate: string;
    early_access: 'Si' | 'No';
    needs_help: 'Si' | 'No';
  };
  docs: {
    dni_front_url: string;
    dni_back_url: string;
    cuit_url: string;
    logo_url: string;
    stand_photos: string[];
    social_links: string;
  };
  observations: string;
}

function createEmptyStandData(): StandData {
  return {
    person: { full_name: '', dni: '', phone: '', email: '', locality: '', province: '', represents_company: 'No' },
    info: { stand_type: '', stand_name: '', description: '', main_products: '', instagram: '', website: '' },
    dates: { days: [], start_time: '' },
    equipment: { space_size: '', brings_structure: 'No', elements: [], table_count: null, chair_count: null },
    electricity: { needs_electricity: 'No', equipment: '', power_watts: null },
    gastronomy: { prepares_food: 'No', food_types: [], uses_gas: 'No', gas_type: '', gas_amount: null, has_certification: 'No', certification_doc_url: '' },
    personnel: { count: 0 },
    logistics: { needs_vehicle: 'No', vehicle_type: '', vehicle_plate: '', early_access: 'No', needs_help: 'No' },
    docs: { dni_front_url: '', dni_back_url: '', cuit_url: '', logo_url: '', stand_photos: [], social_links: '' },
    observations: '',
  };
}

const DAYS = [
  { value: 'sabado', label: 'Sábado 5' },
  { value: 'domingo', label: 'Domingo 6' },
];

const STAND_TYPES = [
  { value: 'EXPOSICION', label: 'Stands de Exposición' },
  { value: 'GASTRONOMIA', label: 'Stands de Gastronomía' },
  { value: 'COMERCIAL', label: 'Stands Comerciales' },
  { value: 'ARTISTICO', label: 'Stands Artísticos' },
];

const SIZES = [
  { value: '2x2', label: '2×2 m' },
  { value: '3x3', label: '3×3 m' },
  { value: '4x4', label: '4×4 m' },
  { value: '4x5', label: '4×5 m' },
  { value: '5x5', label: '5×5 m' },
  { value: '5x6', label: '5×6 m' },
  { value: '6x6', label: '6×6 m' },
];

const EQUIPMENT_ELEMENTS = [
  { value: 'carpa', label: 'Carpa / Barandales' },
  { value: 'tarima', label: 'Tarima' },
  { value: 'cama_musical', label: 'Cama musical' },
  { value: 'luces', label: 'Iluminación' },
  { value: 'ganchos', label: 'Ganchos / Estructuras de techo' },
  { value: 'barras', label: 'Barras de vaso / Barra' },
  { value: 'caja_fuerte', label: 'Caja fuerte' },
  { value: 'otros', label: 'Otros' },
];

const GAS_TYPES = [
  { value: 'natural', label: 'Gas Natural' },
  { value: 'licuado', label: 'Gas Licuado (GLP)' },
];

const FOOD_TYPES = [
  { value: 'empanadas', label: 'Empanadas' },
  { value: 'asados', label: 'Asados / Parrilla' },
  { value: 'pasteleria', label: 'Pastelería / Dulces' },
  { value: 'comida_rapida', label: 'Comida Rápida' },
  { value: 'bebidas', label: 'Bebidas / Infusiones' },
  { value: 'heladeria', label: 'Heladería' },
  { value: 'otros', label: 'Otros' },
];

const VEHICLE_TYPES = [
  { value: 'auto', label: 'Automóvil' },
  { value: 'camioneta', label: 'Camioneta / Furgón' },
  { value: 'camion', label: 'Camión' },
  { value: 'moto', label: 'Moto / Bicicleta' },
];

const STEPS = [
  { key: 'person', label: 'Datos de la persona' },
  { key: 'info', label: 'Información del stand' },
  { key: 'dates', label: 'Días y horarios' },
  { key: 'equipment', label: 'Equipamiento' },
  { key: 'electricity', label: 'Electricidad' },
  { key: 'gastronomy', label: 'Gastronomía' },
  { key: 'personnel', label: 'Personal' },
  { key: 'logistics', label: 'Logística' },
  { key: 'docs', label: 'Documentación y fotos' },
  { key: 'confirm', label: 'Confirmar y enviar' },
];

const YES_NO = [{ v: 'Si', label: 'Sí' }, { v: 'No', label: 'No' }];

@Component({
  selector: 'app-stands-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="form-layout typeform-mode">
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
          <div class="tf-content">
            <span class="tf-label-num">{{ currentStep() + 1 }}</span>
            <h2 class="tf-label">{{ STEPS[currentStep()].label }}</h2>

            @if (currentStep() === 0) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">Nombre completo</label>
                  <input type="text" class="form-input" [(ngModel)]="data().person.full_name" placeholder="Ej: María González" />
                </div>
                <div class="form-group">
                  <label class="form-label">DNI</label>
                  <input type="text" class="form-input" [(ngModel)]="data().person.dni" placeholder="12.345.678" />
                </div>
                <div class="form-group">
                  <label class="form-label">Teléfono</label>
                  <input type="tel" class="form-input" [(ngModel)]="data().person.phone" placeholder="+54 9 291 123-4567" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-input" [(ngModel)]="data().person.email" placeholder="maria@ejemplo.com" />
                </div>
                <div class="grid-2col">
                  <div class="form-group">
                    <label class="form-label">Localidad</label>
                    <input type="text" class="form-input" [(ngModel)]="data().person.locality" placeholder="Puerto Pirámides" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Provincia</label>
                    <input type="text" class="form-input" [(ngModel)]="data().person.province" placeholder="Chubut" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">¿Representa empresa?</label>
                  <div class="radio-cards">
                    @for (opt of YES_NO; track opt.v) {
                      <label class="radio-card" [class.selected]="data().person.represents_company === opt.v">
                        <input type="radio" name="represents_company" [value]="opt.v" [(ngModel)]="data().person.represents_company" />
                        <span class="radio-card-label">{{ opt.label }}</span>
                      </label>
                    }
                  </div>
                </div>
              </div>
            }

            @if (currentStep() === 1) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">Tipo de stand</label>
                  <div class="radio-cards">
                    @for (opt of STAND_TYPES; track opt.value) {
                      <label class="radio-card" [class.selected]="data().info.stand_type === opt.value">
                        <input type="radio" name="stand_type" [value]="opt.value" [(ngModel)]="data().info.stand_type" />
                        <span class="radio-card-label">{{ opt.label }}</span>
                      </label>
                    }
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Nombre del stand / Marca</label>
                  <input type="text" class="form-input" [(ngModel)]="data().info.stand_name" placeholder="Nombre de tu stand" />
                </div>
                <div class="form-group">
                  <label class="form-label">Descripción breve</label>
                  <textarea class="form-textarea" [(ngModel)]="data().info.description" placeholder="Contanos qué ofrecés en tu stand..." rows="3"></textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">Productos / Servicios principales</label>
                  <textarea class="form-textarea" [(ngModel)]="data().info.main_products" placeholder="Ej: Empanadas saladas, dulces caseros..." rows="2"></textarea>
                </div>
                <div class="grid-2col">
                  <div class="form-group">
                    <label class="form-label">Instagram</label>
                    <input type="text" class="form-input" [(ngModel)]="data().info.instagram" placeholder="@mistream" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Sitio web</label>
                    <input type="text" class="form-input" [(ngModel)]="data().info.website" placeholder="https://..." />
                  </div>
                </div>
              </div>
            }

            @if (currentStep() === 2) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">¿Qué días vas a atender el stand?</label>
                  <div class="checkbox-row">
                    @for (day of DAYS; track day.value) {
                      <label class="checkbox-option">
                        <input type="checkbox" [value]="day.value" (change)="toggleDay($event)" />
                        <span class="checkbox-label">{{ day.label }}</span>
                      </label>
                    }
                  </div>
                </div>
<div class="form-group">
  <label class="form-label">Hora de apertura</label>
  <input type="time" class="form-input" [(ngModel)]="data().dates.start_time" />
</div>
              </div>
            }

            @if (currentStep() === 3) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">Tamaño del espacio</label>
                  <div class="radio-cards">
                    @for (sz of SIZES; track sz.value) {
                      <label class="radio-card" [class.selected]="data().equipment.space_size === sz.value">
                        <input type="radio" name="space_size" [value]="sz.value" [(ngModel)]="data().equipment.space_size" />
                        <span class="radio-card-label">{{ sz.label }}</span>
                      </label>
                    }
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">¿Trae su propia estructura?</label>
                  <div class="radio-cards">
                    @for (opt of YES_NO; track opt.v) {
                      <label class="radio-card" [class.selected]="data().equipment.brings_structure === opt.v">
                        <input type="radio" name="brings_structure" [value]="opt.v" [(ngModel)]="data().equipment.brings_structure" />
                        <span class="radio-card-label">{{ opt.label }}</span>
                      </label>
                    }
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Elementos solicitados</label>
                  <div class="checkbox-row">
                    @for (el of EQUIPMENT_ELEMENTS; track el.value) {
                      <label class="checkbox-option">
                        <input type="checkbox" [value]="el.value" (change)="toggleEquipment($event)" />
                        <span class="checkbox-label">{{ el.label }}</span>
                      </label>
                    }
                  </div>
                </div>
                <div class="grid-2col">
                  <div class="form-group">
                    <label class="form-label">Mesas</label>
                    <input type="number" class="form-input" [(ngModel)]="data().equipment.table_count" min="0" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Sillas</label>
                    <input type="number" class="form-input" [(ngModel)]="data().equipment.chair_count" min="0" />
                  </div>
                </div>
              </div>
            }

            @if (currentStep() === 4) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">¿Necesitás electricidad?</label>
                  <div class="radio-cards">
                    @for (opt of YES_NO; track opt.v) {
                      <label class="radio-card" [class.selected]="data().electricity.needs_electricity === opt.v">
                        <input type="radio" name="needs_electricity" [value]="opt.v" [(ngModel)]="data().electricity.needs_electricity" />
                        <span class="radio-card-label">{{ opt.label }}</span>
                      </label>
                    }
                  </div>
                </div>
                @if (data().electricity.needs_electricity === 'Si') {
                  <div class="form-group">
                    <label class="form-label">¿Qué equipamiento necesitás?</label>
                    <textarea class="form-textarea" [(ngModel)]="data().electricity.equipment" placeholder="Ej: 2 luces LED, 1 equipo de sonido..." rows="2"></textarea>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Potencia requerida (vatios)</label>
                    <input type="number" class="form-input" [(ngModel)]="data().electricity.power_watts" min="0" placeholder="Ej: 2200" />
                  </div>
                }
              </div>
            }

            @if (currentStep() === 5) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">¿Preparás comida en tu stand?</label>
                  <div class="radio-cards">
                    @for (opt of YES_NO; track opt.v) {
                      <label class="radio-card" [class.selected]="data().gastronomy.prepares_food === opt.v">
                        <input type="radio" name="prepares_food" [value]="opt.v" [(ngModel)]="data().gastronomy.prepares_food" />
                        <span class="radio-card-label">{{ opt.label }}</span>
                      </label>
                    }
                  </div>
                </div>
                @if (data().gastronomy.prepares_food === 'Si') {
                  <div class="form-group">
                    <label class="form-label">Tipos de comida</label>
                    <div class="checkbox-row">
                      @for (ft of FOOD_TYPES; track ft.value) {
                        <label class="checkbox-option">
                          <input type="checkbox" [value]="ft.value" (change)="toggleFoodType($event)" />
                          <span class="checkbox-label">{{ ft.label }}</span>
                        </label>
                      }
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">¿Utilizás gas?</label>
                    <div class="radio-cards">
                      @for (opt of YES_NO; track opt.v) {
                        <label class="radio-card" [class.selected]="data().gastronomy.uses_gas === opt.v">
                          <input type="radio" name="uses_gas" [value]="opt.v" [(ngModel)]="data().gastronomy.uses_gas" />
                          <span class="radio-card-label">{{ opt.label }}</span>
                        </label>
                      }
                    </div>
                  </div>
                  @if (data().gastronomy.uses_gas === 'Si') {
                    <div class="grid-2col">
                      <div class="form-group">
                        <label class="form-label">Tipo de gas</label>
                        <select class="form-select" [(ngModel)]="data().gastronomy.gas_type">
                          <option value="">Seleccionar</option>
                          @for (gt of GAS_TYPES; track gt.value) {
                            <option [value]="gt.value">{{ gt.label }}</option>
                          }
                        </select>
                      </div>
                      <div class="form-group">
                        <label class="form-label">Cantidad (kg/mes)</label>
                        <input type="number" class="form-input" [(ngModel)]="data().gastronomy.gas_amount" min="0" />
                      </div>
                    </div>
                  }
                  <div class="form-group">
                    <label class="form-label">¿Tenés certificación sanitaria?</label>
                    <div class="radio-cards">
                      @for (opt of YES_NO; track opt.v) {
                        <label class="radio-card" [class.selected]="data().gastronomy.has_certification === opt.v">
                          <input type="radio" name="has_certification" [value]="opt.v" [(ngModel)]="data().gastronomy.has_certification" />
                          <span class="radio-card-label">{{ opt.label }}</span>
                        </label>
                      }
                    </div>
                  </div>
                }
              </div>
             }

             @if (currentStep() === 6) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">¿Cuántas personas va a trabajar en el stand?</label>
                  <input type="number" class="form-input" [(ngModel)]="data().personnel.count" min="0" />
                </div>
              </div>
            }

            @if (currentStep() === 7) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">¿Necesitás ingreso de vehículo?</label>
                  <div class="radio-cards">
                    @for (opt of YES_NO; track opt.v) {
                      <label class="radio-card" [class.selected]="data().logistics.needs_vehicle === opt.v">
                        <input type="radio" name="needs_vehicle" [value]="opt.v" [(ngModel)]="data().logistics.needs_vehicle" />
                        <span class="radio-card-label">{{ opt.label }}</span>
                      </label>
                    }
                  </div>
                </div>
                @if (data().logistics.needs_vehicle === 'Si') {
                  <div class="grid-2col">
                    <div class="form-group">
                      <label class="form-label">Tipo de vehículo</label>
                      <select class="form-select" [(ngModel)]="data().logistics.vehicle_type">
                        <option value="">Seleccionar</option>
                        @for (vt of VEHICLE_TYPES; track vt.value) {
                          <option [value]="vt.value">{{ vt.label }}</option>
                        }
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Patente</label>
                      <input type="text" class="form-input" [(ngModel)]="data().logistics.vehicle_plate" placeholder="AA 123 BB" />
                    </div>
                  </div>
                }
                <div class="form-group">
                  <label class="form-label">¿Necesitás ingreso anticipado?</label>
                  <div class="radio-cards">
                    @for (opt of YES_NO; track opt.v) {
                      <label class="radio-card" [class.selected]="data().logistics.early_access === opt.v">
                        <input type="radio" name="early_access" [value]="opt.v" [(ngModel)]="data().logistics.early_access" />
                        <span class="radio-card-label">{{ opt.label }}</span>
                      </label>
                    }
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">¿Necesitás ayuda del staff del festival?</label>
                  <div class="radio-cards">
                    @for (opt of YES_NO; track opt.v) {
                      <label class="radio-card" [class.selected]="data().logistics.needs_help === opt.v">
                        <input type="radio" name="needs_help" [value]="opt.v" [(ngModel)]="data().logistics.needs_help" />
                        <span class="radio-card-label">{{ opt.label }}</span>
                      </label>
                    }
                  </div>
                </div>
              </div>
            }

             @if (currentStep() === 8) {
               <div class="tf-question">
                 <div class="upload-card">
                  <div class="upload-card-header">DNI — Frente</div>
                  @if (data().docs.dni_front_url) {
                    <div class="upload-success"><a [href]="data().docs.dni_front_url" target="_blank">Ver archivo</a></div>
                  } @else {
                    <div class="upload-area" (click)="docInput_front.click()">
                      <input type="file" #docInput_front accept="image/*" hidden (change)="uploadDoc('dni_front', $event)" />
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span>Subir DNI</span>
                    </div>
                  }
                </div>
                <div class="upload-card">
                  <div class="upload-card-header">DNI — Dorso</div>
                  @if (data().docs.dni_back_url) {
                    <div class="upload-success"><a [href]="data().docs.dni_back_url" target="_blank">Ver archivo</a></div>
                  } @else {
                    <div class="upload-area" (click)="docInput_back.click()">
                      <input type="file" #docInput_back accept="image/*" hidden (change)="uploadDoc('dni_back', $event)" />
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span>Subir DNI</span>
                    </div>
                  }
                </div>
                <div class="upload-card">
                  <div class="upload-card-header">CUIT</div>
                  @if (data().docs.cuit_url) {
                    <div class="upload-success"><a [href]="data().docs.cuit_url" target="_blank">Ver archivo</a></div>
                  } @else {
                    <div class="upload-area" (click)="docInput_cuit.click()">
                      <input type="file" #docInput_cuit accept=".pdf,.jpg,.png" hidden (change)="uploadDoc('cuit', $event)" />
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span>Subir CUIT</span>
                    </div>
                  }
                </div>
                <div class="upload-card">
                  <div class="upload-card-header">Logo o imagen del stand</div>
                  @if (data().docs.logo_url) {
                    <img [src]="data().docs.logo_url" alt="Logo" class="logo-preview" />
                  } @else {
                    <div class="upload-area" (click)="docInput_logo.click()">
                      <input type="file" #docInput_logo accept="image/*" hidden (change)="uploadDoc('logo', $event)" />
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 16 12 12"/><line x1="12" y1="12" x2="12" y2="12"/></svg>
                      <span>Subir logo</span>
                    </div>
                  }
                </div>
                <div class="form-group">
                  <label class="form-label">Fotos del stand</label>
                  <div class="photo-thumbs">
                    @for (photo of data().docs.stand_photos; track $index) {
                      <img [src]="photo" [alt]="'Foto ' + ($index + 1)" class="photo-thumb" />
                    }
                  </div>
                  <div class="upload-area" (click)="docInput_photos.click()">
                    <input type="file" #docInput_photos accept="image/*" hidden multiple (change)="uploadPhotos($event)" />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>Agregar fotos</span>
                  </div>
                </div>
              </div>
            }

             @if (currentStep() === 9) {
               <div class="tf-question">
                 <div class="summary">
                  <div class="summary-group">
                    <h3 class="summary-title">Persona</h3>
                    <p><strong>Nombre:</strong> {{ data().person.full_name || '(sin completar)' }}</p>
                    <p><strong>Email:</strong> {{ data().person.email || '(sin completar)' }}</p>
                    <p><strong>Teléfono:</strong> {{ data().person.phone || '(sin completar)' }}</p>
                  </div>
                  <div class="summary-group">
                    <h3 class="summary-title">Stand</h3>
                    <p><strong>Tipo:</strong> {{ getStandTypeLabel(data().info.stand_type) }}</p>
                    <p><strong>Nombre:</strong> {{ data().info.stand_name || '(sin completar)' }}</p>
                  </div>
                  <div class="summary-group">
                    <h3 class="summary-title">Equipamiento</h3>
                    <p><strong>Espacio:</strong> {{ getSpaceLabel(data().equipment.space_size) }}</p>
                    <p><strong>Electricidad:</strong> {{ data().electricity.needs_electricity }}</p>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Observaciones adicionales</label>
                  <textarea class="form-textarea" [(ngModel)]="data().observations" placeholder="Cualquier otra información relevante..." rows="3"></textarea>
                </div>
              </div>
            }
          </div>
        </div>

        @if (currentStep() < STEPS.length - 1) {
          <div class="next-section">
            <button type="button" class="btn-next-large" (click)="nextStep()" [disabled]="!canProceed()">
              CONTINUAR
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        } @else {
          <div class="next-section">
            <button type="button" class="btn-next-large btn-submit" (click)="onSubmit()" [disabled]="submitting()">
              @if (submitting()) {
                <span class="spinner"></span> Enviando...
              } @else {
                ENVIAR SOLICITUD
              }
            </button>
          </div>
        }
      </div>

      @if (submitSuccess()) {
        <div class="tf-submitting-screen">
          <div class="tf-submitting-card">
            <div class="tf-success-icon">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 class="tf-success-title">¡Solicitud enviada!</h2>
            <p class="tf-success-sub">Tu solicitud de stand fue registrada correctamente.</p>
            <p class="tf-success-id">N° <strong>{{ submittedId() }}</strong></p>
            <p class="tf-success-detail">Te contactaremos a la brevedad posible.</p>
            <a routerLink="/" class="btn btn-primary tf-success-home">Volver al inicio</a>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './stands-form.scss',
})
export class StandsFormPageComponent {
  STEPS = STEPS;
  DAYS = DAYS;
  STAND_TYPES = STAND_TYPES;
  SIZES = SIZES;
  EQUIPMENT_ELEMENTS = EQUIPMENT_ELEMENTS;
  GAS_TYPES = GAS_TYPES;
  FOOD_TYPES = FOOD_TYPES;
  VEHICLE_TYPES = VEHICLE_TYPES;
  YES_NO = YES_NO;

  data = signal(createEmptyStandData());
  currentStep = signal(0);
  submitting = signal(false);
  submitSuccess = signal(false);
  submittedId = signal('');

  private standsService = inject(StandsService);

  progressPercent = computed(() => ((this.currentStep() + 1) / this.STEPS.length) * 100);

  toggleDay(event: any): void {
    const value = event.target.value;
    const d = this.data();
    if (event.target.checked) {
      d.dates.days.push(value);
    } else {
      d.dates.days = d.dates.days.filter(day => day !== value);
    }
  }

  toggleEquipment(event: any): void {
    const value = event.target.value;
    const d = this.data();
    if (event.target.checked) {
      d.equipment.elements.push(value);
    } else {
      d.equipment.elements = d.equipment.elements.filter(el => el !== value);
    }
  }

  toggleFoodType(event: any): void {
    const value = event.target.value;
    const g = this.data().gastronomy;
    if (event.target.checked) {
      g.food_types.push(value);
    } else {
      g.food_types = g.food_types.filter(ft => ft !== value);
    }
  }

  uploadDoc(docType: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const placeholderUrl = `https://placeholder.unsplash.com/400x300?${docType}&${Date.now()}`;
    const d = this.data();

    switch (docType) {
      case 'dni_front': d.docs.dni_front_url = placeholderUrl; break;
      case 'dni_back': d.docs.dni_back_url = placeholderUrl; break;
      case 'cuit': d.docs.cuit_url = placeholderUrl; break;
      case 'logo': d.docs.logo_url = placeholderUrl; break;
    }
    input.value = '';
  }

  uploadPhotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    files.slice(0, 5).forEach(() => {
      this.data().docs.stand_photos.push(
        `https://placeholder.unsplash.com/300x200?photo&${Date.now()}`
      );
    });
    input.value = '';
  }

  getStandTypeLabel(val: string): string {
    return STAND_TYPES.find(s => s.value === val)?.label || val;
  }

  getSpaceLabel(val: string): string {
    return SIZES.find(s => s.value === val)?.label || val;
  }

  getEquipmentLabels(vals: string[]): string {
    if (!vals || vals.length === 0) return '-';
    return vals.map(v => EQUIPMENT_ELEMENTS.find(e => e.value === v)?.label || v).join(', ');
  }

  getFoodLabels(vals: string[]): string {
    if (!vals || vals.length === 0) return '-';
    return vals.map(v => FOOD_TYPES.find(f => f.value === v)?.label || v).join(', ');
  }

  getGasTypeLabel(val: string): string {
    return GAS_TYPES.find(g => g.value === val)?.label || val;
  }

  nextStep(): void {
    const step = this.STEPS[this.currentStep()];
    if (step && this.hasValidationError(step.key)) {
      return;
    }
    if (this.currentStep() < this.STEPS.length - 1) {
      this.currentStep.update(v => v + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(v => v - 1);
    }
  }

  canProceed(): boolean {
    const step = this.STEPS[this.currentStep()];
    if (!step) return true;
    return !this.hasValidationError(step.key);
  }

  hasValidationError(key: string): boolean {
    const d = this.data();
    switch (key) {
      case 'person':
        return !d.person.full_name || !d.person.dni || !d.person.phone ||
               !d.person.email || !d.person.locality || !d.person.province ||
               !d.person.represents_company;
      case 'info':
        return !d.info.stand_type || !d.info.stand_name || !d.info.main_products;
      case 'dates':
        return d.dates.days.length === 0 || !d.dates.start_time;
      case 'equipment':
        return !d.equipment.space_size || !d.equipment.brings_structure ||
               d.equipment.elements.length === 0;
      case 'electricity':
        return !d.electricity.needs_electricity;
      case 'docs':
        return !d.docs.dni_front_url || !d.docs.dni_back_url || !d.docs.cuit_url ||
               !d.docs.logo_url || d.docs.stand_photos.length === 0;
      default:
        return false;
    }
  }

  buildPayload(): StandCreate {
    const d = this.data();
    return {
      person: d.person,
      info: {
        stand_type: d.info.stand_type,
        stand_name: d.info.stand_name,
        description: d.info.description || undefined,
        main_products: d.info.main_products,
        instagram: d.info.instagram || undefined,
        website: d.info.website || undefined,
      },
      dates: d.dates,
      equipment: {
        space_size: d.equipment.space_size,
        brings_structure: d.equipment.brings_structure,
        elements: d.equipment.elements,
        table_count: d.equipment.table_count ?? undefined,
        chair_count: d.equipment.chair_count ?? undefined,
      },
      electricity: {
        needs_electricity: d.electricity.needs_electricity,
        equipment: d.electricity.equipment ? [d.electricity.equipment] : [],
        power_watts: d.electricity.power_watts ?? undefined,
      },
      observations: d.observations || undefined,
      gastronomy: d.gastronomy.prepares_food === 'Si' ? d.gastronomy : undefined,
      personnel: d.personnel.count > 0 ? d.personnel : undefined,
      logistics: d.logistics.needs_vehicle === 'Si' ? d.logistics : undefined,
      docs: d.docs,
    };
  }

  onSubmit(): void {
    this.submitting.set(true);
    this.standsService.createStand(this.buildPayload()).subscribe({
      next: (result) => {
        this.submittedId.set(result.id);
        this.submitSuccess.set(true);
        this.submitting.set(false);
      },
      error: (err) => {
        this.submitting.set(false);
        alert(err.error?.detail || 'Error al enviar la solicitud');
      },
    });
  }
}
