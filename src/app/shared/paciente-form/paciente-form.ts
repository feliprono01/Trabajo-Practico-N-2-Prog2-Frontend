import { Component, EventEmitter, Input, OnInit, Output, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CoberturaService } from '../../core/services/cobertura';
import { Cobertura } from '../../core/models/cobertura.model';
import { RegistroRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './paciente-form.html',
  styleUrl: './paciente-form.scss',
})
export class PacienteForm implements OnInit {
  @Input() cargando = false;
  @Input() errorMensaje: string | null = null;
  @Input() textoBoton = 'Registrarme';
  @Output() enviarFormulario = new EventEmitter<RegistroRequest>();
  @ViewChild(FormGroupDirective) private readonly formGroupDirective?: FormGroupDirective;

  private readonly fb = inject(FormBuilder);
  private readonly coberturaService = inject(CoberturaService);

  readonly coberturas = signal<Cobertura[]>([]);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    fecha_nacimiento: [null as Date | null, [Validators.required]],
    id_cobertura: [null as number | null, [Validators.required]],
    telefono: [''],
  });

  ngOnInit(): void {
    this.coberturaService.getCoberturas().subscribe((respuesta) => this.coberturas.set(respuesta.datos ?? []));
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const fecha = valores.fecha_nacimiento as Date;

    this.enviarFormulario.emit({
      nombre: valores.nombre!,
      apellido: valores.apellido!,
      dni: valores.dni!,
      email: valores.email!,
      password: valores.password!,
      fecha_nacimiento: this.formatearFecha(fecha),
      id_cobertura: valores.id_cobertura!,
      telefono: valores.telefono ?? '',
    });
  }

  resetear(): void {
    // form.reset() solo no alcanza: limpia los valores pero no el estado "submitted"
    // del FormGroupDirective, y Material sigue mostrando los campos requeridos en rojo.
    this.formGroupDirective?.resetForm();
  }

  private formatearFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
