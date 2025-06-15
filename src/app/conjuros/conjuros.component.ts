import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-conjuros',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './conjuros.component.html',
  styleUrl: './conjuros.component.css'
})
export class ConjurosComponent implements OnInit {
  isAdmin: boolean = false;
  conjuros: any[] = [];
  filtroNombre: string = '';

  // Variables para el modal
  showModal: boolean = false;
  conjuroSeleccionado: any = null;
  editMode: boolean = false;
  conjuroEditado: any = null;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = sessionStorage.getItem('token');
      if (token) {
        const payload = this.decodeToken(token);
        this.isAdmin = payload?.rol === 'ADMIN';
      }
    }

    this.cargarConjuros();
  }

  cargarConjuros() {
    this.http.get<any[]>('http://localhost:8080/public/conjuro')
      .subscribe(data => {
        this.conjuros = data;
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

  conjurosFiltrados() {
  const filtro = this.filtroNombre.toLowerCase();
  return this.conjuros.filter(conjuro =>
    conjuro.nombreConjuro.toLowerCase().includes(filtro) ||
    (conjuro.escuela && conjuro.escuela.toLowerCase().includes(filtro)) ||
    (conjuro.efecto && conjuro.efecto.toLowerCase().includes(filtro))
  );
}

  abrirModal(conjuro: any) {
    this.conjuroSeleccionado = { ...conjuro };
    this.conjuroEditado = { ...conjuro };
    this.editMode = false;
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.conjuroSeleccionado = null;
    this.editMode = false;
  }

  activarEdicion() {
    this.editMode = true;
    this.conjuroEditado = { ...this.conjuroSeleccionado };
  }

  cancelarEdicion() {
    this.editMode = false;
    this.conjuroEditado = { ...this.conjuroSeleccionado };
  }

  guardarCambios() {
    if (!this.conjuroEditado) return;

    this.http.post<any>(
      `http://localhost:8080/private/conjuro/actualizar/${this.conjuroEditado.idConjuro}`,
      this.conjuroEditado
    ).subscribe({
      next: (updatedConjuro) => {
        // Actualizar localmente
        const index = this.conjuros.findIndex(c => c.idConjuro === updatedConjuro.idConjuro);
        if (index !== -1) {
          this.conjuros[index] = updatedConjuro;
        }
        this.conjuroSeleccionado = updatedConjuro;
        this.editMode = false;
      },
      error: (err) => {
        console.error('Error al actualizar conjuro', err);
      }
    });
  }

  borrarConjuro(id: number) {
    this.http.post(`http://localhost:8080/private/conjuro/borrar/${id}`, {}).subscribe({
      next: () => {
        this.conjuros = this.conjuros.filter(c => c.idConjuro !== id);
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error al borrar conjuro', err);
      }
    });
  }
}
