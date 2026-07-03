import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface Breadcrumb {
  label: string;
  path: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private router = inject(Router);

  breadcrumbs = signal<Breadcrumb[]>([]);

  private routeLabels: Record<string, string> = {
    'institucional': 'Institucional',
    'declaracion': 'Declaración N° 35/26',
    'documentacion': 'Documentación',
    'noticias': 'Noticias',
    'inscripcion': 'Inscripción',
    'auth': 'Acceso',
    'login': 'Login',
  };

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.buildBreadcrumbs();
      });
  }

  private buildBreadcrumbs() {
    const url = this.router.url;
    const segments = url.split('/').filter(s => s);
    const crumbs: Breadcrumb[] = [{ label: 'Inicio', path: '/' }];

    let path = '';
    for (const segment of segments) {
      path += '/' + segment;
      const label = this.routeLabels[segment] || this.formatLabel(segment);
      crumbs.push({ label, path });
    }

    this.breadcrumbs.set(crumbs);
  }

  formatLabel(segment: string): string {
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}
