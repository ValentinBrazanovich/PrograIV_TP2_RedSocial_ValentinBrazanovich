import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // agrega automáticamente createdAt y updatedAt
export class Publicacion extends Document {
  @Prop({ required: true })
  titulo!: string;

  @Prop({ required: true })
  descripcion!: string;

  @Prop()
  imagenUrl!: string; // opcional por si suben foto

  // relación directa con el creador del posteo
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  creador!: Types.ObjectId;

  // lista de IDs de los usuarios que dieron like
  // al ser un array de IDs, contar los likes es hacer un .length
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  meGustas!: Types.ObjectId[];

  @Prop({ default: 0 })
  cantidadLikes!: number;

  // interruptor para la baja lógica, en vez de eliminar el documento de la base de datos, se marca como eliminada
  @Prop({ default: false })
  eliminada!: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);