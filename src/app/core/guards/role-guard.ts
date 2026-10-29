import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaLogueado()) {
    if (authService.usuario()) {
      authService.logout();
    }
    return router.parseUrl('/login');
  }

  const rolesPermitidos = route.data['roles'] as string[] | undefined;
  const rolActual = authService.getRol();

  if (rolesPermitidos && rolActual && rolesPermitidos.includes(rolActual)) {
    return true;
  }

  return router.parseUrl('/acceso-denegado');
};
