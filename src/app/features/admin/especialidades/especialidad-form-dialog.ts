import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Especialidad, EspecialidadRequest } from '../../../core/models/especialidad.model';
import { noSoloEspaciosValidator } from '../../../core/utils/validadores.util';

@Component({
  selector: 'app-especialidad-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>{{ data.especialidad ? 'Editar especialidad' : 'Nueva especialidad' }}</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content class="contenido">
        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <input matInput formControlName="descripcion" />
          @if (form.controls.descripcion.hasError('required') || form.controls.descripcion.hasError('soloEspacios')) {
            <mat-error>La descripción es obligatoria</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" [mat-dialog-close]="null">Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Guardar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .contenido {
        min-width: 320px;
      }
    `,
  ],
})
export class EspecialidadFormDialog {
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    public readonly dialogRef: MatDialogRef<EspecialidadFormDialog>,
    @Inject(MAT_DIALOG_DATA) public readonly data: { especialidad: Especialidad | null }
  ) {
    this.form = this.fb.group({
      descripcion: [data.especialidad?.descripcion ?? '', [Validators.required, noSoloEspaciosValidator]],
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value as EspecialidadRequest);
  }
}
