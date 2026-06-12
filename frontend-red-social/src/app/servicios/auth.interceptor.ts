import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // next(req) deja que la petición vaya hacia el backend
  // el .pipe() intercepta la respuesta cuando vuelve
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // si el backend devuelve "401 Unauthorized"
      if (error.status === 401) {
        console.warn('Sesión expirada o inválida. Redirigiendo al login...');
        
        // limpia los rastros del usuario
        localStorage.removeItem('usuario');
        
        // se lo manda a loguearse de nuevo
        router.navigate(['/login']);
      }
      
      // el error sigue su camino por si otro componente lo necesita
      return throwError(() => error);
    })
  );
};