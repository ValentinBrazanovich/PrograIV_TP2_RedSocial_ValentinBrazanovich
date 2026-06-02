import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css'
})
export class MiPerfil implements OnInit {
  usuarioActual: any = null;

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(): void {
    const datosGuardados = localStorage.getItem('usuario');
    if (datosGuardados) {
      // convierte los datos de texto a objeto JavaScript
      this.usuarioActual = JSON.parse(datosGuardados);
    }
  }

  cerrarSesion(): void {
    // borra los datos de usuario y token del almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
}