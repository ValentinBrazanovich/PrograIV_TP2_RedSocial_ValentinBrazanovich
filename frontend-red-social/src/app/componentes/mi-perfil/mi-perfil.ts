import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Publicacion } from '../publicaciones/publicacion/publicacion';
import { PublicacionesService } from '../../servicios/publicaciones';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, Publicacion, FormsModule, RouterModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css'
})
export class MiPerfil implements OnInit {
  usuarioActual: any = null;
  misPublicaciones = signal<any[]>([]); // posteos del usuario actual
  mostrarModal = signal<boolean>(false);
  cargando = signal<boolean>(false);
  datosEdicion: any = {
    nombre: '',
    apellido: '',
    nombreUsuario: '',
    descripcion: ''
  }
  archivoNuevo: File | null = null;
  mensajeError = signal<string>('');
  todosLosPosteos: any[] = [];
  cantidadVisible = signal<number>(3); // cantidad de posteos visibles inicialmente

  private apiUrl = environment.apiUrl + '/usuarios'; // URL base para el backend de usuarios

  constructor(private publicacionesService: PublicacionesService, 
              private http: HttpClient,
              private router: Router) {}

  ngOnInit() {
    // datos de la sesion actual
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
      this.cargarMisPosteos();
    }
  }

  cargarMisPosteos() {
    const miId = this.usuarioActual.id || this.usuarioActual._id;

    this.publicacionesService.obtenerMisPublicaciones(miId).subscribe({
      next: (posteos) => {
        this.todosLosPosteos = posteos;
        this.cantidadVisible.set(3);
        this.actualizarVistaPosteos();
      },
      error: (err) => console.error('Error al cargar mis publicaciones:', err)
    })
  }

  actualizarVistaPosteos() {
    const recortes = this.todosLosPosteos.slice(0, this.cantidadVisible());
    this.misPublicaciones.set(recortes);
  }

  cargarMasPosteos() {
    this.cantidadVisible.update(cantidad => cantidad + 3);
    this.actualizarVistaPosteos();
  }

  abrirModalEdicion() {
    this.datosEdicion = {
      nombre: this.usuarioActual.nombre || '',
      apellido: this.usuarioActual.apellido || '',
      nombreUsuario: this.usuarioActual.nombreUsuario || '',
      descripcion: this.usuarioActual.descripcionBreve || this.usuarioActual.descripcion || ''
    };

    this.archivoNuevo = null;
    this.mensajeError.set('');
    this.mostrarModal.set(true);
  }

  cerrarModal(){
    this.mostrarModal.set(false);
  }

  seleccionarImagen(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoNuevo = file;
    }
  }

  guardarCambios() {
    if (this.cargando()) return; // evita múltiples envíos

    this.mensajeError.set('');

    if (this.datosEdicion.nombre && this.datosEdicion.nombre.length > 30) {
      this.mensajeError.set('El nombre no puede tener más de 30 caracteres.');
      return;
    }
    if (this.datosEdicion.apellido && this.datosEdicion.apellido.length > 30) {
      this.mensajeError.set('El apellido no puede tener más de 30 caracteres.');
      return;
    }
    if (this.datosEdicion.nombreUsuario && this.datosEdicion.nombreUsuario.length > 30) {
      this.mensajeError.set('El nombre de usuario no puede tener más de 30 caracteres.');
      return;
    }
    if (this.datosEdicion.descripcion && this.datosEdicion.descripcion.length > 150) {
      this.mensajeError.set('La biografía no puede tener más de 150 caracteres.');
      return;
    }

    this.cargando.set(true);
    const miId = this.usuarioActual.id || this.usuarioActual._id;
    const formData = new FormData();
    
    // Solo se agregan al FormData los campos que el usuario haya modificado
    if (this.datosEdicion.nombre) formData.append('nombre', this.datosEdicion.nombre);
    if (this.datosEdicion.apellido) formData.append('apellido', this.datosEdicion.apellido);
    if (this.datosEdicion.nombreUsuario) formData.append('nombreUsuario', this.datosEdicion.nombreUsuario);

    formData.append('descripcion', this.datosEdicion.descripcion);
    if (this.archivoNuevo) {
      formData.append('imagen', this.archivoNuevo);
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`${this.apiUrl}/editar/${miId}`, formData, { headers }).subscribe({
      next: (respuesta: any) => {
        // actualiza los datos del usuario en la sesión
        const usuarioActualizado = { ...this.usuarioActual, ...respuesta.usuario };
        localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        this.usuarioActual = usuarioActualizado;

        this.cargando.set(false);
        this.cerrarModal();
      },
      error: (err) => {
        this.mensajeError.set('Error al guardar cambios. Por favor, inténtalo de nuevo.');
        this.cargando.set(false);
      }
    });
  }

  quitarPosteoDeLaVista(idBorrado: string) {
    this.todosLosPosteos = this.todosLosPosteos.filter(p => p._id !== idBorrado);
    // recorta y muestra la cantidad actualizada de posteos visibles
    this.actualizarVistaPosteos();
  }

  cerrarSesion() {
    // borra la información de la memoria
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    this.router.navigate(['/login']); // te manda al login
  }
}