import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Cobertura, CoberturaRequest } from '../models/cobertura.model';

@Injectable({
  providedIn: 'root',
})
export class CoberturaService {
  constructor(private readonly http: HttpClient) {}

  getCoberturas(): Observable<ApiResponse<Cobertura[]>> {
    return this.http.get<ApiResponse<Cobertura[]>>(`${environment.apiUrl}/coberturas`);
  }

  crear(datos: CoberturaRequest): Observable<ApiResponse<Cobertura>> {
    return this.http.post<ApiResponse<Cobertura>>(`${environment.apiUrl}/coberturas`, datos);
  }

  actualizar(id: number, datos: CoberturaRequest): Observable<ApiResponse<Cobertura>> {
    return this.http.put<ApiResponse<Cobertura>>(`${environment.apiUrl}/coberturas/${id}`, datos);
  }

  eliminar(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${environment.apiUrl}/coberturas/${id}`);
  }
}
