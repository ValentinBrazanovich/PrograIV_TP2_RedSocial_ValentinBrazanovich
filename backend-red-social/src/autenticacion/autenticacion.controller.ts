import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('registro') // POST http://localhost:3000/autenticacion/registro
  @HttpCode(HttpStatus.CREATED) // devuelve status 201 si tiene éxito
  // interceptor que agarra la imagen
  @UseInterceptors(FileInterceptor('imagenPerfil', {
    storage: memoryStorage()
  }))

  async registro(
    @Body() body: RegistroDto, 
    @UploadedFile() archivo: Express.Multer.File // se recibe la info del archivo guardado
  ) {

    let rutaImagen = '';

    // si el usuario mandó un archivo se a Cloudinary antes de guardar en la DB
    if (archivo) {
      try {
        rutaImagen = await this.autenticacionService.subirACloudinary(archivo);
      } catch (error) {
        console.error('Error al subir a Cloudinary:', error);
      }
    }

    const usuarioCreado = await this.autenticacionService.registrar(body, rutaImagen);
    
    return {
      mensaje: 'Usuario registrado con éxito',
      usuario: {
        id: usuarioCreado._id,
        nombreUsuario: usuarioCreado.nombreUsuario,
        correo: usuarioCreado.correo,
        perfil: usuarioCreado.perfil,

        imagenPerfilUrl: usuarioCreado.imagenPerfilUrl
      }
    };
  }

  @Post('login') // POST http://localhost:3000/autenticacion/login
  @HttpCode(HttpStatus.OK) // devuelve status 200 si tiene éxito
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response){
    const resultado = await this.autenticacionService.login(body);
    const { token, usuario } = resultado;
    res.cookie('token', token, {
      httpOnly: true, // protege el token de ataques XSS
      secure: false,  // permite usar la cookie en localhost (HTTP normal)
      sameSite: 'lax',// permite que localhost:4200 y localhost:3000 compartan la cookie
      maxAge: 1000 * 60 * 60 * 24 // 1 día
    }); // PARA EL ULTIMO SPRINT ESTO DEBERÍA SER TRUE Y SAME SITE DEBERÍA SER 'none' PARA
    //  PERMITIR EL USO CON HTTPS Y DOMINIOS DISTINTOS

    return {mensaje: 'Login exitoso', usuario: usuario};
  }
}