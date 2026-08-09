import { Routes } from '@angular/router';

export const JURADO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./jurado.page').then(m => m.JuradoPageComponent)
  },
  {
    path: 'inscripciones',
    loadComponent: () => import('./jurado-inscripciones.page').then(m => m.JuradoInscripcionesPageComponent)
  },
  {
    path: 'admission',
    loadComponent: () => import('./jurado-admission.page').then(m => m.InscriptionsAdmissionComponent)
  }
];
