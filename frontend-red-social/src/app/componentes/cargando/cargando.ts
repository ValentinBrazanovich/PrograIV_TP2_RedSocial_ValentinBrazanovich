import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Auth } from '../../servicios/auth';

@Component({
  selector: 'app-cargando',
  imports: [],
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})

export class Cargando implements OnInit{
  constructor(private authService: Auth, private router: Router){}

  ngOnInit() {
    this.authService.autorizar().subscribe({
      next: (rta) => {
        localStorage.setItem('usuario', JSON.stringify(rta.usuario));
        this.authService.iniciarTemporizadorSesion();
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        // error 401. El token expiró, es inválido o no hay cookie.
        // limpia datos viejos y me manda a loguearme
        localStorage.removeItem('usuario');
        this.router.navigate(['/login']);
      }
    });
  }
  
}
