import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from './esquemas/usuario.schema';

@Injectable()
export class UsuariosService {
  // se inyecta el modelo de Mongoose para el esquema de Usuario
  constructor(@InjectModel(Usuario.name) private usuarioModel: Model<Usuario>) {}

  // guarda el usuario en la base de datos y devuelve el usuario creado
  async crearUsuario(datosUsuario: any): Promise<Usuario> {
    const usuarioNuevo = new this.usuarioModel(datosUsuario);
    return usuarioNuevo.save();
  }

  // revisa si el correo o el usuario ya existen en la base de datos, devuelve el usuario encontrado o null si no existe
  async buscarPorCorreoOUsuario(correo: string, nombreUsuario: string) {
    return this.usuarioModel.findOne({
      $or: [{ correo: correo }, { nombreUsuario: nombreUsuario }]
    }).exec();
  }
}