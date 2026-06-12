import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private URL_API = `${environment.apiUrl}/autenticacion`;
  private timerAviso: any;
  private timerExpiracion: any;
  public mostrarModalAviso = signal(false);

  constructor(private http: HttpClient, private router: Router) {}

  registrar(datos: FormData): Observable<any> {
    return this.http.post(`${this.URL_API}/registro`, datos); // si en el futuro quiero que registrar loguee 
    // al usuario pongo withCredentials: true tambien en registro
  }

  login(datos: any): Observable<any> {
    return this.http.post(`${this.URL_API}/login`, datos, { withCredentials: true });
  }

  autorizar(): Observable<any> {
    return this.http.post(`${this.URL_API}/autorizar`, {}, { withCredentials: true });
  }

  iniciarTemporizadorSesion(){
    this.limpiarTemporizadores();
    // en 10 minutos muestra el modal avisando al usuario que en 5 minutos expira su sesión
    this.timerAviso = setTimeout(() => {
      this.mostrarModalAviso.set(true);
    }, 10 * 60 * 1000);

    // en 15 minutos cumplidos se cierra la sesión si el usuario no renovo el token
    this.timerExpiracion = setTimeout(() => {
      this.cerrarSesionForzada();
    }, 15 * 60 * 1000);
  }

  limpiarTemporizadores(){
    if (this.timerAviso) clearTimeout(this.timerAviso);
    if (this.timerExpiracion) clearTimeout(this.timerExpiracion);
    this.mostrarModalAviso.set(false);
  }

  extenderSesion(){
    this.http.post(`${this.URL_API}/refrescar`, {}, { withCredentials: true }).subscribe({
      next: () => {
        console.log('Sesión extendida exitosamente.');
        this.iniciarTemporizadorSesion();
      },
      error: () => {
        this.cerrarSesionForzada();
      }
    })
  }

  cerrarSesionForzada() {
    this.limpiarTemporizadores();
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

}
