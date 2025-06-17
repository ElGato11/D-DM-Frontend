import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
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
    this.personajeId = this.route.snapshot.paramMap.get('id') 
      ? +this.route.snapshot.paramMap.get('id')! 
      : null;

    this.personajeForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      fuerza: [10], destreza: [10], constitucion: [10],
      inteligencia: [10], sabiduria: [10], carisma: [10],
      raza: [null],
      clases: [[]],        
      objetos: [[]],
      imagenPersonaje: ['']
    });

    forkJoin({
      razas: this.razaService.getAll(),
      clases: this.claseService.getAll(),
      objetos: this.objetoService.getObjetos()
    }).subscribe(({ razas, clases, objetos }) => {
      this.razas = razas;
      this.clases = clases;
      this.objetos = objetos;

      if (this.personajeId) {
        this.personajeService.getPersonajePorId(this.personajeId)
          .subscribe(p => {
            const claseIds = (p.clases || []).map((c: any) => c.id);
            const objetoIds = (p.objetos || []).map((o: any) => o.id);
            this.personajeForm.patchValue({
              nombre: p.nombre,
              descripcion: p.descripcion,
              nivel: p.nivel,
              fuerza: p.fuerza,
              destreza: p.destreza,
              constitucion: p.constitucion,
              inteligencia: p.inteligencia,
              sabiduria: p.sabiduria,
              carisma: p.carisma,
              raza: p.raza,
              clases: claseIds,
              objetos: objetoIds,
              imagenPersonaje: p.imagenPersonaje
            });
            if (p.imagenPersonaje) {
              this.imagenPreview = 'data:image/jpeg;base64,' + p.imagenPersonaje;
            }
          });
      }
    });
  }

  guardar(): void {
    const form = this.personajeForm.value;
    const payload: any = {
      ...form,
      clases: form.clases,    // number[]
      objetos: form.objetos   // number[]
    };

    if (this.personajeId) {
      payload.idPersonaje = this.personajeId;
      this.personajeService.actualizarPersonaje(payload)
        .subscribe(() => this.router.navigate(['/mis-personajes']));
    } else {
      this.personajeService.crearPersonaje(payload)
        .subscribe(() => this.router.navigate(['/mis-personajes']));
    }
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result as string;
      this.personajeForm.patchValue({ imagenPersonaje: this.imagenPreview });
    };
    reader.readAsDataURL(file);
  }

  cancelar(): void {
    this.router.navigate(['/mis-personajes']);
  }
  onCheckboxChange(event: Event, controlName: string) {
  const checkbox = event.target as HTMLInputElement;
  const control = this.personajeForm.get(controlName);
  if (!control) return;

  const current = control.value as number[];
  if (checkbox.checked) {
    control.setValue([...current, +checkbox.value]);
  } else {
    control.setValue(current.filter(id => id !== +checkbox.value));
  }
}

}
