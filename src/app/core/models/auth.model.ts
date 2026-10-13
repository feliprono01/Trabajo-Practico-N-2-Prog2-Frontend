import { UsuarioSesion } from './usuario.model';

export interface LoginRequest {
  dni: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioSesion;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  fecha_nacimiento: string;
  id_cobertura: number;
  telefono?: string;
}

export interface RegistroResponse {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  rol: string;
  id_cobertura: number;
}
