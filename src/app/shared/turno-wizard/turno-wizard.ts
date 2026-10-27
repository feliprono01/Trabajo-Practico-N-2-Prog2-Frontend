import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EspecialidadService } from '../../core/services/especialidad';
import { SedeService } from '../../core/services/sede';
import { MedicoService } from '../../core/services/medico';
import { AgendaService } from '../../core/services/agenda';
import { TurnoService } from '../../core/services/turno';
import { AuthService } from '../../core/services/auth';
import { NotificacionService } from '../../core/services/notificacion';
import { Especialidad } from '../../core/models/especialidad.model';
import { Sede } from '../../core/models/sede.model';
import { Medico } from '../../core/models/medico.model';
import { EmptyState } from '../empty-state/empty-state';

@Component({
  selector: 'app-turno-wizard',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    EmptyState,
  ],
  templateUrl: './turno-wizard.html',
  styleUrl: './turno-wizard.scss',
})
export class TurnoWizard implements OnInit {
  @Input() sedeFija: number | null = null;
  @Input() idPacienteFijo: number | null = null;
  @Input() nombrePaciente: string | null = null;
  @Input() coberturaPaciente: string | null = null;
  @Output() turnoCreado = new EventEmitter<void>();
  /** Emitido al tocar "Solicitar otro turno": para que el contenedor (ej. operador) pueda volver a elegir paciente. */
  @Output() solicitarOtro = new EventEmitter<void>();

  private readonly especialidadService = inject(EspecialidadService);
  private readonly sedeService = inject(SedeService);
  private readonly medicoService = inject(MedicoService);
  private readonly agendaService = inject(AgendaService);
  private readonly turnoService = inject(TurnoService);
  private readonly authService = inject(AuthService);
  private readonly notificacionService = inject(NotificacionService);

  readonly especialidades = signal<Especialidad[]>([]);
  readonly sedes = signal<Sede[]>([]);
  readonly medicos = signal<Medico[]>([]);
  readonly fechas = signal<string[]>([]);
  readonly horarios = signal<string[]>([]);

  readonly cargandoMedicos = signal(false);
  readonly cargandoFechas = signal(false);
  readonly cargandoHorarios = signal(false);
  readonly enviando = signal(false);
  readonly errorEnvio = signal<string | null>(null);
  readonly completado = signal(false);

  readonly especialidadSeleccionada = signal<Especialidad | null>(null);
  readonly sedeSeleccionada = signal<Sede | null>(null);
  readonly medicoSeleccionado = signal<Medico | null>(null);
  readonly fechaSeleccionada = signal<string | null>(null);
  readonly horarioSeleccionado = signal<string | null>(null);
  readonly pasoActual = signal(0);

  readonly notaControl = new FormControl('', { nonNullable: true, validators: Validators.required });
  readonly coberturaPropia = signal<string | null>(null);

  get coberturaMostrada(): string | null {
    return this.coberturaPaciente ?? this.coberturaPropia();
  }

  ngOnInit(): void {
    this.especialidadService.getEspecialidades().subscribe((r) => this.especialidades.set(r.datos ?? []));

    if (!this.idPacienteFijo) {
      this.authService.perfil().subscribe((r) => this.coberturaPropia.set(r.datos?.cobertura ?? null));
    }

    if (this.sedeFija) {
      this.sedeService.getSedes().subscribe((r) => {
        this.sedes.set(r.datos ?? []);
        const sede = (r.datos ?? []).find((s) => s.id === this.sedeFija) ?? null;
        this.sedeSeleccionada.set(sede);
      });
    } else {
      this.sedeService.getSedes().subscribe((r) => this.sedes.set(r.datos ?? []));
    }
  }

  elegirEspecialidad(especialidad: Especialidad): void {
    this.especialidadSeleccionada.set(especialidad);
    this.medicoSeleccionado.set(null);
    this.fechaSeleccionada.set(null);
    this.horarioSeleccionado.set(null);
    this.pasoActual.update((p) => p + 1);
    if (this.sedeFija) {
      this.cargarMedicos();
    }
  }

  elegirSede(sede: Sede): void {
    this.sedeSeleccionada.set(sede);
    this.medicoSeleccionado.set(null);
    this.fechaSeleccionada.set(null);
    this.horarioSeleccionado.set(null);
    this.pasoActual.update((p) => p + 1);
    this.cargarMedicos();
  }

