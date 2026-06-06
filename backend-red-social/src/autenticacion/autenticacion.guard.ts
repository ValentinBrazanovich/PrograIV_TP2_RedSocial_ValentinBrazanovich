import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AutenticacionGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const peticion = context.switchToHttp().getRequest();
    const token = this.extraerToken(peticion);
    
    if (!token) {
      throw new UnauthorizedException('No estás logueado.');
    }
    
    try {
      // verifica el token usando la misma clave secreta del .env
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET
      });
      // inyecta los datos del usuario en la petición para que el controlador los pueda usar
      peticion['user'] = payload;
    } catch {
      throw new UnauthorizedException('El token es inválido o expiró.');
    }
    return true;
  }

  private extraerToken(peticion: Request): string | undefined {
    const [tipo, token] = peticion.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}