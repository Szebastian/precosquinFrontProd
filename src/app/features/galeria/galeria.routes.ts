import { Routes } from '@angular/router';

export const GALERIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./galeria.page').then(m => m.GaleriaPageComponent),
  },
];
