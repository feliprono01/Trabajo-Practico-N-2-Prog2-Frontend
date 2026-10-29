import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Paginado } from '../models/paginado.model';
import { PacienteBusqueda } from '../models/usuario.model';

export interface FiltrosPaciente {
  dni?: string;
  apellido?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  constructor(private readonly http: HttpClient) {}

  /** Sin dni/apellido devuelve el listado completo de pacientes, paginado y del más nuevo al más viejo. */
  buscar(filtros: FiltrosPaciente): Observable<ApiResponse<Paginado<PacienteBusqueda>>> {
    let params = new HttpParams();
    if (filtros.dni) params = params.set('dni', filtros.dni);
    if (filtros.apellido) params = params.set('apellido', filtros.apellido);
    if (filtros.page) params = params.set('page', filtros.page);
    if (filtros.pageSize) params = params.set('pageSize', filtros.pageSize);
    return this.http.get<ApiResponse<Paginado<PacienteBusqueda>>>(`${environment.apiUrl}/pacientes/buscar`, { params });
  }
}
