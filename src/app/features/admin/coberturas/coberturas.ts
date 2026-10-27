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
import { CoberturaService } from '../../../core/services/cobertura';
import { Cobertura, CoberturaRequest } from '../../../core/models/cobertura.model';
import { CoberturaFormDialog } from './cobertura-form-dialog';
import { AlertService } from '../../../core/services/alert';
import { coincideTexto } from '../../../core/utils/texto.util';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../../shared/empty-state/empty-state';

@Component({
  selector: 'app-coberturas',
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
  templateUrl: './coberturas.html',
  styleUrl: './coberturas.scss',
})
export class Coberturas implements OnInit {
  readonly columnas = ['nombre', 'acciones'];
  readonly filtro = new FormControl('', { nonNullable: true });
  readonly coberturas = signal<Cobertura[]>([]);
  readonly cargando = signal(false);

  get coberturasFiltradas(): Cobertura[] {
    const termino = this.filtro.value.trim();
    if (!termino) return this.coberturas();
    return this.coberturas().filter((c) => coincideTexto(c.nombre, termino));
  }

  constructor(
    private readonly coberturaService: CoberturaService,
    private readonly dialog: MatDialog,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.coberturaService.getCoberturas().subscribe({
      next: (respuesta) => {
        this.coberturas.set(respuesta.datos ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.alertService.error('No se pudieron cargar las coberturas.');
      },
    });
  }

  abrirAlta(): void {
    const ref = this.dialog.open(CoberturaFormDialog, { data: { cobertura: null } });
    ref.afterClosed().subscribe((resultado: CoberturaRequest | null) => {
      if (!resultado) return;
      this.coberturaService.crear(resultado).subscribe({
        next: () => {
          this.alertService.exito('Cobertura creada correctamente.');
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo crear la cobertura.'),
      });
    });
  }

  abrirEdicion(cobertura: Cobertura): void {
    const ref = this.dialog.open(CoberturaFormDialog, { data: { cobertura } });
    ref.afterClosed().subscribe((resultado: CoberturaRequest | null) => {
      if (!resultado) return;
      this.coberturaService.actualizar(cobertura.id, resultado).subscribe({
        next: () => {
          this.alertService.exito('Cobertura actualizada correctamente.');
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo actualizar la cobertura.'),
      });
    });
  }

  eliminar(cobertura: Cobertura): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { titulo: 'Eliminar cobertura', mensaje: `¿Está seguro de eliminar la cobertura "${cobertura.nombre}"?` },
    });
    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (!confirmado) return;
      this.coberturaService.eliminar(cobertura.id).subscribe({
        next: () => {
          this.alertService.exito('Cobertura eliminada correctamente.');
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo eliminar la cobertura.'),
      });
    });
  }

  private mostrarError(err: any, fallback: string): void {
    this.alertService.errorHttp(err, fallback);
  }
}
