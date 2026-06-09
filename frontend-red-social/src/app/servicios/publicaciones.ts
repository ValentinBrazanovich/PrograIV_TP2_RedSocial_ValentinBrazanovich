import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PublicacionesService {
  private URL_API = `${environment.apiUrl}/publicaciones`;

  constructor(private http: HttpClient) {}

  // crear publicación (puede llevar archivo o no, por eso se usa FormData)
  crear(datos: FormData): Observable<any> {
    return this.http.post(this.URL_API, datos, { withCredentials: true });
  }

  // listar publicaciones con paginación y orden
  listar(limit: number = 10, offset: number = 0, orden: string = 'fecha', usuarioId?: string): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString())
      .set('orden', orden);

    if (usuarioId) {
      params = params.set('usuarioId', usuarioId);
    }

    return this.http.get(this.URL_API, { params, withCredentials: true });
  }

  // eliminar publicación
  darBaja(idPublicacion: string): Observable<any> {
    return this.http.delete(`${this.URL_API}/${idPublicacion}`, { withCredentials: true });
  }

  // dar Me Gusta
  darMeGusta(idPublicacion: string): Observable<any> {
    return this.http.post(`${this.URL_API}/${idPublicacion}/like`, {}, { withCredentials: true });
  }

  // quitar Me Gusta
  quitarMeGusta(idPublicacion: string): Observable<any> {
    return this.http.delete(`${this.URL_API}/${idPublicacion}/like`, { withCredentials: true });
  }

  // obtener los posteos de un usuario específico
  obtenerMisPublicaciones(idUsuario: string) { 
    return this.http.get<any[]>(`${this.URL_API}/usuario/${idUsuario}`, { withCredentials: true });
  }
}