import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Objeto {
  id?: number;
  nombre: string;
  tipo: string;
  necesitaCompetencia: boolean;
  danyo?: string;
  efecto: string;
}

@Injectable({ providedIn: 'root' })
export class ObjetoService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getObjetos(): Observable<Objeto[]> {
    return this.http.get<Objeto[]>(`${this.baseUrl}/public/objeto`);
  }

  crearObjeto(objeto: Objeto): Observable<Objeto> {
    return this.http.post<Objeto>(`${this.baseUrl}/private/objeto/crear`, objeto);
  }

  actualizarObjeto(id: number, objeto: Objeto): Observable<Objeto> {
    return this.http.post<Objeto>(`${this.baseUrl}/private/objeto/actualizar/${id}`, objeto);
  }

  borrarObjeto(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/private/objeto/borrar/${id}`, {});
  }
}
