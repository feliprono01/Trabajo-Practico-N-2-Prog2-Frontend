import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PacienteService } from '../../../core/services/paciente';
import { AuthService } from '../../../core/services/auth';
import { AlertService } from '../../../core/services/alert';
import { PacienteBusqueda } from '../../../core/models/usuario.model';
import { TurnoWizard } from '../../../shared/turno-wizard/turno-wizard';

@Component({
  selector: 'app-asignar-turno',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    TurnoWizard,
  ],
  templateUrl: './asignar-turno.html',
  styleUrl: './asignar-turno.scss',
})
export class AsignarTurno {
  private readonly pacienteService = inject(PacienteService);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);

  readonly termino = new FormControl('', { nonNullable: true });
  readonly buscando = signal(false);
  readonly resultados = signal<PacienteBusqueda[]>([]);
  readonly pacienteSeleccionado = signal<PacienteBusqueda | null>(null);

  get sedePropia(): number | null {
    return this.authService.usuario()?.id_sede ?? null;
  }

  buscar(): void {
    const valor = this.termino.value.trim();
    if (!valor) return;

    this.buscando.set(true);
    this.pacienteSeleccionado.set(null);
    const esDni = /^\d+$/.test(valor);
    this.pacienteService.buscar(esDni ? { dni: valor } : { apellido: valor }).subscribe({
      next: (r) => {
        this.resultados.set(r.datos ?? []);
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
  }

  otroPaciente(): void {
    this.pacienteSeleccionado.set(null);
    this.resultados.set([]);
    this.termino.setValue('');
  }
}
