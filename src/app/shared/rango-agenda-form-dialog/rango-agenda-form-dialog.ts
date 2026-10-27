import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Sede } from '../../core/models/sede.model';
import { EspecialidadResumen } from '../../core/models/usuario.model';
import { RangoAgenda, RangoAgendaRequest } from '../../core/models/agenda.model';
import { formatearFechaLocal, parsearFechaLocal } from '../../core/utils/fecha.util';

export interface RangoAgendaFormDialogData {
  rango: RangoAgenda | null;
  idMedico: number;
  medicoFijo: boolean;
  sedes: Sede[];
  especialidades: EspecialidadResumen[];
  sedePreseleccionada?: number | null;
  fechaPreseleccionada?: string | null;
}

const horaSalidaPosterior: ValidatorFn = (group): ValidationErrors | null => {
  const entrada = group.get('hora_entrada')?.value;
  const salida = group.get('hora_salida')?.value;
  if (entrada && salida && salida <= entrada) {
    return { salidaInvalida: true };
  }
  return null;
};

@Component({
  selector: 'app-rango-agenda-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './rango-agenda-form-dialog.html',
  styleUrl: './rango-agenda-form-dialog.scss',
})
export class RangoAgendaFormDialog {
  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    public readonly dialogRef: MatDialogRef<RangoAgendaFormDialog>,
    @Inject(MAT_DIALOG_DATA) public readonly data: RangoAgendaFormDialogData
  ) {
    const r = data.rango;
    this.form = this.fb.group(
      {
        fecha: [
          r?.fecha
            ? parsearFechaLocal(r.fecha)
            : data.fechaPreseleccionada
              ? parsearFechaLocal(data.fechaPreseleccionada)
              : null,
          Validators.required,
        ],
        hora_entrada: [r?.hora_entrada ?? '', Validators.required],
        hora_salida: [r?.hora_salida ?? '', Validators.required],
        id_especialidad: [r?.id_especialidad ?? null, Validators.required],
        id_sede: [r?.id_sede ?? data.sedePreseleccionada ?? null, Validators.required],
      },
      { validators: horaSalidaPosterior }
    );
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valor = this.form.getRawValue();
    const fecha = valor.fecha as Date;
    const payload: RangoAgendaRequest = {
      fecha: formatearFechaLocal(fecha),
      hora_entrada: valor.hora_entrada!,
      hora_salida: valor.hora_salida!,
      id_especialidad: valor.id_especialidad!,
      id_sede: valor.id_sede!,
      id_medico: this.data.idMedico,
    };
    this.dialogRef.close(payload);
  }
}
