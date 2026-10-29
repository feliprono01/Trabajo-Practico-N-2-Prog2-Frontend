import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime } from 'rxjs';
import { PacienteService } from '../../../core/services/paciente';
import { AuthService } from '../../../core/services/auth';
import { AlertService } from '../../../core/services/alert';
import { PacienteBusqueda } from '../../../core/models/usuario.model';
import { TurnoWizard } from '../../../shared/turno-wizard/turno-wizard';
import { EmptyState } from '../../../shared/empty-state/empty-state';

const TAMANIO_PAGINA = 20;

@Component({
  selector: 'app-asignar-turno',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    TurnoWizard,
    EmptyState,
  ],
  templateUrl: './asignar-turno.html',
  styleUrl: './asignar-turno.scss',
})
export class AsignarTurno implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);

  readonly termino = new FormControl('', { nonNullable: true });
  readonly buscando = signal(false);
  readonly resultados = signal<PacienteBusqueda[]>([]);
  readonly total = signal(0);
  readonly pacienteSeleccionado = signal<PacienteBusqueda | null>(null);

  page = 1;
  readonly pageSize = TAMANIO_PAGINA;

  get sedePropia(): number | null {
    return this.authService.usuario()?.id_sede ?? null;
  }

  ngOnInit(): void {
    this.termino.valueChanges.pipe(debounceTime(350)).subscribe(() => {
      this.page = 1;
      this.cargar();
    });
    this.cargar();
  }

  cargar(): void {
    this.buscando.set(true);
    const valor = this.termino.value.trim();
    const esDni = /^\d+$/.test(valor);
    const filtros = valor ? (esDni ? { dni: valor } : { apellido: valor }) : {};

    this.pacienteService.buscar({ ...filtros, page: this.page, pageSize: this.pageSize }).subscribe({
      next: (r) => {
        this.resultados.set(r.datos?.items ?? []);
        this.total.set(r.datos?.total ?? 0);
        this.buscando.set(false);
      },
      error: () => {
        this.buscando.set(false);
        this.alertService.error('No se pudo cargar el listado de pacientes.');
      },
    });
  }

  cambiarPagina(evento: PageEvent): void {
    this.page = evento.pageIndex + 1;
    this.cargar();
  }

  seleccionar(paciente: PacienteBusqueda): void {
    this.pacienteSeleccionado.set(paciente);
  }

  otroPaciente(): void {
    this.pacienteSeleccionado.set(null);
    this.termino.setValue('', { emitEvent: false });
    this.page = 1;
    this.cargar();
  }
}
