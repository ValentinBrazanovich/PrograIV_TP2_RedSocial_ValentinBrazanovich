import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Publicacion } from './publicacion/publicacion';
import { CrearPublicacion } from './crear-publicacion/crear-publicacion';
import { PublicacionesService } from '../../servicios/publicaciones';


@Component({
  selector: 'app-publicaciones',
  imports: [CommonModule, Publicacion, RouterModule, CrearPublicacion],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css'
})
export class Publicaciones implements OnInit {
  listaPublicaciones = signal<any[]>([]);
  usuarioActual: any = null;
  
  // variables para la paginación
  limit: number = 5; // carga de a 5 posteos para poder probar bien el botón
  offset: number = 0;
  ordenActual: string = 'fecha';
  hayMasPublicaciones: boolean = true;

  constructor(private publicacionesService: PublicacionesService) {}

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
    }

    this.cargarFeed();
  }

  cargarFeed(reiniciar: boolean = false) {
    if (reiniciar) {
      // si  se cambia el filtro, pone los contadores en cero
      this.offset = 0;
      this.listaPublicaciones.set([]);
      this.hayMasPublicaciones = true;
    }

    this.publicacionesService.listar(this.limit, this.offset, this.ordenActual).subscribe({
      next: (data) => {
        // si el backend devuelve menos elementos que el límite, significa que ya no hay más páginas
        if (data.length < this.limit) {
          this.hayMasPublicaciones = false; 
        }
        
        // suma las nuevas publicaciones a la lista que ya habia
        this.listaPublicaciones.update(postActuales => [...postActuales, ...data]);
        
        // prepara el offset para la próxima vez que el usuario toque "Cargar más"
        this.offset += this.limit; 
      },
      error: (err) => console.error('Error al cargar las publicaciones:', err)
    });
  }

  cambiarOrden(nuevoOrden: string) {
    // solo recarga si el usuario toca un orden distinto al que ya está viendo
    if (this.ordenActual !== nuevoOrden) {
      this.ordenActual = nuevoOrden;
      this.cargarFeed(true);
    }
  }

  quitarPosteoDeLaVista(idBorrado: string) {
    // cuando el componente hijo avisa que se borró un post, lo sacamos del array al instante
    this.listaPublicaciones.update(posts => posts.filter(p => p._id !== idBorrado));
  }

  agregarNuevoPost(nuevoPost: any) {
    const miId = this.usuarioActual.id || this.usuarioActual._id;

    nuevoPost.creador = {
      _id: miId,
      nombreUsuario: this.usuarioActual.nombreUsuario,
      imagenPerfilUrl: this.usuarioActual.imagenPerfilUrl
    };

    nuevoPost.meGustas = [];
    nuevoPost.cantidadLikes = 0;

    nuevoPost.createdAt = new Date().toISOString();

    // agrega el nuevo post al principio del array para que aparezca primero en el feed
    this.listaPublicaciones.update(posts => [nuevoPost, ...posts]);
  }
  
}