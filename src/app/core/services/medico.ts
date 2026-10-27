import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Medico } from '../models/medico.model';

export interface FiltrosMedico {
  id_especialidad?: number;
  id_sede?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MedicoService {
  constructor(private readonly http: HttpClient) {}

  getMedicos(filtros: FiltrosMedico = {}): Observable<ApiResponse<Medico[]>> {
    let params = new HttpParams();
    if (filtros.id_especialidad) params = params.set('id_especialidad', filtros.id_especialidad);
    if (filtros.id_sede) params = params.set('id_sede', filtros.id_sede);
    return this.http.get<ApiResponse<Medico[]>>(`${environment.apiUrl}/medicos`, { params });
  }
}
