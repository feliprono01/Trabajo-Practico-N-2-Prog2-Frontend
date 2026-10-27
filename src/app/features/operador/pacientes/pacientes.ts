import { Component, ViewChild, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth';
import { AlertService } from '../../../core/services/alert';
import { RegistroRequest } from '../../../core/models/auth.model';
import { PacienteForm } from '../../../shared/paciente-form/paciente-form';

@Component({
  selector: 'app-operador-pacientes',
  standalone: true,
  imports: [MatCardModule, PacienteForm],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.scss',
})
export class OperadorPacientes {
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);

  @ViewChild(PacienteForm) pacienteForm!: PacienteForm;

  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);

  registrar(datos: RegistroRequest): void {
    this.errorMensaje.set(null);
    this.cargando.set(true);

    this.authService.registro(datos).subscribe({
      next: () => {
        this.cargando.set(false);
        this.pacienteForm.resetear();
        this.alertService.exito('Paciente registrado correctamente.');
      },
      error: (error) => {
        this.cargando.set(false);
        this.errorMensaje.set(error.error?.estado ?? 'No se pudo registrar al paciente. Intentá nuevamente.');
      },
    });
  }
}
