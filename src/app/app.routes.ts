import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/auth/auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    canActivate: [publicGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/home/home.page').then(m => m.HomePageComponent),
      },
      {
        path: 'noticias',
        loadComponent: () => import('./features/public/noticias/noticias-public.page').then(m => m.NoticiasPublicPageComponent),
        data: { title: 'Noticias' }
      },
      {
        path: 'noticias/:id',
        loadComponent: () => import('./features/public/noticias/noticia-detail.page').then(m => m.NoticiaDetailPageComponent),
        data: { title: 'Noticia' }
      },
      {
        path: 'inscripcion',
        loadComponent: () => import('./features/public/inscripcion/inscripcion.page').then(m => m.InscripcionPageComponent),
        canDeactivate: [() => import('./features/public/inscripcion/inscripcion-deactivate.guard').then(m => m.inscripcionDeactivateGuard)],
        data: { title: 'Inscripción de Artista' }
      },
      {
        path: 'documentacion',
        loadComponent: () => import('./features/public/documentacion/documentacion.page').then(m => m.DocumentacionPageComponent),
        data: { title: 'Documentación' }
      },
      {
        path: 'institucional/declaracion',
        loadComponent: () => import('./features/public/institucional/declaracion.page').then(m => m.DeclaracionPageComponent),
        data: { title: 'Declaración N° 35/26 C.D.P.P' }
      },
      {
        path: 'patrocinio',
        loadComponent: () => import('./features/public/patrocinio/patrocinio.page').then(m => m.PatrocinioPageComponent),
        data: { title: 'Patrocinio' }
      },
      {
        path: 'cronograma',
        loadComponent: () => import('./features/cronograma/cronograma-public.page').then(m => m.CronogramaPublicPageComponent),
        data: { title: 'Cronograma' }
      },
      {
        path: 'firmar/:token',
        loadComponent: () => import('./features/public/firma-contrato/firma-contrato.page').then(m => m.FirmaContratoPageComponent),
        data: { title: 'Firma de Contrato' }
      },
      {
        path: 'stands/nuevo',
        loadComponent: () => import('./features/public/stands/stands-form.page').then(m => m.StandsFormPageComponent),
        data: { title: 'Solicitud de Stand' }
      },
    ]
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
        path: 'acreditaciones',
        loadChildren: () => import('./features/acreditaciones/acreditaciones.routes').then(m => m.ACREDITACIONES_ROUTES),
        data: { title: 'Acreditaciones', roles: ['organizador', 'admin', 'staff'] }
      },
      {
        path: 'jurado',
        loadChildren: () => import('./features/jurado/jurado.routes').then(m => m.JURADO_ROUTES),
        data: { roles: ['admin', 'jurado'] }
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
      },
      {
        path: 'galeria',
        loadChildren: () => import('./features/galeria/galeria.routes').then(m => m.GALERIA_ROUTES),
        data: { roles: ['organizador', 'admin', 'staff'] }
      },
      {
        path: 'mensajes',
        loadComponent: () => import('./features/mensajes/mensajes-list.page').then(m => m.MensajesListPageComponent),
        data: { title: 'Mensajes', roles: ['organizador', 'admin', 'staff'] }
      },
      {
        path: 'documentation',
        loadComponent: () => import('./features/documentation/admin-documentation.page').then(m => m.AdminDocumentationComponent),
        data: { title: 'Documentación', roles: ['organizador', 'admin', 'staff', 'jurado'] }
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [publicGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./features/public/not-found/not-found.component').then(m => m.NotFoundComponent),
    data: { title: 'Página no encontrada' }
  }
];