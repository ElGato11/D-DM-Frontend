import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArenaService } from '../services/arena.service';
import { PersonajeService } from '../services/personaje.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sala.component.html',
  styleUrl: './sala.component.css'
})
export class SalaComponent implements OnInit, OnDestroy {
  salaId!: number;
  sala: any;
  personajes: any[] = [];
  personajeSeleccionado: number | null = null;
  asignado = false;
  intervalId: any;

  // Combate
  enCombate = false;
  hpHost = 0;
  hpJugador2 = 0;
  turnoActual: 'host' | 'jugador2' = 'host';
  miTurno = false;
  miNombre = '';
  objetosDisponibles: any[] = [];
  objetosUsadosIds: Set<number> = new Set();


  constructor(
    private route: ActivatedRoute,
    private arenaService: ArenaService,
    private personajeService: PersonajeService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // guardamos el nombre de usuario para comparaciones
    this.miNombre = this.authService.getUsuario()?.nombre || '';

    this.salaId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarSala();
    this.personajeService.getMisPersonajes().subscribe(p => this.personajes = p);

    this.intervalId = setInterval(() => this.cargarSala(), 3000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  private cargarSala() {
    this.arenaService.getSala(this.salaId).subscribe(data => {
      this.sala = data;

      if (this.enCombate) {
        // Asegura que los valores se actualizan para ambos jugadores
        this.hpHost = data.hpHost;
        this.hpJugador2 = data.hpJugador2;
        this.turnoActual = data.turnoActual;
        this.calcularMiTurno();

        // Si ha muerto alguien, salir
        if (data.hpHost <= 0 || data.hpJugador2 <= 0) {
          alert('Fin del combate');
          this.salir();
        }
      }
    });
  }


  asignarPersonaje() {
    if (this.personajeSeleccionado == null) return;
    this.arenaService
      .asignarPersonaje(this.salaId, this.personajeSeleccionado)
      .subscribe(() => {
        this.asignado = true;
        this.cargarSala();
      });
  }

  combatir() {
    this.enCombate = true;
    this.arenaService.iniciarCombate(this.salaId).subscribe(sala => {
      this.sala = sala;
      this.hpHost = Math.ceil(sala.personajeHost.constitucion / 2);
      this.hpJugador2 = Math.ceil(sala.personajeJugador2.constitucion / 2);
      this.turnoActual = sala.turnoActual;
      this.calcularMiTurno();
      if (this.miTurno) {
        this.obtenerObjetosDelJugador();
      }

    });
  }
atacar() {
    if (!this.miTurno) return;
    this.arenaService.atacar(this.salaId, this.turnoActual)
      .subscribe(sala => {
        this.sala = sala;
        this.hpHost = sala.hpHost;
        this.hpJugador2 = sala.hpJugador2;
        this.turnoActual = sala.turnoActual;
        this.calcularMiTurno();
        if (this.miTurno) {
          this.obtenerObjetosDelJugador();
        }

        if (sala.hpHost <= 0 || sala.hpJugador2 <= 0) {
          alert('Fin del combate');
          this.salir();
        }
      });
}

  private calcularMiTurno() {
    if (!this.enCombate) return;
    this.miTurno = this.turnoActual === 'host'
      ? this.miNombre === this.sala.host.nombre
      : this.miNombre === this.sala.jugador2?.nombre;
  }

  private eliminarPersonaje(id: number) {
    this.personajeService.borrarPersonaje(id).subscribe(() => {
      alert("¡Un personaje ha sido derrotado!");
      this.enCombate = false;
      this.salir(); // ambos salen
    });
  }

  puedeUsar(obj: any): boolean {
  return !this.objetosUsadosIds.has(obj.id);
}

usarObjeto(obj: any): void {
  if (!this.puedeUsar(obj)) return;

  let danioTotal = 1; // daño por defecto

  if (obj.danyo) {
    const partes = obj.danyo.split('D').map(Number);
    if (partes.length === 2 && !isNaN(partes[0]) && !isNaN(partes[1])) {
      const [numDados, caras] = partes;
      danioTotal = 0;
      for (let i = 0; i < numDados; i++) {
        danioTotal += Math.floor(Math.random() * caras) + 1;
      }
    }
  }

  this.objetosUsadosIds.add(obj.id);

  if (this.turnoActual === 'host') {
    this.hpJugador2 -= danioTotal;
    if (this.hpJugador2 <= 0) {
      this.eliminarPersonaje(this.sala.personajeJugador2.idPersonaje);
      return;
    }
    this.turnoActual = 'jugador2';
  } else {
    this.hpHost -= danioTotal;
    if (this.hpHost <= 0) {
      this.eliminarPersonaje(this.sala.personajeHost.idPersonaje);
      return;
    }
    this.turnoActual = 'host';
  }

  this.calcularMiTurno();
}

  private obtenerObjetosDelJugador(): void {
  const personaje = this.miNombre === this.sala.host.nombre
    ? this.sala.personajeHost
    : this.sala.personajeJugador2;

  this.objetosDisponibles = (personaje.objetos || []).filter((obj: any) => !obj.necesitaCompetencia);
  }

  salir() {
    this.arenaService.salirSala(this.salaId).subscribe(() => {
      this.router.navigate(['/arena']);
    });
  }
}
