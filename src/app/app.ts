import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Configuración y estado principal del sistema
  protected readonly title = signal('Prac1ERP');
  mostrarLayout = signal(false);

  // Manejo de navegación y redirección por rol
  constructor(private router: Router) {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects || event.url;
      this.mostrarLayout.set(url !== '/');
      if (url !== '/' && !this.esAdmin() && url !== '/compras' && url !== '/ventas') {
        this.router.navigate(['/compras']);
      }
    });
  }
  
  // Encargado de verificar si la sesión activa es de administrador
  esAdmin(): boolean {
    return localStorage.getItem('rol') === 'administrador';
  }

  // Encargado de cerrar la sesión activa
  cerrarSesion(): void {
    localStorage.removeItem('rol');
    localStorage.removeItem('usuarioId');
    this.mostrarLayout.set(false);
    this.router.navigate(['/']);
  }
}