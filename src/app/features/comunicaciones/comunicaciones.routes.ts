import { Routes } from '@angular/router';

export const COMUNICACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./comunicaciones.page').then(m => m.ComunicacionesPageComponent)
  }
];
