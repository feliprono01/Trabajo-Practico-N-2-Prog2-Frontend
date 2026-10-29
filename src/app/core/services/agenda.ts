import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { RangoAgenda, RangoAgendaRequest } from '../models/agenda.model';

export interface FiltrosAgenda {
  id_medico?: number;
  id_sede?: number;
  fecha?: string;
}

export interface FiltrosDisponibilidad {
  id_medico: number;
  id_especialidad: number;
  id_sede: number;
  fecha?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  constructor(private readonly http: HttpClient) {}

  getAgenda(filtros: FiltrosAgenda = {}): Observable<ApiResponse<RangoAgenda[]>> {
    let params = new HttpParams();
    if (filtros.id_medico) params = params.set('id_medico', filtros.id_medico);
    if (filtros.id_sede) params = params.set('id_sede', filtros.id_sede);
    if (filtros.fecha) params = params.set('fecha', filtros.fecha);
    return this.http.get<ApiResponse<RangoAgenda[]>>(`${environment.apiUrl}/agenda`, { params });
  }

  crear(datos: RangoAgendaRequest): Observable<ApiResponse<RangoAgenda>> {
    return this.http.post<ApiResponse<RangoAgenda>>(`${environment.apiUrl}/agenda`, datos);
  }

  actualizar(id: number, datos: RangoAgendaRequest): Observable<ApiResponse<RangoAgenda>> {
    return this.http.put<ApiResponse<RangoAgenda>>(`${environment.apiUrl}/agenda/${id}`, datos);
  }

  eliminar(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${environment.apiUrl}/agenda/${id}`);
  }

  getFechasDisponibles(filtros: Omit<FiltrosDisponibilidad, 'fecha'>): Observable<ApiResponse<string[]>> {
    const params = new HttpParams()
      .set('id_medico', filtros.id_medico)
      .set('id_especialidad', filtros.id_especialidad)
      .set('id_sede', filtros.id_sede);
    return this.http.get<ApiResponse<string[]>>(`${environment.apiUrl}/agenda/fechas-disponibles`, { params });
  }

  getHorariosDisponibles(filtros: FiltrosDisponibilidad): Observable<ApiResponse<string[]>> {
    const params = new HttpParams()
      .set('id_medico', filtros.id_medico)
      .set('id_especialidad', filtros.id_especialidad)
      .set('id_sede', filtros.id_sede)
      .set('fecha', filtros.fecha ?? '');
    return this.http.get<ApiResponse<string[]>>(`${environment.apiUrl}/agenda/horarios-disponibles`, { params });
  }
}
