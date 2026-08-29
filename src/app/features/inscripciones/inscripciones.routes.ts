import { Routes } from '@angular/router';

export const INSCRIPCIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./inscripciones-list.page').then(m => m.InscripcionesListPageComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./inscripciones-profile.page').then(m => m.InscripcionesProfilePageComponent)
  }
];
