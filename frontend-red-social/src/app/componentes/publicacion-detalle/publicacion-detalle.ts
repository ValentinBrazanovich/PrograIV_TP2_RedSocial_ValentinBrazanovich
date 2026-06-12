import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicacionesService } from '../../servicios/publicaciones'; 

@Component({
  selector: 'app-publicacion-detalle',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css',
})

export class PublicacionDetalle implements OnInit {
  idPublicacion = '';
  usuarioActual = signal<any>(null);
  publicacion = signal<any>(null);
  comentarios = signal<any[]>([]);
  // paginación
  paginaActual = 1;
  totalPaginas = 1;
  cargandoComentarios = signal(false);
  // variables para crear o editar un comentario
  nuevoComentario = signal('');
  comentarioEditandoId = signal<string | null>(null);
  textoEdicion = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicacionesService: PublicacionesService
  ) {}

  ngOnInit() {
    // toma al usuario logueado
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuarioActual.set(JSON.parse(usuarioGuardado));
    }

    this.idPublicacion = this.route.snapshot.paramMap.get('id') || '';

    if (this.idPublicacion) {
      this.cargarPublicacion();
    } else { // si por algún motivo no hay ID, se lo manda al inicio
      this.router.navigate(['/publicaciones']);
    }
  }

  cargarPublicacion() {
    this.publicacionesService.obtenerPorId(this.idPublicacion).subscribe({
      next: (posteo) => {
        this.publicacion.set(posteo);
        this.cargarComentarios();
      },
      error: () => {
        // si el posteo no existe o lo borraron, me manda al inicio
        this.router.navigate(['/publicaciones']);
      }
    });
  }

  cargarComentarios() {
    this.cargandoComentarios.set(true);
    this.publicacionesService.obtenerComentarios(this.idPublicacion, this.paginaActual).subscribe({
      next: (respuesta) => {
        // al estar paginando, si es la página 1 reemplaza, si es otra agrega al final
        if (this.paginaActual === 1) {
          this.comentarios.set(respuesta.comentarios);
        } else {
          this.comentarios.update(comentariosViejos => [...comentariosViejos, ...respuesta.comentarios]);
        }
        
        this.totalPaginas = respuesta.paginas;
        this.cargandoComentarios.set(false);
      },
      error: () => {
        this.cargandoComentarios.set(false);
      }
    });
  }

  cargarMas() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarComentarios();
    }
  }

  enviarComentario() {
    if (this.nuevoComentario().trim() === '') return;

    this.publicacionesService.agregarComentario(this.idPublicacion, this.nuevoComentario()).subscribe({
      next: (respuesta) => {
        // le inyecta los datos del usuario actual al nuevo comentario
        const comentarioFresco = {
          ...respuesta.comentario,
          usuario: this.usuarioActual()
        };

        // Lo pone primero en la lista
        this.comentarios.update(lista => [comentarioFresco, ...lista]);
        
        // limpia el input
        this.nuevoComentario.set('');
      }
    });
  }

  iniciarEdicion(comentario: any) {
    this.comentarioEditandoId.set(comentario._id);
    this.textoEdicion.set(comentario.mensaje);
  }

  cancelarEdicion() {
    this.comentarioEditandoId.set(null);
    this.textoEdicion.set('');
  }

  guardarEdicion() {
    if (this.textoEdicion().trim() === '' || !this.comentarioEditandoId()) return;

    const idComentario = this.comentarioEditandoId()!;

    this.publicacionesService.editarComentario(idComentario, this.textoEdicion()).subscribe({
      next: () => {
        // busca el comentario en la lista, lo actualiza y cambia a estado editado
        this.comentarios.update(lista => 
          lista.map(c => 
            c._id === idComentario 
              ? { ...c, mensaje: this.textoEdicion(), modificado: true } 
              : c
          )
        );
        this.cancelarEdicion(); // cierra la edición
      }
    });
  }

}
