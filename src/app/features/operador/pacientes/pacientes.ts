import { Component, ViewChild, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth';
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
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild(PacienteForm) pacienteForm!: PacienteForm;

  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);

  registrar(datos: RegistroRequest): void {
    this.errorMensaje.set(null);
    this.cargando.set(true);

    this.authService.registro(datos).subscribe({
      next: () => {
        this.cargando.set(false);
        this.snackBar.open('Paciente registrado correctamente.', 'Cerrar', { duration: 4000 });
        this.pacienteForm.resetear();
      },
      error: (error) => {
        this.cargando.set(false);
        this.errorMensaje.set(error.error?.estado ?? 'No se pudo registrar al paciente. Intentá nuevamente.');
      },
    });
  }
}
