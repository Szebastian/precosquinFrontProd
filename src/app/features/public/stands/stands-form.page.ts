import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StandsService, StandCreate } from '../../../core/services/stands.service';

interface AccompanyingPerson {
  fullName: string;
  dni: string;
}

interface StandData {
  person: {
    full_name: string;
    dni: string;
    phone: string;
    email: string;
    locality: string;
    province: string;
  };
  info: {
    stand_type: string;
    stand_name: string;
    description: string;
    instagram: string;
  };
  dates: {
    days: string[];
  };
  equipment: {
    brings_structure: 'Si' | 'No';
    table_count: number | null;
    chair_count: number | null;
  };
  electricity: {
    needs_electricity: 'Si' | 'No';
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
  accompanyingPersons: AccompanyingPerson[];
  docs: {
    stand_photos: string[];
  };
  observations: string;
}

function createEmptyStandData(): StandData {
  return {
    person: { full_name: '', dni: '', phone: '', email: '', locality: '', province: '' },
    info: { stand_type: '', stand_name: '', description: '', instagram: '' },
    dates: { days: [] },
    equipment: { brings_structure: 'No', table_count: null, chair_count: null },
    electricity: { needs_electricity: 'No' },
    gastronomy: { prepares_food: 'No', food_types: [], uses_gas: 'No', gas_type: '', gas_amount: null, has_certification: 'No', certification_doc_url: '' },
    personnel: { count: 0 },
    accompanyingPersons: [],
    docs: { stand_photos: [] },
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

const PROVINCIAS = [
  { value: 'Chubut', label: 'Chubut' },
  { value: 'Buenos Aires', label: 'Buenos Aires' },
  { value: 'CABA', label: 'Ciudad Autónoma de Buenos Aires' },
  { value: 'Córdoba', label: 'Córdoba' },
  { value: 'Santa Fe', label: 'Santa Fe' },
  { value: 'Mendoza', label: 'Mendoza' },
  { value: 'Neuquén', label: 'Neuquén' },
  { value: 'Río Negro', label: 'Río Negro' },
  { value: 'Santa Cruz', label: 'Santa Cruz' },
  { value: 'Tierra del Fuego', label: 'Tierra del Fuego' },
  { value: 'San Juan', label: 'San Juan' },
  { value: 'San Luis', label: 'San Luis' },
  { value: 'La Pampa', label: 'La Pampa' },
  { value: 'Entre Ríos', label: 'Entre Ríos' },
  { value: 'Corrientes', label: 'Corrientes' },
  { value: 'Misiones', label: 'Misiones' },
  { value: 'Formosa', label: 'Formosa' },
  { value: 'Chaco', label: 'Chaco' },
  { value: 'Santiago del Estero', label: 'Santiago del Estero' },
  { value: 'Tucumán', label: 'Tucumán' },
  { value: 'Salta', label: 'Salta' },
  { value: 'Jujuy', label: 'Jujuy' },
  { value: 'Catamarca', label: 'Catamarca' },
  { value: 'La Rioja', label: 'La Rioja' },
];

const LOCALIDADES_CHUBUT = [
  { value: 'Puerto Madryn', label: 'Puerto Madryn' },
  { value: 'Puerto Pirámides', label: 'Puerto Pirámides' },
  { value: 'Trelew', label: 'Trelew' },
  { value: 'Rawson', label: 'Rawson' },
  { value: 'Comodoro Rivadavia', label: 'Comodoro Rivadavia' },
  { value: 'Esquel', label: 'Esquel' },
  { value: 'Gaiman', label: 'Gaiman' },
  { value: 'Dolavon', label: 'Dolavon' },
  { value: 'Camarones', label: 'Camarones' },
  { value: 'Lago Puelo', label: 'Lago Puelo' },
  { value: 'El Hoyo', label: 'El Hoyo' },
  { value: 'Epuyén', label: 'Epuyén' },
  { value: 'Cholila', label: 'Cholila' },
  { value: 'Gobernador Costa', label: 'Gobernador Costa' },
  { value: 'Paso de Indios', label: 'Paso de Indios' },
  { value: 'Sarmiento', label: 'Sarmiento' },
  { value: 'Telsen', label: 'Telsen' },
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

const YES_NO = [{ v: 'Si', label: 'Sí' }, { v: 'No', label: 'No' }];

const STEPS = [
  { key: 'person', label: 'Datos de la persona' },
  { key: 'info', label: 'Información del stand' },
  { key: 'dates', label: 'Días y horarios' },
  { key: 'equipment', label: 'Equipamiento' },
  { key: 'electricity', label: 'Electricidad' },
  { key: 'gastronomy', label: 'Gastronomía' },
  { key: 'personnel', label: 'Personal' },
  { key: 'accompanying', label: 'Acompañantes' },
  { key: 'docs', label: 'Fotos del stand' },
  { key: 'confirm', label: 'Confirmar y enviar' },
];

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
                    <label class="form-label">Provincia</label>
                    <select class="form-select" [(ngModel)]="data().person.province">
                      <option value="">Seleccionar</option>
                      @for (prov of PROVINCIAS; track prov.value) {
                        <option [value]="prov.value">{{ prov.label }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Localidad</label>
                    @if (data().person.province === 'Chubut') {
                      <select class="form-select" [(ngModel)]="data().person.locality">
                        <option value="">Seleccionar</option>
                        @for (loc of LOCALIDADES_CHUBUT; track loc.value) {
                          <option [value]="loc.value">{{ loc.label }}</option>
                        }
                      </select>
                    } @else {
                      <input type="text" class="form-input" [(ngModel)]="data().person.locality" placeholder="Nombre de localidad" />
                    }
                  </div>
                </div>
              </div>
            }

            @if (currentStep() === 1) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">Tipo de stand</label>
                  <select class="form-select" [(ngModel)]="data().info.stand_type">
                    <option value="">Seleccionar tipo</option>
                    @for (opt of STAND_TYPES; track opt.value) {
                      <option [value]="opt.value">{{ opt.label }}</option>
                    }
                  </select>
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
                  <label class="form-label">Instagram</label>
                  <input type="text" class="form-input" [(ngModel)]="data().info.instagram" placeholder="@mistream" />
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
               </div>
            }

            @if (currentStep() === 3) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">¿Trae su propia estructura?</label>
                  <select class="form-select" [(ngModel)]="data().equipment.brings_structure">
                    @for (opt of YES_NO; track opt.v) {
                      <option [value]="opt.v">{{ opt.label }}</option>
                    }
                  </select>
                </div>
                <div class="grid-2col">
                  <div class="form-group">
                    <label class="form-label">Mesas</label>
                    <select class="form-select" [(ngModel)]="data().equipment.table_count">
                      <option [ngValue]="null">0</option>
                      <option [ngValue]="1">1</option>
                      <option [ngValue]="2">2</option>
                      <option [ngValue]="3">3</option>
                      <option [ngValue]="4">4</option>
                      <option [ngValue]="5">5</option>
                      <option [ngValue]="6">6</option>
                      <option [ngValue]="8">8</option>
                      <option [ngValue]="10">10</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Sillas</label>
                    <select class="form-select" [(ngModel)]="data().equipment.chair_count">
                      <option [ngValue]="null">0</option>
                      <option [ngValue]="2">2</option>
                      <option [ngValue]="4">4</option>
                      <option [ngValue]="6">6</option>
                      <option [ngValue]="8">8</option>
                      <option [ngValue]="10">10</option>
                      <option [ngValue]="12">12</option>
                      <option [ngValue]="15">15</option>
                      <option [ngValue]="20">20</option>
                    </select>
                  </div>
                </div>
              </div>
            }

            @if (currentStep() === 4) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">¿Necesitás electricidad?</label>
                  <select class="form-select" [(ngModel)]="data().electricity.needs_electricity">
                    @for (opt of YES_NO; track opt.v) {
                      <option [value]="opt.v">{{ opt.label }}</option>
                    }
                  </select>
                </div>
              </div>
            }

            @if (currentStep() === 5) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">¿Preparás comida en tu stand?</label>
                  <select class="form-select" [(ngModel)]="data().gastronomy.prepares_food">
                    @for (opt of YES_NO; track opt.v) {
                      <option [value]="opt.v">{{ opt.label }}</option>
                    }
                  </select>
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
                    <select class="form-select" [(ngModel)]="data().gastronomy.uses_gas">
                      @for (opt of YES_NO; track opt.v) {
                        <option [value]="opt.v">{{ opt.label }}</option>
                      }
                    </select>
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
                        <select class="form-select" [(ngModel)]="data().gastronomy.gas_amount">
                          <option [ngValue]="null">No aplica</option>
                          <option [ngValue]="5">Hasta 5 kg</option>
                          <option [ngValue]="10">5 - 10 kg</option>
                          <option [ngValue]="20">10 - 20 kg</option>
                          <option [ngValue]="30">20 - 30 kg</option>
                          <option [ngValue]="50">Más de 30 kg</option>
                        </select>
                      </div>
                    </div>
                  }
                  <div class="form-group">
                    <label class="form-label">¿Tenés certificación sanitaria?</label>
                    <select class="form-select" [(ngModel)]="data().gastronomy.has_certification">
                      @for (opt of YES_NO; track opt.v) {
                        <option [value]="opt.v">{{ opt.label }}</option>
                      }
                    </select>
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
                <p class="form-hint" style="margin-top: 0; margin-bottom: 1rem;">Registrá a las personas que te acompañan (opcional)</p>

