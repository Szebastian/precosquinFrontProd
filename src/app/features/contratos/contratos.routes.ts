import { Routes } from '@angular/router';

export const CONTRATOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./contratos.page').then(m => m.ContratosPageComponent)
  }
];
