import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Raza } from './razas.service';
import { Clase } from './clases.service';
import { Objeto } from './objeto.service';

export interface Personaje {
  idPersonaje?: number;
  nombre: string;
  descripcion?: string;
  nivel: number;

  fuerza: number;
  destreza: number;
  constitucion: number;
  inteligencia: number;
  sabiduria: number;
  carisma: number;

  raza?: Raza;

  clases?: Clase[];

  objetos?: Objeto[];

  imagenPersonaje?: string;
}


@Injectable({
  providedIn: 'root'
})
export class PersonajeService {
  private apiUrl = 'http://localhost:8080/logged';

  constructor(private http: HttpClient) {}

  getMisPersonajes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/personajes`);
  }

  crearPersonaje(personaje: any): Observable<any> {
    const formData = this.crearFormData(personaje);
    return this.http.post<any>(`${this.apiUrl}/personajes`, formData);
  }

  actualizarPersonaje(personaje: any): Observable<any> {
    const formData = this.crearFormData(personaje);
    return this.http.post<any>(`${this.apiUrl}/personaje/actualizar/${personaje.idPersonaje}`, formData);
  }

  borrarPersonaje(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/personaje/borrar/${id}`, {});
  }

  getPersonajePorId(id: number) {
    return this.http.get<any>(`${this.apiUrl}/personaje/${id}`);
  }


  private crearFormData(personaje: any): FormData {
    const formData = new FormData();
    const personajeSinImagen = { ...personaje };
    const imagen = personajeSinImagen.imagenPersonaje;
    delete personajeSinImagen.imagenPersonaje;

    const blob = new Blob([JSON.stringify(personajeSinImagen)], {
      type: 'application/json'
    });
    formData.append('datos', blob);
     
    if (imagen && imagen.startsWith('data:image')) {
      const base64Data = imagen.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const archivo = new File([byteArray], 'imagen.jpg');
      formData.append('imagen', archivo);
    }

    return formData;
  }
}
