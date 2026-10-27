import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Sede, SedeRequest } from '../../../core/models/sede.model';

@Component({
  selector: 'app-sede-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>{{ data.sede ? 'Editar sede' : 'Nueva sede' }}</h2>
    <form [formGroup]="form" (ngSubmit)="guardar()">
      <mat-dialog-content class="contenido">
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" />
          @if (form.controls.nombre.hasError('required')) {
            <mat-error>El nombre es obligatorio</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion" />
          @if (form.controls.direccion.hasError('required')) {
            <mat-error>La dirección es obligatoria</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono" />
          @if (form.controls.telefono.hasError('required')) {
            <mat-error>El teléfono es obligatorio</mat-error>
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
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 320px;
      }
    `,
  ],
})
export class SedeFormDialog {
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    public readonly dialogRef: MatDialogRef<SedeFormDialog>,
    @Inject(MAT_DIALOG_DATA) public readonly data: { sede: Sede | null }
  ) {
    this.form = this.fb.group({
      nombre: [data.sede?.nombre ?? '', Validators.required],
      direccion: [data.sede?.direccion ?? '', Validators.required],
      telefono: [data.sede?.telefono ?? '', Validators.required],
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value as SedeRequest);
  }
}
