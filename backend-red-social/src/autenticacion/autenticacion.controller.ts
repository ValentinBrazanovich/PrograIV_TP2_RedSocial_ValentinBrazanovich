import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseInterceptors, UploadedFile, Req, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { AutenticacionGuard } from './autenticacion.guard';

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
    const esProduccion = process.env.NODE_ENV === 'production';
    
    res.cookie('token', token, {
      httpOnly: true, 
      secure: esProduccion,             // true en Vercel, false en Localhost
      sameSite: esProduccion ? 'none' : 'lax', // 'none' en Vercel, 'lax' en Localhost
      maxAge: 1000 * 60 * 15 
    });

    return {mensaje: 'Login exitoso', usuario: usuario};
  }

  @Post('autorizar') // POST http://localhost:3000/autenticacion/autorizar
  @UseGuards(AutenticacionGuard) // el Guard hace la validación
  @HttpCode(HttpStatus.OK)
  autorizar(@Req() req) {
    return { 
      mensaje: 'Token válido', 
      usuario: req['user'] 
    };
  }

  @Post('refrescar') // POST http://localhost:3000/autenticacion/refrescar
  @UseGuards(AutenticacionGuard)
  @HttpCode(HttpStatus.OK)
  async refrescar(@Req() req, @Res({ passthrough: true }) res: Response) {
    // agarra al usuario de la petición actual
    const usuario = req['user'];
    // el servicio fabrica un nuevo token de 15 minutos
    const nuevoToken = await this.autenticacionService.generarNuevoToken(usuario);
    const esProduccion = process.env.NODE_ENV === 'production';

    // reemplaza el cookie viejo para setear de nuevo en 15 mins
    res.cookie('token', nuevoToken, {
      httpOnly: true, 
      secure: esProduccion,
      sameSite: esProduccion ? 'none' : 'lax',
      maxAge: 1000 * 60 * 15
    });

    return { mensaje: 'Sesión extendida por 15 minutos' };
  }
}