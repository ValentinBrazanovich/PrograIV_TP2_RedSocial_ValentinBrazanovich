import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private URL_API = `${environment.apiUrl}/estadisticas`; 

  constructor(private http: HttpClient) {}

  obtenerReportes(fechaInicio: string, fechaFin: string): Observable<any> {
    // manda las fechas por la URL
    // Ejemplo: http://localhost:3000/estadisticas?inicio=2026-05-01&fin=2026-06-23
    let params = new HttpParams()
      .set('inicio', fechaInicio)
      .set('fin', fechaFin);
      
    return this.http.get(`${this.URL_API}`, { params, withCredentials: true });
  }
}