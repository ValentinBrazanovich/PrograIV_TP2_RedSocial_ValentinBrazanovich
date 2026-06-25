import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guards';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./componentes/login/login').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'registro', loadComponent: () => import('./componentes/registro/registro').then(m => m.Registro), canActivate: [guestGuard] },
  { path: 'publicaciones', loadComponent: () => import('./componentes/publicaciones/publicaciones').then(m => m.Publicaciones), canActivate: [authGuard] },
  { path: 'mi-perfil', loadComponent: () => import('./componentes/mi-perfil/mi-perfil').then(m => m.MiPerfil), canActivate: [authGuard] },
  { path: 'publicacion/:id', loadComponent: () => import ('./componentes/publicacion-detalle/publicacion-detalle').then(m => m.PublicacionDetalle), canActivate: [authGuard]},
  { path: 'dashboard/usuarios', loadComponent: () => import('./componentes/dashboard-usuarios/dashboard-usuarios').then(m => m.DashboardUsuarios), canActivate: [authGuard, adminGuard]},
  { path: 'dashboard/estadisticas', loadComponent: () => import('./componentes/dashboard-estadisticas/dashboard-estadisticas').then(m => m.DashboardEstadisticas), canActivate: [authGuard, adminGuard]},
  // si el usuario entran a la raíz se lo manda al login
  { path: '', loadComponent: () => import('./componentes/cargando/cargando').then(m => m.Cargando), pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];