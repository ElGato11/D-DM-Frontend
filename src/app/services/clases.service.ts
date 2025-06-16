import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ventaja } from './razas.service';
import { Conjuro } from './conjuro.service';
import { Objeto } from './objeto.service';

export interface Clase {
  idClase?: number;
  nombreClase: string;
  imagenClase?: string;
  ventajas: Ventaja[];
  conjuros: Conjuro[];
  competencias: Objeto[];
}

@Injectable({
  providedIn: 'root'
})
export class ClasesService {
  private http = inject(HttpClient);

  private publicUrl = 'http://localhost:8080/public/clase';
  private privateUrl = 'http://localhost:8080/private/clase';

  getAll(): Observable<Clase[]> {
    return this.http.get<Clase[]>(this.publicUrl);
  }

  getById(id: number): Observable<Clase> {
    return this.http.get<Clase>(`${this.publicUrl}/buscar/${id}`);
  }

  crear(clase: Clase, imagen: File | null) {
    const formData = new FormData();
    formData.append('clase', new Blob([JSON.stringify(clase)], { type: 'application/json' }));
    if (imagen) formData.append('imagen', imagen);
    return this.http.post<Clase>(`${this.privateUrl}/crear`, formData);
  }

  actualizar(id: number, clase: Clase, imagen: File | null) {
    const formData = new FormData();
    formData.append('clase', new Blob([JSON.stringify(clase)], { type: 'application/json' }));
    if (imagen) formData.append('imagen', imagen);
    return this.http.post<Clase>(`${this.privateUrl}/actualizar/${id}`, formData);
  }

  borrar(id: number): Observable<void> {
    return this.http.post<void>(`${this.privateUrl}/borrar/${id}`, null);
  }
}
