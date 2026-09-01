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
    { src: 'assets/img/logoRayentray.webp', alt: 'Rayentray', width: 160, height: 80 },
    { src: 'assets/img/bancodelchubut.webp', alt: 'Banco del Chubut', width: 160, height: 80 },
    { src: 'assets/img/LHydro.webp', alt: 'Hidro', width: 160, height: 80 },
    { src: 'assets/img/logoHH.webp', alt: 'HH', width: 160, height: 80 },
    { src: 'assets/img/BodegonElRefugio.webp', alt: 'Bodegón El Refugio', width: 160, height: 80 },
    { src: 'assets/img/ElRefugioPIramiLogo.webp', alt: 'El Refugio Pirámides', width: 160, height: 80 },
    { src: 'assets/img/logoLaReservaEnElMar.webp', alt: 'La Reserva En El Mar', width: 160, height: 80 }
  ];
}
