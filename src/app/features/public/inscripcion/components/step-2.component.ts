import { Component, input, signal, computed, output, HostListener, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscripcionData } from '../inscripcion.page';
import { subcategoriesByCategory, groupSubcategories } from '../inscripcion.page';

@Component({
  selector: 'app-inscripcion-step-2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
      <p class="step-desc" style="margin-top: 0;">Elegí en qué querés competir</p>

      <span class="section-label">¿Qué vas a presentar? *</span>
      <div class="category-cards">
        <label class="category-card" [class.selected]="data().category === 'musica'">
          <input type="radio" name="category" value="musica" [(ngModel)]="data().category" (ngModelChange)="onCategoryChange()" />
          <div class="category-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <div class="category-info">
            <span class="category-name">Música</span>
            <span class="category-count">6 subcategorías</span>
          </div>
        </label>
        <label class="category-card" [class.selected]="data().category === 'danza'">
          <input type="radio" name="category" value="danza" [(ngModel)]="data().category" (ngModelChange)="onCategoryChange()" />
          <div class="category-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div class="category-info">
            <span class="category-name">Danza</span>
            <span class="category-count">6 subcategorías</span>
          </div>
        </label>
      </div>

      @if (data().category) {
        <div class="subcategory-section">
          <span class="section-label">¿En cuál categoría? *</span>
          <div class="subcategory-grid">
            @for (sub of currentSubcategories; track sub.id) {
              <label class="subcategory-chip" [class.selected]="data().subcategory === sub.id">
                <input type="radio" name="subcategory" [value]="sub.id" [(ngModel)]="data().subcategory" />
                {{ sub.name }}
              </label>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .step-content { min-height: 200px; padding-bottom: 1rem; }
    .slide-left { animation: slideLeft 0.3s ease-out; }
    .slide-right { animation: slideRight 0.3s ease-out; }
    .animate-fade-in { animation: fadeIn 0.35s ease-out; }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    .step-desc {
      font-size: 0.95rem;
      color: #94a3b8;
      margin-bottom: 1.75rem;
      line-height: 1.5;
    }

    .section-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.75rem;
      display: block;
    }

    .category-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .category-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.75rem;
      background: rgba(255, 255, 255, 0.02);
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.25, 0.1, 0.25, 1);
      position: relative;
      overflow: hidden;
    }

    .category-card input[type="radio"] {
      display: none;
    }

    .category-card:hover {
      border-color: rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.04);
      transform: translateY(-1px);
    }

    .category-card.selected {
      border-color: #4c8be6;
      background: rgba(76, 139, 230, 0.08);
      box-shadow: 0 0 20px rgba(76, 139, 230, 0.08);
    }

    .category-card.selected .category-icon {
      background: rgba(76, 139, 230, 0.15);
      color: #7eb5f7;
    }

    .category-card.selected .category-name {
      color: #e2e8f0;
    }

    .category-card:active {
      transform: scale(0.98);
    }

    .category-icon {
      width: 48px;
      height: 48px;
      border-radius: 0.625rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      color: #64748b;
      flex-shrink: 0;
      transition: all 0.25s ease;
    }

    .category-card.selected .category-icon svg {
      stroke: #7eb5f7;
    }

    .category-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .category-name {
      font-size: 1rem;
      font-weight: 600;
      color: #cbd5e1;
      transition: color 0.25s ease;
    }

    .category-count {
      font-size: 0.75rem;
      color: #475569;
    }

    .subcategory-section {
      animation: fadeIn 0.35s ease-out;
    }

    .subcategory-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .subcategory-chip {
      display: inline-flex;
      align-items: center;
      padding: 0.6rem 1.1rem;
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      background: transparent;
      color: #94a3b8;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .subcategory-chip input[type="radio"] {
      display: none;
    }

    .subcategory-chip:hover {
      border-color: rgba(255, 255, 255, 0.18);
      color: #e2e8f0;
      background: rgba(255, 255, 255, 0.03);
    }

    .subcategory-chip.selected {
      border-color: #4c8be6;
      background: rgba(76, 139, 230, 0.1);
      color: #7eb5f7;
      font-weight: 600;
    }

    .subcategory-chip:active {
      transform: scale(0.96);
    }

    @media (max-width: 640px) {
      .category-cards { grid-template-columns: 1fr; }
      .category-card { padding: 1rem; }
      .subcategory-chip { font-size: 0.8rem; padding: 0.5rem 0.9rem; }
    }
  `]
})
export class InscripcionStep2Component {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
  goToStep = output<number>();

  onCategoryChange(): void {
    (this.data() as any).category = this.data().category;
    (this.data() as any).subcategory = '';
  }

  subcategories = computed(() => subcategoriesByCategory[this.data().category] || []);
  groupSubcategories = groupSubcategories;

  get currentSubcategories() {
    return subcategoriesByCategory[this.data().category] || [];
  }
}
