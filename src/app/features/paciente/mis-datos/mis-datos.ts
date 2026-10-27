import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth';
import { CoberturaService } from '../../../core/services/cobertura';
import { UsuarioPerfil } from '../../../core/models/usuario.model';
import { Cobertura } from '../../../core/models/cobertura.model';
import { AlertService } from '../../../core/services/alert';

const passwordsCoinciden: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const repetir = group.get('repetirPassword')?.value;
  if (password && repetir && password !== repetir) {
    return { passwordsNoCoinciden: true };
  }
  return null;
};

@Component({
  selector: 'app-mis-datos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './mis-datos.html',
  styleUrl: './mis-datos.scss',
})
export class MisDatos implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly coberturaService = inject(CoberturaService);
  private readonly alertService = inject(AlertService);

  readonly perfil = signal<UsuarioPerfil | null>(null);
  readonly coberturas = signal<Cobertura[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);

  readonly form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      id_cobertura: [null as number | null, Validators.required],
      password: ['', [Validators.minLength(8)]],
      repetirPassword: [''],
    },
    { validators: passwordsCoinciden }
  );

  ngOnInit(): void {
    this.coberturaService.getCoberturas().subscribe((r) => this.coberturas.set(r.datos ?? []));
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.authService.perfil().subscribe({
      next: (r) => {
        this.perfil.set(r.datos);
        this.form.patchValue({
          email: r.datos.email,
          telefono: r.datos.telefono,
          id_cobertura: r.datos.id_cobertura,
        });
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.alertService.error('No se pudieron cargar tus datos.');
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    this.guardando.set(true);

    this.authService
      .actualizarPerfil({
        email: valor.email || undefined,
        telefono: valor.telefono || undefined,
        id_cobertura: valor.id_cobertura ?? undefined,
        password: valor.password || undefined,
      })
      .subscribe({
        next: (r) => {
          this.guardando.set(false);
          this.perfil.set(r.datos);
          this.form.patchValue({ password: '', repetirPassword: '' });
          this.alertService.exito('Datos actualizados correctamente.');
        },
        error: (err) => {
          this.guardando.set(false);
          this.alertService.errorHttp(err, 'No se pudieron actualizar los datos.');
        },
      });
  }
}
