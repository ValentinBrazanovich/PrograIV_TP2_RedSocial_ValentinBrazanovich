import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  // se fija si el usuario guardó sus datos en localStorage al loguearse
  const usuario = localStorage.getItem('usuario'); 

  if (usuario) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};