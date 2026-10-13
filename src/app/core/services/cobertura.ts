import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Cobertura } from '../models/cobertura.model';

@Injectable({
  providedIn: 'root',
})
export class CoberturaService {
  constructor(private readonly http: HttpClient) {}

  getCoberturas(): Observable<ApiResponse<Cobertura[]>> {
    return this.http.get<ApiResponse<Cobertura[]>>(`${environment.apiUrl}/coberturas`);
  }
}
