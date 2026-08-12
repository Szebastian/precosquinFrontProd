import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin.page').then(m => m.AdminPageComponent)
  },
  {
    path: 'stands',
    loadComponent: () => import('./stands/admin-stands.page').then(m => m.AdminStandsPageComponent),
    data: { title: 'Gestión de Stands', roles: ['admin', 'organizador', 'staff'] }
  }
];
