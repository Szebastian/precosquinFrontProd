import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step1-3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div [class]="lastDirection() === 'left' ? 'step-content slide-left' : 'step-content slide-right'">
      <div class="form-group">
        <label class="form-label" for="birthDate">¿Cuál es tu fecha de nacimiento?</label>
        <input type="date" id="birthDate" name="birthDate" required class="form-input"
          [(ngModel)]="data().birthDate" />
        <span class="form-hint">Debés tener al menos 16 años</span>
      </div>
    </div>
  `,
  styles: [`
    .step-content { min-height: 200px; }
    .slide-left { animation: slideLeft 0.3s ease-out; }
    .slide-right { animation: slideRight 0.3s ease-out; }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class Step1_3Component {
  data = input.required<any>();
  lastDirection = input.required<'left' | 'right'>();
}