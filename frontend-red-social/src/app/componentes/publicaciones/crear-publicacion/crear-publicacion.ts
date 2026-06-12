import { Component, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PublicacionesService } from '../../../servicios/publicaciones';

@Component({
  selector: 'app-crear-publicacion',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-publicacion.html',
  styleUrl: './crear-publicacion.css'
})
export class CrearPublicacion implements OnInit {
  // esto le manda el posteo recién creado al muro para que lo muestre al instante
  @Output() postCreado = new EventEmitter<any>();
  
  crearForm: FormGroup;
  archivoSeleccionado: File | null = null;
  imagenPreview = signal<string | null>(null);
  cargando: boolean = false; // desactiva el botón mientras se sube a la base de datos
  usuarioActual: any = null;

  constructor(private fb: FormBuilder, private publicacionesService: PublicacionesService) {
    this.crearForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removerImagen(fileInput: HTMLInputElement) {
    this.archivoSeleccionado = null;
    this.imagenPreview.set(null);
    fileInput.value = '';
  }

  publicar() {
    if (this.crearForm.invalid) return;

    this.cargando = true;
    
    // ya que se puede enviar una imagen, NestJS requiere que se use FormData en vez de un JSON normal
    const formData = new FormData();
    formData.append('titulo', this.crearForm.get('titulo')?.value);
    formData.append('descripcion', this.crearForm.get('descripcion')?.value);
    
    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    }

    this.publicacionesService.crear(formData).subscribe({
      next: (nuevoPost) => {
        this.postCreado.emit(nuevoPost); // los datos del posteo
        this.crearForm.reset(); // vacia inputs
        this.archivoSeleccionado = null;
        this.imagenPreview.set(null);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al crear post:', err);
        this.cargando = false;
      }
    });
  }
}