import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // guarda la fecha de creación y actualización automáticamente
export class Usuario extends Document {
  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true })
  apellido!: string;

  @Prop({ required: true, unique: true })
  correo!: string;

  @Prop({ required: true, unique: true })
  nombreUsuario!: string;

  @Prop({ required: true })
  contrasena!: string;

  @Prop({ required: true })
  fechaNacimiento!: string; // string formato YYYY-MM-DD

  @Prop()
  descripcionBreve!: string;

  // por defecto el perfil es "usuario", pero puede cambiarse a "administrador"
  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil!: string;
  
  @Prop({ default: true })
  activo!: boolean;

  @Prop()
  imagenPerfilUrl!: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);