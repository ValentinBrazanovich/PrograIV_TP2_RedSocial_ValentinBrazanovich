import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @IsString()
  @MaxLength(100)
  titulo!: string;

  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @IsString()
  @MaxLength(500) 
  descripcion!: string;

  // NOTA: no se pone ni la imagen, ni el usuarioId, ni los likes aca
  // la imagen la atrapa Multer (como la foto de perfil)
  // el usuarioId se saca del token JWT por seguridad
  // los likes empiezan siempre vacíos
}