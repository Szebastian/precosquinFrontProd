import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const publicGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const session = await authService.getSession();

  if (session) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
