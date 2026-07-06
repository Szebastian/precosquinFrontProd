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
      <p class="step-desc" style="margin-top: 0;">Seleccioná la categoría y subcategoría de tu presentación</p>

      <div class="form-group">
        <label class="form-label">Categoría *</label>
        <div class="category-cards">
          <label class="category-card" [class.selected]="data().category === 'musica'">
            <input type="radio" name="category" value="musica" [(ngModel)]="data().category" (ngModelChange)="onCategoryChange()" />
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
          <label class="category-card" [class.selected]="data().category === 'danza'">
            <input type="radio" name="category" value="danza" [(ngModel)]="data().category" (ngModelChange)="onCategoryChange()" />
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

      @if (data().category) {
        <div class="form-group animate-fade-in">
          <label class="form-label">Subcategoría *</label>
          <div class="subcategory-grid">
            @for (sub of subcategories(); track sub.id) {
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
    .step-content { min-height: 200px; }
    .slide-left { animation: slideLeft 0.3s ease-out; }
    .slide-right { animation: slideRight 0.3s ease-out; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class InscripcionStep2Component {
  data = input.required<InscripcionData>();
  lastDirection = input.required<'left' | 'right'>();
  goToStep = output<number>();

  onCategoryChange(): void {
    (this.data as any).category = this.data().category;
    (this.data as any).subcategory = '';
  }

  subcategories = computed(() => subcategoriesByCategory[this.data().category] || []);
  groupSubcategories = groupSubcategories;
}
