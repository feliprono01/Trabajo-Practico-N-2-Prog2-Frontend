import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { EspecialidadService } from '../../../core/services/especialidad';
import { Especialidad, EspecialidadRequest } from '../../../core/models/especialidad.model';
import { EspecialidadFormDialog } from './especialidad-form-dialog';
import { AlertService } from '../../../core/services/alert';
import { coincideTexto } from '../../../core/utils/texto.util';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/empty-state/empty-state';

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    EmptyState,
  ],
  templateUrl: './especialidades.html',
  styleUrl: './especialidades.scss',
})
export class Especialidades implements OnInit {
  readonly columnas = ['descripcion', 'acciones'];
  readonly filtro = new FormControl('', { nonNullable: true });
  readonly especialidades = signal<Especialidad[]>([]);
  readonly cargando = signal(false);

  get especialidadesFiltradas(): Especialidad[] {
    const termino = this.filtro.value.trim();
    if (!termino) return this.especialidades();
    return this.especialidades().filter((e) => coincideTexto(e.descripcion, termino));
  }

  constructor(
    private readonly especialidadService: EspecialidadService,
    private readonly dialog: MatDialog,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.especialidadService.getEspecialidades().subscribe({
      next: (respuesta) => {
        this.especialidades.set(respuesta.datos ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.alertService.error('No se pudieron cargar las especialidades.');
      },
    });
  }

  abrirAlta(): void {
    const ref = this.dialog.open(EspecialidadFormDialog, { data: { especialidad: null } });
    ref.afterClosed().subscribe((resultado: EspecialidadRequest | null) => {
      if (!resultado) return;
      this.especialidadService.crear(resultado).subscribe({
        next: () => {
          this.alertService.exito('Especialidad creada correctamente.');
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo crear la especialidad.'),
      });
    });
  }

  abrirEdicion(especialidad: Especialidad): void {
    const ref = this.dialog.open(EspecialidadFormDialog, { data: { especialidad } });
    ref.afterClosed().subscribe((resultado: EspecialidadRequest | null) => {
      if (!resultado) return;
      this.especialidadService.actualizar(especialidad.id, resultado).subscribe({
        next: () => {
          this.alertService.exito('Especialidad actualizada correctamente.');
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo actualizar la especialidad.'),
      });
    });
  }

  eliminar(especialidad: Especialidad): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        titulo: 'Eliminar especialidad',
        mensaje: `¿Está seguro de eliminar la especialidad "${especialidad.descripcion}"?`,
      },
    });
    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.especialidadService.eliminar(especialidad.id).subscribe({
        next: () => {
          this.alertService.exito('Especialidad eliminada correctamente.');
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo eliminar la especialidad.'),
      });
    });
  }

  private mostrarError(err: any, fallback: string): void {
    this.alertService.errorHttp(err, fallback);
  }
}
