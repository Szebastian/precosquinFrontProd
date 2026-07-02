import { Routes } from '@angular/router';

export const NOTICIAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./noticias.page').then(m => m.NoticiasPageComponent)
  }
];
// force compile
