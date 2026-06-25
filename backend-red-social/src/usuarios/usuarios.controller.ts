import { Controller, Get, Post, Put, Delete, Param, Body, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AutenticacionGuard } from '../autenticacion/autenticacion.guard';
import { AdminGuard } from '../autenticacion/admin.guard';
import { UsuariosService } from './usuarios.service';
import { memoryStorage } from 'multer';

@Controller('usuarios')
@UseGuards(AutenticacionGuard)
export class UsuariosController {
    constructor (private readonly usuariosService: UsuariosService) {}

    @Put('editar/:id')
    @UseInterceptors(FileInterceptor('imagen', {
        storage: memoryStorage()
    }))
    async actualizarPerfil(
        @Param('id') idUsuario: string,
        @Body() datosNuevos: any,
        @UploadedFile() archivoImagen?: Express.Multer.File
    ) {
        const perfilActualizado = await this.usuariosService.actualizarPerfil(
            idUsuario,
            datosNuevos,
            archivoImagen
        );

        return {
            mensaje: 'Perfil actualizado exitosamente',
            usuario: perfilActualizado
        };
    }

    // obtiene todos los usuarios (GET /usuarios)
    @Get()
    @UseGuards(AdminGuard)
    async listar() {
        return this.usuariosService.listarTodos();
    }

    // crea un usuario nuevo desde le panel (POST /usuarios)
    @Post()
    @UseGuards(AdminGuard)
    @UseInterceptors(FileInterceptor('imagenPerfil', {
      storage: memoryStorage()
    }))
    async crearUsuarioAdmin(@Body() body: any, @UploadedFile() archivo?: Express.Multer.File) {
        return this.usuariosService.crearDesdeAdmin(body, archivo);
    }

    // baja lógica: deshabilita a un usuario (DELETE /usuarios/:id)
    @Delete(':id')
    @UseGuards(AdminGuard)
    async deshabilitarUsuario(@Param('id') id: string) {
        const usuario = await this.usuariosService.cambiarEstado(id, false);
        return { mensaje: 'Usuario deshabilitado exitosamente', usuario };
    }

    // alta lógica: vuelve a habilitar a un usuario (POST /usuarios/:id/habilitar)
    @Post(':id/habilitar')
    @UseGuards(AdminGuard)
    async habilitarUsuario(@Param('id') id: string) {
        const usuario = await this.usuariosService.cambiarEstado(id, true);
        return { mensaje: 'Usuario rehabilitado exitosamente', usuario };
    }
}
