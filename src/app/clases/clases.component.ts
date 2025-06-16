import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClasesService, Clase } from '../services/clases.service';
import { AuthService } from '../services/auth.service';
import { Ventaja } from '../services/razas.service';
import { Conjuro, ConjuroService } from '../services/conjuro.service';
import { Objeto, ObjetoService } from '../services/objeto.service';
import { VentasjaService } from '../services/ventajas.service';

@Component({
  selector: 'app-clase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clases.component.html',
  styleUrls: ['./clases.component.css']
})
export class ClasesComponent implements OnInit {
  clases: Clase[] = [];
  clasesFiltradas: Clase[] = [];
  claseActualIndex = 0;
  claseActual: Clase | null = null;
  filtroNombre = '';
  isAdmin = false;
  ventajas: Ventaja[] = [];
  conjuros: Conjuro[] = [];
  competencias: Objeto[] = [];

  creando = false;
  editando = false;
  claseEdit: Clase = this.nuevaClase();
  imagenArchivo: File | null = null;
  imagenBase64 = '';

  @ViewChild('carousel', { static: true }) carouselRef!: ElementRef;

  constructor(
    private clasesService: ClasesService,
    private ventajasService: VentasjaService,
    private conjurosService: ConjuroService,
    private objetosService: ObjetoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.cargarClases();

    this.ventajasService.getAll().subscribe((data) => (this.ventajas = data));
    this.conjurosService.getConjuros().subscribe((data) => (this.conjuros = data));
    this.objetosService.getObjetos().subscribe((data) => (this.competencias = data));
  }

  cargarClases() {
    this.clasesService.getAll().subscribe((data) => {
      this.clases = data.map((c) => ({
        ...c,
        imagenClase: c.imagenClase ? 'data:image/*;base64,' + c.imagenClase : undefined
      }));
      this.aplicarFiltro();
    });
  }

  aplicarFiltro() {
    const filtro = this.filtroNombre.toLowerCase();
    this.clasesFiltradas = this.clases.filter((c) =>
      c.nombreClase.toLowerCase().includes(filtro)
    );
    this.claseActualIndex = 0;
    this.claseActual = this.clasesFiltradas[0] || null;
    setTimeout(() => this.centrarElementoCarrusel(), 100);
  }

  cambiarClase(direccion: number) {
    const nuevoIndex = this.claseActualIndex + direccion;
    if (nuevoIndex >= 0 && nuevoIndex < this.clasesFiltradas.length) {
      this.claseActualIndex = nuevoIndex;
      this.claseActual = this.clasesFiltradas[nuevoIndex];
      setTimeout(() => this.centrarElementoCarrusel(), 100);
    }
  }

  centrarElementoCarrusel() {
    const carousel = this.carouselRef?.nativeElement as HTMLElement | null;
    if (!carousel || !carousel.getBoundingClientRect) return;

    const card = carousel.children[this.claseActualIndex] as HTMLElement | null;
    if (!card) return;

    const carouselRect = carousel.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const offset = cardRect.left - carouselRect.left - (carousel.clientWidth / 2 - card.clientWidth / 2);
    carousel.scrollLeft += offset;
  }

  iniciarCreacion() {
    this.claseEdit = this.nuevaClase();
    this.creando = true;
    this.editando = false;
    this.imagenArchivo = null;
    this.imagenBase64 = '';
  }

  iniciarEdicion() {
    if (!this.claseActual) return;
    this.claseEdit = JSON.parse(JSON.stringify(this.claseActual));
    this.editando = true;
    this.creando = false;
    this.imagenBase64 = this.claseEdit.imagenClase || '';
  }

  cancelar() {
    this.creando = false;
    this.editando = false;
    this.claseEdit = this.nuevaClase();
    this.imagenArchivo = null;
    this.imagenBase64 = '';
  }

  guardar() {
    const accion = this.editando
      ? this.clasesService.actualizar(this.claseEdit.idClase!, this.claseEdit, this.imagenArchivo)
      : this.clasesService.crear(this.claseEdit, this.imagenArchivo);

    accion.subscribe(() => {
      this.cargarClases();
      this.cancelar();
    });
  }

  borrarClase() {
    if (this.claseActual?.idClase && confirm('¿Borrar esta clase?')) {
      this.clasesService.borrar(this.claseActual.idClase).subscribe(() => {
        this.cargarClases();
      });
    }
  }

  actualizarImagen(event: any): void {
    const archivo = event.target.files[0];
    this.imagenArchivo = archivo;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.imagenBase64 = base64;
    };
    reader.readAsDataURL(archivo);
  }

  toggleVentaja(id: number): void {
    const index = this.claseEdit.ventajas.findIndex(v => v.id === id);
    if (index >= 0) {
      this.claseEdit.ventajas.splice(index, 1);
    } else {
      const ventaja = this.ventajas.find(v => v.id === id);
      if (ventaja) this.claseEdit.ventajas.push(ventaja);
    }
  }

  toggleConjuro(id: number): void {
    const index = this.claseEdit.conjuros.findIndex(c => c.idConjuro === id);
    if (index >= 0) {
      this.claseEdit.conjuros.splice(index, 1);
    } else {
      const conjuro = this.conjuros.find(c => c.idConjuro === id);
      if (conjuro) this.claseEdit.conjuros.push(conjuro);
    }
  }

  toggleCompetencia(id: number): void {
    const index = this.claseEdit.competencias.findIndex(o => o.id === id);
    if (index >= 0) {
      this.claseEdit.competencias.splice(index, 1);
    } else {
      const obj = this.competencias.find(o => o.id === id);
      if (obj) this.claseEdit.competencias.push(obj);
    }
  }

  isVentajaSeleccionada(id: number): boolean {
    return this.claseEdit.ventajas.some(v => v.id === id);
  }

  isConjuroSeleccionado(id: number): boolean {
    return this.claseEdit.conjuros.some(c => c.idConjuro === id);
  }

  isCompetenciaSeleccionada(id: number): boolean {
    return this.claseEdit.competencias.some(o => o.id === id);
  }

  private nuevaClase(): Clase {
    return {
      nombreClase: '',
      ventajas: [],
      conjuros: [],
      competencias: [],
      imagenClase: ''
    };
  }
}
