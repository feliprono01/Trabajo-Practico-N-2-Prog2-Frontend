import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MedicoService } from '../../../core/services/medico';
import { Medico } from '../../../core/models/medico.model';
import { RangoAgendaRequest } from '../../../core/models/agenda.model';
import { formatearFechaLocal } from '../../../core/utils/fecha.util';

const horaSalidaPosterior: ValidatorFn = (group): ValidationErrors | null => {
  const entrada = group.get('hora_entrada')?.value;
  const salida = group.get('hora_salida')?.value;
  if (entrada && salida && salida <= entrada) {
    return { salidaInvalida: true };
  }
  return null;
};

@Component({
  selector: 'app-nueva-agenda-dialog',
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
  templateUrl: './nueva-agenda-dialog.html',
  styleUrl: './nueva-agenda-dialog.scss',
})
export class NuevaAgendaDialog implements OnInit {
  private readonly medicoService = inject(MedicoService);
  private readonly fb = inject(FormBuilder);
  readonly medicos = signal<Medico[]>([]);

  readonly form = this.fb.group(
    {
      id_medico: [null as number | null, Validators.required],
      id_especialidad: [null as number | null, Validators.required],
      fecha: [null as Date | null, Validators.required],
      hora_entrada: ['', Validators.required],
      hora_salida: ['', Validators.required],
    },
    { validators: horaSalidaPosterior }
  );

  constructor(
    public readonly dialogRef: MatDialogRef<NuevaAgendaDialog>,
    @Inject(MAT_DIALOG_DATA) public readonly data: { idSede: number }
  ) {}

  ngOnInit(): void {
    this.medicoService.getMedicos().subscribe((r) => {
      this.medicos.set(r.datos ?? []);
    });

    this.form.controls.id_medico.valueChanges.subscribe(() => {
      this.form.controls.id_especialidad.setValue(null);
    });
  }

  especialidadesDelMedico() {
    const idMedico = this.form.controls.id_medico.value;
    return this.medicos().find((m) => m.id === idMedico)?.especialidades ?? [];
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
      id_medico: valor.id_medico!,
      id_especialidad: valor.id_especialidad!,
      id_sede: this.data.idSede,
    };
    this.dialogRef.close(payload);
  }
}
