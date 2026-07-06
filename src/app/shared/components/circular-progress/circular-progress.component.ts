import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-circular-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './circular-progress.component.html',
  styleUrl: './circular-progress.component.scss'
})
export class CircularProgressComponent {
  progress = input.required<number>(); // Percentage
  currentStep = input.required<number>();
  totalSteps = input.required<number>();

  get circumference(): number {
    return 2 * Math.PI * 50; // Radius of 50 for a 100x100 SVG viewbox
  }

  get strokeDasharray(): string {
    const progressOffset = this.circumference - (this.progress() / 100) * this.circumference;
    return `${this.circumference} ${this.circumference}`;
  }

  get strokeDashoffset(): number {
    return this.circumference - (this.progress() / 100) * this.circumference;
  }
}