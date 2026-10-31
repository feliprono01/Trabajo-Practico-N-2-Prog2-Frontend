import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth';
import { Rol } from '../../../core/models/usuario.model';
import { SoloAlEnviarErrorStateMatcher } from '../../../core/utils/error-state.util';

const RUTA_POR_ROL: Record<Rol, string> = {
  admin: '/admin',
  medico: '/medico',
  operador: '/operador',
  paciente: '/paciente',
};

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly intentoEnviar = signal(false);
  readonly matcher = new SoloAlEnviarErrorStateMatcher(() => this.intentoEnviar());

  readonly form = this.fb.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,9}$/)]],
    password: ['', [Validators.required]],
  });

  enviar(): void {
    this.intentoEnviar.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMensaje.set(null);
    this.cargando.set(true);

    const { dni, password } = this.form.getRawValue();

    this.authService.login({ dni: dni!, password: password! }).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        const rol = respuesta.datos.usuario.rol;
        this.router.navigate([RUTA_POR_ROL[rol]]);
      },
      error: (error) => {
        this.cargando.set(false);
        this.errorMensaje.set(error.error?.estado ?? 'No se pudo iniciar sesión. Intentá nuevamente.');
      },
    });
  }
}
