import { Component, OnInit, signal } from '@angular/core';
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
  archivoSeleccionado: File | null = null; 
  cargando = signal<boolean>(false);
  mensajeError = signal<string>('');
  fechaMaxima: string = '';
  fechaMinima: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    this.fechaMaxima = `${anio}-${mes}-${dia}`;
    this.fechaMinima = `${anio - 120}-${mes}-${dia}`;

    this.formRegistro = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      apellido: ['', [Validators.required, Validators.maxLength(30)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(60)]],
      nombreUsuario: ['', [Validators.required, Validators.maxLength(30)]],
      contrasena: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/),
        Validators.maxLength(100)
      ]],
      repetirContrasena: ['', [Validators.required, Validators.maxLength(100)]],
      fechaNacimiento: ['', [Validators.required, this.validarRangoFecha]],
      descripcionBreve: ['', [Validators.maxLength(150)]],
      imagenPerfil: ['', [Validators.required]] 
    }, { validators: this.passwordsCoinciden }); // se agrega el validador a todo el grupo

    this.formRegistro.valueChanges.subscribe(() => {
      if (this.mensajeError() !== '') {
        this.mensajeError.set('');
      }
    });
  }

  validarRangoFecha(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const fechaSeleccionada = new Date(control.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // limpia las horas para comparar solo días

    const limitePasado = new Date();
    limitePasado.setFullYear(limitePasado.getFullYear() - 120);
    limitePasado.setHours(0, 0, 0, 0);

    // si la fecha elegida es mayor a hoy tira error
    if (fechaSeleccionada > hoy) {
      return { fechaFutura: true };
    }

     // si la fecha elegida es menor a hace 120 años tira error
    if (fechaSeleccionada < limitePasado) {
      return { fechaMuyAntigua: true };
    }

    return null;
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

    this.mensajeError.set(''); // limpia cualquier mensaje de error previo

    this.cargando.set(true); // bloquea el botón y muestra el mensaje de "Cargando..." mientras se procesa el registro

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
      }, error: (err) => {
        console.error('Error en el registro: ', err);
        if(err.error && err.error.message) {
          this.mensajeError.set(err.error.message);
        } else {
          this.mensajeError.set('Ocurrió un error inesperado. Por favor, intentá de nuevo.');
        }
        this.cargando.set(false); // desbloquea el botón para que el usuario pueda intentar de nuevo
      }
    });
  }

}