export interface HistorialClinico {
  id: number;
  id_turno: number;
  id_medico: number;
  id_paciente: number;
  diagnostico: string;
  tratamiento: string | null;
  observaciones: string | null;
  fecha_registro: string;
  medico_nombre?: string;
  medico_apellido?: string;
  especialidad?: string;
  fecha_turno?: string;
  hora_turno?: string;
}

export interface HistorialClinicoRequest {
  id_turno: number;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;
}
