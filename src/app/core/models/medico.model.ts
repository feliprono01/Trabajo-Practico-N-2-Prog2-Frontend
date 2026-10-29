import { EspecialidadResumen } from './usuario.model';

export interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  especialidades: EspecialidadResumen[];
}
