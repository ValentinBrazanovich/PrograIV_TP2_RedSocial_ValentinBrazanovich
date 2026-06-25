import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../servicios/auth'

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(Auth);
  // se fija si el usuario guardó sus datos en localStorage al loguearse
  const usuario = localStorage.getItem('usuario'); 

  if (usuario) {
    authService.iniciarTemporizadorSesion();
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};