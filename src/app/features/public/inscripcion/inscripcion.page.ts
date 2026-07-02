import { Component, signal, computed, inject, OnDestroy, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface InscripcionResult {
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

interface InscripcionData {
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

@Component({
  selector: 'app-inscripcion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="public-page">
      @if (currentStep() < 8) {
        <nav class="form-nav">
          <a routerLink="/" class="nav-brand">
            <img src="assets/logo.svg" alt="Precosquin" class="nav-logo" />
            <span>Precosquin</span>
          </a>
          <a routerLink="/" class="nav-link">Volver al inicio</a>
        </nav>
      }

      @if (currentStep() < 8) {
        <div class="form-wrapper">
          <div class="form-card animate-scale-in">
            <div class="form-header">
              <h1>Inscripción de Artista</h1>
              <p>Completá los pasos para participar en Precosquin</p>
            </div>

            <div class="steps-indicator">
              <div class="progress-bar-wrapper">
                <div class="progress-bar-fill" [style.width.%]="getProgressPercentage()"></div>
                <span class="progress-bar-text">{{ getProgressPercentage() }}% completado</span>
              </div>
              <div class="steps-row">
                @for (step of visibleSteps(); track step.number; let i = $index) {
                  <div class="step" [class.active]="currentStep() === step.number" [class.completed]="currentStep() > step.number">
                    <div class="step-circle">
                      @if (currentStep() > step.number) {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                      } @else {
                        {{ step.number }}
                      }
                    </div>
                    <span class="step-label">{{ step.label }}</span>
                  </div>
                  @if (i < visibleSteps().length - 1) {
                    <div class="step-line" [class.completed]="currentStep() > step.number"></div>
                  }
                }
              </div>
            </div>

            <form (submit)="onSubmit($event)" class="inscription-form">

            @if (currentStep() === 1) {
              <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
                <h2 class="step-title">Datos Generales del Participante</h2>
                <p class="step-desc">Completá tus datos personales de contacto</p>

                <div class="form-group">
                  <label class="form-label" for="fullName">Nombre y apellido *</label>
                  <input type="text" id="fullName" name="fullName" required class="form-input"
                    [(ngModel)]="data.fullName" placeholder="Ej: Juan Carlos Gómez" />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label" for="dni">DNI *</label>
                    <input type="text" id="dni" name="dni" required class="form-input"
                      [(ngModel)]="data.dni" placeholder="12345678" maxlength="8" />
                    <span class="form-hint">Solo números, 7 u 8 dígitos</span>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="birthDate">Fecha de nacimiento *</label>
                    <input type="date" id="birthDate" name="birthDate" required class="form-input"
                      [(ngModel)]="data.birthDate" (ngModelChange)="onBirthDateChange()" />
                    <span class="form-hint">Debés tener al menos 16 años</span>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label" for="age">Edad</label>
                    <input type="text" id="age" name="age" class="form-input form-input-readonly"
                      [value]="data.age !== null ? data.age + ' años' : '—'" readonly />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="address">Domicilio *</label>
                    <input type="text" id="address" name="address" required class="form-input"
                      [(ngModel)]="data.address" placeholder="Calle, número, piso, depto" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label" for="locality">Localidad *</label>
                    <input type="text" id="locality" name="locality" required class="form-input"
                      [(ngModel)]="data.locality" placeholder="Ej: Puerto Pirámides" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="province">Provincia *</label>
                    <select id="province" name="province" required class="form-input"
                      [(ngModel)]="data.province">
                      <option value="">Seleccionar provincia</option>
                      @for (prov of provincias; track prov) {
                        <option [value]="prov">{{ prov }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label" for="phone">Teléfono de contacto *</label>
                    <input type="tel" id="phone" name="phone" required class="form-input"
                      [(ngModel)]="data.phone" placeholder="+54 11 1234-5678" />
                    <span class="form-hint">Con código de país y área</span>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="email">Correo electrónico *</label>
                    <input type="email" id="email" name="email" required class="form-input"
                      [(ngModel)]="data.email" placeholder="tu&#64;ejemplo.com" />
                    <span class="form-hint">Recibirás confirmación en este email</span>
                  </div>
                </div>
              </div>
            }

            @if (currentStep() === 2) {
              <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
                <h2 class="step-title">Rubro de Participación</h2>
                <p class="step-desc">Seleccioná la categoría y subcategoría de tu presentación</p>

                <div class="form-group">
                  <label class="form-label">Categoría *</label>
                  <div class="category-cards">
                    <label class="category-card" [class.selected]="data.category === 'musica'">
                      <input type="radio" name="category" value="musica" [(ngModel)]="data.category" (ngModelChange)="onCategoryChange()" />
                      <div class="category-icon category-icon-music">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                        </svg>
                      </div>
                      <div>
                        <span class="category-name">Música</span>
                        <span class="category-desc">6 subcategorías</span>
                      </div>
                    </label>
                    <label class="category-card" [class.selected]="data.category === 'danza'">
                      <input type="radio" name="category" value="danza" [(ngModel)]="data.category" (ngModelChange)="onCategoryChange()" />
                      <div class="category-icon category-icon-dance">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                        </svg>
                      </div>
                      <div>
                        <span class="category-name">Danza</span>
                        <span class="category-desc">6 subcategorías</span>
                      </div>
                    </label>
                  </div>
                </div>

                @if (data.category) {
                  <div class="form-group animate-fade-in">
                    <label class="form-label">Subcategoría *</label>
                    <div class="subcategory-grid">
                      @for (sub of subcategories(); track sub.id) {
                        <label class="subcategory-chip" [class.selected]="data.subcategory === sub.id">
                          <input type="radio" name="subcategory" [value]="sub.id" [(ngModel)]="data.subcategory" />
                          {{ sub.name }}
                        </label>
                      }
                    </div>
                  </div>
                }
              </div>
            }

            @if (currentStep() === 3) {
              <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
                <h2 class="step-title">Integrantes del Grupo</h2>
                <p class="step-desc">Agregá los datos de cada integrante</p>

                @for (member of data.members; track $index; let i = $index) {
                  <div class="member-card">
                    <div class="member-header">
                      <h3 class="member-number">Integrante {{ i + 1 }}</h3>
                      @if (data.members.length > 1) {
                        <button type="button" class="btn-remove" (click)="removeMember(i)">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                          Quitar
                        </button>
                      }
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label class="form-label">Nombre completo *</label>
                        <input type="text" class="form-input" [(ngModel)]="member.fullName" placeholder="Nombre y apellido" [name]="'memberName' + i" required />
                      </div>
                      <div class="form-group">
                        <label class="form-label">DNI *</label>
                        <input type="text" class="form-input" [(ngModel)]="member.dni" placeholder="12345678" [name]="'memberDni' + i" required />
                      </div>
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label class="form-label">Edad</label>
                        <input type="number" class="form-input" [(ngModel)]="member.age" placeholder="Ej: 25" [name]="'memberAge' + i" min="0" max="120" />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Función *</label>
                        <select class="form-input" [(ngModel)]="member.role" [name]="'memberRole' + i" required>
                          <option value="">Seleccionar función</option>
                          <option value="cantante">Cantante</option>
                          <option value="guitarrista">Guitarrista</option>
                          <option value="bailarin">Bailarín</option>
                          <option value="baterista">Baterista</option>
                          <option value="bajista">Bajista</option>
                          <option value="tecladista">Tecladista</option>
                          <option value="violinista">Violinista</option>
                          <option value="acordeonista">Acordeonista</option>
                          <option value="percusionista">Percusionista</option>
                          <option value="corista">Corista</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                    </div>
                  </div>
                }

                <button type="button" class="btn btn-add-member" (click)="addMember()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5v14"/><path d="M5 12h14"/>
                  </svg>
                  Agregar Integrante
                </button>
              </div>
            }

            @if (currentStep() === 4) {
              <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
                @if (data.category === 'musica') {
                  <h2 class="step-title">Información Artística — Música</h2>
                  <p class="step-desc">Completá los datos de tu presentación musical</p>

                  @if (data.subcategory === 'cancion_inedita') {
                    <div class="alert-info" style="margin-bottom: var(--space-4);">
                      <strong>Atención:</strong> Para Canción Inédita deberás cargar la letra y la partitura en el paso 6 (Archivos).
                    </div>
                  }

                  <div class="form-group">
                    <label class="form-label" for="artisticName">Nombre artístico</label>
                    <input type="text" id="artisticName" name="artisticName" class="form-input"
                      [(ngModel)]="data.artisticName" placeholder="Si tenés nombre artístico, ingresalo" />
                  </div>

                  <div class="form-group">
                    <label class="form-label">Listado de 6 temas</label>
                    <div class="themes-table-wrapper">
                      <table class="themes-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Título</th>
                            <th>Ritmo</th>
                            <th>Autor</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (theme of data.themes; track $index; let i = $index) {
                            <tr>
                              <td class="theme-number">{{ i + 1 }}</td>
                              <td><input type="text" class="form-input table-input" [(ngModel)]="theme.title" [name]="'themeTitle' + i" placeholder="Título del tema" /></td>
                              <td><input type="text" class="form-input table-input" [(ngModel)]="theme.rhythm" [name]="'themeRhythm' + i" placeholder="Ej: Chacarera" /></td>
                              <td><input type="text" class="form-input table-input" [(ngModel)]="theme.author" [name]="'themeAuthor' + i" placeholder="Autor / compositor" /></td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                }

                @if (data.category === 'danza') {
                  <h2 class="step-title">Información Artística — Danza</h2>
                  <p class="step-desc">Completá los datos de tu presentación de danza</p>

                  <div class="form-group">
                    <label class="form-label" for="proposalName">Nombre de la propuesta</label>
                    <input type="text" id="proposalName" name="proposalName" class="form-input"
                      [(ngModel)]="data.proposalName" placeholder="Ej: 'Zamba del Tropero'" />
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="choreographerName">Nombre del coreógrafo</label>
                    <input type="text" id="choreographerName" name="choreographerName" class="form-input"
                      [(ngModel)]="data.choreographerName" placeholder="Nombre del coreógrafo" />
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="style">Estilo</label>
                    <textarea id="style" name="style" class="form-textarea" rows="4"
                      [(ngModel)]="data.style"
                      placeholder="Describí el estilo de la presentación (folklórico, contemporáneo, etc.)..."></textarea>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="danceList">Listado de danzas o cuadros</label>
                    <textarea id="danceList" name="danceList" class="form-textarea" rows="4"
                      [(ngModel)]="data.danceList"
                      placeholder="Listá las danzas o cuadros que componen la presentación..."></textarea>
                  </div>
                }
              </div>
            }

            @if (currentStep() === 5) {
              <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
                <div class="step-title-row">
                  <h2 class="step-title">Rider Técnico</h2>
                  <span class="optional-badge">Opcional</span>
                </div>
                <p class="step-desc">Indicá qué necesitás para tu presentación en escenario. Podés avanzar sin completar esta sección.</p>

                <!-- SONIDO -->
                <div class="rider-section">
                  <div class="rider-section-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                    <h3>Sonido</h3>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Microfonos necesarios</label>
                    <div class="rider-chips">
                      @for (mic of micOptions; track mic) {
                        <label class="rider-chip" [class.selected]="data.riderTecnico.sonido.microfonos.includes(mic)">
                          <input type="checkbox" [checked]="data.riderTecnico.sonido.microfonos.includes(mic)" (change)="toggleMic(mic)" />
                          {{ mic }}
                        </label>
                      }
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Monitores de escenario</label>
                      <select class="form-input" [(ngModel)]="data.riderTecnico.sonido.monitores" name="monitores">
                        <option value="">No requiere</option>
                        <option value="1">1 monitor</option>
                        <option value="2">2 monitores</option>
                        <option value="3">3 monitores</option>
                        <option value="4">4 monitores</option>
                        <option value="custom">Más de 4 (especificar en observaciones)</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">DI Boxes</label>
                      <input type="number" class="form-input" [(ngModel)]="data.riderTecnico.sonido.diBoxes" name="diBoxes" placeholder="Cantidad" min="0" max="20" />
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Backline (equipamiento que lleva el artista)</label>
                    <div class="rider-chips">
                      @for (item of backlineOptions; track item) {
                        <label class="rider-chip" [class.selected]="data.riderTecnico.sonido.backline.includes(item)">
                          <input type="checkbox" [checked]="data.riderTecnico.sonido.backline.includes(item)" (change)="toggleBackline(item)" />
                          {{ item }}
                        </label>
                      }
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="cables">Cables o conectores especiales</label>
                    <input type="text" id="cables" class="form-input" [(ngModel)]="cablesInput" name="cables"
                      placeholder="Ej: cable XLR 10m, jack 1/4, adaptador mini-jack" />
                    <span class="form-hint">Separá múltiples ítems con coma</span>
                  </div>
                </div>

                <!-- OTROS -->
                <div class="rider-section">
                  <div class="rider-section-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <h3>Otras Necesidades</h3>
                  </div>

                  <div class="form-group">
                    <label class="form-label" for="otrosRider">Información adicional</label>
                    <textarea id="otrosRider" class="form-textarea" rows="3"
                      [(ngModel)]="data.riderTecnico.otros" name="otrosRider"
                      placeholder="Cualquier otra necesidad técnica no contemplada en las secciones anteriores..."></textarea>
                  </div>
                </div>
              </div>
            }

            @if (currentStep() === 6) {
              <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
                <h2 class="step-title">Archivos a Adjuntar</h2>
                <p class="step-desc">Subí los archivos requeridos para completar tu inscripción</p>

                <div class="form-group">
                  <label class="form-label">Foto de DNI — Frente</label>
                  <div class="file-upload-area">
                    <div class="file-drop-zone" [class.drag-over]="dragOverStates['dniFrontFile']" [class.has-file]="data.dniFrontName"
                      (dragover)="onDragOver($event, 'dniFrontFile')" (dragleave)="onDragLeave($event, 'dniFrontFile')" (drop)="onDrop($event, 'dniFrontFile')">
                      <label class="file-upload-btn">
                        <input type="file" #dniFrontInput accept="image/*" hidden (change)="onFileSelect($event, 'dniFrontFile')" />
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Seleccionar archivo
                      </label>
                      <span class="file-name-display">{{ data.dniFrontName || 'Arrastrá un archivo o hacé click' }}</span>
                      @if (dragOverStates['dniFrontFile']) {
                        <span class="drag-over-text">Soltá el archivo aquí</span>
                      }
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Foto de DNI — Dorso</label>
                  <div class="file-upload-area">
                    <div class="file-drop-zone" [class.drag-over]="dragOverStates['dniBackFile']" [class.has-file]="data.dniBackName"
                      (dragover)="onDragOver($event, 'dniBackFile')" (dragleave)="onDragLeave($event, 'dniBackFile')" (drop)="onDrop($event, 'dniBackFile')">
                      <label class="file-upload-btn">
                        <input type="file" #dniBackInput accept="image/*" hidden (change)="onFileSelect($event, 'dniBackFile')" />
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Seleccionar archivo
                      </label>
                      <span class="file-name-display">{{ data.dniBackName || 'Arrastrá un archivo o hacé click' }}</span>
                      @if (dragOverStates['dniBackFile']) {
                        <span class="drag-over-text">Soltá el archivo aquí</span>
                      }
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Foto promocional del artista o grupo</label>
                  <div class="file-upload-area">
                    <div class="file-drop-zone" [class.drag-over]="dragOverStates['promoPhotoFile']" [class.has-file]="data.promoPhotoName"
                      (dragover)="onDragOver($event, 'promoPhotoFile')" (dragleave)="onDragLeave($event, 'promoPhotoFile')" (drop)="onDrop($event, 'promoPhotoFile')">
                      <label class="file-upload-btn">
                        <input type="file" #promoPhotoInput accept="image/*" hidden (change)="onFileSelect($event, 'promoPhotoFile')" />
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Seleccionar archivo
                      </label>
                      <span class="file-name-display">{{ data.promoPhotoName || 'Arrastrá un archivo o hacé click' }}</span>
                      @if (dragOverStates['promoPhotoFile']) {
                        <span class="drag-over-text">Soltá el archivo aquí</span>
                      }
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="biography">Breve biografía artística</label>
                  <textarea id="biography" name="biography" class="form-textarea" rows="5"
                    [(ngModel)]="data.biography"
                    placeholder="Contanos sobre tu trayectoria, experiencia, logros..."></textarea>
                  <span class="form-hint">Opcional pero recomendado para el jurado</span>
                </div>

                @if (data.subcategory === 'cancion_inedita') {
                  <div class="file-section-divider">
                    <h3 class="section-subtitle">Archivos para Canción Inédita</h3>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Letra de la canción</label>
                    <div class="file-upload-area">
                      <div class="file-drop-zone" [class.drag-over]="dragOverStates['lyricsFile']" [class.has-file]="data.lyricsFileName"
                        (dragover)="onDragOver($event, 'lyricsFile')" (dragleave)="onDragLeave($event, 'lyricsFile')" (drop)="onDrop($event, 'lyricsFile')">
                        <label class="file-upload-btn">
                          <input type="file" #lyricsInput accept=".pdf,.doc,.docx,.txt" hidden (change)="onFileSelect($event, 'lyricsFile')" />
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                          </svg>
                          Seleccionar archivo
                        </label>
                        <span class="file-name-display">{{ data.lyricsFileName || 'Arrastrá un archivo o hacé click' }}</span>
                        @if (dragOverStates['lyricsFile']) {
                          <span class="drag-over-text">Soltá el archivo aquí</span>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Partitura</label>
                    <div class="file-upload-area">
                      <div class="file-drop-zone" [class.drag-over]="dragOverStates['scoreFile']" [class.has-file]="data.scoreFileName"
                        (dragover)="onDragOver($event, 'scoreFile')" (dragleave)="onDragLeave($event, 'scoreFile')" (drop)="onDrop($event, 'scoreFile')">
                        <label class="file-upload-btn">
                          <input type="file" #scoreInput accept=".pdf,.png,.jpg,.jpeg" hidden (change)="onFileSelect($event, 'scoreFile')" />
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                          </svg>
                          Seleccionar archivo
                        </label>
                        <span class="file-name-display">{{ data.scoreFileName || 'Arrastrá un archivo o hacé click' }}</span>
                        @if (dragOverStates['scoreFile']) {
                          <span class="drag-over-text">Soltá el archivo aquí</span>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            @if (currentStep() === 7) {
              <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
                <h2 class="step-title">Declaración Jurada y Revisión</h2>
                <p class="step-desc">Verificá tu información y aceptá las condiciones</p>

                <div class="declaration-section">
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="data.acceptRegulations" name="acceptRegulations" />
                    <span>Acepto el <a href="#" class="text-brand">reglamento del certamen</a> *</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="data.acceptImageRights" name="acceptImageRights" />
                    <span>Autorizo la difusión de imágenes y videos de mi presentación *</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" [(ngModel)]="data.acceptDataTruth" name="acceptDataTruth" />
                    <span>Declaro que los datos consignados son veraces *</span>
                  </label>
                </div>

                <div class="review-divider"></div>

                <div class="review-section">
                  <div class="review-header">
                    <h3>Datos Personales</h3>
                    <button type="button" class="btn-edit" (click)="goToStep(1)">Editar</button>
                  </div>
                  <div class="review-grid">
                    <div class="review-item">
                      <span class="review-label">Nombre</span>
                      <span class="review-value">{{ data.fullName || '-' }}</span>
                    </div>
                    <div class="review-item">
                      <span class="review-label">DNI</span>
                      <span class="review-value">{{ data.dni || '-' }}</span>
                    </div>
                    <div class="review-item">
                      <span class="review-label">Fecha de Nacimiento</span>
                      <span class="review-value">{{ data.birthDate || '-' }}</span>
                    </div>
                    <div class="review-item">
                      <span class="review-label">Edad</span>
                      <span class="review-value">{{ data.age !== null ? data.age + ' años' : '-' }}</span>
                    </div>
                    <div class="review-item full-width">
                      <span class="review-label">Domicilio</span>
                      <span class="review-value">{{ data.address || '-' }}</span>
                    </div>
                    <div class="review-item">
                      <span class="review-label">Localidad</span>
                      <span class="review-value">{{ data.locality || '-' }}</span>
                    </div>
                    <div class="review-item">
                      <span class="review-label">Provincia</span>
                      <span class="review-value">{{ data.province || '-' }}</span>
                    </div>
                    <div class="review-item">
                      <span class="review-label">Teléfono</span>
                      <span class="review-value">{{ data.phone || '-' }}</span>
                    </div>
                    <div class="review-item">
                      <span class="review-label">Email</span>
                      <span class="review-value">{{ data.email || '-' }}</span>
                    </div>
                  </div>
                </div>

                <div class="review-section">
                  <div class="review-header">
                    <h3>Rubro de Participación</h3>
                    <button type="button" class="btn-edit" (click)="goToStep(2)">Editar</button>
                  </div>
                  <div class="review-grid">
                    <div class="review-item">
                      <span class="review-label">Categoría</span>
                      <span class="review-value">{{ data.category === 'musica' ? 'Música' : data.category === 'danza' ? 'Danza' : '-' }}</span>
                    </div>
                    <div class="review-item">
                      <span class="review-label">Subcategoría</span>
                      <span class="review-value">{{ subcategoryName() || '-' }}</span>
                    </div>
                  </div>
                </div>

                @if (isGroupType()) {
                  <div class="review-section">
                    <div class="review-header">
                      <h3>Integrantes</h3>
                      <button type="button" class="btn-edit" (click)="goToStep(3)">Editar</button>
                    </div>
                    <div class="review-grid">
                      @for (member of data.members; track $index; let i = $index) {
                        <div class="review-item full-width">
                          <span class="review-label">Integrante {{ i + 1 }}</span>
                          <span class="review-value">{{ member.fullName || '-' }} — {{ member.role || '-' }} @if (member.dni) { (DNI: {{ member.dni }}) } @if (member.age) { · {{ member.age }} años }</span>
                        </div>
                      }
                      @if (data.members.length === 0) {
                        <div class="review-item full-width">
                          <span class="review-value review-empty">No se cargaron integrantes</span>
                        </div>
                      }
                    </div>
                  </div>
                }

                <div class="review-section">
                  <div class="review-header">
                    <h3>Información Artística</h3>
                    <button type="button" class="btn-edit" (click)="goToStep(4)">Editar</button>
                  </div>
                  <div class="review-grid">
                    @if (data.category === 'musica') {
                      <div class="review-item">
                        <span class="review-label">Nombre Artístico</span>
                        <span class="review-value">{{ data.artisticName || 'No ingresado' }}</span>
                      </div>
                      <div class="review-item full-width">
                        <span class="review-label">Temas</span>
                        <span class="review-value">{{ getFilledThemesCount() }} de 6 temas ingresados</span>
                      </div>
                    }
                    @if (data.category === 'danza') {
                      <div class="review-item">
                        <span class="review-label">Nombre de la Propuesta</span>
                        <span class="review-value">{{ data.proposalName || 'No ingresado' }}</span>
                      </div>
                      <div class="review-item">
                        <span class="review-label">Coreógrafo</span>
                        <span class="review-value">{{ data.choreographerName || 'No ingresado' }}</span>
                      </div>
                      @if (data.style) {
                        <div class="review-item full-width">
                          <span class="review-label">Estilo</span>
                          <span class="review-value">{{ data.style }}</span>
                        </div>
                      }
                      @if (data.danceList) {
                        <div class="review-item full-width">
                          <span class="review-label">Danzas o Cuadros</span>
                          <span class="review-value">{{ data.danceList }}</span>
                        </div>
                      }
                    }
                  </div>
                </div>

                <div class="review-section">
                  <div class="review-header">
                    <h3>Rider Técnico</h3>
                    <button type="button" class="btn-edit" (click)="goToStep(5)">Editar</button>
                  </div>
                  <div class="review-grid">
                    @if (data.riderTecnico.sonido.microfonos.length > 0) {
                      <div class="review-item full-width">
                        <span class="review-label">Microfonos</span>
                        <span class="review-value">{{ data.riderTecnico.sonido.microfonos.join(', ') }}</span>
                      </div>
                    }
                    @if (data.riderTecnico.sonido.monitores) {
                      <div class="review-item">
                        <span class="review-label">Monitores</span>
                        <span class="review-value">{{ data.riderTecnico.sonido.monitores }}</span>
                      </div>
                    }
                    @if (data.riderTecnico.sonido.diBoxes) {
                      <div class="review-item">
                        <span class="review-label">DI Boxes</span>
                        <span class="review-value">{{ data.riderTecnico.sonido.diBoxes }}</span>
                      </div>
                    }
                    @if (data.riderTecnico.sonido.backline.length > 0) {
                      <div class="review-item full-width">
                        <span class="review-label">Backline</span>
                        <span class="review-value">{{ data.riderTecnico.sonido.backline.join(', ') }}</span>
                      </div>
                    }
                    @if (!hasRiderData()) {
                      <div class="review-item full-width">
                        <span class="review-value review-empty">Sin rider técnico configurado</span>
                      </div>
                    }
                  </div>
                </div>

                <div class="review-section">
                  <div class="review-header">
                    <h3>Archivos Adjuntos</h3>
                    <button type="button" class="btn-edit" (click)="goToStep(6)">Editar</button>
                  </div>
                  <div class="review-grid">
                    <div class="review-item">
                      <span class="review-label">DNI Frente</span>
                      @if (filePreviews['dniFrontFile']) {
                        <img [src]="filePreviews['dniFrontFile']" class="review-thumb" alt="DNI Frente" />
                      } @else {
                        <span class="review-value">{{ data.dniFrontName || 'No adjuntado' }}</span>
                      }
                    </div>
                    <div class="review-item">
                      <span class="review-label">DNI Dorso</span>
                      @if (filePreviews['dniBackFile']) {
                        <img [src]="filePreviews['dniBackFile']" class="review-thumb" alt="DNI Dorso" />
                      } @else {
                        <span class="review-value">{{ data.dniBackName || 'No adjuntado' }}</span>
                      }
                    </div>
                    <div class="review-item">
                      <span class="review-label">Foto Promocional</span>
                      @if (filePreviews['promoPhotoFile']) {
                        <img [src]="filePreviews['promoPhotoFile']" class="review-thumb" alt="Foto Promocional" />
                      } @else {
                        <span class="review-value">{{ data.promoPhotoName || 'No adjuntada' }}</span>
                      }
                    </div>
                    <div class="review-item full-width">
                      <span class="review-label">Biografía Artística</span>
                      <span class="review-value">{{ data.biography || 'No ingresada' }}</span>
                    </div>
                    @if (data.subcategory === 'cancion_inedita') {
                      <div class="review-item">
                        <span class="review-label">Letra</span>
                        <span class="review-value">{{ data.lyricsFileName || 'No adjuntada' }}</span>
                      </div>
                      <div class="review-item">
                        <span class="review-label">Partitura</span>
                        @if (filePreviews['scoreFile']) {
                          <img [src]="filePreviews['scoreFile']" class="review-thumb" alt="Partitura" />
                        } @else {
                          <span class="review-value">{{ data.scoreFileName || 'No adjuntada' }}</span>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>
            }

            @if (submitted()) {
              <div class="step-content success-content animate-scale-in">
                <div class="success-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
                  </svg>
                </div>
                <h2>Inscripción Enviada</h2>
                <p>Generando tu constancia...</p>
              </div>
            }

            @if (!submitted()) {
              <div class="form-actions">
                @if (currentStep() > 1) {
                  <button type="button" class="btn btn-secondary" (click)="prevStep()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                    Anterior
                  </button>
                }
                <div class="spacer"></div>
                @if (error()) {
                  <span class="form-error">{{ error() }}</span>
                }
                @if (currentStep() < 7) {
                  <button type="button" class="btn btn-primary" (click)="nextStep()" [disabled]="!canProceed()">
                    Siguiente
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </button>
                } @else {
                  @if (!showConfirmSubmit()) {
                    <button type="button" class="btn btn-primary btn-lg" (click)="showConfirmSubmit.set(true)" [disabled]="!canProceed() || submitting()">
                      Enviar Inscripción
                    </button>
                  } @else {
                    <div class="confirm-submit-group">
                      <span class="confirm-text">¿Confirmás el envío?</span>
                      <button type="button" class="btn btn-secondary btn-sm" (click)="showConfirmSubmit.set(false)">Cancelar</button>
                      <button type="submit" class="btn btn-primary btn-lg" [disabled]="submitting()">
                        @if (submitting()) {
                          <span class="spinner"></span> {{ submittingText() }}
                        } @else {
                          Sí, enviar
                        }
                      </button>
                    </div>
                  }
                }
              </div>
            }
          </form>
          <div class="sponsors-section">
            <img src="assets/MUNI-LOGO2.svg" alt="Municipalidad" class="sponsor-logo sponsor-logo-inverted sponsor-logo-large" />
            <img src="assets/rayentray.png" alt="Rayentray" class="sponsor-logo sponsor-logo-transparent" />
            <img src="assets/hidro.jpeg" alt="Hidro" class="sponsor-logo sponsor-logo-transparent" />
          </div>

          <div class="social-container">
            <p class="social-label">Seguinos en las redes:</p>
            <div class="social-section">
              <a href="https://www.instagram.com/precosquinpuertopiramides?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" class="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                <span>Instagram</span>
              </a>
              <a href="https://www.youtube.com/@PreCosquinPuertoPirámides" target="_blank" rel="noopener noreferrer" class="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                </svg>
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      }

      @if (currentStep() === 8 && inscriptionResult()) {
        <div class="constancia-page animate-scale-in" id="constancia">
          <div class="constancia-card">
            <div class="constancia-header">
              <img src="assets/logo.svg" alt="Precosquin" class="constancia-logo-img" />
              <div class="constancia-badge">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
                </svg>
                Inscripción Registrada
              </div>
            </div>

            <h2 class="constancia-title">Constancia de Inscripción</h2>

            <div class="constancia-body">
              <div class="constancia-field">
                <span class="constancia-label">N° de Inscripción</span>
                <span class="constancia-value constancia-id">{{ inscriptionResult()!.id }}</span>
              </div>

              <div class="constancia-field">
                <span class="constancia-label">Fecha de Inscripción</span>
                <span class="constancia-value">{{ formatDate(inscriptionResult()!.created_at) }}</span>
              </div>

              <div class="constancia-divider"></div>

              <div class="constancia-field">
                <span class="constancia-label">Nombre Completo</span>
                <span class="constancia-value">{{ data.fullName }}</span>
              </div>

              <div class="constancia-row">
                <div class="constancia-field">
                  <span class="constancia-label">DNI</span>
                  <span class="constancia-value">{{ data.dni }}</span>
                </div>
                <div class="constancia-field">
                  <span class="constancia-label">Fecha de Nacimiento</span>
                  <span class="constancia-value">{{ data.birthDate }}</span>
                </div>
              </div>

              <div class="constancia-row">
                <div class="constancia-field">
                  <span class="constancia-label">Edad</span>
                  <span class="constancia-value">{{ data.age !== null ? data.age + ' años' : '-' }}</span>
                </div>
                <div class="constancia-field">
                  <span class="constancia-label">Domicilio</span>
                  <span class="constancia-value">{{ data.address }}</span>
                </div>
              </div>

              <div class="constancia-row">
                <div class="constancia-field">
                  <span class="constancia-label">Localidad</span>
                  <span class="constancia-value">{{ data.locality }}</span>
                </div>
                <div class="constancia-field">
                  <span class="constancia-label">Provincia</span>
                  <span class="constancia-value">{{ data.province }}</span>
                </div>
              </div>

              <div class="constancia-row">
                <div class="constancia-field">
                  <span class="constancia-label">Teléfono</span>
                  <span class="constancia-value">{{ data.phone }}</span>
                </div>
                <div class="constancia-field">
                  <span class="constancia-label">Email</span>
                  <span class="constancia-value">{{ data.email }}</span>
                </div>
              </div>

              <div class="constancia-divider"></div>

              <div class="constancia-row">
                <div class="constancia-field">
                  <span class="constancia-label">Categoría</span>
                  <span class="constancia-value constancia-category">{{ data.category === 'musica' ? 'Música' : 'Danza' }}</span>
                </div>
                <div class="constancia-field">
                  <span class="constancia-label">Subcategoría</span>
                  <span class="constancia-value constancia-category">{{ subcategoryName() }}</span>
                </div>
              </div>

              @if (isGroupType() && data.members.length > 0) {
                <div class="constancia-divider"></div>
                <div class="constancia-field">
                  <span class="constancia-label">Integrantes</span>
                  @for (member of data.members; track $index; let i = $index) {
                    <span class="constancia-value">{{ member.fullName }} — {{ member.role }} @if (member.dni) { (DNI: {{ member.dni }}) } @if (member.age) { · {{ member.age }} años }</span>
                  }
                </div>
              }

              <div class="constancia-divider"></div>

              @if (data.category === 'musica') {
                @if (data.artisticName) {
                  <div class="constancia-field">
                    <span class="constancia-label">Nombre Artístico</span>
                    <span class="constancia-value">{{ data.artisticName }}</span>
                  </div>
                }
                @if (getFilledThemesCount() > 0) {
                  <div class="constancia-field">
                    <span class="constancia-label">Temas</span>
                    @for (theme of data.themes; track $index; let i = $index) {
                      @if (theme.title || theme.rhythm || theme.author) {
                        <span class="constancia-value">{{ i + 1 }}. {{ theme.title || '—' }} — {{ theme.rhythm || '—' }} — {{ theme.author || '—' }}</span>
                      }
                    }
                  </div>
                    }
              }

              @if (data.category === 'danza') {
                @if (data.proposalName) {
                  <div class="constancia-field">
                    <span class="constancia-label">Nombre de la Propuesta</span>
                    <span class="constancia-value">{{ data.proposalName }}</span>
                  </div>
                }
                @if (data.choreographerName) {
                  <div class="constancia-field">
                    <span class="constancia-label">Coreógrafo</span>
                    <span class="constancia-value">{{ data.choreographerName }}</span>
                  </div>
                }
                @if (data.style) {
                  <div class="constancia-field">
                    <span class="constancia-label">Estilo</span>
                    <span class="constancia-value">{{ data.style }}</span>
                  </div>
                }
                @if (data.danceList) {
                  <div class="constancia-field">
                    <span class="constancia-label">Danzas o Cuadros</span>
                    <span class="constancia-value">{{ data.danceList }}</span>
                  </div>
                }
              }

              @if (data.biography) {
                <div class="constancia-divider"></div>
                <div class="constancia-field">
                  <span class="constancia-label">Biografía Artística</span>
                  <span class="constancia-value">{{ data.biography }}</span>
                </div>
              }

              @if (hasRiderData()) {
                <div class="constancia-divider"></div>
                <div class="constancia-field">
                  <span class="constancia-label">Rider Técnico</span>
                  @if (data.riderTecnico.sonido.microfonos.length > 0) {
                    <span class="constancia-value">Microfonos: {{ data.riderTecnico.sonido.microfonos.join(', ') }}</span>
                  }
                  @if (data.riderTecnico.sonido.monitores) {
                    <span class="constancia-value">Monitores: {{ data.riderTecnico.sonido.monitores }}</span>
                  }
                  @if (data.riderTecnico.sonido.diBoxes) {
                    <span class="constancia-value">DI Boxes: {{ data.riderTecnico.sonido.diBoxes }}</span>
                  }
                  @if (data.riderTecnico.sonido.backline.length > 0) {
                    <span class="constancia-value">Backline: {{ data.riderTecnico.sonido.backline.join(', ') }}</span>
                  }
                  @if (data.riderTecnico.otros) {
                    <span class="constancia-value">Otros: {{ data.riderTecnico.otros }}</span>
                  }
                </div>
              }

              <div class="constancia-divider"></div>

              <div class="constancia-field">
                <span class="constancia-label">Estado</span>
                <span class="constancia-value constancia-status">Pendiente de revisión</span>
              </div>

              <div class="constancia-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
                <p>Conservá esta constancia como comprobante. Tu inscripción será revisada por el jurado. Recibirás un email con los próximos pasos.</p>
              </div>
            </div>

            <div class="constancia-footer">
              <button type="button" class="btn btn-primary" (click)="printConstancia()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Descargar / Imprimir
              </button>
              <button type="button" class="btn btn-secondary" (click)="resetForm()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Nueva inscripción
              </button>
              <a routerLink="/" class="btn btn-secondary">Volver al Inicio</a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .public-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
      padding-bottom: var(--space-12);
    }

    .sponsors-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-12);
      margin-top: var(--space-8);
      padding: var(--space-10);
      border-top: 3px solid rgba(99, 102, 241, 0.3);
      background: #1e293b;
      border-radius: 0 0 var(--radius-2xl) var(--radius-2xl);
      box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.3);
    }

    .sponsor-logo {
      height: 80px;
      width: auto;
      max-width: 160px;
      object-fit: contain;
      opacity: 1;
      padding: var(--space-2);
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid #334155;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .sponsor-logo-inverted {
      filter: brightness(0) invert(1);
      background: transparent;
      border: none;
      box-shadow: none;
      padding: 0;
    }

    .sponsor-logo-large {
      height: 110px;
      max-width: 220px;
    }

    .sponsor-logo-transparent {
      background: transparent;
      border: none;
      box-shadow: none;
      padding: 0;
    }

    .social-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-6) var(--space-8);
      background: rgba(255, 255, 255, 0.95);
    }

    .social-label {
      font-size: var(--text-sm);
      color: #475569;
      font-weight: var(--weight-medium);
      margin: 0;
    }

    .social-section {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .social-link {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      background: rgba(99, 102, 241, 0.1);
      border-radius: var(--radius-lg);
      color: #4f46e5;
      text-decoration: none;
      transition: all 0.2s ease;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
    }

    .social-link:hover {
      background: rgba(99, 102, 241, 0.2);
      transform: translateY(-2px);
    }

    .form-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-5) var(--space-6);
      max-width: 720px;
      margin: 0 auto;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      text-decoration: none;
      color: #fff;
      font-weight: var(--weight-bold);
      font-size: var(--text-lg);
    }

    .brand-icon-sm {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      background: var(--brand-600);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .nav-link {
      font-size: var(--text-sm);
      color: #94a3b8;
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    .nav-link:hover { color: #fff; }

    .form-wrapper {
      max-width: 720px;
      margin: 0 auto;
      padding: 0 var(--space-4) var(--space-8);
    }

    .form-card {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
      border: 2px solid rgba(99, 102, 241, 0.3);
      border-radius: var(--radius-2xl);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1);
      overflow: hidden;
    }

    .form-header {
      text-align: center;
      padding: var(--space-10) var(--space-8) var(--space-5);
    }

    .form-header h1 {
      font-size: 1.625rem;
      font-weight: var(--weight-bold);
      color: #e2e8f0;
      margin: 0 0 var(--space-2);
    }

    .form-header p {
      font-size: var(--text-sm);
      color: #94a3b8;
      margin: 0;
    }

    .steps-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-3) var(--space-8) var(--space-6);
      gap: var(--space-4);
    }

    .steps-row {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: nowrap;
      width: 100%;
      gap: 0;
    }

    .progress-bar-wrapper {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-full);
      position: relative;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--brand-600), var(--brand-400));
      border-radius: var(--radius-full);
      transition: width 0.4s ease;
    }

    .progress-bar-text {
      position: absolute;
      right: 0;
      top: -18px;
      font-size: 10px;
      color: #64748b;
      font-weight: var(--weight-medium);
    }

    .step-progress-row {
      display: flex;
      align-items: center;
      gap: 0;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-1);
      flex-shrink: 0;
    }

    .step-circle {
      width: 30px;
      height: 30px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      background: rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      transition: all var(--transition-base);
      flex-shrink: 0;
    }

    .step.active .step-circle {
      background: var(--brand-600);
      color: #fff;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.3);
    }

    .step.completed .step-circle {
      background: var(--success-500);
      color: #fff;
    }

    .step-label {
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      color: #64748b;
      white-space: nowrap;
    }

    .step.active .step-label { color: var(--brand-400); font-weight: var(--weight-semibold); }
    .step.completed .step-label { color: var(--success-400); }

    .step-line {
      flex: 1;
      height: 2px;
      min-width: 20px;
      max-width: 60px;
      background: rgba(255, 255, 255, 0.1);
      flex-shrink: 1;
      transition: background var(--transition-base);
    }

    .step-line.completed { background: var(--success-500); }

    @media (max-width: 640px) {
      .step-label { display: none; }
      .step-line { min-width: 12px; max-width: 30px; }
      .form-header { padding: var(--space-8) var(--space-6) var(--space-4); }
      .steps-indicator { padding: var(--space-3) var(--space-4) var(--space-5); }
    }

    .inscription-form {
      padding: var(--space-2) var(--space-8) var(--space-8);
    }

    .step-content {
      min-height: 200px;
    }

    .step-title {
      font-size: 1.125rem;
      font-weight: var(--weight-semibold);
      color: #e2e8f0;
      margin: 0 0 var(--space-1);
    }

    .step-desc {
      font-size: var(--text-sm);
      color: #94a3b8;
      margin: 0 0 var(--space-6);
    }

    .form-group {
      margin-bottom: var(--space-5);
    }

    .form-label {
      display: block;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: #cbd5e1;
      margin-bottom: var(--space-2);
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 0.75rem 0.875rem;
      font-size: var(--text-base);
      color: #e2e8f0;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-lg);
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
      font-family: inherit;
    }

    .form-input:focus,
    .form-textarea:focus {
      border-color: var(--brand-400);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
      background: rgba(255, 255, 255, 0.08);
    }

    .form-input::placeholder,
    .form-textarea::placeholder {
      color: #64748b;
    }

    .form-textarea {
      resize: vertical;
      min-height: 120px;
    }

    .form-input-readonly {
      opacity: 0.7;
      cursor: default;
    }

    select.form-input {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      padding-right: 2.5rem;
    }

    select.form-input option {
      background: #1e293b;
      color: #e2e8f0;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-5);
    }

    @media (min-width: 640px) {
      .form-row { grid-template-columns: 1fr 1fr; }
    }

    .category-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
    }

    .category-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-4);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-xl);
      cursor: pointer;
      transition: all var(--transition-fast);
      background: rgba(255, 255, 255, 0.03);
    }

    .category-card input { display: none; }

    .category-card:hover {
      border-color: rgba(99, 102, 241, 0.3);
      background: rgba(99, 102, 241, 0.08);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .category-card.selected {
      border-color: var(--brand-400);
      background: rgba(99, 102, 241, 0.15);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
    }

    .category-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .category-icon-music { background: rgba(99, 102, 241, 0.2); color: var(--brand-400); }
    .category-icon-dance { background: rgba(245, 158, 11, 0.2); color: var(--warning-400); }
    .category-card.selected .category-icon-music { background: var(--brand-600); color: #fff; }
    .category-card.selected .category-icon-dance { background: var(--warning-500); color: #fff; }

    .category-name {
      display: block;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: #e2e8f0;
    }

    .category-desc {
      display: block;
      font-size: var(--text-xs);
      color: #94a3b8;
    }

    .subcategory-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .subcategory-chip {
      display: inline-flex;
      align-items: center;
      padding: 10px var(--space-4);
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      border-radius: var(--radius-full);
      font-size: var(--text-sm);
      color: #cbd5e1;
      cursor: pointer;
      transition: all var(--transition-fast);
      background: rgba(255, 255, 255, 0.03);
    }

    .subcategory-chip input { display: none; }

    .subcategory-chip:hover {
      border-color: rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.08);
    }

    .subcategory-chip.selected {
      border-color: var(--brand-400);
      background: rgba(99, 102, 241, 0.2);
      color: var(--brand-300);
      font-weight: var(--weight-medium);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
    }

    .form-hint {
      display: block;
      font-size: var(--text-xs);
      color: #64748b;
      margin-top: var(--space-2);
    }

    .member-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      margin-bottom: var(--space-4);
    }

    .member-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);
    }

    .member-number {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--brand-400);
      margin: 0;
    }

    .btn-remove {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-xs);
      color: var(--danger-600);
      background: none;
      border: none;
      cursor: pointer;
      font-weight: var(--weight-medium);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }

    .btn-remove:hover { background: rgba(239, 68, 68, 0.1); }

    .btn-add-member {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0.625rem 1.25rem;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      border-radius: var(--radius-lg);
      border: 2px dashed rgba(99, 102, 241, 0.4);
      background: rgba(99, 102, 241, 0.05);
      color: var(--brand-400);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-add-member:hover {
      border-color: var(--brand-400);
      background: rgba(99, 102, 241, 0.1);
    }

    .themes-table-wrapper {
      overflow-x: auto;
      margin-top: var(--space-2);
    }

    .themes-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm);
    }

    .themes-table th {
      text-align: left;
      padding: var(--space-2) var(--space-3);
      color: #94a3b8;
      font-weight: var(--weight-medium);
      font-size: var(--text-xs);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .themes-table td {
      padding: var(--space-2) var(--space-3);
    }

    .theme-number {
      color: #64748b;
      font-weight: var(--weight-medium);
      width: 30px;
    }

    .table-input {
      padding: 0.5rem 0.625rem !important;
      font-size: var(--text-sm) !important;
    }

    .section-subtitle {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--brand-400);
      margin: 0 0 var(--space-4);
      padding-top: var(--space-4);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .file-upload-area {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .file-upload-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0.5rem 1rem;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: #e2e8f0;
      background: rgba(99, 102, 241, 0.15);
      border: 1.5px solid rgba(99, 102, 241, 0.3);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }

    .file-upload-btn:hover {
      background: rgba(99, 102, 241, 0.25);
      border-color: var(--brand-400);
    }

    .file-name-display {
      font-size: var(--text-sm);
      color: #64748b;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .review-thumb {
      width: 120px;
      height: 80px;
      object-fit: cover;
      border-radius: var(--radius-md);
      border: 2px solid rgba(99, 102, 241, 0.3);
      margin-top: var(--space-1);
    }

    .declaration-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .review-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: var(--space-5) 0;
    }

    .review-section {
      margin-bottom: var(--space-5);
    }

    .review-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-3);
    }

    .review-header h3 {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: #e2e8f0;
    }

    .btn-edit {
      font-size: var(--text-xs);
      color: var(--brand-400);
      background: none;
      border: none;
      cursor: pointer;
      font-weight: var(--weight-medium);
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
    }
    .btn-edit:hover { background: rgba(99, 102, 241, 0.1); }

    .review-grid {
      background: rgba(255, 255, 255, 0.05);
      border-radius: var(--radius-lg);
      padding: var(--space-4) var(--space-5);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .review-item.full-width {
      grid-column: 1 / -1;
    }

    .review-label {
      display: block;
      font-size: var(--text-xs);
      color: #94a3b8;
      margin-bottom: 3px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .review-value {
      display: block;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: #e2e8f0;
    }

    .review-empty {
      color: #64748b;
      font-style: italic;
      font-weight: normal;
    }

    .terms-check {
      margin-top: var(--space-6);
      padding-top: var(--space-5);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      font-size: var(--text-sm);
      color: #cbd5e1;
      cursor: pointer;
      padding: var(--space-2) 0;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--brand-600);
      flex-shrink: 0;
    }

    .form-actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-top: var(--space-8);
      padding-top: var(--space-6);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .spacer { flex: 1; }

    .form-error {
      color: var(--danger-600);
      font-size: var(--text-sm);
    }

    .constancia-page {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: var(--space-10) var(--space-4);
      min-height: 100vh;
    }

    .constancia-card {
      width: 100%;
      max-width: 640px;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
      border: 2px solid rgba(99, 102, 241, 0.3);
      border-radius: var(--radius-xl);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1);
      padding: var(--space-10);
    }

    .constancia-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-6);
    }

    .constancia-logo-img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 50%;
    }

    .constancia-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(34, 197, 94, 0.15);
      color: var(--success-400);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
    }

    .constancia-title {
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: #e2e8f0;
      text-align: center;
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-4);
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    }

    .constancia-body {
      padding: var(--space-4) 0;
    }

    .constancia-field {
      margin-bottom: var(--space-3);
    }

    .constancia-label {
      display: block;
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .constancia-value {
      display: block;
      font-size: var(--text-sm);
      color: #e2e8f0;
      font-weight: var(--weight-medium);
    }

    .constancia-id {
      font-family: monospace;
      font-size: var(--text-xs);
      color: var(--brand-400);
      background: rgba(99, 102, 241, 0.15);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      display: inline-block;
    }

    .constancia-category {
      font-weight: var(--weight-semibold);
      color: var(--brand-400);
    }

    .constancia-status {
      color: var(--warning-400);
    }

    .constancia-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .constancia-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: var(--space-4) 0;
    }

    .constancia-note {
      display: flex;
      gap: var(--space-2);
      align-items: flex-start;
      background: rgba(59, 130, 246, 0.1);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      margin-top: var(--space-4);
      color: #93c5fd;
    }

    .constancia-note svg {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .constancia-note p {
      font-size: var(--text-xs);
      color: #93c5fd;
      margin: 0;
      line-height: 1.5;
    }

    .constancia-footer {
      display: flex;
      justify-content: center;
      gap: var(--space-3);
      margin-top: var(--space-6);
      padding-top: var(--space-4);
      border-top: 2px solid rgba(255, 255, 255, 0.1);
    }

    @media print {
      body * { visibility: hidden; }
      #constancia, #constancia * { visibility: visible; }
      #constancia {
        position: absolute;
        left: 0; top: 0;
        width: 100%;
        padding: 40px;
        background: #fff;
      }
      .constancia-footer { display: none; }
      .constancia-badge { border: 1px solid var(--success-600); }
    }

    .nav-logo {
      height: 28px;
      width: auto;
    }

    .success-content {
      text-align: center;
      padding: var(--space-8) 0;
    }

    .success-icon {
      width: 72px;
      height: 72px;
      border-radius: var(--radius-full);
      background: rgba(34, 197, 94, 0.15);
      color: var(--success-400);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }

    .success-content h2 {
      font-size: var(--text-xl);
      color: #e2e8f0;
      margin-bottom: var(--space-2);
    }

    .success-content p {
      color: #94a3b8;
      margin-bottom: var(--space-6);
      max-width: 360px;
      margin-left: auto;
      margin-right: auto;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0.625rem 1.25rem;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      border-radius: var(--radius-lg);
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-lg { padding: 0.75rem 2rem; font-size: var(--text-base); }

    .btn-primary {
      background: var(--brand-600);
      color: #fff;
    }
    .btn-primary:hover:not(:disabled) { background: var(--brand-700); }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.2); }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .animate-scale-in { animation: scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }

    @media (max-width: 640px) {
      .social-section {
        flex-direction: column;
        width: 100%;
      }

      .social-link {
        width: 100%;
        justify-content: center;
      }
    }

    .rider-section {
      background: rgba(255, 255, 255, 0.03);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      margin-bottom: var(--space-5);
    }

    .rider-section-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
      color: var(--brand-400);
    }

    .rider-section-header h3 {
      margin: 0;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: #e2e8f0;
    }

    .rider-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .rider-chip {
      display: inline-flex;
      align-items: center;
      padding: 8px var(--space-3);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      color: #cbd5e1;
      cursor: pointer;
      transition: all var(--transition-fast);
      background: rgba(255, 255, 255, 0.03);
    }

    .rider-chip input { display: none; }

    .rider-chip:hover {
      border-color: rgba(255, 255, 255, 0.25);
      background: rgba(255, 255, 255, 0.06);
    }

    .rider-chip.selected {
      border-color: var(--brand-400);
      background: rgba(99, 102, 241, 0.2);
      color: var(--brand-300);
      font-weight: var(--weight-medium);
    }

    .rider-checks {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .step-title-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-1);
    }

    .optional-badge {
      font-size: 10px;
      font-weight: var(--weight-bold);
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 2px 10px;
      border-radius: var(--radius-full);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .alert-info {
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: var(--radius-lg);
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-sm);
      color: #c7d2fe;
      line-height: 1.6;
    }

    .alert-info strong {
      color: var(--brand-400);
    }

    .confirm-submit-group {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      animation: fadeIn 0.2s ease;
    }

    .confirm-text {
      font-size: var(--text-sm);
      color: var(--warning-400);
      font-weight: var(--weight-semibold);
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: var(--text-xs);
    }

    .field-error {
      font-size: var(--text-xs);
      color: var(--danger-500);
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .form-input.error,
    .form-textarea.error,
    select.form-input.error {
      border-color: var(--danger-500);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
    }

    .file-upload-area {
      position: relative;
    }

    .file-drop-zone {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
      border: 2px dashed rgba(255, 255, 255, 0.15);
      border-radius: var(--radius-lg);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .file-drop-zone:hover,
    .file-drop-zone.drag-over {
      border-color: var(--brand-400);
      background: rgba(99, 102, 241, 0.08);
    }

    .file-drop-zone.has-file {
      border-color: var(--success-400);
      border-style: solid;
      background: rgba(34, 197, 94, 0.05);
    }

    .drag-over-text {
      font-size: var(--text-xs);
      color: var(--brand-400);
      font-weight: var(--weight-medium);
    }

    .file-size-error {
      font-size: var(--text-xs);
      color: var(--danger-500);
      margin-top: 4px;
    }

    .slide-left {
      animation: slideLeft 0.3s ease-out;
    }

    .slide-right {
      animation: slideRight 0.3s ease-out;
    }

    @keyframes slideLeft {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @media (max-width: 640px) {
      .constancia-row {
        grid-template-columns: 1fr;
      }

      .subcategory-grid {
        overflow-x: auto;
        flex-wrap: nowrap;
        padding-bottom: var(--space-2);
        -webkit-overflow-scrolling: touch;
      }

      .subcategory-chip {
        flex-shrink: 0;
      }

      .confirm-submit-group {
        flex-wrap: wrap;
      }
    }
  `]
})
export class InscripcionPageComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);

  currentStep = signal(1);
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

  steps = [
    { number: 1, label: 'Datos' },
    { number: 2, label: 'Rubro' },
    { number: 3, label: 'Integrantes' },
    { number: 4, label: 'Arte' },
    { number: 5, label: 'Rider' },
    { number: 6, label: 'Archivos' },
    { number: 7, label: 'Confirmar' },
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

  onDragOver(event: DragEvent, fieldName: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverStates[fieldName] = true;
  }

  onDragLeave(event: DragEvent, fieldName: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverStates[fieldName] = false;
  }

  onDrop(event: DragEvent, fieldName: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverStates[fieldName] = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0], fieldName);
    }
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

  visibleSteps = computed(() => {
    if (this.isGroupType()) {
      return this.steps;
    }
    return this.steps.filter(s => s.number !== 3);
  });

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

  onFileSelect(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      (this.data as any)[fieldName] = file;
      const nameMap: Record<string, string> = {
        dniFrontFile: 'dniFrontName',
        dniBackFile: 'dniBackName',
        promoPhotoFile: 'promoPhotoName',
        lyricsFile: 'lyricsFileName',
        scoreFile: 'scoreFileName',
      };
      (this.data as any)[nameMap[fieldName]] = file.name;

      if (file.type.startsWith('image/')) {
        if (this.filePreviews[fieldName]) {
          URL.revokeObjectURL(this.filePreviews[fieldName]);
        }
        this.filePreviews[fieldName] = URL.createObjectURL(file);
      }
    }
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

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
      full_name: this.data.fullName,
      stage_name: this.data.artisticName || null,
      email: this.data.email,
      phone: this.data.phone,
      category: this.data.category,
      subcategory: this.data.subcategory,
      dni: this.data.dni || null,
      birth_date: this.data.birthDate || null,
      age: this.data.age,
      address: this.data.address || null,
      locality: this.data.locality || null,
      province: this.data.province || null,
      bio: this.data.biography || null,
      rider_tecnico: this.hasRiderData() ? this.data.riderTecnico : null,
      proposal_name: this.data.proposalName || null,
      choreographer_name: this.data.choreographerName || null,
      style: this.data.style || null,
      dance_list: this.data.danceList || null,
      themes: this.data.category === 'musica'
        ? this.data.themes.filter(t => t.title || t.rhythm || t.author)
        : null,
      members: this.isGroupType() ? this.data.members : null,
    };

    this.http.post<InscripcionResult>(`${environment.apiUrl}/inscriptions/`, payload).subscribe({
      next: (result) => {
        this.inscriptionResult.set(result);
        this.clearDraft();
        this.uploadFiles(result.id);
      },
      error: (err) => {
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
