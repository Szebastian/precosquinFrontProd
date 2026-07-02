import { Routes } from '@angular/router';

export const STAFF_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./staff.page').then(m => m.StaffPageComponent)
  }
];
