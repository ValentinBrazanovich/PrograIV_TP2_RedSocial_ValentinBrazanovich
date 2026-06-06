import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicacionesService } from './publicaciones.service';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { AutenticacionGuard } from '../autenticacion/autenticacion.guard'; 

@Controller('publicaciones')
@UseGuards(AutenticacionGuard) // Protege TODAS las rutas de este controlador
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
    const usuarioId = peticion.user.id;
    return this.publicacionesService.darBaja(idPublicacion, usuarioId);
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
}