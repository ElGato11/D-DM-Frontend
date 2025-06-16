import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService, Usuario } from '../services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  creando: boolean = false;
  editando: boolean = false;
  usuarioEdit: Usuario = this.nuevoUsuario();
  crearComoAdmin: boolean = false;

  // Para cambio de contraseña
  editandoClaveId: number | null = null;
  nuevaClave = '';
  repetirClave = '';

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuariosService.getAll().subscribe(data => {
      this.usuarios = data;
    });
  }

  iniciarCreacion(): void {
    this.usuarioEdit = this.nuevoUsuario();
    this.creando = true;
    this.editando = false;
    this.crearComoAdmin = false;
  }

  iniciarEdicion(usuario: Usuario): void {
    this.usuarioEdit = { ...usuario };
    this.editando = true;
    this.creando = false;
  }

  guardar(): void {
    if (this.creando) {
      const endpoint = this.crearComoAdmin
        ? this.usuariosService.crearAdmin(this.usuarioEdit)
        : this.usuariosService.crear(this.usuarioEdit);

      endpoint.subscribe(() => {
        this.cancelar();
        this.cargarUsuarios();
      });
    } else if (this.editando && this.usuarioEdit.id) {
      this.usuariosService.actualizar(this.usuarioEdit.id, this.usuarioEdit).subscribe(() => {
        this.cancelar();
        this.cargarUsuarios();
      });
    }
  }

  borrar(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.usuariosService.borrar(id).subscribe(() => {
        this.cargarUsuarios();
      });
    }
  }

  iniciarCambioClave(id: number): void {
    this.editandoClaveId = id;
    this.nuevaClave = '';
    this.repetirClave = '';
  }

  guardarCambioClave(): void {
    if (this.nuevaClave !== this.repetirClave) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.editandoClaveId !== null) {
      this.usuariosService.cambiarClave(this.editandoClaveId, this.nuevaClave).subscribe(() => {
        alert('Contraseña actualizada');
        this.cancelarCambioClave();
      });
    }
  }

  cancelarCambioClave(): void {
    this.editandoClaveId = null;
    this.nuevaClave = '';
    this.repetirClave = '';
  }

  cancelar(): void {
    this.creando = false;
    this.editando = false;
    this.usuarioEdit = this.nuevoUsuario();
  }

  

  private nuevoUsuario(): Usuario {
  return {
    id: 0,
    nombre: '',
    clave: '',
    rol: 'USER'
  };
}

}
