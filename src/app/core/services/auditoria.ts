import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Paginado } from '../models/paginado.model';
import { AuditoriaFiltros, RegistroAuditoria } from '../models/auditoria.model';

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {
  constructor(private readonly http: HttpClient) {}

  listar(filtros: AuditoriaFiltros = {}): Observable<ApiResponse<Paginado<RegistroAuditoria>>> {
    let params = new HttpParams();
    if (filtros.id_usuario) params = params.set('id_usuario', filtros.id_usuario);
    if (filtros.entidad) params = params.set('entidad', filtros.entidad);
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    if (filtros.page) params = params.set('page', filtros.page);
    if (filtros.pageSize) params = params.set('pageSize', filtros.pageSize);
    return this.http.get<ApiResponse<Paginado<RegistroAuditoria>>>(`${environment.apiUrl}/auditoria`, { params });
  }
}
