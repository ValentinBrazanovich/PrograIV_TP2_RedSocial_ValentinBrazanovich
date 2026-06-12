import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CrearComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío.' })
  @MaxLength(300, { message: 'El comentario no puede superar los 300 caracteres.' })
  mensaje!: string;

  // id de la publicación a la que pertenece el comentario
  @IsString()
  @IsNotEmpty()
  publicacionId!: string;
}

export class ModificarComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío.' })
  @MaxLength(300, { message: 'El comentario no puede superar los 300 caracteres.' })
  mensaje!: string;
}