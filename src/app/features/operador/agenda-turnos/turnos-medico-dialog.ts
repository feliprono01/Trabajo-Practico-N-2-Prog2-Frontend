import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TurnoService } from '../../../core/services/turno';
import { NotificacionService } from '../../../core/services/notificacion';
import { Turno } from '../../../core/models/turno.model';
import { AlertService } from '../../../core/services/alert';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { EmptyState } from '../../../shared/empty-state/empty-state';

export interface TurnosMedicoDialogData {
  medicoNombre: string;
  idMedico: number;
  fecha: string;
}

@Component({
  selector: 'app-turnos-medico-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    EmptyState,
  ],
  templateUrl: './turnos-medico-dialog.html',
  styleUrl: './turnos-medico-dialog.scss',
})
export class TurnosMedicoDialog implements OnInit {
  private readonly turnoService = inject(TurnoService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly dialog = inject(MatDialog);
  private readonly alertService = inject(AlertService);

  readonly turnos = signal<Turno[]>([]);
  readonly cargando = signal(false);

  constructor(
    public readonly dialogRef: MatDialogRef<TurnosMedicoDialog>,
    @Inject(MAT_DIALOG_DATA) public readonly data: TurnosMedicoDialogData
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.turnoService.turnosSede(this.data.fecha).subscribe({
      next: (r) => {
        this.turnos.set((r.datos ?? []).filter((t) => t.estado === 'confirmado' && t.id_medico === this.data.idMedico));
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
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
          this.alertService.exito('Turno cancelado correctamente.');
          this.notificacionService.refrescarContador();
          this.cargar();
        },
        error: (err) => this.alertService.errorHttp(err, 'No se pudo cancelar el turno.'),
      });
    });
  }
}
