import { Component, Input, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicacionesService } from '../../../servicios/publicaciones';
import { RouterModule } from '@angular/router';
import { TiempoHacePipe } from '../../../pipes/tiempo-hace-pipe';
import { TruncarTextoPipe } from '../../../pipes/truncar-texto-pipe';
import { RangoPipe } from '../../../pipes/rango-pipe';
import { EfectoTerminalDirective } from '../../../directivas/efecto-terminal.directive';
import { ScrollAnimadoDirective } from "../../../directivas/scroll-animado.directive";
import { ClickAfueraDirective } from '../../../directivas/click-afuera.directive';

@Component({
  selector: 'app-publicacion',
  imports: [ CommonModule, RouterModule, TiempoHacePipe,
             TruncarTextoPipe, RangoPipe, EfectoTerminalDirective,
             ScrollAnimadoDirective, ClickAfueraDirective ],
  templateUrl: './publicacion.html',
  styleUrl: './publicacion.css',
})

export class Publicacion implements OnInit {
  @Input() publicacion: any;
  @Output() posteoBorrado = new EventEmitter<void>();

  mostrarModalEliminar = signal<boolean>(false);
  miUsuarioId: string = '';
  yaLeDiLike = signal<boolean>(false);
  textoExpandido = signal<boolean>(false);
  usuarioActual: any = null;

  constructor(private publicacionesService: PublicacionesService) {}

  ngOnInit(): void {
    // busca mi ID en el localStorage
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      this.usuarioActual = JSON.parse(usuario);
      this.miUsuarioId = this.usuarioActual.id || this.usuarioActual._id;
    }

    this.verificarLike();
  }

  verificarLike(): void {
    this.yaLeDiLike.set(this.publicacion.meGustas.includes(this.miUsuarioId));
  }

  toggleTexto() {
    this.textoExpandido.update(valor => !valor);
  }
  
  toggleLike(): void {
    if (this.yaLeDiLike()) { // si ya le di like, quito el like
      this.publicacionesService.quitarMeGusta(this.publicacion._id).subscribe({
        next: () => {
          this.yaLeDiLike.set(false);
          this.publicacion.cantidadLikes--;
          this.publicacion.meGustas = this.publicacion.meGustas.filter((id: string) => id !== this.miUsuarioId);
        }
      });
    } else { // si no le di like, le doy like
      this.publicacionesService.darMeGusta(this.publicacion._id).subscribe({
        next: () => {
          this.yaLeDiLike.set(true);
          this.publicacion.cantidadLikes++;
          this.publicacion.meGustas.push(this.miUsuarioId);
        }
      });
    }
  }

  intentarBorrar(): void {
    this.mostrarModalEliminar.set(true); // abre el modal al querer eliminar un post
  }

  cancelarBorrado(): void {
    this.mostrarModalEliminar.set(false); // esto lo cierra si el usuario lo cancela
  }

  confirmarBorrado(): void {
    this.publicacionesService.darBaja(this.publicacion._id).subscribe({
      next: () => {
        this.mostrarModalEliminar.set(false); // cierra el modal al aceptar
        this.posteoBorrado.emit(); // avisa al padre para que actualice la lista
      }, 
      error: (err) => console.error('Error al borrar la publicación:', err)
    });
  }

}