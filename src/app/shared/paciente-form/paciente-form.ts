import { Component, EventEmitter, Input, OnInit, Output, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CoberturaService } from '../../core/services/cobertura';
import { Cobertura } from '../../core/models/cobertura.model';
import { RegistroRequest } from '../../core/models/auth.model';
import { contrasenaMinimaValidator, fechaNacimientoValidator, noSoloEspaciosValidator } from '../../core/utils/validadores.util';
import { SoloAlEnviarErrorStateMatcher } from '../../core/utils/error-state.util';

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
  readonly intentoEnviar = signal(false);
  readonly hoyMax = new Date();
  readonly matcher = new SoloAlEnviarErrorStateMatcher(() => this.intentoEnviar());

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, noSoloEspaciosValidator]],
    apellido: ['', [Validators.required, noSoloEspaciosValidator]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{7,9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, contrasenaMinimaValidator(8)]],
    fecha_nacimiento: ['', [Validators.required, fechaNacimientoValidator]],
    id_cobertura: [null as number | null, [Validators.required]],
    telefono: [''],
  });

  ngOnInit(): void {
    this.coberturaService.getCoberturas().subscribe((respuesta) => this.coberturas.set(respuesta.datos ?? []));
  }

  onFechaInput(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    const digitos = valor.replace(/\D/g, '').slice(0, 8);

    let formateado = digitos;
    if (digitos.length > 4) {
      formateado = `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
    } else if (digitos.length > 2) {
      formateado = `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
    }

    // setValue (en lugar de tocar el DOM a mano) dispara el writeValue del
    // ControlValueAccessor, que es quien efectivamente actualiza lo que se ve
    // en el input: así el resultado no depende del orden de ejecución entre
    // este handler y el listener propio de formControlName sobre "input".
    this.form.controls.fecha_nacimiento.setValue(formateado);
  }

  onCalendarSeleccion(fecha: Date | null): void {
    if (!fecha) return;
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    this.form.controls.fecha_nacimiento.setValue(`${dia}/${mes}/${fecha.getFullYear()}`);
  }

  enviar(): void {
    this.intentoEnviar.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();

    this.enviarFormulario.emit({
      nombre: valores.nombre!,
      apellido: valores.apellido!,
      dni: valores.dni!,
      email: valores.email!,
      password: valores.password!,
      fecha_nacimiento: this.formatearFechaParaBackend(valores.fecha_nacimiento!),
      id_cobertura: valores.id_cobertura!,
      telefono: valores.telefono ?? '',
    });
  }

  resetear(): void {
    // form.reset() solo no alcanza: limpia los valores pero no el estado "submitted"
    // del FormGroupDirective, y Material sigue mostrando los campos requeridos en rojo.
    this.formGroupDirective?.resetForm();
    this.intentoEnviar.set(false);
  }

  private formatearFechaParaBackend(valor: string): string {
    const [dia, mes, anio] = valor.split('/');
    return `${anio}-${mes}-${dia}`;
  }
}
