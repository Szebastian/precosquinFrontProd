import { Routes } from '@angular/router';

export const ACREDITACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./acreditaciones.page').then(m => m.AcreditacionesPageComponent)
  }
];
