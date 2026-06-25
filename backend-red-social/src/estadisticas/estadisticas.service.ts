import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comentario } from '../publicaciones/esquemas/comentario.schema';
import { Publicacion } from '../publicaciones/esquemas/publicacion.schema';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
  ) {}

  async obtenerReportes(fechaInicio: string, fechaFin: string) {
    // string a Date
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999); // que cubra todo el último día

    const filtroFecha = { createdAt: { $gte: inicio, $lte: fin } };

    // publicaciones por usuario (Barras)
    const pubsPorUsuario = await this.publicacionModel.aggregate([
      { $match: filtroFecha },
      { $group: { _id: '$creador', total: { $sum: 1 } } },
      // busca el nombre en la colección de usuarios
      { $lookup: { from: 'usuarios', localField: '_id', foreignField: '_id', as: 'usuario' } },
      { $unwind: '$usuario' },
      { $project: { etiqueta: '$usuario.nombreUsuario', total: 1, _id: 0 } }
    ]);

    // comentarios a lo largo del tiempo (líneas)
    const comentariosPorFecha = await this.comentarioModel.aggregate([
      { $match: filtroFecha },
      // agrupa por día exacto (DD-MM-YYYY)
      { $group: { _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } }, total: { $sum: 1 } } },
      { $sort: { _id: 1 } }, // ordena cronológicamente
      { $project: { etiqueta: '$_id', total: 1, _id: 0 } }
    ]);

    // comentarios por publicación (dona)
    const nombreColeccionPubs = this.publicacionModel.collection.name;

    const comentariosPorPub = await this.comentarioModel.aggregate([
      { $match: filtroFecha },
      { $addFields: { publicacionIdObj: { $toObjectId: '$publicacion' } } },
      { $group: { _id: '$publicacionIdObj', total: { $sum: 1 } } },
      { 
        $lookup: { 
          from: nombreColeccionPubs, 
          localField: '_id', 
          foreignField: '_id', 
          as: 'pub' 
        } 
      },
      
      // si la publicación ya no existe en la base de datos se descarta el comentario
      { $unwind: '$pub' }, 
      
      // solo permite pasar las publicaciones que NO están eliminadas
      { $match: { 'pub.eliminada': false } },
      
      // pide el título
      { $project: { etiqueta: '$pub.titulo', total: 1, _id: 0 } },
      
      { $sort: { total: -1 } }, 
      { $limit: 10 } 
    ]);

    return { pubsPorUsuario, comentariosPorFecha, comentariosPorPub };
  }
}