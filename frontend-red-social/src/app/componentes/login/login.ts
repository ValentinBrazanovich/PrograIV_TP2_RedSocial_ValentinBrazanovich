import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../servicios/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  mensajeError = signal<string>('');

  constructor(private formBuilder: FormBuilder, private router: Router, private Auth: Auth) {}

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  // formulario para el login con correo o usuario y contraseña (8 caracteres minimo, 1 mayúscula y 1 número)
  inicializarFormulario(): void {
    this.loginForm = this.formBuilder.group({
      correoOUsuario: ['', [Validators.required]],
      contrasena: ['', [Validators.required]],
    });

    this.loginForm.valueChanges.subscribe(() => {
      if (this.mensajeError() !== '') {
        this.mensajeError.set('');
      }
    });
  }

  enviar(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      return;
    }

    this.mensajeError.set('');

    this.Auth.login(this.loginForm.value).subscribe({
      next: (respuesta) => {
        localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        this.mensajeError.set(error.error?.message || 'Error al iniciar sesión');
      }
    });
  }
}
