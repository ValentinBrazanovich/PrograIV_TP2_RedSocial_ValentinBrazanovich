import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PublicacionesService {
  private URL_API = `${environment.apiUrl}/publicaciones`;

  constructor(private http: HttpClient) {}

  // arma los headers con el token automáticamente
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // crear publicación (puede llevar archivo o no, por eso se usa FormData)
  crear(datos: FormData): Observable<any> {
    return this.http.post(this.URL_API, datos, { headers: this.getHeaders() });
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

    return this.http.get(this.URL_API, { headers: this.getHeaders(), params });
  }

  // eliminar publicación
  darBaja(idPublicacion: string): Observable<any> {
    return this.http.delete(`${this.URL_API}/${idPublicacion}`, { headers: this.getHeaders() });
  }

  // dar Me Gusta
  darMeGusta(idPublicacion: string): Observable<any> {
    return this.http.post(`${this.URL_API}/${idPublicacion}/like`, {}, { headers: this.getHeaders() });
  }

  // quitar Me Gusta
  quitarMeGusta(idPublicacion: string): Observable<any> {
    return this.http.delete(`${this.URL_API}/${idPublicacion}/like`, { headers: this.getHeaders() });
  }

  // obtener los posteos de un usuario específico
  obtenerMisPublicaciones(idUsuario: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<any[]>(`${this.URL_API}/usuario/${idUsuario}`, {headers});
  }
}