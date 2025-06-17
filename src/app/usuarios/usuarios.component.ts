import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService, Usuario } from '../services/usuarios.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  creando = false;
  editando = false;
  usuarioEdit: Usuario = this.nuevoUsuario();
  nombreOriginal = '';                 // <-- variable para almacenar el nombre antes de editar
  crearComoAdmin = false;
  editandoClaveId: number | null = null;
  nuevaClave = '';
  repetirClave = '';
  isAdmin = false;
  idUsuarioActual = 0;
  nombreUsuarioActual = '';
  usuarioActual: Usuario = this.nuevoUsuario();

  constructor(
    private usuariosService: UsuariosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuario();
    this.isAdmin = usuario?.rol === 'ADMIN';
    this.idUsuarioActual = usuario?.id || 0;
    this.nombreUsuarioActual = usuario?.nombre || '';
    this.usuarioActual = {
      id: this.idUsuarioActual,
      nombre: this.nombreUsuarioActual,
      rol: 'USER'
    };
    if (this.isAdmin) {
      this.cargarUsuarios();
    } else {
      this.usuarios = [this.usuarioActual];
    }
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
    this.nombreOriginal = usuario.nombre;   // <-- guardamos el nombre anterior
    this.editando = true;
    this.creando = false;
  }

  guardar(): void {
    const nuevoNombre = this.usuarioEdit.nombre?.trim();
    if (!this.validarNombre(nuevoNombre)) {
      alert('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    // CREACIÓN
    if (this.creando) {
      if (!this.validarClave(this.usuarioEdit.clave)) {
        alert('La contraseña debe tener al menos 4 caracteres y contener letras y números.');
        return;
      }
      const endpoint = this.crearComoAdmin
        ? this.usuariosService.crearAdmin(this.usuarioEdit)
        : this.usuariosService.crear(this.usuarioEdit);
      endpoint.subscribe(() => {
        this.cancelar();
        this.cargarUsuarios();
      });

    // EDICIÓN
    } else if (this.editando) {
      const esPropio = this.nombreOriginal === this.nombreUsuarioActual;

      // Admin actualiza a cualquier usuario (distinto de él mismo)
      if (this.isAdmin && !esPropio) {
        const datos = { ...this.usuarioEdit };
        delete datos.clave;
        this.usuariosService.actualizar(this.usuarioEdit.id, datos).subscribe(() => {
          this.cancelar();
          this.cargarUsuarios();
          alert('Usuario actualizado correctamente');
        });

      // Usuario normal actualiza su propio nombre
      } else if (!this.isAdmin && esPropio) {
        if (nuevoNombre === this.nombreUsuarioActual) {
          alert('No hay cambios para guardar.');
          return;
        }
        this.usuariosService.editarNombrePropio({ nombre: nuevoNombre! }).subscribe({
          next: res => {
            if (res.token) sessionStorage.setItem('token', res.token);
            this.usuarioActual.nombre = nuevoNombre!;
            this.nombreUsuarioActual = nuevoNombre!;
            this.cancelar();
            alert(res.mensaje || 'Nombre actualizado correctamente');
          },
          error: err => {
            console.error('Error al actualizar nombre:', err);
            alert('Error al actualizar tu nombre.');
          }
        });

      // Sin permisos
      } else {
        alert('No tienes permisos para editar este usuario.');
      }

    } else {
      alert('Datos insuficientes para guardar.');
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
    if (!this.validarClave(this.nuevaClave)) {
      alert('La nueva contraseña debe tener al menos 4 caracteres y contener letras y números.');
      return;
    }
    const endpoint = this.isAdmin
      ? this.usuariosService.cambiarClave(this.editandoClaveId!, this.nuevaClave)
      : this.usuariosService.cambiarClavePropia(this.nuevaClave);
    endpoint.subscribe({
      next: res => {
        alert(res.mensaje || 'Contraseña actualizada correctamente');
        this.cancelarCambioClave();
      },
      error: () => {
        alert('Ha habido un error al cambiar la contraseña');
      }
    });
  }

  borrar(id: number): void {
    if (!this.isAdmin) return;
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.usuariosService.borrar(id).subscribe(() => {
        this.cargarUsuarios();
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
    this.nombreOriginal = '';
  }

  private nuevoUsuario(): Usuario {
    return { id: 0, nombre: '', clave: '', rol: 'USER' };
  }

  validarNombre(nombre: unknown): boolean {
    return typeof nombre === 'string' && nombre.trim().length >= 3;
  }

  validarClave(clave: unknown): boolean {
    return (
      typeof clave === 'string' &&
      clave.length >= 4 &&
      /[a-zA-Z]/.test(clave) &&
      /[0-9]/.test(clave)
    );
  }
}
