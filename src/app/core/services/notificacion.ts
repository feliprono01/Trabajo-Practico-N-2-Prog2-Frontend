import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Notificacion } from '../models/notificacion.model';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private readonly contador = signal(0);
  readonly contadorNoLeidas = this.contador.asReadonly();

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<ApiResponse<Notificacion[]>> {
    return this.http.get<ApiResponse<Notificacion[]>>(`${environment.apiUrl}/notificaciones`);
  }

  marcarLeida(id: number): Observable<ApiResponse<{ id: number; leida: number }>> {
    return this.http
      .put<ApiResponse<{ id: number; leida: number }>>(`${environment.apiUrl}/notificaciones/${id}/leida`, {})
      .pipe(tap(() => this.contador.update((actual) => Math.max(0, actual - 1))));
  }

  refrescarContador(): void {
    this.http
      .get<ApiResponse<{ cantidad: number }>>(`${environment.apiUrl}/notificaciones/no-leidas`)
      .subscribe({
        next: (respuesta) => this.contador.set(respuesta.datos?.cantidad ?? 0),
        error: () => this.contador.set(0),
      });
  }

  limpiarContador(): void {
    this.contador.set(0);
  }
}
