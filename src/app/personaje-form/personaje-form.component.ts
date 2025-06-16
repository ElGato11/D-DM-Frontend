import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonajeService } from '../services/personaje.service';
import { ObjetoService } from '../services/objeto.service';
import { RazasService } from '../services/razas.service';
import { ClasesService } from '../services/clases.service';

@Component({
  selector: 'app-personaje-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personaje-form.component.html',
  styleUrls: ['./personaje-form.component.css']
})
export class PersonajeFormComponent implements OnInit {
  personajeForm!: FormGroup;
  imagenPreview: string | null = null;
  personajeId: number | null = null;
  razas: any[] = [];
  clases: any[] = [];
  objetos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private personajeService: PersonajeService,
    private razaService: RazasService,
    private claseService: ClasesService,
    private objetoService: ObjetoService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAuxiliares();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.personajeId = +idParam;
      this.personajeService.getPersonajePorId(this.personajeId).subscribe(p => {
        this.personajeForm.patchValue(p);
        if (p.imagenPersonaje) {
          this.imagenPreview = 'data:image/jpeg;base64,' + p.imagenPersonaje;
        }
      });
    }
  }

  initForm(): void {
    this.personajeForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      nivel: [1],
      fuerza: [10], destreza: [10], constitucion: [10],
      inteligencia: [10], sabiduria: [10], carisma: [10],
      raza: [null], clases: [[]], objetos: [[]],
      imagenPersonaje: ['']
    });
  }

  loadAuxiliares(): void {
    this.razaService.getAll().subscribe(r => this.razas = r);
    this.claseService.getAll().subscribe(c => this.clases = c);
    this.objetoService.getObjetos().subscribe(o => this.objetos = o);
  }

  guardar(): void {
    const personaje = this.personajeForm.value;
    if (this.personajeId) {
      personaje.idPersonaje = this.personajeId;
      this.personajeService.actualizarPersonaje(personaje).subscribe(() => this.router.navigate(['/mis-personajes']));
    } else {
      this.personajeService.crearPersonaje(personaje).subscribe(() => this.router.navigate(['/mis-personajes']));
    }
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

  cancelar(): void {
    this.router.navigate(['/mis-personajes']);
  }
}
