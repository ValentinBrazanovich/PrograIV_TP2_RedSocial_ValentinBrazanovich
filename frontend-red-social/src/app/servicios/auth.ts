import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private URL_API = 'http://localhost:3000/autenticacion';
  constructor(private http: HttpClient) {}

  registrar(datos: FormData): Observable<any> {
    return this.http.post(`${this.URL_API}/registro`, datos);
  }

  login(datos: any): Observable<any> {
    return this.http.post(`${this.URL_API}/login`, datos);
  }

}
