import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TurnoService } from '../../../core/services/turno';
import { HistorialClinicoService } from '../../../core/services/historial-clinico';
import { NotificacionService } from '../../../core/services/notificacion';
import { AuthService } from '../../../core/services/auth';
import { Turno } from '../../../core/models/turno.model';
import { HistorialClinico } from '../../../core/models/historial-clinico.model';
import { AlertService } from '../../../core/services/alert';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/empty-state/empty-state';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatExpansionModule, MatProgressSpinnerModule, EmptyState],
  templateUrl: './mis-turnos.html',
  styleUrl: './mis-turnos.scss',
})
export class MisTurnos implements OnInit {
  private readonly turnoService = inject(TurnoService);
  private readonly historialService = inject(HistorialClinicoService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly alertService = inject(AlertService);

  readonly turnos = signal<Turno[]>([]);
  readonly cargando = signal(false);
  readonly historialPorTurno = signal<Record<number, HistorialClinico | null>>({});

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.turnoService.misTurnos().subscribe({
      next: (r) => {
        this.turnos.set(this.ordenarPorProximidad(r.datos ?? []));
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.alertService.error('No se pudieron cargar tus turnos.');
      },
    });
  }

  private ordenarPorProximidad(turnos: Turno[]): Turno[] {
    const ahora = new Date();
    const conFecha = turnos.map((t) => ({ t, fecha: new Date(`${t.fecha.slice(0, 10)}T${t.hora}`) }));
    const futuros = conFecha.filter((x) => x.fecha >= ahora).sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    const pasados = conFecha.filter((x) => x.fecha < ahora).sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    return [...futuros, ...pasados].map((x) => x.t);
  }

  cargarHistorial(turno: Turno): void {
    if (turno.estado !== 'atendido' || this.historialPorTurno()[turno.id] !== undefined) return;
    const idPaciente = this.authService.getId();
    if (!idPaciente) return;
    this.historialService.consultar(idPaciente).subscribe({
      next: (r) => {
        const registro = (r.datos ?? []).find((h) => h.id_turno === turno.id) ?? null;
        this.historialPorTurno.update((actual) => ({ ...actual, [turno.id]: registro }));
      },
      error: () => this.historialPorTurno.update((actual) => ({ ...actual, [turno.id]: null })),
    });
  }

  cancelar(turno: Turno): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { titulo: 'Cancelar turno', mensaje: `¿Está seguro de cancelar el turno del ${turno.fecha.slice(0, 10)} a las ${turno.hora}?` },
    });
    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.turnoService.cancelar(turno.id).subscribe({
        next: () => {
          this.snackBar.open('Turno cancelado correctamente.', 'Cerrar', { duration: 3000 });
          this.notificacionService.refrescarContador();
          this.cargar();
        },
        error: (err) => this.alertService.errorHttp(err, 'No se pudo cancelar el turno.'),
      });
    });
  }
}
