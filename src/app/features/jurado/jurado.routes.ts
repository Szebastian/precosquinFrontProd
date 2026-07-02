import { Routes } from '@angular/router';

export const JURADO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./jurado.page').then(m => m.JuradoPageComponent)
  },
  {
    path: 'inscripciones',
    loadComponent: () => import('./jurado-inscripciones.page').then(m => m.JuradoInscripcionesPageComponent)
  }
];
