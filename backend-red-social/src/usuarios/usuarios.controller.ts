import { Controller, Put, Param, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import { memoryStorage } from 'multer';

@Controller('usuarios')
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
}
