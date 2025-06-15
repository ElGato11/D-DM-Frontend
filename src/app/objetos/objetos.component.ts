import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-objetos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './objetos.component.html',
  styleUrl: './objetos.component.css'
})
export class ObjetosComponent implements OnInit {
  isAdmin: boolean = false;
  objetos: any[] = [];
  filtroNombre: string = '';
  objetoSeleccionado: any = null;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = sessionStorage.getItem('token');
      if (token) {
        const payload = this.decodeToken(token);
        this.isAdmin = payload?.rol === 'ADMIN';
      }
    }

    this.http.get<any[]>('http://localhost:8080/public/objeto')
      .subscribe(data => {
        this.objetos = data;
      });
  }

  decodeToken(token: string): any {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = atob(payloadBase64);
      return JSON.parse(decodedPayload);
    } catch (e) {
      console.error('Error al decodificar token:', e);
      return null;
    }
  }

  objetosFiltrados() {
    return this.objetos.filter(obj =>
      (obj.nombre?.toLowerCase().includes(this.filtroNombre.toLowerCase()) ||
       obj.tipo?.toLowerCase().includes(this.filtroNombre.toLowerCase()) ||
       obj.efecto?.toLowerCase().includes(this.filtroNombre.toLowerCase()) ||
       (obj.danyo && obj.danyo.toLowerCase().includes(this.filtroNombre.toLowerCase())))
    );
  }

  obtenerFondoObjeto(index: number): string {
    const imagenes = ['libro1.png', 'libro2.png', 'libro3.png'];
    return imagenes[index % imagenes.length];
  }

  seleccionarObjeto(objeto: any) {
    this.objetoSeleccionado = objeto;
  }

  cerrarModal() {
    this.objetoSeleccionado = null;
  }

  editarObjeto() {
    if (!this.objetoSeleccionado) return;
    const updated = { ...this.objetoSeleccionado };
    this.http.post<any>(`http://localhost:8080/private/objeto/actualizar/${updated.id}`, updated)
      .subscribe(() => {
        this.cerrarModal();
        this.ngOnInit();
      });
  }

  borrarObjeto() {
    if (!this.objetoSeleccionado) return;
    this.http.post<void>(`http://localhost:8080/private/objeto/borrar/${this.objetoSeleccionado.id}`, {})
      .subscribe(() => {
        this.cerrarModal();
        this.ngOnInit();
      });
  }
}
