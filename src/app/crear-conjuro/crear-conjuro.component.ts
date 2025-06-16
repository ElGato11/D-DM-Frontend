import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

import { ConjuroService, Conjuro } from '../services/conjuro.service';

@Component({
  selector: 'app-crear-conjuro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-conjuro.component.html',
  styleUrl: './crear-conjuro.component.css'
})
export class CrearConjuroComponent implements OnInit {
  form = this.fb.group({
    nombreConjuro: ['', Validators.required],
    nivel: [1, [Validators.required, Validators.min(0)]],
    escuela: ['', Validators.required],
    efecto: ['', Validators.required]
  });

  isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private conjuroService: ConjuroService, 
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {}

  onSubmit() {
    if (!this.isBrowser || this.form.invalid) return;

    const nuevoConjuro: Conjuro = this.form.value as Conjuro;

    this.conjuroService.crearConjuro(nuevoConjuro)
      .subscribe({
        next: () => {
          alert('Conjuro creado con éxito');
          this.router.navigate(['/conjuros']);
        },
        error: () => alert('Error al crear el conjuro')
      });
  }
}
