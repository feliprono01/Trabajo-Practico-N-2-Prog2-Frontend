import { Component, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Sede } from '../../../core/models/sede.model';
import { Especialidad } from '../../../core/models/especialidad.model';
import { Cobertura } from '../../../core/models/cobertura.model';
import { Rol, Usuario, UsuarioAltaRequest, UsuarioEdicionRequest } from '../../../core/models/usuario.model';
import { formatearFechaLocal, parsearFechaLocal } from '../../../core/utils/fecha.util';

export interface UsuarioFormDialogData {
  usuario: Usuario | null;
  sedes: Sede[];
  especialidades: Especialidad[];
  coberturas: Cobertura[];
}

const ROLES_GESTIONABLES: { valor: Rol; etiqueta: string }[] = [
  { valor: 'operador', etiqueta: 'Operador' },
  { valor: 'medico', etiqueta: 'Médico' },
  { valor: 'admin', etiqueta: 'Administrador' },
];

const ROL_PACIENTE: { valor: Rol; etiqueta: string } = { valor: 'paciente', etiqueta: 'Paciente' };

@Component({
  selector: 'app-usuario-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './usuario-form-dialog.html',
  styleUrl: './usuario-form-dialog.scss',
})
export class UsuarioFormDialog implements OnInit {
  readonly form;
  readonly esEdicion = signal(false);

  get roles(): { valor: Rol; etiqueta: string }[] {
    return this.data.usuario?.rol === 'paciente' ? [ROL_PACIENTE] : ROLES_GESTIONABLES;
  }

  constructor(
    private readonly fb: FormBuilder,
    public readonly dialogRef: MatDialogRef<UsuarioFormDialog>,
    @Inject(MAT_DIALOG_DATA) public readonly data: UsuarioFormDialogData
  ) {
    const u = data.usuario;
    this.esEdicion.set(!!u);

    this.form = this.fb.group({
      nombre: [u?.nombre ?? '', Validators.required],
      apellido: [u?.apellido ?? '', Validators.required],
      dni: [{ value: u?.dni ?? '', disabled: this.esEdicion() }, [Validators.required, Validators.pattern(/^\d{7,9}$/)]],
      email: [u?.email ?? '', [Validators.required, Validators.email]],
      password: [u ? '' : '', u ? [] : [Validators.required, Validators.minLength(6)]],
      fecha_nacimiento: [u?.fecha_nacimiento ? parsearFechaLocal(u.fecha_nacimiento) : null, Validators.required],
      telefono: [u?.telefono ?? ''],
      rol: [{ value: (u?.rol as Rol) ?? 'operador', disabled: this.esEdicion() }, Validators.required],
      id_sede: [u?.id_sede ?? null],
      id_cobertura: [u?.id_cobertura ?? null],
      especialidades: [u?.especialidades?.map((e) => e.id) ?? []],
    });
  }

  ngOnInit(): void {
    this.form.controls.rol.valueChanges.subscribe(() => this.actualizarValidadoresDependientes());
    this.actualizarValidadoresDependientes();
  }

  get mostrarSede(): boolean {
    const rol = this.form.getRawValue().rol;
    return rol === 'operador' || rol === 'medico';
  }

  get mostrarCobertura(): boolean {
    return this.form.getRawValue().rol === 'paciente';
  }

  get mostrarEspecialidades(): boolean {
    return this.form.getRawValue().rol === 'medico';
  }

  private actualizarValidadoresDependientes(): void {
    const idSede = this.form.controls.id_sede;
    const idCobertura = this.form.controls.id_cobertura;
    const especialidades = this.form.controls.especialidades;

    idSede.clearValidators();
    idCobertura.clearValidators();
    especialidades.clearValidators();

    if (this.mostrarSede) {
      idSede.setValidators(Validators.required);
    } else {
      idSede.setValue(null);
    }

    if (this.mostrarCobertura) {
      idCobertura.setValidators(Validators.required);
    } else {
      idCobertura.setValue(null);
    }

    if (this.mostrarEspecialidades) {
      especialidades.setValidators(Validators.required);
    } else {
      especialidades.setValue([]);
    }

    idSede.updateValueAndValidity({ emitEvent: false });
    idCobertura.updateValueAndValidity({ emitEvent: false });
    especialidades.updateValueAndValidity({ emitEvent: false });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const fechaNacimiento = formatearFechaLocal(valor.fecha_nacimiento as Date);

    if (this.esEdicion()) {
      const payload: UsuarioEdicionRequest = {
        nombre: valor.nombre ?? undefined,
        apellido: valor.apellido ?? undefined,
        email: valor.email ?? undefined,
        telefono: valor.telefono || undefined,
        fecha_nacimiento: fechaNacimiento,
        id_sede: this.mostrarSede ? (valor.id_sede ?? undefined) : undefined,
        id_cobertura: this.mostrarCobertura ? (valor.id_cobertura ?? undefined) : undefined,
        especialidades: this.mostrarEspecialidades ? (valor.especialidades ?? undefined) : undefined,
        password: valor.password || undefined,
      };
      this.dialogRef.close(payload);
      return;
    }

    const payload: UsuarioAltaRequest = {
      nombre: valor.nombre ?? '',
      apellido: valor.apellido ?? '',
      dni: valor.dni ?? '',
      email: valor.email ?? '',
      password: valor.password ?? '',
      fecha_nacimiento: fechaNacimiento,
      telefono: valor.telefono || undefined,
      rol: valor.rol as UsuarioAltaRequest['rol'],
      id_sede: this.mostrarSede ? (valor.id_sede ?? null) : null,
      especialidades: this.mostrarEspecialidades ? (valor.especialidades ?? undefined) : undefined,
    };
    this.dialogRef.close(payload);
  }
}
