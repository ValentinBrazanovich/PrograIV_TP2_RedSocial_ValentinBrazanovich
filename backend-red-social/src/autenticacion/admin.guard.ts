import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const peticion = context.switchToHttp().getRequest();
    const usuario = peticion.user;

    // si hay un usuario logueado y su perfil es administrador
    if (usuario && usuario.perfil === 'administrador') {
      return true;
    }

    // si es un usuario normal queriendo meterse en cosas de admin, no le da acceso
    throw new ForbiddenException('Acceso denegado. Esta ruta es exclusiva para administradores.');
  }
}