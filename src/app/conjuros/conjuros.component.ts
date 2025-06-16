import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConjuroService, Conjuro } from '../services/conjuro.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-conjuros',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './conjuros.component.html',
  styleUrl: './conjuros.component.css'
})
export class ConjurosComponent implements OnInit {
  isAdmin: boolean = false;
  conjuros: Conjuro[] = [];
  filtroNombre: string = '';

  showModal: boolean = false;
  conjuroSeleccionado: Conjuro | null = null;
  editMode: boolean = false;
  conjuroEditado: Conjuro | null = null;

  constructor(
    private conjuroService: ConjuroService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.cargarConjuros();
  }

  cargarConjuros() {
    this.conjuroService.getConjuros().subscribe(data => {
      this.conjuros = data;
    });
  }

  conjurosFiltrados() {
    const filtro = this.filtroNombre.toLowerCase();
    return this.conjuros.filter(c =>
      c.nombreConjuro.toLowerCase().includes(filtro) ||
      (c.escuela && c.escuela.toLowerCase().includes(filtro)) ||
      (c.efecto && c.efecto.toLowerCase().includes(filtro))
    );
  }

  abrirModal(conjuro: Conjuro) {
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
    this.conjuroEditado = { ...this.conjuroSeleccionado! };
  }

  cancelarEdicion() {
    this.editMode = false;
    this.conjuroEditado = { ...this.conjuroSeleccionado! };
  }

  guardarCambios() {
    if (!this.conjuroEditado) return;

    this.conjuroService.actualizarConjuro(this.conjuroEditado.idConjuro, this.conjuroEditado)
      .subscribe({
        next: updated => {
          const index = this.conjuros.findIndex(c => c.idConjuro === updated.idConjuro);
          if (index !== -1) this.conjuros[index] = updated;
          this.conjuroSeleccionado = updated;
          this.editMode = false;
        },
        error: err => console.error('Error al actualizar conjuro', err)
      });
  }

  borrarConjuro(id: number) {
    this.conjuroService.borrarConjuro(id).subscribe({
      next: () => {
        this.conjuros = this.conjuros.filter(c => c.idConjuro !== id);
        this.cerrarModal();
      },
      error: err => console.error('Error al borrar conjuro', err)
    });
  }
}
