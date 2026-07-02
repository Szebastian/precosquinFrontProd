import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@shared/components/toast/toast.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      const status = error.status;
      const message = error.error?.message || error.message || 'Error desconocido';

      switch (status) {
        case 400:
          toast.error('Datos inválidos', message);
          break;
        case 401:
          toast.error('Sesión expirada', 'Por favor inicie sesión nuevamente');
          auth.logout();
          break;
        case 403:
          toast.error('Sin permisos', 'No tiene autorización para esta acción');
          router.navigate(['/dashboard']);
          break;
        case 404:
          toast.error('No encontrado', 'El recurso solicitado no existe');
          break;
        case 409:
          toast.warning('Conflicto', message);
          break;
        case 422:
          toast.error('Error de validación', message);
          break;
        case 429:
          toast.warning('Demasiadas solicitudes', 'Por favor espere un momento');
          break;
        case 500:
          toast.error('Error del servidor', 'Intente nuevamente más tarde');
          break;
        default:
          toast.error('Error', message);
      }

      return throwError(() => error);
    })
  );
};