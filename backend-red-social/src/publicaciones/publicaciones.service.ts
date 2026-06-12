import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './esquemas/publicacion.schema';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { v2 as cloudinary } from 'cloudinary';
import { Comentario } from './esquemas/comentario.schema';
import { CrearComentarioDto, ModificarComentarioDto } from './dto/comentarios.dto';
import * as streamifier from 'streamifier';

@Injectable()
export class PublicacionesService {
  constructor(@InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>, 
              @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // sube la imagen a la nube
  async subirACloudinary(archivo: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'socialite_publicaciones' }, // carpeta distinta para no mezclar con perfiles
        (error, result) => {
          if (error || !result) return reject(error || new Error('Fallo al subir imagen'));
          resolve(result.secure_url);
        },
      );
      streamifier.createReadStream(archivo.buffer).pipe(uploadStream);
    });
  }

  // da de alta una publicación
  async crear(datos: CrearPublicacionDto, usuarioId: string, archivo?: Express.Multer.File) {
    let urlImagen = '';
    if (archivo) {
      urlImagen = await this.subirACloudinary(archivo);
    }

    const nuevaPublicacion = new this.publicacionModel({
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      imagenUrl: urlImagen,
      creador: new Types.ObjectId(usuarioId),
      cantidadLikes: 0,
    });

    return nuevaPublicacion.save();
  }

  // listar publicaciones (con paginación, filtros y ordenamiento)
  async listar(limit: number = 10, offset: number = 0, orden: string = 'fecha', filtroUsuarioId?: string) {
    const query: any = { eliminada: false }; // filtra la baja lógica
    
    // Si pasa un ID, trae solo los posteos de ese perfil
    if (filtroUsuarioId) {
      query.creador = new Types.ObjectId(filtroUsuarioId);
    }

    // define como ordenar: por fecha (createdAt) o por cantidad de likes (cantidadLikes)
    const sortQuery: any = orden === 'likes' ? { cantidadLikes: -1 } : { createdAt: -1 };

    return this.publicacionModel.find(query)
      .sort(sortQuery)
      .skip(offset)
      .limit(limit)
      // populate 'rellena' el ID del creador con sus datos reales para mostrarlos en el frontend
      .populate('creador', 'nombreUsuario imagenPerfilUrl') 
      .exec();
  }

  // baja lógica
  async darBaja(idPublicacion: string, idUsuario: string) {
    const publicacion = await this.publicacionModel.findById(idPublicacion);
    if (!publicacion) throw new NotFoundException('Publicación no encontrada');
    
    if (publicacion.creador.toString() !== idUsuario) {
       throw new BadRequestException('No se puede borrar una publicación ajena.');
    }

    if (publicacion.imagenUrl) {
      try {
        const partes = publicacion.imagenUrl.split('/');
        const archivoConExtension = partes.pop();
        const carpeta = partes.pop();
        
        const nombreArchivo = archivoConExtension!.split('.')[0];
        const publicId = `${carpeta}/${nombreArchivo}`;

        // orden de borrado a Cloudinary
        await cloudinary.uploader.destroy(publicId);
        console.log(`[Cloudinary] Imagen destruida con éxito: ${publicId}`);
      } catch (error) {
        console.error('Hubo un drama al borrar la imagen en Cloudinary:', error);
      }
    }

    return await this.publicacionModel.findByIdAndDelete(idPublicacion);
  }

  // dar "Me Gusta"
  async darMeGusta(idPublicacion: string, idUsuario: string) {
    const publicacion = await this.publicacionModel.findById(idPublicacion);
    if (!publicacion) throw new NotFoundException('La publicación no existe');

    const usuarioObjId = new Types.ObjectId(idUsuario);
    
    if (publicacion.meGustas.includes(usuarioObjId)) {
      throw new BadRequestException('Ya le diste me gusta a esta publicación.');
    }

    publicacion.meGustas.push(usuarioObjId);
    publicacion.cantidadLikes = publicacion.meGustas.length; // actualiza el contador
    return publicacion.save();
  }

  // quitar "Me Gusta"
  async quitarMeGusta(idPublicacion: string, idUsuario: string) {
    const publicacion = await this.publicacionModel.findById(idPublicacion);
    if (!publicacion) throw new NotFoundException('La publicación no existe');
    
    // filtra el array sacando el ID del usuario
    publicacion.meGustas = publicacion.meGustas.filter(id => id.toString() !== idUsuario);
    publicacion.cantidadLikes = publicacion.meGustas.length; // actualiza el contador
    return publicacion.save();
  }

  // trae solo los posteos del usuario especifico
  async listarMisPublicaciones(idUsuario: string) {
    const posteos = await this.publicacionModel
      .find({ 
        creador: new Types.ObjectId(idUsuario), 
        eliminada: { $ne: true } // solo trae las que no están eliminadas
      })
      .sort({ createdAt: -1 })
      .populate('creador', 'nombreUsuario nombre imagenPerfilUrl');
    
    return posteos;
  }

  async agregarComentario(usuarioId: string, datos: CrearComentarioDto){
    const nuevoComentario = new this.comentarioModel({
      usuario: usuarioId,
      publicacion: datos.publicacionId,
      mensaje: datos.mensaje
    });

    return await nuevoComentario.save();
  }

  async editarComentario(comentarioId: string, usuarioId: string, datos: ModificarComentarioDto){
    const comentario = await this.comentarioModel.findById(comentarioId);

    if (!comentario){
      throw new NotFoundException('El comentario no existe.');
    }

    if (comentario.usuario.toString() !== usuarioId){ // solo el usuario puede editar su comentario
      throw new UnauthorizedException('No tenés permiso de editar este comentario.');
    }

    comentario.mensaje = datos.mensaje;
    comentario.modificado = true;

    return await comentario.save();
  }

  async obtenerComentariosPorPublicacion(publicacionId: string, pagina: number = 1, limite: number = 5){
    const skip = (pagina - 1) * limite // lógica de paginación

    const comentarios = await this.comentarioModel
      .find({ publicacion: publicacionId})
      .sort({ createdAt: -1 }) // ordena de forma descendente, de mas reciente a mas viejo
      .skip(skip)
      .limit(limite)
      // datos del usuario para el front
      .populate('usuario', 'nombreUsuario nombre apellido imagenPerfilUrl');

    const total = await this.comentarioModel.countDocuments({ publicacion: publicacionId });

    return { comentarios, total, paginas:Math.ceil(total / limite), paginaActual: pagina};
  }

  // traer una sola publicación por ID
  async obtenerPorId(idPublicacion: string) {
    const publicacion = await this.publicacionModel
      .findById(idPublicacion)
      .populate('creador', 'nombreUsuario imagenPerfilUrl');
      
    if (!publicacion || publicacion.eliminada) {
      throw new NotFoundException('La publicación no existe o fue eliminada.');
    }
    return publicacion;
  }

}