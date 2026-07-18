import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Ne pas attacher de token sur les routes d'authentification elles-mêmes
  const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  const accessToken = authService.getAccessToken();
  const authReq = accessToken && !isAuthRoute
    ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 sur une requête authentifiée (pas déjà un essai de refresh) -> on tente un refresh
      if (error.status === 401 && !isAuthRoute && authService.getRefreshToken()) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const retriedReq = req.clone({
              setHeaders: { Authorization: `Bearer ${authService.getAccessToken()}` },
            });
            return next(retriedReq);
          }),
          catchError((refreshError) => {
            // Le refresh a aussi échoué -> session expirée, on déconnecte
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
