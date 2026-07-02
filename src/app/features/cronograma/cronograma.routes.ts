import { Routes } from '@angular/router';

export const CRONOGRAMA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./cronograma.page').then(m => m.CronogramaPageComponent)
  }
];
