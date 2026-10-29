import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  FiltroReporte,
  RankingMedico,
  TasaCancelacion,
  TurnosPorEspecialidad,
  TurnosPorSede,
} from '../models/reporte.model';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  constructor(private readonly http: HttpClient) {}

  private armarParams(filtro: FiltroReporte): HttpParams {
    let params = new HttpParams();
    if (filtro.fechaDesde) params = params.set('fechaDesde', filtro.fechaDesde);
    if (filtro.fechaHasta) params = params.set('fechaHasta', filtro.fechaHasta);
    return params;
  }

  turnosPorEspecialidad(filtro: FiltroReporte = {}): Observable<ApiResponse<TurnosPorEspecialidad[]>> {
    return this.http.get<ApiResponse<TurnosPorEspecialidad[]>>(`${environment.apiUrl}/reportes/turnos-especialidad`, {
      params: this.armarParams(filtro),
    });
  }

  turnosPorSede(filtro: FiltroReporte = {}): Observable<ApiResponse<TurnosPorSede[]>> {
    return this.http.get<ApiResponse<TurnosPorSede[]>>(`${environment.apiUrl}/reportes/turnos-sede`, {
      params: this.armarParams(filtro),
    });
  }

  rankingMedicos(filtro: FiltroReporte = {}): Observable<ApiResponse<RankingMedico[]>> {
    return this.http.get<ApiResponse<RankingMedico[]>>(`${environment.apiUrl}/reportes/ranking-medicos`, {
      params: this.armarParams(filtro),
    });
  }

  tasaCancelacion(filtro: FiltroReporte = {}): Observable<ApiResponse<TasaCancelacion>> {
    return this.http.get<ApiResponse<TasaCancelacion>>(`${environment.apiUrl}/reportes/tasa-cancelacion`, {
      params: this.armarParams(filtro),
    });
  }
}
