export type Rol = 'admin' | 'medico' | 'operador' | 'paciente';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido: string;
  rol: Rol;
  id_sede: number | null;
}

export interface UsuarioPerfil {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  rol: Rol;
  id_sede: number | null;
  id_cobertura: number | null;
  sede: string | null;
  cobertura: string | null;
}

export interface EspecialidadResumen {
  id: number;
  descripcion: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  rol: Rol;
  id_sede: number | null;
  sede: string | null;
  id_cobertura: number | null;
  cobertura: string | null;
  especialidades?: EspecialidadResumen[];
}

export type RolGestionable = Exclude<Rol, 'paciente'>;

export interface UsuarioAltaRequest {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  fecha_nacimiento: string;
  telefono?: string;
  rol: RolGestionable;
  id_sede?: number | null;
  especialidades?: number[];
}

export interface UsuarioEdicionRequest {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  id_sede?: number;
  id_cobertura?: number;
  especialidades?: number[];
  password?: string;
}

export interface ActualizarPerfilRequest {
  email?: string;
  password?: string;
  telefono?: string;
  id_cobertura?: number;
}

export interface PacienteBusqueda {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  id_cobertura: number | null;
  cobertura: string | null;
}
