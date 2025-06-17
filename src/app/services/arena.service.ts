import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:8080/logged/arena';

@Injectable({
  providedIn: 'root'
})
export class ArenaService {
  constructor(private http: HttpClient) {}

  listarSalas(): Observable<any[]> {
    return this.http.get<any[]>(`${API}/salas`);
  }

  crearSala(nombre: string): Observable<any> {
    return this.http.post<any>(`${API}/crear`, { nombre });
  }

  unirseSala(id: number): Observable<any> {
    return this.http.post<any>(`${API}/unirse/${id}`, {});
  }

  salirSala(id: number): Observable<void> {
    return this.http.post<void>(`${API}/salir/${id}`, {});
  }

  getSala(id: number): Observable<any> {
    return this.http.get<any>(`${API}/${id}`);
  }

  asignarPersonaje(salaId: number, personajeId: number): Observable<any> {
    return this.http.post<any>(`${API}/${salaId}/asignar-personaje`, { personajeId });
  }

  iniciarCombate(salaId: number): Observable<any> {
    return this.http.post<any>(`${API}/${salaId}/iniciar-combate`, {});
  }

  atacar(salaId: number, atacante: 'host' | 'jugador2'): Observable<any> {
    return this.http.post<any>(`${API}/${salaId}/atacar`, { atacante });
  }
}
