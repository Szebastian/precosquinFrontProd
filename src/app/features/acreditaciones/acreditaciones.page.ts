import { Component, inject, OnInit, signal, computed, HostListener, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Html5Qrcode } from 'html5-qrcode';
import { AcreditacionesService } from './services/acreditaciones.service';
import {
  AccreditationParticipant,
  AccreditationStats,
  AccreditationStatus,
  CheckInResult,
  CheckInResultType,
  CheckInMethod,
  AuditLogEntry,
  ACCREDITATION_STATUS_CONFIG,
  CHECK_IN_RESULT_CONFIG,
} from './models/acreditaciones.models';

@Component({
  selector: 'app-acreditaciones-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- ═══════════ CHECK-IN SECTION ═══════════ -->
      <div class="checkin-section">
        <div class="checkin-header">
          <h1 class="checkin-title">Check-in de Acreditación</h1>
          <p class="checkin-subtitle">Escaneá el QR o ingresá el DNI del participante</p>
        </div>

        <!-- Search Bar -->
        <div class="checkin-search">
          <div class="search-bar-large" [class.search-focused]="searchFocused()">
            <svg class="search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              #searchInput
              type="text"
              class="search-input-large"
              placeholder="Ingresá el DNI del participante..."
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)"
              (keydown.enter)="searchParticipant()"
              (focus)="searchFocused.set(true)"
              (blur)="searchFocused.set(false)"
              autocomplete="off"
            />
            @if (searchQuery()) {
              <button class="search-clear-btn" (click)="clearSearch()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            }
            <button class="btn-qr" (click)="openQRScanner()" title="Escanear QR">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
              </svg>
              Escanear QR
            </button>
          </div>
          <div class="search-hints">
            <span class="hint">Presioná <kbd>Ctrl</kbd>+<kbd>K</kbd> para buscar</span>
            <span class="hint">o escaneá el código QR del participante</span>
          </div>
        </div>

        <!-- Check-in Result -->
        @if (checkInResult()) {
          <div class="checkin-result" [class]="'result-' + checkInResult()!.type">
            <!-- NOT FOUND -->
            @if (checkInResult()!.type === 'not_found') {
              <div class="result-content">
                <div class="result-icon result-icon-error">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <h2 class="result-title">Participante no encontrado</h2>
                <p class="result-message">No se encontró ningún participante con ese DNI o código QR.</p>
                <button class="btn btn-primary btn-large" (click)="clearSearch()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Buscar otro participante
                </button>
              </div>
            }

            <!-- ALREADY ACCREDITED -->
            @if (checkInResult()!.type === 'already_accredited') {
              <div class="result-content">
                <div class="result-icon result-icon-warning">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <h2 class="result-title">Ya acreditado</h2>
                <p class="result-message">Este participante ya fue acreditado.</p>
                @if (checkInResult()!.participant) {
                  <div class="result-details">
                    <div class="detail-row"><span class="detail-label">Acreditado por:</span><span class="detail-value">{{ checkInResult()!.participant!.accreditedBy }}</span></div>
                    <div class="detail-row"><span class="detail-label">Fecha:</span><span class="detail-value">{{ checkInResult()!.participant!.accreditedAt | date:'dd/MM/yyyy HH:mm' }}</span></div>
                  </div>
                }
                <button class="btn btn-primary btn-large" (click)="clearSearch()">Buscar otro participante</button>
              </div>
            }

            <!-- NOT APPROVED -->
            @if (checkInResult()!.type === 'not_approved') {
              <div class="result-content">
                <div class="result-icon result-icon-error">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <h2 class="result-title">No autorizado</h2>
                <p class="result-message">Este participante no está autorizado para acreditación.</p>
                <button class="btn btn-primary btn-large" (click)="clearSearch()">Buscar otro participante</button>
              </div>
            }

            <!-- FOUND - Participant Summary -->
            @if (checkInResult()!.type === 'found' && checkInResult()!.participant) {
              <div class="result-content result-found">
                <div class="participant-summary">
                  <div class="participant-photo">
                    @if (checkInResult()!.participant!.photoUrl) {
                      <img [src]="checkInResult()!.participant!.photoUrl" [alt]="checkInResult()!.participant!.representativeName" />
                    } @else {
                      <div class="photo-placeholder">{{ getInitials(checkInResult()!.participant!.representativeName) }}</div>
                    }
                  </div>
                  <div class="participant-info-main">
                    <h2 class="participant-name-main">{{ checkInResult()!.participant!.representativeName }}</h2>
                    <p class="participant-group-main">{{ checkInResult()!.participant!.groupName }}</p>
                    <div class="participant-meta">
                      <span class="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        DNI: {{ checkInResult()!.participant!.dni }}
                      </span>
                      <span class="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                        {{ checkInResult()!.participant!.category }}
                      </span>
                      <span class="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {{ checkInResult()!.participant!.province }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="schedule-summary">
                  <div class="schedule-item">
                    <span class="schedule-label">Horario</span>
                    <span class="schedule-value schedule-time">{{ checkInResult()!.participant!.presentationTime }}</span>
                  </div>
                  <div class="schedule-item">
                    <span class="schedule-label">Escenario</span>
                    <span class="schedule-value">{{ checkInResult()!.participant!.stage }}</span>
                  </div>
                  <div class="schedule-item">
                    <span class="schedule-label">Orden</span>
                    <span class="schedule-value schedule-order">#{{ checkInResult()!.participant!.presentationOrder }}</span>
                  </div>
                  <div class="schedule-item">
                    <span class="schedule-label">Integrantes</span>
                    <span class="schedule-value">{{ checkInResult()!.participant!.memberCount }}</span>
                  </div>
                </div>

                <div class="checkin-actions">
                  <div class="accredited-success-banner">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span class="accredited-success-text">Acreditado correctamente</span>
                  </div>
                  <button class="btn btn-secondary btn-large" (click)="clearSearch()">Cerrar</button>
                </div>
              </div>
            }
          </div>
        }

        <!-- Success Screen -->
        @if (showSuccess()) {
          <div class="success-screen">
            <div class="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 class="success-title">¡Participante acreditado!</h2>
            @if (lastAccredited()) {
              <div class="success-details">
                <div class="success-row"><span class="success-label">Nombre:</span><span class="success-value">{{ lastAccredited()!.representativeName }}</span></div>
                <div class="success-row"><span class="success-label">Grupo:</span><span class="success-value">{{ lastAccredited()!.groupName }}</span></div>
                <div class="success-row"><span class="success-label">Horario:</span><span class="success-value">{{ lastAccredited()!.presentationTime }}</span></div>
                <div class="success-row"><span class="success-label">Escenario:</span><span class="success-value">{{ lastAccredited()!.stage }}</span></div>
                <div class="success-row"><span class="success-label">Orden:</span><span class="success-value">#{{ lastAccredited()!.presentationOrder }}</span></div>
              </div>
            }
            <button class="btn btn-primary btn-large" (click)="resetCheckIn()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Siguiente participante
            </button>
          </div>
        }
      </div>

      <!-- ═══════════ CONFIRMATION DIALOG ═══════════ -->
      @if (showConfirmDialog()) {
        <div class="modal-overlay" (click)="cancelAccreditation()">
          <div class="modal-confirm" (click)="$event.stopPropagation()">
            <div class="confirm-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3 class="confirm-title">¿Confirmar acreditación?</h3>
            <p class="confirm-message">
              Se acreditará a <strong>{{ pendingParticipant()?.representativeName }}</strong>
              del grupo <strong>{{ pendingParticipant()?.groupName }}</strong>.
            </p>
            <div class="confirm-actions">
              <button class="btn btn-secondary btn-large" (click)="cancelAccreditation()">Cancelar</button>
              <button class="btn btn-accredit-large" (click)="executeAccreditation()" [disabled]="saving()">
                {{ saving() ? 'Acreditando...' : 'Confirmar' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ═══════════ QR SCANNER MODAL ═══════════ -->
      @if (showQRScanner()) {
        <div class="modal-overlay" (click)="closeQRScanner()">
          <div class="modal-qr" (click)="$event.stopPropagation()">
            <div class="qr-header">
              <h3>Escanear código QR</h3>
              <button class="btn-close" (click)="closeQRScanner()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div class="qr-body">
              @if (cameraAvailable()) {
                <div id="qr-video-container" class="qr-video-container">
                  <div id="qr-reader"></div>
                  <div class="qr-overlay">
                    <div class="qr-crosshair">
                      <div class="qr-corner qr-corner-tl"></div>
                      <div class="qr-corner qr-corner-tr"></div>
                      <div class="qr-corner qr-corner-bl"></div>
                      <div class="qr-corner qr-corner-br"></div>
                    </div>
                    <p class="qr-scan-hint">Alineá el código QR dentro del recuadro</p>
                  </div>
                </div>
              } @else {
                <div class="qr-placeholder">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  </svg>
                  <p>{{ cameraError() || 'Cámara no disponible' }}</p>
                </div>
              }
              <div class="qr-manual-section">
                <p class="qr-hint">O ingresá el código manualmente:</p>
                <div class="qr-manual-input">
                  <input type="text" class="form-input" placeholder="Código QR..."
                    [ngModel]="manualQRCode()" (ngModelChange)="manualQRCode.set($event)"
                    (keydown.enter)="searchByQR()" />
                  <button class="btn btn-primary" (click)="searchByQR()">Buscar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ═══════════ ADMIN DASHBOARD ═══════════ -->
      <div class="admin-section">
        <div class="admin-header">
          <h2 class="admin-title">Panel de administración</h2>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card stat-pending">
            <div class="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            <div class="stat-info"><span class="stat-value">{{ stats().pendingCount }}</span><span class="stat-label">Pendientes</span></div>
          </div>
          <div class="stat-card stat-accredited">
            <div class="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
            <div class="stat-info"><span class="stat-value">{{ stats().accreditedTodayCount }}</span><span class="stat-label">Acreditados hoy</span></div>
          </div>
          <div class="stat-card stat-absent">
            <div class="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="11" x2="23" y2="11"/></svg></div>
            <div class="stat-info"><span class="stat-value">{{ stats().absentCount }}</span><span class="stat-label">Ausentes</span></div>
          </div>
          <div class="stat-card stat-late">
            <div class="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            <div class="stat-info"><span class="stat-value">{{ stats().lateCount }}</span><span class="stat-label">Tarde</span></div>
          </div>
          <div class="stat-card stat-total">
            <div class="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
            <div class="stat-info"><span class="stat-value">{{ stats().totalParticipants }}</span><span class="stat-label">Total</span></div>
          </div>
        </div>

        <!-- Filters -->
        <div class="toolbar">
          <div class="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="search-input" placeholder="Buscar en la lista..."
              [ngModel]="adminSearch()" (ngModelChange)="adminSearch.set($event)" />
            @if (adminSearch()) {
              <button class="search-clear" (click)="adminSearch.set('')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            }
          </div>
          <div class="filter-chips">
            <button class="chip" [class.chip-active]="adminFilter() === 'all'" (click)="adminFilter.set('all')">Todos</button>
            <button class="chip" [class.chip-active]="adminFilter() === 'pending'" (click)="adminFilter.set('pending')"><span class="chip-dot" style="background:#64748b"></span>Pendientes</button>
            <button class="chip" [class.chip-active]="adminFilter() === 'accredited'" (click)="adminFilter.set('accredited')"><span class="chip-dot" style="background:#16a34a"></span>Acreditados</button>
          </div>
        </div>

        <!-- Table -->
        @if (loading()) {
          <div class="loading-state"><div class="spinner-lg"></div><p>Cargando...</p></div>
        } @else if (filteredParticipants().length === 0) {
          <div class="empty-state">
            <div class="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
            <h3 class="empty-title">No se encontraron participantes</h3>
            <p class="empty-desc">No hay participantes que coincidan con los filtros.</p>
          </div>
        } @else {
          <div class="data-table">
            <div class="table-scroll">
              <div class="table-header">
                <span class="col-qr">QR</span>
                <span class="col-participant">Participante</span>
                <span class="col-group">Grupo</span>
                <span class="col-category">Categoría</span>
                <span class="col-order">Orden</span>
                <span class="col-time">Horario</span>
                <span class="col-status">Estado</span>
                <span class="col-accredited-at">Acreditado</span>
                <span class="col-actions">Acciones</span>
              </div>
              @for (item of filteredParticipants(); track item.id) {
                <div class="table-row" [class.row-accredited]="item.status === 'accredited'">
                  <span class="col-qr">
                    <button class="btn-qr-small" title="Ver QR" (click)="showParticipantQR(item)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    </button>
                  </span>
                  <span class="col-participant">
                    <span class="participant-name">{{ item.representativeName }}</span>
                    <span class="participant-dni">DNI: {{ item.dni }}</span>
                  </span>
                  <span class="col-group">{{ item.groupName }}</span>
                  <span class="col-category"><span class="badge badge-blue">{{ item.category }}</span></span>
                  <span class="col-order"><span class="order-badge">#{{ item.presentationOrder }}</span></span>
                  <span class="col-time"><span class="time-badge">{{ item.presentationTime }}</span></span>
                  <span class="col-status">
                    <span class="status-badge" [style.background]="getStatusConfig(item.status).bgColor" [style.color]="getStatusConfig(item.status).color">
                      <span class="status-dot" [style.background]="getStatusConfig(item.status).color"></span>
                      {{ getStatusConfig(item.status).label }}
                    </span>
                  </span>
                  <span class="col-accredited-at">
                    @if (item.accreditedAt) {
                      <span class="accredited-time">{{ item.accreditedAt | date:'HH:mm' }}</span>
                    } @else {
                      <span class="no-accredited">—</span>
                    }
                  </span>
                  <span class="col-actions">
                    @if (item.status !== 'accredited' && item.status !== 'blocked') {
                      <button class="btn-icon btn-accredit" title="Acreditar rápido" (click)="quickAccredit(item)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                    }
                  </span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: #f5f3ef; min-height: 100vh; margin: calc(var(--space-4) * -1); padding: var(--space-4); }
    .page-container { max-width: 100%; width: 100%; }

    /* ═══════════ CHECK-IN SECTION ═══════════ */
    .checkin-section {
      background: #fff; border: 1px solid #e0ddd9; border-radius: 18px;
      padding: 32px; margin-bottom: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    }
    .checkin-header { text-align: center; margin-bottom: 24px; }
    .checkin-title { font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
    .checkin-subtitle { font-size: 14px; color: #7a7570; }

    .checkin-search { max-width: 640px; margin: 0 auto 24px; }
    .search-bar-large {
      display: flex; align-items: center; gap: 12px;
      background: #faf9f7; border: 2px solid #e0ddd9; border-radius: 14px;
      padding: 0 20px; transition: all 0.2s;
    }
    .search-focused { border-color: #4c8be6; box-shadow: 0 0 0 4px rgba(76,139,230,0.12); background: #fff; }
    .search-icon { color: #9a9590; flex-shrink: 0; }
    .search-input-large { flex: 1; border: none; outline: none; padding: 18px 0; font-size: 18px; color: #1a1a1a; background: transparent; }
    .search-input-large::placeholder { color: #a09a94; }
    .search-clear-btn { background: none; border: none; cursor: pointer; color: #9a9590; padding: 6px; border-radius: 8px; display: flex; }
    .search-clear-btn:hover { background: #f0ede9; color: #3a3530; }
    .btn-qr {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: 10px; border: none;
      background: #4c8be6; color: #fff; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
    }
    .btn-qr:hover { background: #3a7bd4; }
    .search-hints { text-align: center; margin-top: 10px; }
    .hint { font-size: 12px; color: #9a9590; }
    .hint kbd { background: #f0ede9; border: 1px solid #e0ddd9; border-radius: 4px; padding: 1px 5px; font-size: 11px; font-family: var(--font-mono); }

    /* ═══════════ CHECK-IN RESULT ═══════════ */
    .checkin-result { border-radius: 14px; overflow: hidden; animation: slideUp 0.25s ease; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } }
    .result-content { padding: 32px; text-align: center; }
    .result-icon { margin-bottom: 16px; }
    .result-icon-error svg { color: #dc2626; }
    .result-icon-warning svg { color: #eab308; }
    .result-title { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
    .result-message { font-size: 14px; color: #7a7570; margin-bottom: 20px; }
    .result-details { background: #faf9f7; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; text-align: left; }
    .detail-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .detail-label { font-size: 13px; color: #7a7570; }
    .detail-value { font-size: 13px; font-weight: 600; color: #3a3530; }
    .result-not_found { background: #fef2f2; border: 1px solid #fecaca; }
    .result-not_found .result-title { color: #dc2626; }
    .result-already_accredited { background: #fef9c3; border: 1px solid #fde68a; }
    .result-already_accredited .result-title { color: #a16207; }
    .result-not_approved { background: #fef2f2; border: 1px solid #fecaca; }
    .result-not_approved .result-title { color: #dc2626; }
    .result-found { background: #f0fdf4; border: 1px solid #bbf7d0; }

    /* Participant Summary */
    .participant-summary { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; text-align: left; }
    .participant-photo { width: 80px; height: 80px; border-radius: 16px; overflow: hidden; flex-shrink: 0; }
    .participant-photo img { width: 100%; height: 100%; object-fit: cover; }
    .photo-placeholder {
      width: 100%; height: 100%; background: #e8f0fe; color: #2563eb;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: 700;
    }
    .participant-name-main { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
    .participant-group-main { font-size: 14px; color: #7a7570; margin-bottom: 8px; }
    .participant-meta { display: flex; gap: 16px; flex-wrap: wrap; }
    .meta-item { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: #5a5550; }
    .meta-item svg { color: #9a9590; }

    .schedule-summary {
      display: flex; gap: 16px; justify-content: center; margin-bottom: 28px;
      background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #dcfce7;
    }
    .schedule-item { text-align: center; }
    .schedule-label { display: block; font-size: 11px; color: #9a9590; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .schedule-value { font-size: 16px; font-weight: 600; color: #1a1a1a; }
    .schedule-time { font-family: var(--font-mono); background: #f0fdf4; padding: 4px 12px; border-radius: 8px; }
    .schedule-order { font-family: var(--font-mono); }

    .checkin-actions { display: flex; gap: 12px; justify-content: center; flex-direction: column; align-items: center; }
    .accredited-success-banner { display: flex; align-items: center; gap: 12px; padding: 16px 28px; background: rgba(22,163,74,0.08); border: 1.5px solid rgba(22,163,74,0.25); border-radius: 12px; animation: successPulse 0.6s ease; }
    .accredited-success-text { font-size: 1.1rem; font-weight: 700; color: #16a34a; }
    @keyframes successPulse { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

    /* ═══════════ SUCCESS SCREEN ═══════════ */
    .success-screen {
      background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px;
      padding: 40px; text-align: center; animation: slideUp 0.25s ease;
    }
    .success-icon { color: #16a34a; margin-bottom: 16px; }
    .success-title { font-size: 24px; font-weight: 700; color: #16a34a; margin-bottom: 20px; }
    .success-details { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto; }
    .success-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .success-label { font-size: 13px; color: #7a7570; }
    .success-value { font-size: 13px; font-weight: 600; color: #1a1a1a; }

    /* ═══════════ BUTTONS ═══════════ */
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 500; border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: #4c8be6; color: #fff; box-shadow: 0 2px 8px rgba(76,139,230,0.3); }
    .btn-primary:hover:not(:disabled) { background: #3a7bd4; }
    .btn-secondary { background: #ebe8e4; color: #4a4540; }
    .btn-secondary:hover { background: #e0ddd9; }
    .btn-large { padding: 12px 24px; font-size: 15px; }
    .btn-accredit-xlarge {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 16px 36px; border-radius: 14px; border: none;
      background: #16a34a; color: #fff; font-size: 18px; font-weight: 700;
      cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 16px rgba(22,163,74,0.3);
    }
    .btn-accredit-xlarge:hover { background: #15803d; box-shadow: 0 6px 20px rgba(22,163,74,0.4); transform: translateY(-1px); }
    .btn-accredit-large {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 28px; border-radius: 10px; border: none;
      background: #16a34a; color: #fff; font-size: 15px; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-accredit-large:hover { background: #15803d; }
    .btn-close { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 10px; border: none; background: #f0ede9; color: #7a7570; cursor: pointer; }
    .btn-close:hover { background: #e0ddd9; color: #3a3530; }
    .btn-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: #8a8580; cursor: pointer; transition: all 0.15s; }
    .btn-icon:hover { background: #f0ede9; color: #3a3530; }
    .btn-accredit { color: #16a34a; }
    .btn-accredit:hover { background: #dcfce7; color: #16a34a; }
    .btn-qr-small { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e0ddd9; background: #fff; color: #8a8580; cursor: pointer; }
    .btn-qr-small:hover { background: #f0ede9; color: #4c8be6; border-color: #4c8be6; }

    /* ═══════════ CONFIRM DIALOG ═══════════ */
    .modal-overlay { position: fixed; inset: 0; background: rgba(20,18,16,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); animation: fadeIn 0.15s ease; }
    @keyframes fadeIn { from { opacity: 0; } }
    .modal-confirm { background: #fff; border-radius: 18px; padding: 32px; max-width: 420px; width: 100%; text-align: center; animation: scaleIn 0.2s ease; box-shadow: 0 24px 80px rgba(0,0,0,0.2); }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } }
    .confirm-icon { color: #eab308; margin-bottom: 16px; }
    .confirm-title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; }
    .confirm-message { font-size: 14px; color: #7a7570; margin-bottom: 24px; line-height: 1.5; }
    .confirm-actions { display: flex; gap: 12px; justify-content: center; }

    /* ═══════════ QR MODAL ═══════════ */
    .modal-qr { background: #fff; border-radius: 18px; max-width: 440px; width: 100%; overflow: hidden; animation: scaleIn 0.2s ease; box-shadow: 0 24px 80px rgba(0,0,0,0.2); }
    .qr-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid #f0ede9; }
    .qr-header h3 { font-size: 16px; font-weight: 600; color: #1a1a1a; }
    .qr-body { padding: 0; }
    .qr-video-container {
      position: relative; width: 100%; aspect-ratio: 4/3; background: #000;
      border-radius: 14px 14px 0 0; overflow: hidden;
    }

    .qr-video-container video {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover;
      display: block;
    }
    .qr-overlay {
      position: absolute; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .qr-crosshair {
      width: 200px; height: 200px; position: relative;
    }
    .qr-corner {
      position: absolute; width: 30px; height: 30px; border-color: #4c8be6; border-style: solid;
    }
    .qr-corner-tl { top: 0; left: 0; border-width: 3px 0 0 3px; border-radius: 6px 0 0 0; }
    .qr-corner-tr { top: 0; right: 0; border-width: 3px 3px 0 0; border-radius: 0 6px 0 0; }
    .qr-corner-bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; border-radius: 0 0 0 6px; }
    .qr-corner-br { bottom: 0; right: 0; border-width: 0 3px 3px 0; border-radius: 0 0 6px 0; }
    .qr-scan-hint {
      margin-top: 20px; color: #fff; font-size: 13px; font-weight: 500;
      background: rgba(0,0,0,0.5); padding: 6px 14px; border-radius: 8px;
      backdrop-filter: blur(4px);
    }
    .qr-manual-section { padding: 20px 24px; }
    .qr-hint { font-size: 12px; color: #9a9590; text-align: center; margin-bottom: 10px; }
    .qr-manual-input { display: flex; gap: 8px; }
    .qr-manual-input .form-input { flex: 1; }
    .qr-placeholder {
      text-align: center; color: #9a9590; padding: 32px 24px 16px;
    }
    .qr-placeholder p { margin: 12px 0 4px; font-size: 14px; }
    .form-input { width: 100%; padding: 10px 13px; border: 1.5px solid #e0ddd9; border-radius: 10px; font-size: 14px; color: #1a1a1a; background: #faf9f7; outline: none; box-sizing: border-box; }
    .form-input:focus { border-color: #4c8be6; background: #fff; }
    .form-input::placeholder { color: #a09a94; }

    /* ═══════════ ADMIN SECTION ═══════════ */
    .admin-section { }
    .admin-header { margin-bottom: 20px; }
    .admin-title { font-size: 18px; font-weight: 600; color: #1a1a1a; }

    /* Stats */
    .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px; }
    .stat-card { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid #e0ddd9; border-radius: 12px; padding: 14px 16px; }
    .stat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-pending .stat-icon { background: #f1f5f9; color: #64748b; }
    .stat-accredited .stat-icon { background: #f0fdf4; color: #16a34a; }
    .stat-absent .stat-icon { background: #fef2f2; color: #dc2626; }
    .stat-late .stat-icon { background: #fff7ed; color: #ea580c; }
    .stat-total .stat-icon { background: #eff6ff; color: #2563eb; }
    .stat-value { font-size: 20px; font-weight: 700; color: #1a1a1a; line-height: 1.2; }
    .stat-label { font-size: 11px; color: #7a7570; margin-top: 1px; }

    /* Toolbar */
    .toolbar { margin-bottom: 16px; }
    .search-bar { display: flex; align-items: center; gap: 10px; background: #fff; border: 1.5px solid #e0ddd9; border-radius: 12px; padding: 0 16px; margin-bottom: 12px; transition: all 0.2s; }
    .search-bar:focus-within { border-color: #4c8be6; box-shadow: 0 0 0 3px rgba(76,139,230,0.12); }
    .search-bar svg { color: #9a9590; flex-shrink: 0; }
    .search-input { flex: 1; border: none; outline: none; padding: 12px 0; font-size: 14px; color: #1a1a1a; background: transparent; }
    .search-input::placeholder { color: #a09a94; }
    .search-clear { background: none; border: none; cursor: pointer; color: #9a9590; padding: 4px; border-radius: 6px; display: flex; }
    .search-clear:hover { background: #f0ede9; color: #3a3530; }

    .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 999px; border: 1.5px solid #e0ddd9; background: #fff; color: #5a5550; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .chip:hover { border-color: #c5c0ba; }
    .chip-active { border-color: #4c8be6; background: #e8f0fe; color: #1a56db; }
    .chip-dot { width: 8px; height: 8px; border-radius: 50%; }

    /* Table */
    .data-table { background: #fff; border: 1px solid #e0ddd9; border-radius: 14px; overflow: hidden; }
    .table-scroll { overflow-x: auto; }
    .table-header, .table-row { display: grid; gap: 12px; align-items: center; padding: 12px 16px; font-size: 13px; }
    .table-header { background: #f8f6f3; font-weight: 600; color: #5a5550; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e8e5e1; }
    .table-row { border-bottom: 1px solid #f0ede9; transition: background 0.15s; }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: #faf9f7; }
    .row-accredited { opacity: 0.7; }
    .table-header, .table-row { grid-template-columns: 40px 1.2fr 1fr 0.8fr 50px 70px 0.9fr 70px 60px; }

    .col-participant { display: flex; flex-direction: column; gap: 2px; }
    .participant-name { font-weight: 600; color: #1a1a1a; }
    .participant-dni { font-size: 11px; color: #8a8580; font-family: var(--font-mono); }
    .col-group { color: #3a3530; font-size: 13px; }
    .badge { display: inline-flex; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .badge-blue { background: #e8f0fe; color: #1a56db; }
    .order-badge { font-family: var(--font-mono); font-weight: 700; color: #5a5550; font-size: 12px; }
    .time-badge { font-family: var(--font-mono); font-weight: 600; font-size: 12px; background: #f4f2ef; padding: 3px 8px; border-radius: 6px; }
    .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .status-dot { width: 6px; height: 6px; border-radius: 50%; }
    .accredited-time { font-family: var(--font-mono); font-size: 12px; color: #16a34a; font-weight: 600; }
    .no-accredited { color: #c5c0ba; }
    .col-actions { display: flex; gap: 4px; justify-content: flex-end; }

    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 48px; color: #7a7570; gap: 12px; }
    .spinner-lg { width: 32px; height: 32px; border: 3px solid #e0ddd9; border-top-color: #4c8be6; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 48px 24px; background: #fff; border-radius: 14px; border: 1px solid #e8e5e1; }
    .empty-icon { margin-bottom: 12px; color: #c5c0ba; }
    .empty-title { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px; }
    .empty-desc { font-size: 13px; color: #7a7570; }

    /* ═══════════ RESPONSIVE ═══════════ */
    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(3, 1fr); }
      .table-header, .table-row { grid-template-columns: 36px 1fr 0.8fr 0.7fr 44px 60px 0.8fr 60px 50px; }
    }
    @media (max-width: 768px) {
      :host { margin: calc(var(--space-3) * -1); padding: var(--space-3); }
      .checkin-section { padding: 20px; }
      .checkin-title { font-size: 20px; }
      .search-bar-large { padding: 0 14px; }
      .search-input-large { font-size: 16px; padding: 14px 0; }
      .btn-qr { padding: 8px 14px; font-size: 13px; }
      .participant-summary { flex-direction: column; text-align: center; }
      .participant-meta { justify-content: center; }
      .schedule-summary { flex-wrap: wrap; gap: 12px; }
      .checkin-actions { flex-direction: column; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .table-header { display: none; }
      .table-row { grid-template-columns: 1fr auto; gap: 8px; padding: 14px; position: relative; }
      .col-group, .col-category, .col-order, .col-accredited-at { display: none; }
      .col-actions { position: absolute; top: 14px; right: 14px; }
    }
    @media (max-width: 480px) {
      :host { padding: var(--space-2); }
      .checkin-section { padding: 16px; border-radius: 14px; }
      .checkin-title { font-size: 18px; }
      .search-hints { display: none; }
      .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
      .stat-card { padding: 10px 12px; }
      .schedule-summary { flex-direction: column; gap: 8px; }
    }

    /* ═══════════ DARK MODE ═══════════ */
    :host-context(.dark) { background: #0f1117; }
    :host-context(.dark) .checkin-section { background: #161927; border-color: #2a2d3e; }
    :host-context(.dark) .checkin-title { color: #f1f5f9; }
    :host-context(.dark) .checkin-subtitle { color: #94a3b8; }
    :host-context(.dark) .search-bar-large { background: #1a1d2e; border-color: #2a2d3e; }
    :host-context(.dark) .search-focused { border-color: #4c8be6; background: #1a1d2e; }
    :host-context(.dark) .search-input-large { color: #f1f5f9 !important; }
    :host-context(.dark) .search-input-large::placeholder { color: #64748b !important; }
    :host-context(.dark) .search-clear-btn:hover { background: #2a2d3e; color: #e2e8f0; }
    :host-context(.dark) .hint kbd { background: #1e2130; border-color: #2a2d3e; color: #94a3b8; }

    :host-context(.dark) .result-not_found { background: rgba(220,38,38,0.1); border-color: rgba(220,38,38,0.3); }
    :host-context(.dark) .result-already_accredited { background: rgba(234,179,8,0.1); border-color: rgba(234,179,8,0.3); }
    :host-context(.dark) .result-not_approved { background: rgba(220,38,38,0.1); border-color: rgba(220,38,38,0.3); }
    :host-context(.dark) .result-found { background: rgba(22,163,74,0.1); border-color: rgba(22,163,74,0.3); }
    :host-context(.dark) .result-title { color: #f1f5f9; }
    :host-context(.dark) .result-message { color: #94a3b8; }
    :host-context(.dark) .participant-name-main { color: #f1f5f9; }
    :host-context(.dark) .participant-group-main { color: #94a3b8; }
    :host-context(.dark) .meta-item { color: #94a3b8; }
    :host-context(.dark) .schedule-summary { background: #1a1d2e; border-color: rgba(22,163,74,0.3); }
    :host-context(.dark) .schedule-value { color: #e2e8f0; }
    :host-context(.dark) .schedule-time { background: rgba(22,163,74,0.15); }
    :host-context(.dark) .result-details { background: #1a1d2e; }
    :host-context(.dark) .detail-value { color: #e2e8f0; }

    :host-context(.dark) .success-screen { background: rgba(22,163,74,0.1); border-color: rgba(22,163,74,0.3); }
    :host-context(.dark) .success-title { color: #4ade80; }
    :host-context(.dark) .success-details { background: #1a1d2e; }
    :host-context(.dark) .success-value { color: #e2e8f0; }

    :host-context(.dark) .modal-overlay { background: rgba(0,0,0,0.65); }
    :host-context(.dark) .modal-confirm, :host-context(.dark) .modal-qr { background: #161927; box-shadow: 0 24px 80px rgba(0,0,0,0.5); }
    :host-context(.dark) .confirm-title, :host-context(.dark) .qr-header h3 { color: #f1f5f9; }
    :host-context(.dark) .confirm-message { color: #94a3b8; }
    :host-context(.dark) .qr-manual-section { background: #161927; }
    :host-context(.dark) .qr-hint { color: #64748b; }
    :host-context(.dark) .btn-secondary { background: #2a2d3e; color: #e2e8f0; }
    :host-context(.dark) .btn-secondary:hover { background: #334155; }
    :host-context(.dark) .btn-close { background: #2a2d3e; color: #94a3b8; }
    :host-context(.dark) .btn-close:hover { background: #334155; color: #e2e8f0; }
    :host-context(.dark) .form-input { background: #1a1d2e; border-color: #2a2d3e; color: #f1f5f9 !important; }
    :host-context(.dark) .form-input::placeholder { color: #64748b !important; }
    :host-context(.dark) .form-input:focus { border-color: #4c8be6; }

    :host-context(.dark) .admin-title { color: #f1f5f9; }
    :host-context(.dark) .stat-card { background: #161927; border-color: #2a2d3e; }
    :host-context(.dark) .stat-value { color: #f1f5f9; }
    :host-context(.dark) .search-bar { background: #1a1d2e; border-color: #2a2d3e; }
    :host-context(.dark) .search-input { color: #e2e8f0; }
    :host-context(.dark) .search-input::placeholder { color: #64748b; }
    :host-context(.dark) .chip { background: #1a1d2e; border-color: #2a2d3e; color: #94a3b8; }
    :host-context(.dark) .chip-active { border-color: #4c8be6; background: rgba(76,139,230,0.12); color: #60a5fa; }
    :host-context(.dark) .data-table { background: #161927; border-color: #2a2d3e; }
    :host-context(.dark) .table-header { background: #1a1d2e; color: #94a3b8; border-bottom-color: #2a2d3e; }
    :host-context(.dark) .table-row { border-bottom-color: #1e2130; }
    :host-context(.dark) .table-row:hover { background: #1a1d2e; }
    :host-context(.dark) .participant-name { color: #f1f5f9; }
    :host-context(.dark) .participant-dni { color: #64748b; }
    :host-context(.dark) .col-group { color: #e2e8f0; }
    :host-context(.dark) .badge-blue { background: rgba(37,99,235,0.2); color: #60a5fa; }
    :host-context(.dark) .order-badge { color: #94a3b8; }
    :host-context(.dark) .time-badge { background: #1e2130; color: #e2e8f0; }
    :host-context(.dark) .btn-qr-small { background: #1a1d2e; border-color: #2a2d3e; color: #64748b; }
    :host-context(.dark) .btn-qr-small:hover { background: #2a2d3e; color: #60a5fa; border-color: #4c8be6; }
    :host-context(.dark) input, :host-context(.dark) textarea, :host-context(.dark) select { color: #f1f5f9 !important; }
    :host-context(.dark) input::placeholder, :host-context(.dark) textarea::placeholder { color: #64748b !important; }
  `]
})
export class AcreditacionesPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private acreditacionesService = inject(AcreditacionesService);
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('qrVideo') qrVideo!: ElementRef<HTMLVideoElement>;

  private html5QrCode: Html5Qrcode | null = null;
  private cameraStream: MediaStream | null = null;

  loading = signal(true);
  saving = signal(false);
  searchQuery = signal('');
  searchFocused = signal(false);
  checkInResult = signal<CheckInResult | null>(null);
  showConfirmDialog = signal(false);
  showSuccess = signal(false);
  showQRScanner = signal(false);
  manualQRCode = signal('');
  cameraAvailable = signal(false);
  cameraError = signal('');
  pendingParticipant = signal<AccreditationParticipant | null>(null);
  lastAccredited = signal<AccreditationParticipant | null>(null);
  adminSearch = signal('');
  adminFilter = signal<string>('all');

  participants = signal<AccreditationParticipant[]>([]);
  stats = signal<AccreditationStats>({ pendingCount: 0, accreditedTodayCount: 0, absentCount: 0, lateCount: 0, totalParticipants: 0 });

  filteredParticipants = computed(() => {
    let list = this.participants();
    const search = this.adminSearch().toLowerCase();
    const filter = this.adminFilter();
    if (search) {
      list = list.filter(p => p.representativeName.toLowerCase().includes(search) || p.groupName.toLowerCase().includes(search) || p.dni.includes(search));
    }
    if (filter !== 'all') list = list.filter(p => p.status === filter);
    return list;
  });

  ngOnInit() { this.loadData(); }
  ngAfterViewInit() {}

  loadData() {
    this.loading.set(true);
    this.acreditacionesService.getParticipants({ page_size: 200 }).subscribe({
      next: (res) => {
        this.participants.set(res.data || []);
        this.loading.set(false);
      },
      error: () => { this.participants.set([]); this.loading.set(false); }
    });
    this.acreditacionesService.getStats().subscribe({
      next: (stats) => { this.stats.set(stats); },
      error: () => {}
    });
  }

  getStatusConfig(status: AccreditationStatus) {
    return ACCREDITATION_STATUS_CONFIG[status] || ACCREDITATION_STATUS_CONFIG.pending;
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  // ═══════════ CHECK-IN FLOW ═══════════
  searchParticipant() {
    const query = this.searchQuery().trim();
    if (!query) return;
    this.loading.set(true);
    this.acreditacionesService.checkInByDNI(query).subscribe({
      next: (result) => {
        this.checkInResult.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.checkInResult.set({ type: 'not_found', participant: null, message: 'Error al buscar participante.' });
        this.loading.set(false);
      }
    });
  }

  searchByQR() {
    const code = this.manualQRCode().trim();
    if (!code) return;
    this.closeQRScanner();
    this.loading.set(true);
    this.acreditacionesService.checkInByQR(code).subscribe({
      next: (result) => {
        this.checkInResult.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.checkInResult.set({ type: 'not_found', participant: null, message: 'Error al decodificar QR.' });
        this.loading.set(false);
      }
    });
  }

  confirmAccreditation() {
    this.pendingParticipant.set(this.checkInResult()!.participant);
    this.showConfirmDialog.set(true);
  }

  cancelAccreditation() {
    this.showConfirmDialog.set(false);
    this.pendingParticipant.set(null);
  }

  executeAccreditation() {
    const p = this.pendingParticipant();
    if (!p) return;
    this.saving.set(true);
    this.acreditacionesService.accredit(p.id, 'Operador', 'qr').subscribe({
      next: () => {
        this.participants.update(list => list.map(item => item.id === p.id ? { ...item, status: 'accredited' as AccreditationStatus, accreditedAt: new Date().toISOString(), accreditedBy: 'Operador actual' } : item));
        this.lastAccredited.set({ ...p, status: 'accredited', accreditedAt: new Date().toISOString() });
        this.showConfirmDialog.set(false);
        this.pendingParticipant.set(null);
        this.checkInResult.set(null);
        this.showSuccess.set(true);
        this.saving.set(false);
        this.loadData();
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  quickAccredit(participant: AccreditationParticipant) {
    this.pendingParticipant.set(participant);
    this.showConfirmDialog.set(true);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.checkInResult.set(null);
    this.showSuccess.set(false);
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 100);
  }

  resetCheckIn() {
    this.searchQuery.set('');
    this.checkInResult.set(null);
    this.showSuccess.set(false);
    this.lastAccredited.set(null);
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 100);
  }

  async openQRScanner() {
    this.showQRScanner.set(true);
    this.manualQRCode.set('');
    this.cameraAvailable.set(false);
    this.cameraError.set('');

    setTimeout(async () => {
      try {
        this.html5QrCode = new Html5Qrcode('qr-video-container');
        const instance = this.html5QrCode;
        await instance.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decoded: string) => {
            if (decoded && decoded !== this.manualQRCode()) {
              this.manualQRCode.set(decoded);
              this.stopQRScanner();
              this.searchByQR();
            }
          },
          (error: any) => {
            // Ignore minor scan errors
          }
        );
        this.cameraAvailable.set(true);
      } catch (err: any) {
        console.warn('Camera access failed:', err);
        this.cameraAvailable.set(false);
        if (err?.name === 'NotAllowedError' || err?.message?.includes('permission')) {
          this.cameraError.set('Permiso de cámara denegado. Permití el acceso y volvé a intentar.');
        } else if (err?.name === 'NotFoundError' || err?.message?.includes('no camera')) {
          this.cameraError.set('No se encontró cámara en este dispositivo.');
        } else {
          this.cameraError.set('No se pudo acceder a la cámara: ' + err?.message || 'Error desconocido');
        }
      }
    }, 100);
  }

  private stopQRScanner() {
    if (this.html5QrCode) {
      try {
        this.html5QrCode.clear();
      } catch (e) {}
      this.html5QrCode = null;
    }
    this.cameraAvailable.set(false);
  }

  closeQRScanner() {
    this.stopQRScanner();
    this.showQRScanner.set(false);
  }

  ngOnDestroy() {
    this.stopQRScanner();
  }
  showParticipantQR(item: AccreditationParticipant) { alert(`QR Code: ${item.registrationNumber}`); }

  private updateStats() {
    const list = this.participants();
    const today = new Date().toISOString().split('T')[0];
    this.stats.set({
      pendingCount: list.filter(p => p.status === 'pending').length,
      accreditedTodayCount: list.filter(p => p.status === 'accredited' && p.accreditedAt?.startsWith(today)).length,
      absentCount: list.filter(p => p.status === 'pending' && p.presentationDay < today).length,
      lateCount: list.filter(p => p.status === 'pending' && p.presentationDay === today).length,
      totalParticipants: list.length,
    });
  }

  // ═══════════ KEYBOARD SHORTCUTS ═══════════
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (this.showConfirmDialog()) this.cancelAccreditation();
      else if (this.showQRScanner()) this.closeQRScanner();
      else if (this.checkInResult()) this.clearSearch();
    }
    if (event.key === 'Enter' && this.checkInResult()?.type === 'found' && !this.showConfirmDialog()) {
      this.clearSearch();
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.searchInput?.nativeElement?.focus();
    }
  }
}
