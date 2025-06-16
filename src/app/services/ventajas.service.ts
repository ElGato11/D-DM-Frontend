import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ventaja {
  id: number;
  nombre: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VentasjaService {
  private http = inject(HttpClient);

  private publicUrl = 'http://localhost:8080/public/ventaja';
  private privateUrl = 'http://localhost:8080/private/ventaja';

  getAll(): Observable<Ventaja[]> {
    return this.http.get<Ventaja[]>(this.publicUrl);
  }

  getById(id: number): Observable<Ventaja> {
    return this.http.get<Ventaja>(`${this.publicUrl}/buscar/${id}`);
  }

  crear(ventaja: Ventaja): Observable<Ventaja> {
    return this.http.post<Ventaja>(`${this.privateUrl}/crear`, ventaja);
  }

  actualizar(id: number, ventaja: Ventaja): Observable<Ventaja> {
    return this.http.post<Ventaja>(`${this.privateUrl}/actualizar/${id}`, ventaja);
  }

  borrar(id: number): Observable<void> {
    return this.http.post<void>(`${this.privateUrl}/borrar/${id}`, null);
  }
}
