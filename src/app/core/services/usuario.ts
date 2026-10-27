import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Paginado } from '../models/paginado.model';
import { Usuario, UsuarioAltaRequest, UsuarioEdicionRequest, Rol } from '../models/usuario.model';

export interface FiltrosUsuario {
  nombre?: string;
  apellido?: string;
  rol?: Rol;
  id_sede?: number;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(private readonly http: HttpClient) {}

  listar(filtros: FiltrosUsuario = {}): Observable<ApiResponse<Paginado<Usuario>>> {
    let params = new HttpParams();
    if (filtros.nombre) params = params.set('nombre', filtros.nombre);
    if (filtros.apellido) params = params.set('apellido', filtros.apellido);
    if (filtros.rol) params = params.set('rol', filtros.rol);
    if (filtros.id_sede) params = params.set('id_sede', filtros.id_sede);
    if (filtros.page) params = params.set('page', filtros.page);
    if (filtros.pageSize) params = params.set('pageSize', filtros.pageSize);
    return this.http.get<ApiResponse<Paginado<Usuario>>>(`${environment.apiUrl}/usuarios`, { params });
  }

  crear(datos: UsuarioAltaRequest): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(`${environment.apiUrl}/usuarios`, datos);
  }

  actualizar(id: number, datos: UsuarioEdicionRequest): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${environment.apiUrl}/usuarios/${id}`, datos);
  }
}
