export interface TurnosPorEspecialidad {
  especialidad: string;
  cantidad: number;
}

export interface TurnosPorSede {
  sede: string;
  cantidad: number;
}

export interface RankingMedico {
  nombre: string;
  apellido: string;
  cantidad_atendidos: number;
}

export interface TasaCancelacion {
  total_turnos: number;
  cancelados: number;
  tasa_cancelacion_porcentaje: number;
}

export interface FiltroReporte {
  fechaDesde?: string;
  fechaHasta?: string;
}
