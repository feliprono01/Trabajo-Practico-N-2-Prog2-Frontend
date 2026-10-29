import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface AlertDialogData {
  titulo: string;
  mensaje: string;
  tipo: 'error' | 'advertencia';
}

@Component({
  selector: 'app-alert-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="alert-contenido">
      <div class="alert-icono" [class.tipo-error]="data.tipo === 'error'" [class.tipo-advertencia]="data.tipo === 'advertencia'">
        <mat-icon>{{ data.tipo === 'error' ? 'error_outline' : 'warning_amber' }}</mat-icon>
      </div>
      <h2 mat-dialog-title>{{ data.titulo }}</h2>
      <mat-dialog-content>
        <p>{{ data.mensaje }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="center">
        <button mat-flat-button color="primary" [mat-dialog-close]="true">Entendido</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .alert-contenido {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        min-width: 320px;
        max-width: 420px;
        padding: 0.5rem 0.5rem 0;
      }

      .alert-icono {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.5rem;
      }

      .alert-icono.tipo-error {
        background: #fdecea;
      }

      .alert-icono.tipo-error mat-icon {
        color: #c62828;
      }

      .alert-icono.tipo-advertencia {
        background: #fff4e5;
      }

      .alert-icono.tipo-advertencia mat-icon {
        color: #e65100;
      }

      .alert-icono mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      h2[mat-dialog-title] {
        margin: 0 0 0.25rem;
      }

      mat-dialog-content p {
        margin: 0;
        color: var(--mat-sys-on-surface-variant, #555);
      }

      mat-dialog-actions {
        width: 100%;
        margin-top: 0.5rem;
      }

      mat-dialog-actions button {
        min-width: 140px;
      }
    `,
  ],
})
export class AlertDialog {
  constructor(
    public readonly dialogRef: MatDialogRef<AlertDialog>,
    @Inject(MAT_DIALOG_DATA) public readonly data: AlertDialogData
  ) {}
}
