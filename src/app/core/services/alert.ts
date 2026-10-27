import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertDialog } from '../../shared/alert-dialog/alert-dialog';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  error(mensaje: string, titulo = 'No se pudo completar la acción'): void {
    this.dialog.open(AlertDialog, {
      data: { titulo, mensaje, tipo: 'error' },
      autoFocus: false,
    });
  }

  advertencia(mensaje: string, titulo = 'Atención'): void {
    this.dialog.open(AlertDialog, {
      data: { titulo, mensaje, tipo: 'advertencia' },
      autoFocus: false,
    });
  }

  /** Extrae el mensaje del backend (err.error.estado) o usa un fallback, y lo muestra como alerta de error. */
  errorHttp(err: any, fallback: string): void {
    const mensaje = err?.error?.estado || fallback;
    this.error(mensaje);
  }

  /** Mensaje de éxito breve, bien visible (fondo verde, arriba al centro). No bloquea la pantalla. */
  exito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3500,
      panelClass: ['snackbar-exito'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
