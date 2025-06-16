import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-new-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.css'
})
export class NewUserComponent {
  creationMessage = '';
  creationError = '';

  userForm = this.fb.group({
    nombre: ['', Validators.required],
    clave: ['', [Validators.required, Validators.minLength(4)]]
  });

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  crearUsuario() {
    if (this.userForm.invalid) return;

    const url = 'http://localhost:8080/public/usuario/crear';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post(url, this.userForm.value, { headers }).subscribe({
      next: () => {
        this.creationMessage = 'Usuario creado correctamente.';
        this.creationError = '';
        this.userForm.reset();
      },
      error: () => {
        this.creationError = 'Error al crear el usuario.';
        this.creationMessage = '';
      }
    });
  }
}
