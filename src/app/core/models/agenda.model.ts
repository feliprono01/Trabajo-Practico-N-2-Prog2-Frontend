export interface RangoAgenda {
  id: number;
  hora_entrada: string;
  hora_salida: string;
  fecha: string;
  id_medico: number;
  medico_nombre: string;
  medico_apellido: string;
  id_especialidad: number;
  especialidad: string;
  id_sede: number;
  sede: string;
}

export interface RangoAgendaRequest {
  hora_entrada: string;
  hora_salida: string;
  fecha: string;
  id_medico: number;
  id_especialidad: number;
  id_sede: number;
}
