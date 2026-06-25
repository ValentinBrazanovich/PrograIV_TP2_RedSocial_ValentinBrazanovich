import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from './esquemas/usuario.schema';
import { v2 as cloudinary } from 'cloudinary';
import * as bcrypt from 'bcrypt' 

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

  // actualiza el perfil y limpia la basura en la nube
  async actualizarPerfil(idUsuario: string, datosNuevos: any, nuevaImagenUrl?: Express.Multer.File): Promise<Usuario> {
    // busca el usuario actual en la base de datos
    const usuario = await this.usuarioModel.findById(idUsuario);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    // VALIDACIÓN DE NOMBRE DE USUARIO
    // si se manda un nombre de usuario nuevo y es distinto al actual, verifica que no esté en uso por otro perfil
    if (datosNuevos.nombreUsuario && datosNuevos.nombreUsuario !== usuario.nombreUsuario) {
      // busca si otro usuario ya tiene el nombre
      const existeUsername = await this.usuarioModel.findOne({ nombreUsuario: datosNuevos.nombreUsuario });
      if (existeUsername) {
        throw new BadRequestException('Ese nombre de usuario ya está en uso. ¡Elegí otro!');
      }
      usuario.nombreUsuario = datosNuevos.nombreUsuario;
    }

    // actualiza los campos de texto normales (nombre y descripción)
    if (datosNuevos.nombre) usuario.nombre = datosNuevos.nombre;
    if (datosNuevos.apellido) usuario.apellido = datosNuevos.apellido;
    if (datosNuevos.descripcion) usuario.descripcionBreve = datosNuevos.descripcion;

    // CLOUDINARY PARA LA FOTO
    if (nuevaImagenUrl) {
      // se borra la foto anterior de cloudinary
      if (usuario.imagenPerfilUrl && usuario.imagenPerfilUrl.includes('cloudinary')) {
        try {
          const partesUrl = usuario.imagenPerfilUrl.split('/');
          const archivo = partesUrl[partesUrl.length - 1];
          const carpeta = partesUrl[partesUrl.length - 2];
          const nombreSinExtension = archivo.split('.')[0];
          
          const publicId = `${carpeta}/${nombreSinExtension}`;
          console.log('Intentando borrar de Cloudinary el publicId:', publicId);

          await cloudinary.uploader.destroy(publicId);
          console.log('¡Foto vieja eliminada de la nube!');
        } catch (error) {
          console.error('Error al intentar borrar el avatar viejo:', error);
        }
      }

      const nuevaUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'socialite_perfiles' }, // carpeta en Cloudinary
          (error, result) => {
            if (error) return reject(error);
            resolve(result!.secure_url);
          }
        );
        // convierte el buffer a stream y lo manda a Cloudinary
        const stream = require('stream');
        const bufferStream = new stream.PassThrough();
        bufferStream.end(nuevaImagenUrl.buffer);
        bufferStream.pipe(uploadStream);
      });

      // guarda la nueva URL en el usuario
      usuario.imagenPerfilUrl = nuevaUrl;
    }

    // guarda los cambios finales y devuelve el usuario actualizado
    return await usuario.save();
  }

  // LISTAR TODOS LOS USUARIOS (para el panel de admin)
  async listarTodos() {
    // .select('-contrasena') asegura que las contraseñas no viajen al frontend
    return await this.usuarioModel.find().select('-contrasena').exec();
  }

  // CREAR USUARIO DESDE EL PANEL
  async crearDesdeAdmin(datos: any, archivo?: Express.Multer.File) {
    // se hashea la contraseña, igual que en el registro normal
    const contrasenaHasheada = await bcrypt.hash(datos.contrasena, 10);

    let rutaImagen = '';

    if (archivo) {
      try {
        rutaImagen = await new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'socialite_perfiles' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result!.secure_url);
            }
          );
          const stream = require('stream');
          const bufferStream = new stream.PassThrough();
          bufferStream.end(archivo.buffer);
          bufferStream.pipe(uploadStream);
        });
      } catch (error) {
        console.error('Error al subir la foto desde el panel de admin:', error);
      }
    }
    
    const avatarIniciales = `https://ui-avatars.com/api/?name=${datos.nombre}+${datos.apellido}&background=1e1e24&color=8a2be2&size=400`;

    const nuevoUsuario = new this.usuarioModel({
      ...datos,
      contrasena: contrasenaHasheada,
      imagenPerfilUrl: rutaImagen || avatarIniciales
      // el campo 'perfil' ('usuario' o 'administrador') viene dentro de 'datos'
    });

    return await nuevoUsuario.save();
  }

  // ALTA Y BAJA LÓGICA
  async cambiarEstado(id: string, estado: boolean) {
    const usuario = await this.usuarioModel.findByIdAndUpdate(
      id,
      { activo: estado },
      { new: true } // devuelve el documento actualizado
    ).select('-contrasena');

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    return usuario;
  }
}