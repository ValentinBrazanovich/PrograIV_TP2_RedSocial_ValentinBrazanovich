import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // crea "createdAt" y "updatedAt" (fechas)
export class Comentario extends Document {
  // relación con la colección Usuarios
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  usuario!: Types.ObjectId;

  // relación con la colección Publicaciones
  @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true })
  publicacion!: Types.ObjectId;

  @Prop({ required: true, maxlength: 300 }) // 300 caracteres como máximo por comentario
  mensaje!: string;

  // se cambia a true cuando hacen el PUT
  @Prop({ default: false })
  modificado!: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);