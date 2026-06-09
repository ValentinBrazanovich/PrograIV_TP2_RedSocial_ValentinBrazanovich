import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private URL_API = `${environment.apiUrl}/autenticacion`;
  constructor(private http: HttpClient) {}

  registrar(datos: FormData): Observable<any> {
    return this.http.post(`${this.URL_API}/registro`, datos); // si en el futuro quiero que registrar loguee 
    // al usuario pongo withCredentials: true tambien en registro
  }

  login(datos: any): Observable<any> {
    return this.http.post(`${this.URL_API}/login`, datos, { withCredentials: true });
  }

}
