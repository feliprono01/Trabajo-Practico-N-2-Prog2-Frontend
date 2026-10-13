import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth';
import { CoberturaService } from '../../../core/services/cobertura';
import { Cobertura } from '../../../core/models/cobertura.model';

@Component({
  selector: 'app-registro',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly coberturaService = inject(CoberturaService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly cargando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly coberturas = signal<Cobertura[]>([]);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    fecha_nacimiento: [null as Date | null, [Validators.required]],
    id_cobertura: [null as number | null, [Validators.required]],
    telefono: [''],
  });

  ngOnInit(): void {
    this.coberturaService.getCoberturas().subscribe({
      next: (respuesta) => this.coberturas.set(respuesta.datos),
      error: () =>
        this.snackBar.open('No se pudo cargar el listado de coberturas', 'Cerrar', { duration: 4000 }),
    });
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMensaje.set(null);
    this.cargando.set(true);

    const valores = this.form.getRawValue();
    const fecha = valores.fecha_nacimiento as Date;

    this.authService
      .registro({
        nombre: valores.nombre!,
        apellido: valores.apellido!,
        dni: valores.dni!,
        email: valores.email!,
        password: valores.password!,
        fecha_nacimiento: this.formatearFecha(fecha),
        id_cobertura: valores.id_cobertura!,
        telefono: valores.telefono ?? '',
      })
      .subscribe({
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

  private formatearFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
