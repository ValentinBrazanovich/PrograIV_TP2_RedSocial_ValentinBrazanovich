import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './esquemas/publicacion.schema';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { AutenticacionModule } from '../autenticacion/autenticacion.module';

@Module({
  imports: [
    AutenticacionModule,
    MongooseModule.forFeature([{ name: Publicacion.name, schema: PublicacionSchema }])
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService]
})

export class PublicacionesModule {}
