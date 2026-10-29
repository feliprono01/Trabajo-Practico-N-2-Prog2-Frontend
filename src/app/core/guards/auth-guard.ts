import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaLogueado()) {
    return true;
  }

  // Si quedó un usuario en memoria (signal) sin token válido -por ejemplo,
  // si se borró el token manualmente-, hay que limpiarlo: si no, el layout
  // (que se muestra en base a ese signal) queda renderizado por fuera del
  // router-outlet, que sí redirige al login, mostrando un estado mixto.
  if (authService.usuario()) {
    authService.logout();
  }

  return router.parseUrl('/login');
};
