import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Especialidad, EspecialidadRequest } from '../models/especialidad.model';

@Injectable({
  providedIn: 'root',
})
export class EspecialidadService {
  constructor(private readonly http: HttpClient) {}

  getEspecialidades(): Observable<ApiResponse<Especialidad[]>> {
    return this.http.get<ApiResponse<Especialidad[]>>(`${environment.apiUrl}/especialidades`);
  }

  crear(datos: EspecialidadRequest): Observable<ApiResponse<Especialidad>> {
    return this.http.post<ApiResponse<Especialidad>>(`${environment.apiUrl}/especialidades`, datos);
  }

  actualizar(id: number, datos: EspecialidadRequest): Observable<ApiResponse<Especialidad>> {
    return this.http.put<ApiResponse<Especialidad>>(`${environment.apiUrl}/especialidades/${id}`, datos);
  }

  eliminar(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${environment.apiUrl}/especialidades/${id}`);
  }
}
