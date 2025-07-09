import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

const noAuthUrls = [
  "api/v1/users"
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // 👇 Verifica si la URL no requiere autenticación
  const isNoAuthUrlPost = noAuthUrls.some(url =>
    req.url.includes(url) && req.method === "POST"
  );

  // 👇 Si hay token y no es una URL pública, verifica su validez
  if (!isNoAuthUrlPost && token) {
    if (authService.isTokenExpired(token)) {
      authService.logout();
      return throwError(() => new Error("Token expirado"));
    }

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log("Error en la petición", error);
      if (error.status === 401) {
        authService.logout(); // 👈 cerrar sesión directamente
      } else if (error.status === 403) {
        alert("No tienes los permisos necesarios para acceder a este recurso.");
        authService.setRedirectUrl("/home");
      }
      return throwError(() => error.error || error);
    })
  );
};
