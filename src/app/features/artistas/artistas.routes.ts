import { Routes } from '@angular/router';

export const ARTISTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./artistas-list.page').then(m => m.ArtistasListPageComponent)
  }
];
