import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArenaService } from '../services/arena.service';
import { PersonajeService } from '../services/personaje.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sala.component.html',
  styleUrl: './sala.component.css'
})
export class SalaComponent implements OnInit {
  salaId!: number;
  sala: any;
  personajes: any[] = [];
  personajeSeleccionado: number | null = null;
  asignado: boolean = false;
  intervalId: any;

  constructor(
    private route: ActivatedRoute,
    private arenaService: ArenaService,
    private personajeService: PersonajeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.salaId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarSala();
    this.personajeService.getMisPersonajes().subscribe(p => this.personajes = p);

    this.intervalId = setInterval(() => {
      this.cargarSala();
    }, 3000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  cargarSala() {
    this.arenaService.getSala(this.salaId).subscribe(data => this.sala = data);
  }

  asignarPersonaje() {
    if (this.personajeSeleccionado == null) return;
    this.arenaService.asignarPersonaje(this.salaId, this.personajeSeleccionado).subscribe(() => {
      this.asignado = true; // <- esta línea es nueva
      this.cargarSala();
    });
  }
  combatir() {
    console.log("¡Combate iniciado!");
    // Aquí puedes luego mostrar animaciones, navegar, etc.
  }

  salir() {
    this.arenaService.salirSala(this.salaId).subscribe(() => {
      this.router.navigate(['/arena']);
    });
  }
}
