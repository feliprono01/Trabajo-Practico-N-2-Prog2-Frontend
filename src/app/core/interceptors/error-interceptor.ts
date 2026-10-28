import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

const RUTAS_SIN_LOGOUT_AUTOMATICO = ['/auth/login', '/auth/registro'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      const esRutaExcluida = RUTAS_SIN_LOGOUT_AUTOMATICO.some((ruta) => req.url.includes(ruta));

      if (error.status === 401 && !esRutaExcluida) {
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
