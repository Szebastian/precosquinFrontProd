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
    { src: 'assets/MUNI-LOGO2.svg', alt: 'Municipalidad', width: 160, height: 80 },
    { src: 'assets/rayentray.png', alt: 'Rayentray', width: 160, height: 80 },
    { src: 'assets/hidro.jpeg', alt: 'Hidro', width: 160, height: 80 }
  ];
}
