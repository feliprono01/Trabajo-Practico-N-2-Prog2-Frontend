import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Sede, SedeRequest } from '../models/sede.model';

@Injectable({
  providedIn: 'root',
})
export class SedeService {
  constructor(private readonly http: HttpClient) {}

  getSedes(): Observable<ApiResponse<Sede[]>> {
    return this.http.get<ApiResponse<Sede[]>>(`${environment.apiUrl}/sedes`);
  }

  crear(datos: SedeRequest): Observable<ApiResponse<Sede>> {
    return this.http.post<ApiResponse<Sede>>(`${environment.apiUrl}/sedes`, datos);
  }

  actualizar(id: number, datos: SedeRequest): Observable<ApiResponse<Sede>> {
    return this.http.put<ApiResponse<Sede>>(`${environment.apiUrl}/sedes/${id}`, datos);
  }

  eliminar(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${environment.apiUrl}/sedes/${id}`);
  }
}
