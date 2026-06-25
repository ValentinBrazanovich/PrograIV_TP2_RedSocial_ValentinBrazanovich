import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const usuarioGuardado = localStorage.getItem('usuario');

  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    // si está logueado y es administrador puede pasar
    if (usuario.perfil === 'administrador') {
      return true;
    }
  }

  // si no es admin lo manda a publicaciones
  router.navigate(['/publicaciones']);
  return false;
};