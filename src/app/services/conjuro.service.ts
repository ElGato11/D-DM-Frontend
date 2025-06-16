import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Conjuro {
  idConjuro: number;
  nombreConjuro: string;
  escuela: string;
  efecto: string;
  nivel: number;
}

@Injectable({ providedIn: 'root' })
export class ConjuroService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getConjuros(): Observable<Conjuro[]> {
    return this.http.get<Conjuro[]>(`${this.baseUrl}/public/conjuro`);
  }

  actualizarConjuro(id: number, conjuro: Conjuro): Observable<Conjuro> {
    return this.http.post<Conjuro>(`${this.baseUrl}/private/conjuro/actualizar/${id}`, conjuro);
  }

  borrarConjuro(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/private/conjuro/borrar/${id}`, {});
  }

  crearConjuro(conjuro: Conjuro): Observable<Conjuro> {
    return this.http.post<Conjuro>(`${this.baseUrl}/private/conjuro/crear`, conjuro);
  }
}
