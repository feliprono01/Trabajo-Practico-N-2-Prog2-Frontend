import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth';
import { RegistroRequest } from '../../../core/models/auth.model';
import { PacienteForm } from '../../../shared/paciente-form/paciente-form';

@Component({
  selector: 'app-registro',
  imports: [RouterLink, MatCardModule, MatIconModule, PacienteForm],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);

  registrar(datos: RegistroRequest): void {
    this.errorMensaje.set(null);
    this.cargando.set(true);

    this.authService.registro(datos).subscribe({
      next: () => {
        this.cargando.set(false);
        this.snackBar.open('Registro exitoso. Ya podés iniciar sesión.', 'Cerrar', { duration: 4000 });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.cargando.set(false);
        this.errorMensaje.set(error.error?.estado ?? 'No se pudo completar el registro. Intentá nuevamente.');
      },
    });
  }
}
