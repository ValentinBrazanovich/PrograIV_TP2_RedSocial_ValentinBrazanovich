import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guards';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./componentes/login/login').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'registro', loadComponent: () => import('./componentes/registro/registro').then(m => m.Registro), canActivate: [guestGuard] },
  { path: 'publicaciones', loadComponent: () => import('./componentes/publicaciones/publicaciones').then(m => m.Publicaciones), canActivate: [authGuard] },
  { path: 'mi-perfil', loadComponent: () => import('./componentes/mi-perfil/mi-perfil').then(m => m.MiPerfil), canActivate: [authGuard] },
  
  // si el usuario entran a la raíz se lo manda al login
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];