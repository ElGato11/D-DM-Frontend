import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonajeService } from '../services/personaje.service';
import { ObjetoService } from '../services/objeto.service';
import { RazasService } from '../services/razas.service';
import { ClasesService } from '../services/clases.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mis-personajes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mis-personajes.component.html',
  styleUrls: ['./mis-personajes.component.css']
})
export class MisPersonajesComponent implements OnInit {
  personajeForm!: FormGroup;
  personajes: any[] = [];
  razas: any[] = [];
  clases: any[] = [];
  objetos: any[] = [];
  modoEdicion: boolean = false;
  personajeEditandoId: number | null = null;
  imagenPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private personajeService: PersonajeService,
    private razasService: RazasService,
    private clasesService: ClasesService,
    private objetoService: ObjetoService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarDatos();
  }

  initForm(): void {
    this.personajeForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      nivel: [1],
      experiencia: [0],
      fuerza: [10],
      destreza: [10],
      constitucion: [10],
      inteligencia: [10],
      sabiduria: [10],
      carisma: [10],
      raza: [null],
      clases: [[]],
      objetos: [[]],
      imagenPersonaje: ['']
    });
  }

  cargarDatos(): void {
    this.personajeService.getMisPersonajes().subscribe(p => this.personajes = p);
    this.razasService.getAll().subscribe(r => this.razas = r);
    this.clasesService.getAll().subscribe(c => this.clases = c);
    this.objetoService.getObjetos().subscribe(o => this.objetos = o);
  }

  getNombresClases(clases: any[]): string {
    return clases?.length ? clases.map(c => c.nombre).join(', ') : 'Ninguna';
  }

  getNombresObjetos(objetos: any[]): string {
    return objetos?.length ? objetos.map(o => o.nombre).join(', ') : 'Ninguno';
  }


  guardar(): void {
    const personaje = this.personajeForm.value;

    if (this.modoEdicion && this.personajeEditandoId !== null) {
      personaje.idPersonaje = this.personajeEditandoId;
      this.personajeService.actualizarPersonaje(personaje).subscribe(() => {
        this.cancelar();
        this.cargarDatos();
      });
    } else {
      this.personajeService.crearPersonaje(personaje).subscribe(() => {
        this.cancelar();
        this.cargarDatos();
      });
    }
  }

  editar(personaje: any): void {
    this.modoEdicion = true;
    this.personajeEditandoId = personaje.idPersonaje;
    this.imagenPreview = personaje.imagenPersonaje ? 'data:image/jpeg;base64,' + personaje.imagenPersonaje : null;
    this.personajeForm.patchValue({ ...personaje });
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este personaje?')) {
      this.personajeService.borrarPersonaje(id).subscribe(() => this.cargarDatos());
    }
  }

  cancelar(): void {
    this.modoEdicion = false;
    this.personajeEditandoId = null;
    this.imagenPreview = null;
    this.personajeForm.reset({
      nivel: 1,
      experiencia: 0,
      fuerza: 10,
      destreza: 10,
      constitucion: 10,
      inteligencia: 10,
      sabiduria: 10,
      carisma: 10
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
        this.personajeForm.patchValue({ imagenPersonaje: this.imagenPreview });
      };
      reader.readAsDataURL(file);
    }
  }
}
