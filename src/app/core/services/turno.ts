import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Turno, TurnoRequest } from '../models/turno.model';

@Injectable({
  providedIn: 'root',
})
export class TurnoService {
  constructor(private readonly http: HttpClient) {}

  crear(datos: TurnoRequest): Observable<ApiResponse<{ id: number; estado: string }>> {
    return this.http.post<ApiResponse<{ id: number; estado: string }>>(`${environment.apiUrl}/turnos`, datos);
  }

  cancelar(id: number): Observable<ApiResponse<{ id: number; estado: string }>> {
    return this.http.put<ApiResponse<{ id: number; estado: string }>>(`${environment.apiUrl}/turnos/${id}/cancelar`, {});
  }

  atender(id: number): Observable<ApiResponse<{ id: number; estado: string }>> {
    return this.http.put<ApiResponse<{ id: number; estado: string }>>(`${environment.apiUrl}/turnos/${id}/atender`, {});
  }

  misTurnos(): Observable<ApiResponse<Turno[]>> {
    return this.http.get<ApiResponse<Turno[]>>(`${environment.apiUrl}/turnos/mis-turnos`);
  }

  turnosMedico(fecha: string, id_sede?: number): Observable<ApiResponse<Turno[]>> {
    let params = new HttpParams().set('fecha', fecha);
    if (id_sede) params = params.set('id_sede', id_sede);
    return this.http.get<ApiResponse<Turno[]>>(`${environment.apiUrl}/turnos/medico`, { params });
  }

  turnosSede(fecha: string): Observable<ApiResponse<Turno[]>> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<ApiResponse<Turno[]>>(`${environment.apiUrl}/turnos/sede`, { params });
  }
}
