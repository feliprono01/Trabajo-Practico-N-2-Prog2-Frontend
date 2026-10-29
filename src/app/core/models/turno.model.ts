export type EstadoTurno = 'confirmado' | 'cancelado' | 'atendido';

export interface Turno {
  id: number;
  fecha: string;
  hora: string;
  estado: EstadoTurno;
  nota?: string;
  especialidad?: string;
  sede?: string;
  id_sede?: number;
  id_medico?: number;
  medico_nombre?: string;
  medico_apellido?: string;
  paciente_nombre?: string;
  paciente_apellido?: string;
  paciente_dni?: string;
  paciente_fecha_nacimiento?: string;
}

export interface TurnoRequest {
  id_especialidad: number;
  id_sede: number;
  id_medico: number;
  fecha: string;
  hora: string;
  nota: string;
  id_paciente_req?: number;
}
