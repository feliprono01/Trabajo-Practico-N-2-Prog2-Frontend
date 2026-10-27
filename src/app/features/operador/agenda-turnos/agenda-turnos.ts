import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AgendaService } from '../../../core/services/agenda';
import { SedeService } from '../../../core/services/sede';
import { AuthService } from '../../../core/services/auth';
import { RangoAgenda, RangoAgendaRequest } from '../../../core/models/agenda.model';
import { Sede } from '../../../core/models/sede.model';
import { formatearFechaLocal } from '../../../core/utils/fecha.util';
import { AlertService } from '../../../core/services/alert';
import { NuevaAgendaDialog } from './nueva-agenda-dialog';
import { TurnosMedicoDialog } from './turnos-medico-dialog';
import { RangoAgendaFormDialog } from '../../../shared/rango-agenda-form-dialog/rango-agenda-form-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/empty-state/empty-state';

@Component({
  selector: 'app-operador-agenda-turnos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    EmptyState,
  ],
  templateUrl: './agenda-turnos.html',
  styleUrl: './agenda-turnos.scss',
})
export class OperadorAgendaTurnos implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly sedeService = inject(SedeService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly alertService = inject(AlertService);

  readonly columnas = ['medico', 'especialidad', 'horario', 'sede', 'acciones'];
  readonly fecha = new FormControl(new Date(), { nonNullable: true });
  readonly idSede = new FormControl<number | null>(null);
  readonly rangos = signal<RangoAgenda[]>([]);
  readonly cargando = signal(false);
  readonly sedes = signal<Sede[]>([]);

  get sedePropia(): number | null {
    return this.authService.usuario()?.id_sede ?? null;
  }

  ngOnInit(): void {
    this.idSede.setValue(this.sedePropia);
    this.sedeService.getSedes().subscribe((r) => this.sedes.set(r.datos ?? []));
    this.fecha.valueChanges.subscribe(() => this.cargar());
    this.idSede.valueChanges.subscribe(() => this.cargar());
    this.cargar();
  }

  esSedePropia(rango: RangoAgenda): boolean {
    return rango.id_sede === this.sedePropia;
  }

  cargar(): void {
    this.cargando.set(true);
    this.agendaService
      .getAgenda({ fecha: formatearFechaLocal(this.fecha.value), id_sede: this.idSede.value ?? undefined })
      .subscribe({
        next: (r) => {
          this.rangos.set(r.datos ?? []);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.alertService.error('No se pudo cargar la agenda.');
        },
      });
  }

  abrirNuevaAgenda(): void {
    if (!this.sedePropia) return;
    const ref = this.dialog.open(NuevaAgendaDialog, { data: { idSede: this.sedePropia } });
    ref.afterClosed().subscribe((resultado: RangoAgendaRequest | null) => {
      if (!resultado) return;
      this.agendaService.crear(resultado).subscribe({
        next: () => {
          this.snackBar.open('Agenda creada correctamente.', 'Cerrar', { duration: 3000 });
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo crear la agenda.'),
      });
    });
  }

  editar(rango: RangoAgenda): void {
    const ref = this.dialog.open(RangoAgendaFormDialog, {
      data: { rango, idMedico: rango.id_medico, medicoFijo: true, sedes: this.sedes(), especialidades: [{ id: rango.id_especialidad, descripcion: rango.especialidad }] },
    });
    ref.afterClosed().subscribe((resultado: RangoAgendaRequest | null) => {
      if (!resultado) return;
      this.agendaService.actualizar(rango.id, resultado).subscribe({
        next: () => {
          this.snackBar.open('Agenda actualizada correctamente.', 'Cerrar', { duration: 3000 });
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo actualizar la agenda.'),
      });
    });
  }

  eliminar(rango: RangoAgenda): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { titulo: 'Eliminar rango horario', mensaje: `¿Está seguro de eliminar el rango ${rango.hora_entrada} - ${rango.hora_salida} de ${rango.medico_apellido}?` },
    });
    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.agendaService.eliminar(rango.id).subscribe({
        next: () => {
          this.snackBar.open('Rango horario eliminado correctamente.', 'Cerrar', { duration: 3000 });
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo eliminar el rango horario.'),
      });
    });
  }

  verTurnos(rango: RangoAgenda): void {
    this.dialog.open(TurnosMedicoDialog, {
      data: {
        medicoNombre: `${rango.medico_apellido}, ${rango.medico_nombre}`,
        idMedico: rango.id_medico,
        fecha: formatearFechaLocal(this.fecha.value),
      },
    });
  }

  private mostrarError(err: any, fallback: string): void {
    this.alertService.errorHttp(err, fallback);
  }
}
