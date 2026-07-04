import { Component, input, computed } from '@angular/core';

export interface StepInfo {
  number: number;
  label: string;
}

@Component({
  selector: 'app-inscripcion-step-indicator',
  standalone: true,
  template: `
    <div class="steps-indicator">
      <div class="progress-bar-wrapper">
        <div class="progress-bar-fill" [style.width.%]="progressPercentage()"></div>
        <span class="progress-bar-text">{{ progressPercentage() }}% completado</span>
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
  `,
  styles: [`
    .steps-indicator { margin-bottom: var(--space-8); }
    .progress-bar-wrapper { position: relative; height: 6px; background: var(--gray-200); border-radius: 999px; margin-bottom: var(--space-4); overflow: hidden; }
    .progress-bar-fill { height: 100%; background: var(--brand-500); border-radius: 999px; transition: width 0.5s ease; }
    .progress-bar-text { position: absolute; right: 0; top: -20px; font-size: 11px; font-weight: var(--weight-bold); color: var(--gray-500); }
    .steps-row { display: flex; align-items: center; justify-content: space-between; }
    .step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .step-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: var(--weight-bold); background: var(--gray-200); color: var(--gray-500); transition: all 0.3s ease; }
    .step.active .step-circle { background: var(--brand-500); color: white; transform: scale(1.1); }
    .step.completed .step-circle { background: #22c55e; color: white; }
    .step-label { font-size: 11px; font-weight: var(--weight-bold); color: var(--gray-500); }
    .step.active .step-label { color: var(--brand-600); }
    .step.completed .step-label { color: #22c55e; }
    .step-line { flex: 1; height: 2px; background: var(--gray-200); margin: 0 var(--space-2); margin-bottom: 20px; transition: background 0.3s ease; }
    .step-line.completed { background: #22c55e; }
  `]
})
export class InscripcionStepIndicatorComponent {
  currentStep = input.required<number>();
  steps = input.required<StepInfo[]>();

  visibleSteps = computed(() => this.steps().filter(s => s.number <= 7));
  progressPercentage = computed(() => Math.round((this.currentStep() / 7) * 100));
}
