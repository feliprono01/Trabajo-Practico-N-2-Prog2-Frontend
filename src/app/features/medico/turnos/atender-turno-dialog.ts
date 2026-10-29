import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HistorialClinicoRequest } from '../../../core/models/historial-clinico.model';

@Component({
  selector: 'app-atender-turno-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Marcar turno como atendido</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content class="contenido">
        <mat-form-field appearance="outline">
          <mat-label>Diagnóstico</mat-label>
          <textarea matInput formControlName="diagnostico" rows="2"></textarea>
          @if (form.controls.diagnostico.hasError('required')) {
            <mat-error>El diagnóstico es obligatorio</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Tratamiento</mat-label>
          <textarea matInput formControlName="tratamiento" rows="2"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="2"></textarea>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" [mat-dialog-close]="null">Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Confirmar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .contenido {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 380px;
      }
    `,
  ],
})
export class AtenderTurnoDialog {
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    public readonly dialogRef: MatDialogRef<AtenderTurnoDialog>,
    @Inject(MAT_DIALOG_DATA) public readonly data: { idTurno: number }
  ) {
    this.form = this.fb.group({
      diagnostico: ['', Validators.required],
      tratamiento: [''],
      observaciones: [''],
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valor = this.form.getRawValue();
    const payload: HistorialClinicoRequest = {
      id_turno: this.data.idTurno,
      diagnostico: valor.diagnostico!,
      tratamiento: valor.tratamiento || undefined,
      observaciones: valor.observaciones || undefined,
    };
    this.dialogRef.close(payload);
  }
}
