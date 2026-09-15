import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SesionService } from '../../servicios/sesion.service';

@Component({
  imports: [],
  selector: 'app-sesion',
  styleUrl: './sesion.css',
  templateUrl: './sesion.html',
})
export class Sesion {
  // Datos del formulario de login y registro
  mostrarRegistro = false;

  nombre = '';
  correo = '';
  contrasena = '';

  constructor(
    private sesionService: SesionService,
    private router: Router
  ) {}

  // Alterna entre la vista de iniciar sesión y crear cuenta
  alternarVista(): void {
    this.mostrarRegistro = !this.mostrarRegistro;
  }

  enviar(): void {
    if (this.mostrarRegistro) {
      this.sesionService.registrarCliente(
        { nombre: this.nombre, correo: this.correo, contrasena: this.contrasena },
        (error) => {
          if (error) {
            console.error('Error al registrar cliente:', error);
            alert('No se pudo registrar la cuenta');
            return;
          }
          this.mostrarRegistro = false;
        }
      );
      return;
    }

    this.sesionService.iniciarSesion(this.correo, this.contrasena, (error, resultado) => {
      if (error) {
        console.error('Error al iniciar sesion:', error);
        alert('No se pudo iniciar sesión');
        return;
      }
      if (resultado && resultado.existe) {
        localStorage.setItem('rol', resultado.rol);
        localStorage.setItem('usuarioId', String(resultado.usuario.id));
        this.router.navigate([resultado.rol === 'administrador' ? '/dashboard' : '/compras']);
      } else {
        alert('Correo o contraseña incorrectos');
      }
    });
  }
}