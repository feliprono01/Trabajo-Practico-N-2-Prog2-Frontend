/** Normaliza un texto para comparaciones: minúsculas y sin acentos/diacríticos. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** true si `texto` contiene `busqueda`, ignorando mayúsculas y acentos. */
export function coincideTexto(texto: string, busqueda: string): boolean {
  return normalizarTexto(texto).includes(normalizarTexto(busqueda));
}
