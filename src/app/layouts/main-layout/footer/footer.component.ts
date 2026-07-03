import { Component, signal, computed } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  private readonly _currentYear = signal(new Date().getFullYear());
  readonly currentYear = computed(() => this._currentYear());

  readonly sponsors = [
    { src: 'assets/img/LPiramides.webp', alt: 'Municipalidad', width: 160, height: 80 },
    { src: 'assets/img/LRayentray.webp', alt: 'Rayentray', width: 160, height: 80 },
    { src: 'assets/img/LHydro.webp', alt: 'Hidro', width: 160, height: 80 }
  ];
}
