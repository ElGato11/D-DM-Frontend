import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ventaja } from './ventajas.service';

export interface Raza {
  idRaza?: number;
  nombre: string;
  imagenRaza?: string;
  ventajas: Ventaja[];
  carismaMod: number;
  fuerzaMod: number;
  inteligenciaMod: number;
  sabiduriaMod: number;
  constitucionMod: number;
  destrezaMod: number;
}

@Injectable({
  providedIn: 'root'
})
export class RazasService {
  private http = inject(HttpClient);

  private publicUrl = 'http://localhost:8080/public/raza';
  private privateUrl = 'http://localhost:8080/private/raza';

  getAll(): Observable<Raza[]> {
    return this.http.get<Raza[]>(this.publicUrl);
  }

  getById(id: number): Observable<Raza> {
    return this.http.get<Raza>(`${this.publicUrl}/${id}`);
  }

crear(raza: Raza, imagen: File | null) {
  const formData = new FormData();
  formData.append('raza', new Blob([JSON.stringify(raza)], { type: 'application/json' }));
  if (imagen) formData.append('imagen', imagen);
  return this.http.post<Raza>(`${this.privateUrl}/crear`, formData);
}

actualizar(id: number, raza: Raza, imagen: File | null) {
  const formData = new FormData();
  formData.append('raza', new Blob([JSON.stringify(raza)], { type: 'application/json' }));
  if (imagen) formData.append('imagen', imagen);
  return this.http.post<Raza>(`${this.privateUrl}/actualizar/${id}`, formData);
}


  borrar(id: number): Observable<void> {
    return this.http.post<void>(`${this.privateUrl}/borrar/${id}`, null);
  }
}
export { Ventaja };

