import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ObjetoService, Objeto } from '../services/objeto.service';

@Component({
  selector: 'app-crear-objeto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-objeto.component.html',
  styleUrl: './crear-objeto.component.css'
})
export class CrearObjetoComponent {
  objeto: Objeto = {
    nombre: '',
    tipo: '',
    necesitaCompetencia: false,
    danyo: '',
    efecto: ''
  };

  mensaje: string = '';

  constructor(
    private objetoService: ObjetoService,
    private router: Router
  ) {}

  crearObjeto() {
    if (!this.objeto.nombre || !this.objeto.tipo || !this.objeto.efecto) {
      this.mensaje = 'Rellena todos los campos obligatorios.';
      return;
    }

    const objetoFinal = { ...this.objeto };

    if (!objetoFinal.danyo) {
      objetoFinal.danyo = '';
    } else {
      const formatoValido = /^\d+[dD]\d+$/;
      if (!formatoValido.test(objetoFinal.danyo.trim())) {
        alert('El campo daño debe estar vacío o tener el formato "número+D+número" (por ejemplo: 2D6)');
        return;
      }
    }

    this.objetoService.crearObjeto(objetoFinal).subscribe({
      next: () => {
        this.mensaje = 'Objeto creado correctamente.';
        setTimeout(() => this.router.navigate(['/objetos']), 1500);
      },
      error: (error) => {
        console.error('Error al crear objeto:', error);
        this.mensaje = 'Error al crear el objeto.';
      }
    });
  }
}
