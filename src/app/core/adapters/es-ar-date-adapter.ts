import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

/**
 * El `NativeDateAdapter` de Angular Material delega el parseo de texto tipeado
 * (no elegido con el calendario) en `Date.parse()` del navegador, que para
 * strings con barras asume el formato estadounidense MM/DD/YYYY. Con un día
 * mayor a 12 (ej. "20/10/2026") eso produce silenciosamente una fecha
 * inválida, sin importar el locale configurado.
 *
 * Este adapter interpreta explícitamente dd/MM/yyyy (o d/M/yyyy), que es el
 * único formato que usa esta app, y delega en el comportamiento original
 * para cualquier otro caso (por ejemplo, selección por calendario, que ya
 * entrega un objeto Date directamente, no un string).
 */
@Injectable()
export class EsArDateAdapter extends NativeDateAdapter {
  override parse(value: unknown): Date | null {
    if (typeof value === 'string' && value.trim()) {
      const partes = value.trim().split(/[/\-.]/);
      if (partes.length === 3) {
        const dia = Number(partes[0]);
        const mes = Number(partes[1]);
        let anio = Number(partes[2]);

        if (Number.isInteger(dia) && Number.isInteger(mes) && Number.isInteger(anio)) {
          if (anio < 100) {
            anio += anio < 50 ? 2000 : 1900;
          }
          const fecha = new Date(anio, mes - 1, dia);
          const esValida = fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
          return esValida ? fecha : new Date(NaN);
        }
      }
    }
    return super.parse(value);
  }
}
