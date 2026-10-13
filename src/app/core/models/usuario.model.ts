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
