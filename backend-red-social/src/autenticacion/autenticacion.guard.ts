import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AutenticacionGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const peticion = context.switchToHttp().getRequest();
    const token = peticion.cookies['token'];
    
    if (!token) {
      throw new UnauthorizedException('No estás logueado.');
    }
    
    try {
      // verifica el token usando la misma clave secreta del .env
      const payload = await this.jwtService.verifyAsync(token);
      // inyecta los datos del usuario en la petición para que el controlador los pueda usar
      peticion['user'] = payload;
    } catch {
      throw new UnauthorizedException('El token es inválido o expiró.');
    }
    return true;
  }
  
}