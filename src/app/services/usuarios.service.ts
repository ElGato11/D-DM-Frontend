import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
  rol?: 'USER' | 'ADMIN'; 
  clave?: string; 
}


@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/private/usuario`);
  }

  crear(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/public/usuario/crear`, usuario);
  }

  crearAdmin(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/private/usuario/crear/admin`, usuario);
  }

  actualizar(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/private/usuario/actualizar/${id}`, usuario);
  }

  borrar(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/private/usuario/borrar/${id}`, {});
  }

  cambiarClave(id: number, nuevaClave: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/private/usuario/cambiar-clave/${id}`, nuevaClave);
  }
}
