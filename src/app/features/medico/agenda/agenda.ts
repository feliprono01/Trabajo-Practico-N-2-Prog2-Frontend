import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { AgendaService } from '../../../core/services/agenda';
import { SedeService } from '../../../core/services/sede';
import { MedicoService } from '../../../core/services/medico';
import { AuthService } from '../../../core/services/auth';
import { AlertService } from '../../../core/services/alert';
import { RangoAgenda, RangoAgendaRequest } from '../../../core/models/agenda.model';
import { Sede } from '../../../core/models/sede.model';
import { EspecialidadResumen } from '../../../core/models/usuario.model';
import { formatearFechaLocal } from '../../../core/utils/fecha.util';
import { RangoAgendaFormDialog } from '../../../shared/rango-agenda-form-dialog/rango-agenda-form-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/empty-state/empty-state';

@Component({
  selector: 'app-medico-agenda',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    EmptyState,
  ],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
})
export class MedicoAgenda implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly sedeService = inject(SedeService);
  private readonly medicoService = inject(MedicoService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly alertService = inject(AlertService);

  readonly fecha = new FormControl(new Date(), { nonNullable: true });
  readonly rangos = signal<RangoAgenda[]>([]);
  readonly cargando = signal(false);
  readonly sedes = signal<Sede[]>([]);
  readonly especialidades = signal<EspecialidadResumen[]>([]);

  ngOnInit(): void {
    this.sedeService.getSedes().subscribe((r) => this.sedes.set(r.datos ?? []));
    this.medicoService.getMedicos().subscribe((r) => {
      const propio = (r.datos ?? []).find((m) => m.id === this.authService.getId());
      this.especialidades.set(propio?.especialidades ?? []);
    });

    this.fecha.valueChanges.subscribe(() => this.cargar());
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.agendaService.getAgenda({ fecha: formatearFechaLocal(this.fecha.value) }).subscribe({
      next: (respuesta) => {
        this.rangos.set(respuesta.datos ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.alertService.error('No se pudo cargar la agenda.');
      },
    });
  }

  abrirAlta(): void {
    const idMedico = this.authService.getId();
    if (!idMedico) return;
    const ref = this.dialog.open(RangoAgendaFormDialog, {
      data: {
        rango: null,
        idMedico,
        medicoFijo: true,
        sedes: this.sedes(),
        especialidades: this.especialidades(),
        sedePreseleccionada: this.authService.usuario()?.id_sede ?? null,
        fechaPreseleccionada: formatearFechaLocal(this.fecha.value),
      },
    });
    ref.afterClosed().subscribe((resultado: RangoAgendaRequest | null) => {
      if (!resultado) return;
      this.agendaService.crear(resultado).subscribe({
        next: () => {
          this.alertService.exito('Rango horario creado correctamente.');
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo crear el rango horario.'),
      });
    });
  }

  abrirEdicion(rango: RangoAgenda): void {
    const idMedico = this.authService.getId();
    if (!idMedico) return;
    const ref = this.dialog.open(RangoAgendaFormDialog, {
      data: { rango, idMedico, medicoFijo: true, sedes: this.sedes(), especialidades: this.especialidades() },
    });
    ref.afterClosed().subscribe((resultado: RangoAgendaRequest | null) => {
      if (!resultado) return;
      this.agendaService.actualizar(rango.id, resultado).subscribe({
        next: () => {
          this.alertService.exito('Rango horario actualizado correctamente.');
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo actualizar el rango horario.'),
      });
    });
  }

  eliminar(rango: RangoAgenda): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Eliminar rango horario',
        mensaje: `¿Está seguro de eliminar el rango ${rango.hora_entrada} - ${rango.hora_salida}?`,
      },
    });
    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.agendaService.eliminar(rango.id).subscribe({
        next: () => {
          this.alertService.exito('Rango horario eliminado correctamente.');
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo eliminar el rango horario.'),
      });
    });
  }

  private mostrarError(err: any, fallback: string): void {
    this.alertService.errorHttp(err, fallback);
  }
}
