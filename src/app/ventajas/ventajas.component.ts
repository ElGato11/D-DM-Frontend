import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasjaService, Ventaja } from '../services/ventajas.service';

@Component({
  selector: 'app-ventajas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventajas.component.html',
  styleUrls: ['./ventajas.component.css']
})
export class VentajasComponent implements OnInit {
  ventajas: Ventaja[] = [];
  editando: boolean = false;
  creando: boolean = false;
  ventajaEdit: Ventaja = this.nuevaVentaja();

  constructor(private ventajaService: VentasjaService) {}

  ngOnInit(): void {
    this.cargarVentajas();
  }

  cargarVentajas(): void {
    this.ventajaService.getAll().subscribe(data => {
      this.ventajas = data;
    });
  }

  iniciarCreacion(): void {
    this.ventajaEdit = this.nuevaVentaja();
    this.creando = true;
    this.editando = false;
  }

  iniciarEdicion(ventaja: Ventaja): void {
    this.ventajaEdit = { ...ventaja };
    this.editando = true;
    this.creando = false;
  }

  guardar(): void {
    if (this.creando) {
      this.ventajaService.crear(this.ventajaEdit).subscribe(() => {
        this.cancelar();
        this.cargarVentajas();
      });
    } else if (this.editando && this.ventajaEdit.id) {
      this.ventajaService.actualizar(this.ventajaEdit.id, this.ventajaEdit).subscribe(() => {
        this.cancelar();
        this.cargarVentajas();
      });
    }
  }

  borrar(id: number): void {
    if (confirm('¿Estás seguro de que quieres borrar esta ventaja?')) {
      this.ventajaService.borrar(id).subscribe(() => {
        this.cargarVentajas();
      });
    }
  }

  cancelar(): void {
    this.creando = false;
    this.editando = false;
    this.ventajaEdit = this.nuevaVentaja();
  }

  private nuevaVentaja(): Ventaja {
    return {
      id: 0,
      nombre: '',
      descripcion: ''
    };
  }
}
