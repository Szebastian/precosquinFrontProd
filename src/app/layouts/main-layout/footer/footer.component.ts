import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { PartnersService, Partner } from '@core/services/partners.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  private readonly _currentYear = signal(new Date().getFullYear());
  readonly currentYear = computed(() => this._currentYear());
  private partnersService = inject(PartnersService);

  readonly sponsors = signal<{ src: string; alt: string; width: number; height: number }[]>([]);

  ngOnInit(): void {
    this.partnersService.getPublicList().subscribe({
      next: (res) => {
        const all = res.data || [];
        this.sponsors.set(all.map(p => ({
          src: p.logo_url,
          alt: p.name,
          width: 160,
          height: 80
        })));
      }
    });
  }
}