                @for (person of data().accompanyingPersons; track $index; let i = $index) {
                  <div class="person-card">
                    <div class="person-header">
                      <span class="person-number">Persona {{ i + 1 }}</span>
                      <button type="button" class="btn-remove-person" (click)="removePerson(i)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    <div class="grid-2col">
                      <div class="form-group">
                        <label class="form-label">Nombre completo</label>
                        <input type="text" class="form-input" [ngModel]="person.fullName"
                          (ngModelChange)="person.fullName = $event"
                          [name]="'personName_' + i"
                          placeholder="Ej: Juan García" />
                      </div>
                      <div class="form-group">
                        <label class="form-label">DNI</label>
                        <input type="text" class="form-input" [ngModel]="person.dni"
                          (ngModelChange)="person.dni = $event"
                          [name]="'personDni_' + i"
                          placeholder="12.345.678" maxlength="10" />
                      </div>
                    </div>
                  </div>
                }

                @if (data().accompanyingPersons.length === 0) {
                  <div class="empty-accompanying">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <p>No registraste personas acompañantes</p>
                    <span>Podés agregar personas para habilitar su ingreso</span>
                  </div>
                }

                <button type="button" class="btn-add-person" (click)="addPerson()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  Agregar persona
                </button>

                <p class="form-hint">Si no llevás acompañantes, podés continuar directamente.</p>
              </div>
             }

            @if (currentStep() === 8) {
              <div class="tf-question">
                <div class="form-group">
                  <label class="form-label">Fotos del stand</label>
                  <p class="form-hint">Subí fotos de tu stand o de lo que vas a ofrecer</p>
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
                   <p><strong>Electricidad:</strong> {{ data().electricity.needs_electricity }}</p>
                  </div>
                  @if (data().accompanyingPersons.length > 0) {
                    <div class="summary-group">
                      <h3 class="summary-title">Acompañantes</h3>
                      <p><strong>Cantidad:</strong> {{ data().accompanyingPersons.length }} persona(s)</p>
                      @for (person of data().accompanyingPersons; track $index) {
                        <p>{{ person.fullName || '(sin nombre)' }} — DNI: {{ person.dni || '(sin DNI)' }}</p>
                      }
                    </div>
                  }
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
          <div class="nav-section">
            @if (currentStep() > 0) {
              <button type="button" class="btn-back" (click)="prevStep()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                VOLVER
              </button>
            }
            <div class="next-wrapper">
              <button type="button" class="btn-next-large" (click)="nextStep()" [disabled]="!canProceed()">
                CONTINUAR
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>
        } @else {
          <div class="nav-section">
            @if (currentStep() > 0) {
              <button type="button" class="btn-back" (click)="prevStep()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                VOLVER
              </button>
            }
            <div class="next-wrapper">
              <button type="button" class="btn-next-large btn-submit" (click)="onSubmit()" [disabled]="submitting()">
                @if (submitting()) {
                  <span class="spinner"></span> Enviando...
                } @else {
                  ENVIAR SOLICITUD
                }
              </button>
            </div>
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
            
            <div class="tf-success-details">
              <div class="tf-success-row">
                <span class="tf-success-label">N° de solicitud</span>
                <span class="tf-success-value">{{ submittedId() }}</span>
              </div>
              <div class="tf-success-row">
                <span class="tf-success-label">Email</span>
                <span class="tf-success-value">{{ data().person.email }}</span>
              </div>
            </div>

            <div class="tf-success-email-info">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <p>Te enviamos un comprobante a <strong>{{ data().person.email }}</strong></p>
            </div>

            <p class="tf-success-detail">Te contactaremos a la brevedad posible.</p>
            
            <div class="tf-success-actions">
              <a routerLink="/" class="btn-success-home">Volver al inicio</a>
            </div>
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
  PROVINCIAS = PROVINCIAS;
  LOCALIDADES_CHUBUT = LOCALIDADES_CHUBUT;
  SIZES = SIZES;
  EQUIPMENT_ELEMENTS = EQUIPMENT_ELEMENTS;
  GAS_TYPES = GAS_TYPES;
  FOOD_TYPES = FOOD_TYPES;
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

   toggleFoodType(event: any): void {
    const value = event.target.value;
    const g = this.data().gastronomy;
    if (event.target.checked) {
      g.food_types.push(value);
    } else {
      g.food_types = g.food_types.filter(ft => ft !== value);
    }
  }

  addPerson(): void {
    const d = this.data();
    d.accompanyingPersons.push({ fullName: '', dni: '' });
  }

  removePerson(index: number): void {
    const d = this.data();
    d.accompanyingPersons.splice(index, 1);
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
               !d.person.email || !d.person.locality || !d.person.province;
      case 'info':
        return !d.info.stand_type || !d.info.stand_name;
      case 'dates':
        return d.dates.days.length === 0;
      case 'equipment':
        return !d.equipment.brings_structure;
      case 'electricity':
        return !d.electricity.needs_electricity;
      case 'gastronomy':
        return !d.gastronomy.prepares_food;
      case 'docs':
        return false;
      default:
        return false;
    }
  }

  buildPayload(): StandCreate {
    const d = this.data();
    const accompanyingNames = d.accompanyingPersons.length > 0
      ? d.accompanyingPersons.map(p => ({ name: p.fullName, id_number: p.dni }))
      : undefined;
    return {
      person: d.person,
      info: {
        stand_type: d.info.stand_type,
        stand_name: d.info.stand_name,
        description: d.info.description || undefined,
        instagram: d.info.instagram || undefined,
      },
      dates: d.dates,
      equipment: {
        brings_structure: d.equipment.brings_structure,
        table_count: d.equipment.table_count ?? undefined,
        chair_count: d.equipment.chair_count ?? undefined,
      },
      electricity: {
        needs_electricity: d.electricity.needs_electricity,
      },
      observations: d.observations || undefined,
      gastronomy: d.gastronomy.prepares_food === 'Si' ? d.gastronomy : undefined,
      personnel: {
        count: d.personnel.count,
        names: accompanyingNames,
      },
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
