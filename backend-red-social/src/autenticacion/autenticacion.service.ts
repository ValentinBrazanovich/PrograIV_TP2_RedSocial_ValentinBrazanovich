import { Injectable, BadRequestException, UnauthorizedException  } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AutenticacionService {
  constructor(private usuariosService: UsuariosService, private jwtService: JwtService) {}

  async registrar(datos: RegistroDto, rutaImagenPerfil?: string) {
    // valida que las contraseñas coincidan
    // si no coinciden dispara un BadRequestException (Nestjs lo convierte en un Status 400)
    if (datos.contrasena !== datos.repetirContrasena) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    // verifica que no exista alguien con ese correo o usuario en la base de datos
    const usuarioExistente = await this.usuariosService.buscarPorCorreoOUsuario(
      datos.correo,
      datos.nombreUsuario,
    );
    
    if (usuarioExistente) {
      throw new BadRequestException('El correo o el nombre de usuario ya están en uso.');
    }

    // encripta la contraseña con bcrypt
    const saltos = 10;
    const contrasenaEncriptada = await bcrypt.hash(datos.contrasena, saltos);

    // construye el objeto final para guardar (se descarta "repetirContrasena")
    const nuevoUsuario = {
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      nombreUsuario: datos.nombreUsuario,
      contrasena: contrasenaEncriptada,
      fechaNacimiento: datos.fechaNacimiento,
      descripcionBreve: datos.descripcionBreve,
      
      imagenPerfilUrl: rutaImagenPerfil
    };

    // guarda en la base de datos a través del servicio de usuarios
    return this.usuariosService.crearUsuario(nuevoUsuario);
  }

  async login(datos: LoginDto){
    const usuario = await this.usuariosService.buscarPorCorreoOUsuario(
      datos.correoOUsuario,
      datos.correoOUsuario
    );

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    // verifica la contraseña
    const contrasenaValida = await bcrypt.compare(datos.contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    // devuelve el token firmado y los datos del usuario para mostrar en el frontend
    const payload = { id: usuario._id, nombreUsuario: usuario.nombreUsuario, perfil: usuario.perfil };
    return {
      access_token: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        nombreUsuario: usuario.nombreUsuario,
        perfil: usuario.perfil,
        fechaNacimiento: usuario.fechaNacimiento,
        descripcionBreve: usuario.descripcionBreve,
        imagenPerfilUrl: usuario.imagenPerfilUrl
      }
    };
  }
}
