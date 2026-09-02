import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InscriptionsService, Inscription } from '@core/services/inscriptions.service';
import { StagePlotComponent } from '../public/inscripcion/components/stage-plot/stage-plot.component';

@Component({
  selector: 'app-stage-plots-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StagePlotComponent],
  template: `
    <div class="sp-page">
      <!-- Header -->
      <div class="sp-header">
        <div class="sp-header-left">
          <a routerLink="/panel/dashboard" class="sp-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          </a>
          <div>
            <h1 class="sp-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></svg>
              Stage Plots
            </h1>
            <p class="sp-subtitle">Vista del sonido para organizar el escenario</p>
          </div>
        </div>
        <div class="sp-header-right">
          <span class="sp-count">{{ filteredPlots().length }} artista{{ filteredPlots().length === 1 ? '' : 's' }}</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="sp-filters">
        <div class="sp-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar por nombre, nombre artístico..." [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" class="sp-search-input" />
        </div>
        <select [ngModel]="filterCategory()" (ngModelChange)="filterCategory.set($event)" class="sp-select">
          <option value="">Todas las categorías</option>
          <option value="musica">Música</option>
          <option value="danza">Danza</option>
        </select>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="sp-loading">
          <div class="spinner"></div>
          <span>Cargando stage plots...</span>
        </div>
      }

      <!-- Empty -->
      @if (!loading() && filteredPlots().length === 0) {
        <div class="sp-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>
          <p>No hay stage plots para mostrar</p>
          <span>Las inscripciones con rider técnico aparecerán acá</span>
        </div>
      }

      <!-- TABLE -->
      @if (!loading() && filteredPlots().length > 0) {
        <div class="sp-table-wrap">
          <table class="sp-table">
            <thead>
              <tr>
                <th class="th-artist">Artista</th>
                <th class="th-cat">Categoría</th>
                <th class="th-inst">Instrumentos</th>
                <th class="th-mic">Micrófonos</th>
                <th class="th-di">DI</th>
                <th class="th-mon">Monitores</th>
                <th class="th-needs">Necesidades</th>
                <th class="th-action"></th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredPlots(); track item.inscription.id) {
                <!-- Main Row -->
                <tr class="sp-row" [class.sp-row-expanded]="expandedId() === item.inscription.id" (click)="toggleExpand(item.inscription.id)">
                  <td class="td-artist">
                    <div class="artist-cell">
                      <div class="artist-avatar">
                        @if (photoUrls()[item.inscription.id]) {
                          <img [src]="photoUrls()[item.inscription.id]" [alt]="item.inscription.full_name" />
                        } @else if (item.inscription.promo_photo_url) {
                          <img [src]="item.inscription.promo_photo_url" [alt]="item.inscription.full_name" />
                        } @else {
                          <span class="avatar-initials">{{ getInitials(item.inscription.full_name) }}</span>
                        }
                      </div>
                      <div class="artist-info">
                        <span class="artist-name">{{ item.inscription.stage_name || item.inscription.full_name }}</span>
                        <span class="artist-realname">{{ item.inscription.full_name }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="td-cat">
                    <span class="cat-chip" [class.cat-musica]="item.inscription.category === 'musica'" [class.cat-danza]="item.inscription.category === 'danza'">
                      {{ getSubcategoryLabel(item.inscription.subcategory) }}
                    </span>
                  </td>
                  <td class="td-inst">
                    @if (item.instrumentCount > 0) {
                      <span class="cell-count cell-count--blue">{{ item.instrumentCount }}</span>
                    } @else {
                      <span class="cell-empty">—</span>
                    }
                  </td>
                  <td class="td-mic">
                    @if (item.rider?.sonido?.microfonos?.length) {
                      <span class="cell-count cell-count--cyan">{{ item.rider.sonido.microfonos.length }}</span>
                    } @else {
                      <span class="cell-empty">—</span>
                    }
                  </td>
                  <td class="td-di">
                    @if (item.rider?.sonido?.diBoxes) {
                      <span class="cell-count cell-count--yellow">{{ item.rider.sonido.diBoxes }}</span>
                    } @else {
                      <span class="cell-empty">—</span>
                    }
                  </td>
                  <td class="td-mon">
                    @if (item.rider?.sonido?.monitorCount) {
                      <span class="cell-count cell-count--orange">{{ item.rider.sonido.monitorCount }}</span>
                    } @else {
                      <span class="cell-empty">—</span>
                    }
                  </td>
                  <td class="td-needs">
                    @if (item.inscription.technical_needs) {
                      <span class="needs-preview">{{ item.inscription.technical_needs }}</span>
                    } @else {
                      <span class="cell-empty">—</span>
                    }
                  </td>
                  <td class="td-action">
                    <svg class="expand-arrow" [class.rotated]="expandedId() === item.inscription.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </td>
                </tr>

                <!-- Expanded Detail -->
                @if (expandedId() === item.inscription.id) {
                  <tr class="sp-detail-row">
                    <td colspan="8">
                      <div class="sp-detail">
                        <!-- Two column layout -->
                        <div class="sp-detail-grid">
                          <!-- Left: Stage Plot -->
                          <div class="sp-detail-left">
                            @if (item.instrumentCount > 0) {
                              <h4 class="detail-title">Stage Plot</h4>
                              <div class="sp-stage-plot">
                                <app-stage-plot
                                  [initialInstruments]="item.rider.stagePlotInstruments"
                                  [category]="item.inscription.category"
                                  [readonly]="true">
                                </app-stage-plot>
                              </div>
                            } @else {
                              <div class="no-stage-plot">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.25"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                                <p>Sin stage plot configurado</p>
                              </div>
                            }
                          </div>

                          <!-- Right: Info -->
                          <div class="sp-detail-right">
                            <!-- Sonido -->
                            @if (item.rider?.sonido) {
                              <div class="detail-section">
                                <h5 class="detail-section-title">Sonido</h5>
                                <div class="detail-kv">
                                  @if (item.rider.sonido.microfonos?.length) {
                                    <div class="kv-row"><span class="kv-label">Micrófonos</span><div class="kv-tags">@for (m of item.rider.sonido.microfonos; track m) { <span class="kv-tag">{{ m }}</span> }</div></div>
                                  }
                                  @if (item.rider.sonido.diBoxes) {
                                    <div class="kv-row"><span class="kv-label">DI Boxes</span><span class="kv-val kv-val--accent">{{ item.rider.sonido.diBoxes }}</span></div>
                                  }
                                  @if (item.rider.sonido.cables?.length) {
                                    <div class="kv-row"><span class="kv-label">Cables</span><div class="kv-tags">@for (c of item.rider.sonido.cables; track c) { <span class="kv-tag">{{ c }}</span> }</div></div>
                                  }
                                  @if (item.rider.sonido.backline?.length) {
                                    <div class="kv-row"><span class="kv-label">Backline</span><div class="kv-tags">@for (b of item.rider.sonido.backline; track b) { <span class="kv-tag">{{ b }}</span> }</div></div>
                                  }
                                </div>
                              </div>
                            }

                            <!-- Input List -->
                            @if (item.rider?.inputList?.length) {
                              <div class="detail-section">
                                <h5 class="detail-section-title">Input List — {{ item.rider.inputList.length }} canales</h5>
                                <div class="input-table">
                                  @for (ch of item.rider.inputList; track $index) {
                                    <div class="input-row">
                                      <span class="input-num">{{ $index + 1 }}</span>
                                      <span class="input-source">{{ ch.source || ch.micType }}</span>
                                      @if (ch.micType) { <span class="input-type">{{ ch.micType }}</span> }
                                      @if (ch.fxInsert) { <span class="input-fx">FX:{{ ch.fxInsert }}</span> }
                                      @if (ch.phantom) { <span class="input-phantom">48V</span> }
                                    </div>
                                  }
                                </div>
                              </div>
                            }

                            <!-- Monitor Mixes -->
                            @if (item.rider?.monitorMixes?.length) {
                              <div class="detail-section">
                                <h5 class="detail-section-title">Mezclas de Monitor</h5>
                                <div class="monitor-chips">
                                  @for (mix of item.rider.monitorMixes; track $index) {
                                    <div class="monitor-chip">
                                      <span class="monitor-label">{{ mix.label || 'MON ' + ($index + 1) }}</span>
                                      <span class="monitor-items">{{ mix.items?.join(', ') || '—' }}</span>
                                    </div>
                                  }
                                </div>
                              </div>
                            }

                            <!-- Needs / Notes -->
                            @if (item.inscription.technical_needs || item.rider?.otros) {
                              <div class="detail-section">
                                @if (item.inscription.technical_needs) {
                                  <h5 class="detail-section-title">Necesidades Técnicas</h5>
                                  <p class="detail-text">{{ item.inscription.technical_needs }}</p>
                                }
                                @if (item.rider?.otros) {
                                  <h5 class="detail-section-title" style="margin-top:0.5rem">Otros</h5>
                                  <p class="detail-text">{{ item.rider.otros }}</p>
                                }
                              </div>
                            }
                          </div>
                        </div>

                        <div class="sp-detail-footer">
                          <a [routerLink]="['/panel/inscripciones', item.inscription.id]" class="sp-profile-link" (click)="$event.stopPropagation()">
                            Ver inscripción completa →
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styleUrl: './stage-plots.page.scss'
})
export class StagePlotsPageComponent implements OnInit, OnDestroy {
  private inscriptionsService = inject(InscriptionsService);

  loading = signal(true);
  searchQuery = signal('');
  filterCategory = signal('');
  expandedId = signal<string | null>(null);
  photoUrls = signal<Record<string, string>>({});

  allPlots = signal<{ inscription: Inscription; rider: any; instrumentCount: number }[]>([]);

  filteredPlots = computed(() => {
    let items = this.allPlots();
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.filterCategory();

    if (q) {
      items = items.filter(i =>
        i.inscription.full_name?.toLowerCase().includes(q) ||
        i.inscription.stage_name?.toLowerCase().includes(q) ||
        i.inscription.artistic_name?.toLowerCase().includes(q)
      );
    }
    if (cat) {
      items = items.filter(i => i.inscription.category === cat);
    }
    return items;
  });

  ngOnInit(): void {
    this.loadPlots();
  }

  ngOnDestroy(): void {}

  loadPlots(): void {
    this.loading.set(true);
    this.inscriptionsService.getInscriptions({ page_size: 200 }).subscribe({
      next: (res) => {
        const plots = (res.data || [])
          .filter(i => i.rider_tecnico)
          .map(i => ({
            inscription: i,
            rider: i.rider_tecnico,
            instrumentCount: i.rider_tecnico?.stagePlotInstruments?.length || 0,
          }))
          .sort((a, b) => b.instrumentCount - a.instrumentCount);
        this.allPlots.set(plots);
        this.loading.set(false);
        this.resolvePhotos(plots);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private resolvePhotos(plots: { inscription: Inscription }[]): void {
    plots.forEach(p => {
      const photo = p.inscription.promo_photo_url;
      if (photo && !photo.startsWith('http')) {
        this.inscriptionsService.getPublicUrl(photo).subscribe({
          next: (res) => {
            if (res.public_url) {
              this.photoUrls.update(urls => ({ ...urls, [p.inscription.id]: res.public_url }));
            }
          },
          error: () => {}
        });
      }
    });
  }

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getSubcategoryLabel(sub: string): string {
    const map: Record<string, string> = {
      solista_vocal: 'Solista Vocal',
      solista_instrumental: 'Solista Inst.',
      duo_vocal: 'Dúo Vocal',
      conjunto_vocal: 'Conj. Vocal',
      conjunto_instrumental: 'Conj. Instrumental',
      malambo_masculino: 'Malambo Masc.',
      malambo_femenino: 'Malambo Fem.',
      conjunto_malambo: 'Conj. Malambo',
      pareja_tradicional: 'Pareja Trad.',
      pareja_estilizada: 'Pareja Estil.',
      conjunto_baile: 'Conj. Baile',
      baile_suelto_solo: 'Baile Suelto',
      baile_suelto_pareja: 'Baile Pareja',
    };
    return map[sub] || sub?.replace(/_/g, ' ') || '';
  }

}
