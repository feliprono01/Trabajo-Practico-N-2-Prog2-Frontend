import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PacienteService } from '../../../core/services/paciente';
import { HistorialClinicoService } from '../../../core/services/historial-clinico';
import { PacienteBusqueda } from '../../../core/models/usuario.model';
import { HistorialClinico } from '../../../core/models/historial-clinico.model';
import { AlertService } from '../../../core/services/alert';
import { EmptyState } from '../../../shared/empty-state/empty-state';

@Component({
  selector: 'app-medico-historial',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    EmptyState,
  ],
  templateUrl: './historial.html',
  styleUrl: './historial.scss',
})
export class MedicoHistorial {
  private readonly pacienteService = inject(PacienteService);
  private readonly historialService = inject(HistorialClinicoService);
  private readonly alertService = inject(AlertService);

  readonly termino = new FormControl('', { nonNullable: true });
  readonly buscando = signal(false);
  readonly resultados = signal<PacienteBusqueda[]>([]);
  readonly pacienteSeleccionado = signal<PacienteBusqueda | null>(null);
  readonly historial = signal<HistorialClinico[]>([]);
  readonly cargandoHistorial = signal(false);

  buscar(): void {
    const valor = this.termino.value.trim();
    if (!valor) return;

    this.buscando.set(true);
    this.pacienteSeleccionado.set(null);
    this.historial.set([]);

    const esDni = /^\d+$/.test(valor);
    this.pacienteService.buscar(esDni ? { dni: valor } : { apellido: valor }).subscribe({
      next: (respuesta) => {
        this.resultados.set(respuesta.datos ?? []);
        this.buscando.set(false);
      },
      error: () => {
        this.buscando.set(false);
        this.alertService.error('No se pudo buscar al paciente.');
      },
    });
  }

  seleccionar(paciente: PacienteBusqueda): void {
    this.pacienteSeleccionado.set(paciente);
    this.cargandoHistorial.set(true);
    this.historialService.consultar(paciente.id).subscribe({
      next: (respuesta) => {
        this.historial.set(respuesta.datos ?? []);
        this.cargandoHistorial.set(false);
      },
      error: () => {
        this.cargandoHistorial.set(false);
        this.alertService.error('No se pudo cargar el historial clínico.');
      },
    });
  }
}
