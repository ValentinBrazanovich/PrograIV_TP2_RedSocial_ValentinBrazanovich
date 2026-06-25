import { Controller, Get, Post, Put, Body, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { AutenticacionGuard } from '../autenticacion/autenticacion.guard';
import { CrearComentarioDto, ModificarComentarioDto } from './dto/comentarios.dto';

@Controller('publicaciones')
@UseGuards(AutenticacionGuard) // protege TODAS las rutas de este controlador
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  // crear nueva publicación (POST /publicaciones)
  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage() }))
  async crear(
    @Body() body: CrearPublicacionDto,
    @UploadedFile() archivo: Express.Multer.File,
    @Req() peticion: any
  ) {
    // el guard inyecta los datos del usuario en peticion.user
    const usuarioId = peticion.user.id;

    return this.publicacionesService.crear(body, usuarioId, archivo);
  }

  // listar publicaciones (GET /publicaciones?limit=10&offset=0&orden=fecha)
  @Get()
  async listar(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('orden') orden?: string,
    @Query('usuarioId') usuarioId?: string,
  ) {
    // convierte los textos que llegan por URL a números
    const limiteNum = limit ? parseInt(limit, 10) : 10;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    
    return this.publicacionesService.listar(limiteNum, offsetNum, orden, usuarioId);
  }

  // ruta para los posteos personales
  @Get('usuario/:id')
  async obtenerMisPosteos(@Param('id') idUsuario: string) {

    return await this.publicacionesService.listarMisPublicaciones(idUsuario);
  }

  // dar de baja una publicación (DELETE /publicaciones/:id)
  @Delete(':id')
  async darBaja(@Param('id') idPublicacion: string, @Req() peticion: any) {
    const usuarioLogueado = peticion.user;

    return this.publicacionesService.darBaja(idPublicacion, usuarioLogueado);
  }

  // dar Me Gusta (POST /publicaciones/:id/like)
  @Post(':id/like')
  async darMeGusta(@Param('id') idPublicacion: string, @Req() peticion: any) {
    const usuarioId = peticion.user.id;

    return this.publicacionesService.darMeGusta(idPublicacion, usuarioId);
  }

  // quitar Me Gusta (DELETE /publicaciones/:id/like)
  @Delete(':id/like')
  async quitarMeGusta(@Param('id') idPublicacion: string, @Req() peticion: any) {
    const usuarioId = peticion.user.id;

    return this.publicacionesService.quitarMeGusta(idPublicacion, usuarioId);
  }

  @Post('comentarios') // POST http://localhost:3000/publicaciones/comentarios
  async crearComentario(@Req() req, @Body() body: CrearComentarioDto) {
    const usuarioId = req['user'].id; // se agarra el user desde el token
    const comentario = await this.publicacionesService.agregarComentario(usuarioId, body);

    return { mensaje: 'Comentario agregado con éxito', comentario };
  }

  @Put('comentarios/:id') // PUT http://localhost:3000/publicaciones/comentarios/12345
  async editarComentario(
    @Req() req, 
    @Param('id') comentarioId: string, 
    @Body() body: ModificarComentarioDto
  ) {
    const usuarioId = req['user'].id;
    const comentario = await this.publicacionesService.editarComentario(comentarioId, usuarioId, body);

    return { mensaje: 'Comentario editado con éxito', comentario };
  }

  @Get(':id/comentarios') // GET http://localhost:3000/publicaciones/12345/comentarios?pagina=1
  async obtenerComentarios(
    @Param('id') publicacionId: string,
    @Query('pagina') pagina: string
  ) {
    // si no mandan página por defecto es 1, y traemos de a 5 comentarios
    const numPagina = pagina ? parseInt(pagina, 10) : 1;
    const limite = 5; 
    
    return await this.publicacionesService.obtenerComentariosPorPublicacion(publicacionId, numPagina, limite);
  }

  // obtiene un posteo específico
  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.publicacionesService.obtenerPorId(id);
  }
}