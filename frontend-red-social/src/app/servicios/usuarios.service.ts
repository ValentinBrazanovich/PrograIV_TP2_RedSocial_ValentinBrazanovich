import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private URL_API = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  // obtiene todos los usuarios para la tabla
  obtenerTodos() {
    return this.http.get<any[]>(this.URL_API, { withCredentials: true });
  }

  // crea un usuario nuevo (con opción de admin)
  crearUsuarioAdmin(datos: FormData) {
    return this.http.post<any>(this.URL_API, datos, { withCredentials: true });
  }

  // Deshabilitar (Baja lógica)
  deshabilitar(id: string) {
    return this.http.delete<any>(`${this.URL_API}/${id}`, { withCredentials: true });
  }

  // Habilitar (Alta lógica)
  habilitar(id: string) {
    return this.http.post<any>(`${this.URL_API}/${id}/habilitar`, {}, { withCredentials: true });
  }
}