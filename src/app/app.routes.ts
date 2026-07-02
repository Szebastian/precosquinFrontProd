import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { publicGuard } from './core/auth/public.guard';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/home/home.page').then(m => m.HomePageComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'panel',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.page').then(m => m.DashboardPageComponent),
        data: { title: 'Dashboard', roles: ['organizador', 'admin', 'staff', 'jurado'] }
      },
      {
        path: 'inscripciones',
        loadChildren: () => import('./features/inscripciones/inscripciones.routes').then(m => m.INSCRIPCIONES_ROUTES),
        data: { roles: ['organizador', 'admin', 'staff'] }
      },
      {
        path: 'artistas',
        loadChildren: () => import('./features/artistas/artistas.routes').then(m => m.ARTISTAS_ROUTES),
        data: { roles: ['organizador', 'admin', 'staff', 'jurado'] }
      },
      {
        path: 'cronograma',
        loadChildren: () => import('./features/cronograma/cronograma.routes').then(m => m.CRONOGRAMA_ROUTES),
        data: { roles: ['organizador', 'admin', 'staff'] }
      },
      {
        path: 'jurado',
        loadChildren: () => import('./features/jurado/jurado.routes').then(m => m.JURADO_ROUTES),
        data: { roles: ['admin'] }
      },
      {
        path: 'staff',
        loadChildren: () => import('./features/staff/staff.routes').then(m => m.STAFF_ROUTES),
        data: { roles: ['staff', 'organizador', 'admin'] }
      },
      {
        path: 'comunicaciones',
        loadChildren: () => import('./features/comunicaciones/comunicaciones.routes').then(m => m.COMUNICACIONES_ROUTES),
        data: { roles: ['organizador', 'admin', 'staff'] }
      },
      {
        path: 'contratos',
        loadChildren: () => import('./features/contratos/contratos.routes').then(m => m.CONTRATOS_ROUTES),
        data: { roles: ['organizador', 'admin'] }
      },
      {
        path: 'reportes',
        loadChildren: () => import('./features/reportes/reportes.routes').then(m => m.REPORTES_ROUTES),
        data: { roles: ['organizador', 'admin'] }
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
        data: { roles: ['admin'] }
      },
      {
        path: 'noticias',
        loadChildren: () => import('./features/noticias/noticias.routes').then(m => m.NOTICIAS_ROUTES),
        data: { roles: ['organizador', 'admin', 'staff'] }
      }
    ]
  },
  {
    path: 'inscripcion',
    loadComponent: () => import('./features/public/inscripcion/inscripcion.page').then(m => m.InscripcionPageComponent),
    canActivate: [publicGuard],
    data: { title: 'Inscripción de Artista' }
  },
  {
    path: 'noticias',
    loadComponent: () => import('./features/public/noticias/noticias-public.page').then(m => m.NoticiasPublicPageComponent),
    canActivate: [publicGuard],
    data: { title: 'Noticias' }
  },
  {
    path: 'noticias/:id',
    loadComponent: () => import('./features/public/noticias/noticia-detail.page').then(m => m.NoticiaDetailPageComponent),
    canActivate: [publicGuard],
    data: { title: 'Noticia' }
  },
  {
    path: 'documentacion',
    loadComponent: () => import('./features/public/documentacion/documentacion.page').then(m => m.DocumentacionPageComponent),
    canActivate: [publicGuard],
    data: { title: 'Documentación' }
  },
  {
    path: 'firmar/:token',
    loadComponent: () => import('./features/public/firma-contrato/firma-contrato.page').then(m => m.FirmaContratoPageComponent),
    canActivate: [publicGuard],
    data: { title: 'Firma de Contrato' }
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [publicGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];