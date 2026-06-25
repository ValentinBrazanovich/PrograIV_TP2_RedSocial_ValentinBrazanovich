import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsuariosService } from '../../servicios/usuarios.service';
import { validarRangoFecha } from '../../validaciones/validaciones';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-usuarios',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './dashboard-usuarios.html',
  styleUrl: './dashboard-usuarios.css'
})
export class DashboardUsuarios implements OnInit {
  
  usuarios = signal<any[]>([]);
  crearForm: FormGroup;
  cargando = signal(false);
  fechaMaxima: string;
  fechaMinima: string;
  archivoSeleccionado: File | null = null;

  constructor(private usuariosService: UsuariosService, private fb: FormBuilder) {
    const hoy = new Date();
    this.fechaMaxima = hoy.toISOString().split('T')[0]; 
    
    const limitePasado = new Date();
    limitePasado.setFullYear(hoy.getFullYear() - 100);
    this.fechaMinima = limitePasado.toISOString().split('T')[0];

    this.crearForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', Validators.required],
      contrasena: ['', [
        Validators.required, 
        Validators.minLength(8), 
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]],
      fechaNacimiento: ['', [
        Validators.required, 
        validarRangoFecha()
      ]],
      
      perfil: ['usuario', Validators.required] // por defecto es 'usuario'
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando.set(true);
    this.usuariosService.obtenerTodos().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.cargando.set(false);
      }
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  crearUsuario() {
    if (this.crearForm.invalid) return;

    const formData = new FormData();
    
    Object.keys(this.crearForm.controls).forEach(key => {
      formData.append(key, this.crearForm.get(key)?.value);
    });

    // anexa la imágen
    if (this.archivoSeleccionado) {
      formData.append('imagenPerfil', this.archivoSeleccionado);
    }

    this.usuariosService.crearUsuarioAdmin(formData).subscribe({
      next: (nuevoUsuario) => {
        // se agrega el nuevo a la tabla instantaneamente
        this.usuarios.update(lista => [...lista, nuevoUsuario]);
        this.crearForm.reset({ perfil: 'usuario' });
        this.archivoSeleccionado = null;
        console.log('Usuario creado con éxito');
      },
      error: (err) => console.log('Hubo un error al crear el usuario')
    });
  }

  cambiarEstado(usuario: any) {
    const id = usuario._id;
    
    // si estaba activo lo deshabilita y si estaba en false lo habilita.
    if (usuario.activo) {
      this.usuariosService.deshabilitar(id).subscribe({
        next: () => this.actualizarTablaLocal(id, false)
      });
    } else {
      this.usuariosService.habilitar(id).subscribe({
        next: () => this.actualizarTablaLocal(id, true)
      });
    }
  }

  // función auxiliar para actualizar la bandera en la tabla sin recargar toda la página
  private actualizarTablaLocal(id: string, nuevoEstado: boolean) {
    this.usuarios.update(lista => 
      lista.map(u => u._id === id ? { ...u, activo: nuevoEstado } : u)
    );
  }

  quitarImagen(inputElement: HTMLInputElement) {
    this.archivoSeleccionado = null;
    inputElement.value = '';
  }

}