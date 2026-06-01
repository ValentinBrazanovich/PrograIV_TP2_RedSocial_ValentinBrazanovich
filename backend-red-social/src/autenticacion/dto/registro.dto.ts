export class RegistroDto {
  nombre!: string;
  apellido!: string;
  correo!: string;
  nombreUsuario!: string;
  contrasena!: string;
  repetirContrasena!: string; // se pide para validar pero no va a la DB
  fechaNacimiento!: string;
  descripcionBreve!: string;
}