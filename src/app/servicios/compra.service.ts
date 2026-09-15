import { Injectable } from '@angular/core';
import { API_URL } from './api-url';
import { CallbackHttp, obtenerJSON, postJSON } from './http-cliente';

@Injectable({ providedIn: 'root' })
export class CompraService {
  private readonly url = `${API_URL}/compras`;

  obtenerProductos(callback: CallbackHttp): void {
    obtenerJSON(`${this.url}/productos`, callback);
  }

  obtenerDistribuidores(callback: CallbackHttp): void {
    obtenerJSON(`${this.url}/distribuidores`, callback);
  }

  agregarDistribuidor(datos: any, callback: CallbackHttp): void {
    postJSON(`${this.url}/distribuidores`, datos, callback);
  }

  obtenerCompras(callback: CallbackHttp): void {
    obtenerJSON(this.url, callback);
  }

  crearCompra(datos: any, callback: CallbackHttp): void {
    postJSON(this.url, datos, callback);
  }
}
