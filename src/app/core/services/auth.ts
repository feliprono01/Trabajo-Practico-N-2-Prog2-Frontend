import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { LoginRequest, LoginResponse, RegistroRequest, RegistroResponse } from '../models/auth.model';
import { ActualizarPerfilRequest, UsuarioPerfil, UsuarioSesion } from '../models/usuario.model';

const TOKEN_KEY = 'clinica_token';
const USUARIO_KEY = 'clinica_usuario';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly usuarioActual = signal<UsuarioSesion | null>(this.leerUsuarioGuardado());

  readonly usuario = this.usuarioActual.asReadonly();

  constructor(private readonly http: HttpClient) {}

  registro(datos: RegistroRequest): Observable<ApiResponse<RegistroResponse>> {
    return this.http.post<ApiResponse<RegistroResponse>>(`${environment.apiUrl}/auth/registro`, datos);
  }

  login(credenciales: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/login`, credenciales).pipe(
      tap((respuesta) => {
        if (respuesta.datos) {
          this.guardarSesion(respuesta.datos.token, respuesta.datos.usuario);
        }
      })
    );
  }

  perfil(): Observable<ApiResponse<UsuarioPerfil>> {
    return this.http.get<ApiResponse<UsuarioPerfil>>(`${environment.apiUrl}/auth/perfil`);
  }

  actualizarPerfil(datos: ActualizarPerfilRequest): Observable<ApiResponse<UsuarioPerfil>> {
    return this.http.put<ApiResponse<UsuarioPerfil>>(`${environment.apiUrl}/auth/perfil`, datos);
  }

  getId(): number | null {
    return this.usuarioActual()?.id ?? null;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.usuarioActual.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  estaLogueado(): boolean {
    return !!this.getToken();
  }

  getRol(): string | null {
    return this.usuarioActual()?.rol ?? null;
  }

  private guardarSesion(token: string, usuario: UsuarioSesion): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    this.usuarioActual.set(usuario);
  }

  private leerUsuarioGuardado(): UsuarioSesion | null {
    const guardado = localStorage.getItem(USUARIO_KEY);
    if (!guardado) {
      return null;
    }
    try {
      return JSON.parse(guardado) as UsuarioSesion;
    } catch {
      return null;
    }
  }
}
