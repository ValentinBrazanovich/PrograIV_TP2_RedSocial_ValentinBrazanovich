import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @IsString()
  @MaxLength(100)
  titulo!: string;

  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @IsString()
  @MaxLength(1000) 
  descripcion!: string;
}