import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ObjetoService, Objeto } from '../services/objeto.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-objetos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './objetos.component.html',
  styleUrls: ['./objetos.component.css']
})
export class ObjetosComponent implements OnInit {
  isAdmin: boolean = false;
  objetos: Objeto[] = [];
  filtroNombre: string = '';
  objetoSeleccionado: Objeto | null = null;

  constructor(
    private objetoService: ObjetoService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isAdmin = this.authService.isAdmin();
    }
    this.cargarObjetos();
  }

  cargarObjetos() {
    this.objetoService.getObjetos().subscribe(data => {
      this.objetos = data;
    });
  }

  objetosFiltrados() {
    const filtro = this.filtroNombre.toLowerCase();
    return this.objetos.filter(obj =>
      (obj.nombre?.toLowerCase().includes(filtro) ||
       obj.tipo?.toLowerCase().includes(filtro) ||
       obj.efecto?.toLowerCase().includes(filtro) ||
       (obj.danyo && obj.danyo.toLowerCase().includes(filtro)))
    );
  }

  obtenerFondoObjeto(index: number): string {
    const imagenes = ['bolsa1.png', 'bolsa2.png', 'bolsa3.png'];
    return imagenes[index % imagenes.length];
  }

  seleccionarObjeto(objeto: Objeto) {
    this.objetoSeleccionado = { ...objeto };
  }

  cerrarModal() {
    this.objetoSeleccionado = null;
  }

  editarObjeto() {
    if (!this.objetoSeleccionado) return;

    this.objetoService.actualizarObjeto(this.objetoSeleccionado.id!, this.objetoSeleccionado)
      .subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarObjetos();
        },
        error: err => console.error('Error al actualizar objeto:', err)
      });
  }

  borrarObjeto() {
    if (!this.objetoSeleccionado) return;

    this.objetoService.borrarObjeto(this.objetoSeleccionado.id!)
      .subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarObjetos();
        },
        error: err => console.error('Error al borrar objeto:', err)
      });
  }
}
