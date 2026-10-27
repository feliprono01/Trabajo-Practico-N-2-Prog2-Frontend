import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TurnoService } from '../../../core/services/turno';
import { SedeService } from '../../../core/services/sede';
import { NotificacionService } from '../../../core/services/notificacion';
import { HistorialClinicoService } from '../../../core/services/historial-clinico';
import { Turno } from '../../../core/models/turno.model';
import { HistorialClinicoRequest } from '../../../core/models/historial-clinico.model';
import { Sede } from '../../../core/models/sede.model';
import { formatearFechaLocal, parsearFechaLocal } from '../../../core/utils/fecha.util';
import { AlertService } from '../../../core/services/alert';
import { AtenderTurnoDialog } from './atender-turno-dialog';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/empty-state/empty-state';

@Component({
  selector: 'app-medico-turnos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    EmptyState,
  ],
  templateUrl: './turnos.html',
  styleUrl: './turnos.scss',
})
export class MedicoTurnos implements OnInit {
  private readonly turnoService = inject(TurnoService);
  private readonly sedeService = inject(SedeService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly historialService = inject(HistorialClinicoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly alertService = inject(AlertService);

  readonly fecha = new FormControl(new Date(), { nonNullable: true });
  readonly idSede = new FormControl<number | null>(null);
  readonly turnos = signal<Turno[]>([]);
  readonly cargando = signal(false);
  readonly sedes = signal<Sede[]>([]);

  ngOnInit(): void {
    this.sedeService.getSedes().subscribe((r) => this.sedes.set(r.datos ?? []));
    this.fecha.valueChanges.subscribe(() => this.cargar());
    this.idSede.valueChanges.subscribe(() => this.cargar());
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.turnoService.turnosMedico(formatearFechaLocal(this.fecha.value), this.idSede.value ?? undefined).subscribe({
      next: (respuesta) => {
        this.turnos.set(respuesta.datos ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.alertService.error('No se pudieron cargar los turnos.');
      },
    });
  }

  edad(fechaNacimiento?: string): number | null {
    if (!fechaNacimiento) return null;
    const nacimiento = parsearFechaLocal(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  atender(turno: Turno): void {
    const ref = this.dialog.open(AtenderTurnoDialog, { data: { idTurno: turno.id } });
    ref.afterClosed().subscribe((payload: HistorialClinicoRequest | null) => {
      if (!payload) return;
      this.turnoService.atender(turno.id).subscribe({
        next: () => {
          this.historialService.crear(payload).subscribe({
            next: () => {
              this.snackBar.open('Turno marcado como atendido.', 'Cerrar', { duration: 3000 });
              this.notificacionService.refrescarContador();
              this.cargar();
            },
            error: (err) => this.mostrarError(err, 'El turno se marcó como atendido pero no se pudo guardar el historial.'),
          });
        },
        error: (err) => this.mostrarError(err, 'No se pudo marcar el turno como atendido.'),
      });
    });
  }

  cancelar(turno: Turno): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { titulo: 'Cancelar turno', mensaje: `¿Está seguro de cancelar el turno de ${turno.paciente_apellido}, ${turno.paciente_nombre}?` },
    });
    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.turnoService.cancelar(turno.id).subscribe({
        next: () => {
          this.snackBar.open('Turno cancelado correctamente.', 'Cerrar', { duration: 3000 });
          this.notificacionService.refrescarContador();
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo cancelar el turno.'),
      });
    });
  }

  private mostrarError(err: any, fallback: string): void {
    this.alertService.errorHttp(err, fallback);
  }
}
