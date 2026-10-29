/**
 * Convierte un string "YYYY-MM-DD" (o un ISO con hora/Z) a un Date en horario local,
 * tomando solo la parte de fecha. Evita el corrimiento de día que produce
 * `new Date('YYYY-MM-DD')`, que JS interpreta como medianoche UTC y no como
 * medianoche local (en Argentina, UTC-3, eso cae en el día anterior).
 */
export function parsearFechaLocal(iso: string): Date {
  const [anio, mes, dia] = iso.slice(0, 10).split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

/** Formatea un Date a "YYYY-MM-DD" usando sus componentes locales. */
export function formatearFechaLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Validador de FormGroup: exige que, si ambos campos "fechaDesde" y "fechaHasta"
 * tienen valor, "fechaHasta" no sea anterior a "fechaDesde".
 */
export function rangoFechasValidator(group: { get(nombre: string): { value: unknown } | null }): Record<string, boolean> | null {
  const desde = group.get('fechaDesde')?.value as Date | null;
  const hasta = group.get('fechaHasta')?.value as Date | null;
  if (desde && hasta && hasta < desde) {
    return { rangoFechasInvalido: true };
  }
  return null;
}
