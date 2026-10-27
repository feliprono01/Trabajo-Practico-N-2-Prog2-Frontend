export interface Notificacion {
  id: number;
  tipo: string;
  mensaje: string;
  leida: boolean | 0 | 1;
  fecha: string;
}
