import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-publicaciones',
  imports: [CommonModule, RouterModule],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  usuarioActual: any = null;

  // PUBLICACIONES DE PRUEBA, BORRAR DESPUES
  posteosFalsos = [
    {
      autor: 'Elon Musk',
      usuario: '@elon_mars',
      contenido: 'Probando el nuevo servidor de Facebook 2. ¡Vuela! 🚀',
      fecha: 'Hace 5 minutos'
    },
    {
      autor: 'Onyx Oberon',
      usuario: '@onyx_alas',
      contenido: 'Qué linda noche para salir un rato 🦇✨',
      fecha: 'Hace 2 horas'
    }
  ];

  ngOnInit(): void {
    const datosGuardados = localStorage.getItem('usuarioActual');
    if (datosGuardados) {
      this.usuarioActual = JSON.parse(datosGuardados);
    }
  }


}
