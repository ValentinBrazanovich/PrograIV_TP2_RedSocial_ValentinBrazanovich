import { Controller, Post, Body, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AutenticacionService } from './autenticacion.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post('registro') // POST http://localhost:3000/autenticacion/registro
  @HttpCode(HttpStatus.CREATED) // devuelve status 201 si tiene éxito
  // interceptor que agarra la imagen
  @UseInterceptors(FileInterceptor('imagenPerfil', {
    storage: diskStorage({
      destination: './uploads', // la guarda en la carpeta uploads
      filename: (req, file, cb) => {
        // se le genera unnombre único con la fecha y un número random para que no se pisen
        const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, nombreUnico + extname(file.originalname)); // mantiene la extensión (.png, .jpg)
      }
    })
  }))
  async registro(
    @Body() body: RegistroDto, 
    @UploadedFile() archivo: Express.Multer.File // se recibe la info del archivo guardado
  ) {
    // si se mandó foto arma la ruta. Si no mandó guarda un texto vacío
    const rutaImagen = archivo ? `/uploads/${archivo.filename}` : '';
    
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
  async login(@Body() body: LoginDto) {
    const resultado = await this.autenticacionService.login(body);
    return resultado;
  }
}