import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { HistorialClinico, HistorialClinicoRequest } from '../models/historial-clinico.model';

export interface PacienteDeHistorial {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
}

@Injectable({
  providedIn: 'root',
})
export class HistorialClinicoService {
  constructor(private readonly http: HttpClient) {}

  crear(datos: HistorialClinicoRequest): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(`${environment.apiUrl}/historial-clinico`, datos);
  }

  consultar(idPaciente: number): Observable<ApiResponse<HistorialClinico[]>> {
    return this.http.get<ApiResponse<HistorialClinico[]>>(`${environment.apiUrl}/historial-clinico/${idPaciente}`);
  }

  misPacientes(): Observable<ApiResponse<PacienteDeHistorial[]>> {
    return this.http.get<ApiResponse<PacienteDeHistorial[]>>(`${environment.apiUrl}/historial-clinico/mis-pacientes`);
  }
}
