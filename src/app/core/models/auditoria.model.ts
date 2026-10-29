export interface RegistroAuditoria {
  id: number;
  id_usuario: number;
  usuario_nombre: string | null;
  usuario_apellido: string | null;
  accion: 'ALTA' | 'BAJA' | 'MODIFICACION';
  entidad: string;
  id_entidad: number | null;
  detalle: string | null;
  fecha: string;
}

export interface AuditoriaFiltros {
  id_usuario?: number;
  entidad?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  pageSize?: number;
}
