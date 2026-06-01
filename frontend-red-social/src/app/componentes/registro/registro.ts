import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../servicios/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})

export class Registro implements OnInit {
  formRegistro!: FormGroup;
  // aca se guarda el archivo físico seleccionado para subirlo luego al backend
  archivoSeleccionado: File | null = null; 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.formRegistro = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required]],
      contrasena: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]],
      repetirContrasena: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      descripcionBreve: ['', [Validators.maxLength(250)]],
      imagenPerfil: ['', [Validators.required]] 
    }, { validators: this.passwordsCoinciden }); // se agrega el validador a todo el grupo
  }

  // validador personalizado para verificar que coincidan
  passwordsCoinciden(control: AbstractControl): ValidationErrors | null {
    const password = control.get('contrasena')?.value;
    const confirmPassword = control.get('repetirContrasena')?.value;
    
    if (password !== confirmPassword) {
      control.get('repetirContrasena')?.setErrors({ noCoinciden: true });
      return { noCoinciden: true };
    }
    return null;
  }

  // captura el archivo al ser seleccionado
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  enviar(): void {
    if (this.formRegistro.invalid || !this.archivoSeleccionado) {
      this.formRegistro.markAllAsTouched();

      return;
    }

    const formData = new FormData();
    const controles = this.formRegistro.controls;

    formData.append('nombre', controles['nombre'].value);
    formData.append('apellido', controles['apellido'].value);
    formData.append('correo', controles['correo'].value);
    formData.append('nombreUsuario', controles['nombreUsuario'].value);
    formData.append('contrasena', controles['contrasena'].value);
    formData.append('repetirContrasena', controles['repetirContrasena'].value);
    formData.append('fechaNacimiento', controles['fechaNacimiento'].value);

    if(controles['descripcionBreve'].value) {
      formData.append('descripcionBreve', controles['descripcionBreve'].value);
    }

    formData.append('imagenPerfil', this.archivoSeleccionado);

    this.auth.registrar(formData).subscribe({
      next: (respuesta) => {
        console.log('Registro exitoso: ', respuesta);
        this.router.navigate(['/login']);
      }, error: (error) => {
        console.error('Error en el registro: ', error);
      }
    });

  }
}