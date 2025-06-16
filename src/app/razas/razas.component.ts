import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RazasService, Raza } from '../services/razas.service';
import { VentasjaService, Ventaja } from '../services/ventajas.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-raza',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './razas.component.html',
  styleUrls: ['./razas.component.css']
})
export class RazasComponent implements OnInit {
  razas: Raza[] = [];
  razasFiltradas: Raza[] = [];
  razaActualIndex = 0;
  razaActual: Raza | null = null;
  filtroNombre = '';
  isAdmin = false;

  creando = false;
  editando = false;
  razaEdit: Raza = this.nuevaRaza();
  imagenArchivo: File | null = null;
  imagenBase64 = '';

  ventajas: Ventaja[] = [];

  stats = [
    { key: 'carismaMod', label: 'Carisma' },
    { key: 'fuerzaMod', label: 'Fuerza' },
    { key: 'inteligenciaMod', label: 'Inteligencia' },
    { key: 'sabiduriaMod', label: 'Sabiduría' },
    { key: 'constitucionMod', label: 'Constitución' },
    { key: 'destrezaMod', label: 'Destreza' }
  ] as const;

  @ViewChild('carousel', { static: true }) carouselRef!: ElementRef;
  @ViewChildren('razaItem') razaItemRefs!: QueryList<ElementRef>;

  constructor(
    private razasService: RazasService,
    private ventajasService: VentasjaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.cargarRazas();
    this.ventajasService.getAll().subscribe((data) => (this.ventajas = data));
  }

  cargarRazas() {
    this.razasService.getAll().subscribe((data) => {
      this.razas = data.map((r) => ({
        ...r,
        imagenRaza: r.imagenRaza ? 'data:image/*;base64,' + r.imagenRaza : undefined
      }));
      this.aplicarFiltro();
    });
  }

  aplicarFiltro() {
    const filtro = this.filtroNombre.toLowerCase();
    this.razasFiltradas = this.razas.filter((r) =>
      r.nombre.toLowerCase().includes(filtro)
    );
    this.razaActualIndex = 0;
    this.razaActual = this.razasFiltradas[0] || null;
    setTimeout(() => this.centrarElementoCarrusel(this.razaActualIndex), 0);
  }

  cambiarRaza(direccion: number) {
    const nuevoIndex = this.razaActualIndex + direccion;
    if (
      nuevoIndex >= 0 &&
      nuevoIndex < this.razasFiltradas.length
    ) {
      this.razaActualIndex = nuevoIndex;
      this.razaActual = this.razasFiltradas[nuevoIndex];
      this.centrarElementoCarrusel(nuevoIndex);
    }
  }

  centrarElementoCarrusel(index: number) {
    const carousel = this.carouselRef?.nativeElement as HTMLElement;
    if (!carousel) return;

    const cards = carousel.querySelectorAll('.raza-card') as NodeListOf<HTMLElement>;
    const card = cards[index];
    if (!card) return;

    const offset = card.offsetLeft - (carousel.offsetWidth / 2) + (card.offsetWidth / 2);
    carousel.scrollLeft = offset;
  }

  iniciarCreacion() {
    this.razaEdit = this.nuevaRaza();
    this.creando = true;
    this.editando = false;
    this.imagenArchivo = null;
    this.imagenBase64 = '';
  }

  iniciarEdicion() {
    if (!this.razaActual) return;
    this.razaEdit = JSON.parse(JSON.stringify(this.razaActual));
    this.editando = true;
    this.creando = false;
    this.imagenBase64 = this.razaEdit.imagenRaza || '';
  }

  cancelar() {
    this.creando = false;
    this.editando = false;
    this.razaEdit = this.nuevaRaza();
    this.imagenArchivo = null;
    this.imagenBase64 = '';
  }

  guardar() {
    const accion = this.editando
      ? this.razasService.actualizar(this.razaEdit.idRaza!, this.razaEdit, this.imagenArchivo)
      : this.razasService.crear(this.razaEdit, this.imagenArchivo);

    accion.subscribe(() => {
      this.cargarRazas();
      this.cancelar();
    });
  }

  borrarRaza() {
    if (this.razaActual?.idRaza && confirm('¿Borrar esta raza?')) {
      this.razasService.borrar(this.razaActual.idRaza).subscribe(() => {
        this.cargarRazas();
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
    const index = this.razaEdit.ventajas.findIndex((v) => v.id === id);
    if (index >= 0) {
      this.razaEdit.ventajas.splice(index, 1);
    } else {
      const ventaja = this.ventajas.find((v) => v.id === id);
      if (ventaja) this.razaEdit.ventajas.push(ventaja);
    }
  }

  isSeleccionada(id: number): boolean {
    return this.razaEdit.ventajas.some((v) => v.id === id);
  }

  private nuevaRaza(): Raza {
    return {
      nombre: '',
      imagenRaza: '',
      ventajas: [],
      carismaMod: 0,
      fuerzaMod: 0,
      inteligenciaMod: 0,
      sabiduriaMod: 0,
      constitucionMod: 0,
      destrezaMod: 0
    };
  }
}
