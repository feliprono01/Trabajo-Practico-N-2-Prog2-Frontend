import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PacienteBusqueda } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  constructor(private readonly http: HttpClient) {}

  buscar(termino: { dni?: string; apellido?: string }): Observable<ApiResponse<PacienteBusqueda[]>> {
    let params = new HttpParams();
    if (termino.dni) params = params.set('dni', termino.dni);
    if (termino.apellido) params = params.set('apellido', termino.apellido);
    return this.http.get<ApiResponse<PacienteBusqueda[]>>(`${environment.apiUrl}/pacientes/buscar`, { params });
  }
}
