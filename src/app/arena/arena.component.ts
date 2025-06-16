import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArenaService } from '../services/arena.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-arena',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './arena.component.html',
  styleUrl: './arena.component.css'
})
export class ArenaComponent implements OnInit {
  salas: any[] = [];
  nombreNuevaSala: string = '';

  constructor(private arenaService: ArenaService, private router: Router) {}

  ngOnInit(): void {
    this.cargarSalas();
  }

  cargarSalas() {
    this.arenaService.listarSalas().subscribe(data => this.salas = data);
  }

  crearSala() {
    if (!this.nombreNuevaSala.trim()) return;
    this.arenaService.crearSala(this.nombreNuevaSala).subscribe(sala => {
      this.router.navigate(['/arena', sala.id]);
    });
  }

  unirse(id: number) {
    this.arenaService.unirseSala(id).subscribe(() => {
      this.router.navigate(['/arena', id]);
    });
  }
}