  private cargarMedicos(): void {
    const especialidad = this.especialidadSeleccionada();
    const sede = this.sedeSeleccionada();
    if (!especialidad || !sede) return;
    this.cargandoMedicos.set(true);
    this.medicoService.getMedicos({ id_especialidad: especialidad.id, id_sede: sede.id }).subscribe({
      next: (r) => {
        this.medicos.set(r.datos ?? []);
        this.cargandoMedicos.set(false);
      },
      error: () => this.cargandoMedicos.set(false),
    });
  }

  elegirMedico(medico: Medico): void {
    this.medicoSeleccionado.set(medico);
    this.fechaSeleccionada.set(null);
    this.horarioSeleccionado.set(null);
    this.pasoActual.update((p) => p + 1);
    const especialidad = this.especialidadSeleccionada();
    const sede = this.sedeSeleccionada();
    if (!especialidad || !sede) return;
    this.cargandoFechas.set(true);
    this.agendaService.getFechasDisponibles({ id_medico: medico.id, id_especialidad: especialidad.id, id_sede: sede.id }).subscribe({
      next: (r) => {
        this.fechas.set((r.datos ?? []).map((f) => f.slice(0, 10)));
        this.cargandoFechas.set(false);
      },
      error: () => this.cargandoFechas.set(false),
    });
  }

  elegirFecha(fecha: string, avanzar = true): void {
    this.fechaSeleccionada.set(fecha);
    this.horarioSeleccionado.set(null);
    if (avanzar) this.pasoActual.update((p) => p + 1);
    const especialidad = this.especialidadSeleccionada();
    const sede = this.sedeSeleccionada();
    const medico = this.medicoSeleccionado();
    if (!especialidad || !sede || !medico) return;
    this.cargandoHorarios.set(true);
    this.agendaService
      .getHorariosDisponibles({ id_medico: medico.id, id_especialidad: especialidad.id, id_sede: sede.id, fecha })
      .subscribe({
        next: (r) => {
          this.horarios.set(r.datos ?? []);
          this.cargandoHorarios.set(false);
        },
        error: () => this.cargandoHorarios.set(false),
      });
  }

  elegirHorario(horario: string): void {
    this.horarioSeleccionado.set(horario);
    this.pasoActual.update((p) => p + 1);
  }

  irANota(): void {
    this.pasoActual.update((p) => p + 1);
  }

  confirmar(): void {
    const especialidad = this.especialidadSeleccionada();
    const sede = this.sedeSeleccionada();
    const medico = this.medicoSeleccionado();
    const fecha = this.fechaSeleccionada();
    const hora = this.horarioSeleccionado();

    if (!especialidad || !sede || !medico || !fecha || !hora || this.notaControl.invalid) {
      this.notaControl.markAsTouched();
      return;
    }

    this.enviando.set(true);
    this.errorEnvio.set(null);

    this.turnoService
      .crear({
        id_especialidad: especialidad.id,
        id_sede: sede.id,
        id_medico: medico.id,
        fecha,
        hora,
        nota: this.notaControl.value,
        id_paciente_req: this.idPacienteFijo ?? undefined,
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.completado.set(true);
          this.notificacionService.refrescarContador();
          this.turnoCreado.emit();
        },
        error: (err) => {
          this.enviando.set(false);
          this.errorEnvio.set(err?.error?.estado || 'No se pudo confirmar el turno. Probá con otro horario.');
          this.horarioSeleccionado.set(null);
          this.pasoActual.update((p) => p - 2);
          // Refrescar horarios disponibles por si el conflicto fue justamente por ocupación
          this.elegirFecha(fecha, false);
        },
      });
  }

  reiniciar(): void {
    this.especialidadSeleccionada.set(null);
    this.sedeSeleccionada.set(this.sedeFija ? this.sedeSeleccionada() : null);
    this.medicoSeleccionado.set(null);
    this.fechaSeleccionada.set(null);
    this.horarioSeleccionado.set(null);
    this.notaControl.reset('');
    this.completado.set(false);
    this.errorEnvio.set(null);
    this.pasoActual.set(0);
  }

  solicitarOtroClick(): void {
    this.reiniciar();
    this.solicitarOtro.emit();
  }
}
