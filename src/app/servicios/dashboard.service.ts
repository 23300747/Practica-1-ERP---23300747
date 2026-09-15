import { Injectable } from '@angular/core';
import { API_URL } from './api-url';
import { CallbackHttp, obtenerJSON } from './http-cliente';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly url = `${API_URL}/dashboard`;

  obtenerResumen(callback: CallbackHttp): void {
    obtenerJSON(this.url, callback);
  }
}
