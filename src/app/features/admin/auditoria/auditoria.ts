import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime } from 'rxjs';
import { AuditoriaService } from '../../../core/services/auditoria';
import { UsuarioService } from '../../../core/services/usuario';
import { RegistroAuditoria } from '../../../core/models/auditoria.model';
import { Usuario } from '../../../core/models/usuario.model';
import { AlertService } from '../../../core/services/alert';
import { rangoFechasValidator } from '../../../core/utils/fecha.util';
import { EmptyState } from '../../../shared/empty-state/empty-state';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    EmptyState,
  ],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class Auditoria implements OnInit {
  readonly columnas = ['fecha', 'usuario', 'accion', 'entidad', 'detalle'];
  readonly registros = signal<RegistroAuditoria[]>([]);
  readonly total = signal(0);
  readonly cargando = signal(false);
  readonly usuarios = signal<Usuario[]>([]);

  page = 1;
  pageSize = 15;

  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);

  readonly filtros = this.fb.group(
    {
      id_usuario: [null as number | null],
      entidad: [''],
      fechaDesde: [null as Date | null],
      fechaHasta: [null as Date | null],
    },
    { validators: rangoFechasValidator }
  );

  constructor(
    private readonly auditoriaService: AuditoriaService,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.usuarioService.listar({ pageSize: 500 }).subscribe((r) => this.usuarios.set(r.datos?.items ?? []));

    this.filtros.valueChanges.pipe(debounceTime(350)).subscribe(() => {
      this.page = 1;
      this.cargar();
    });
    this.cargar();
  }

  cargar(): void {
    if (this.filtros.invalid) {
      return;
    }
    this.cargando.set(true);
    const valor = this.filtros.value;
    this.auditoriaService
      .listar({
        id_usuario: valor.id_usuario ?? undefined,
        entidad: valor.entidad || undefined,
        fechaDesde: this.formatearFecha(valor.fechaDesde),
        fechaHasta: this.formatearFecha(valor.fechaHasta),
        page: this.page,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (respuesta) => {
          this.registros.set(respuesta.datos?.items ?? []);
          this.total.set(respuesta.datos?.total ?? 0);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.alertService.error('No se pudo cargar la auditoría.');
        },
      });
  }

  cambiarPagina(evento: PageEvent): void {
    this.page = evento.pageIndex + 1;
    this.pageSize = evento.pageSize;
    this.cargar();
  }

  private formatearFecha(fecha: Date | null | undefined): string | undefined {
    if (!fecha) return undefined;
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
