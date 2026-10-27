import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { SedeService } from '../../../core/services/sede';
import { Sede, SedeRequest } from '../../../core/models/sede.model';
import { SedeFormDialog } from './sede-form-dialog';
import { AlertService } from '../../../core/services/alert';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/empty-state/empty-state';

@Component({
  selector: 'app-sedes',
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
  templateUrl: './sedes.html',
  styleUrl: './sedes.scss',
})
export class Sedes implements OnInit {
  readonly columnas = ['nombre', 'direccion', 'telefono', 'acciones'];
  readonly filtro = new FormControl('', { nonNullable: true });
  readonly sedes = signal<Sede[]>([]);
  readonly cargando = signal(false);

  get sedesFiltradas(): Sede[] {
    const termino = this.filtro.value.trim().toLowerCase();
    if (!termino) return this.sedes();
    return this.sedes().filter(
      (s) =>
        s.nombre.toLowerCase().includes(termino) ||
        s.direccion.toLowerCase().includes(termino) ||
        s.telefono.toLowerCase().includes(termino)
    );
  }

  constructor(
    private readonly sedeService: SedeService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.sedeService.getSedes().subscribe({
      next: (respuesta) => {
        this.sedes.set(respuesta.datos ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.alertService.error('No se pudieron cargar las sedes.');
      },
    });
  }

  abrirAlta(): void {
    const ref = this.dialog.open(SedeFormDialog, { data: { sede: null } });
    ref.afterClosed().subscribe((resultado: SedeRequest | null) => {
      if (!resultado) return;
      this.sedeService.crear(resultado).subscribe({
        next: () => {
          this.snackBar.open('Sede creada correctamente.', 'Cerrar', { duration: 3000 });
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo crear la sede.'),
      });
    });
  }

  abrirEdicion(sede: Sede): void {
    const ref = this.dialog.open(SedeFormDialog, { data: { sede } });
    ref.afterClosed().subscribe((resultado: SedeRequest | null) => {
      if (!resultado) return;
      this.sedeService.actualizar(sede.id, resultado).subscribe({
        next: () => {
          this.snackBar.open('Sede actualizada correctamente.', 'Cerrar', { duration: 3000 });
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo actualizar la sede.'),
      });
    });
  }

  eliminar(sede: Sede): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { titulo: 'Eliminar sede', mensaje: `¿Está seguro de eliminar la sede "${sede.nombre}"?` },
    });
    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.sedeService.eliminar(sede.id).subscribe({
        next: () => {
          this.snackBar.open('Sede eliminada correctamente.', 'Cerrar', { duration: 3000 });
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo eliminar la sede.'),
      });
    });
  }

  private mostrarError(err: any, fallback: string): void {
    this.alertService.errorHttp(err, fallback);
  }
}
