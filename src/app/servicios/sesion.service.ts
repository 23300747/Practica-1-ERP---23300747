import { Injectable } from '@angular/core';
import { API_URL } from './api-url';
import { CallbackHttp, postJSON } from './http-cliente';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly url = `${API_URL}/sesion`;

  iniciarSesion(correo: string, contrasena: string, callback: CallbackHttp): void {
    postJSON(`${this.url}/login`, { correo, contrasena }, callback);
  }

  registrarCliente(datos: any, callback: CallbackHttp): void {
    postJSON(`${this.url}/registro`, datos, callback);
  }
}
