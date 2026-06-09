import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const usuario = localStorage.getItem('usuario');

  if (!usuario) {
    return true; // si no hay sesión s puede ver el login/registro
  } else {
    // si ya está logueado y quiere entrar al login, se lo manda a su perfil
    router.navigate(['/mi-perfil']); 
    return false;
  }
};