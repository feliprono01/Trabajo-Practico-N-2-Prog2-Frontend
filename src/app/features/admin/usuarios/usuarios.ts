import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { UsuarioService } from '../../../core/services/usuario';
import { SedeService } from '../../../core/services/sede';
import { EspecialidadService } from '../../../core/services/especialidad';
import { CoberturaService } from '../../../core/services/cobertura';
import { Usuario, UsuarioAltaRequest, UsuarioEdicionRequest } from '../../../core/models/usuario.model';
import { Sede } from '../../../core/models/sede.model';
import { Especialidad } from '../../../core/models/especialidad.model';
import { Cobertura } from '../../../core/models/cobertura.model';
import { UsuarioFormDialog } from './usuario-form-dialog';
import { AlertService } from '../../../core/services/alert';
import { EmptyState } from '../../../shared/empty-state/empty-state';

const ETIQUETAS_ROL: Record<string, string> = {
  admin: 'Administrador',
  medico: 'Médico',
  operador: 'Operador',
  paciente: 'Paciente',
};

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    EmptyState,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  readonly columnas = ['nombre', 'dni', 'rol', 'sede', 'email', 'acciones'];
  readonly etiquetasRol = ETIQUETAS_ROL;

  readonly usuarios = signal<Usuario[]>([]);
  readonly total = signal(0);
  readonly cargando = signal(false);
  readonly sedes = signal<Sede[]>([]);
  readonly especialidades = signal<Especialidad[]>([]);
  readonly coberturas = signal<Cobertura[]>([]);

  page = 1;
  pageSize = 10;

  private readonly fb = inject(FormBuilder);

  readonly filtros = this.fb.group({
    nombre: [''],
    apellido: [''],
    rol: [''],
    id_sede: [null as number | null],
  });

  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly sedeService: SedeService,
    private readonly especialidadService: EspecialidadService,
    private readonly coberturaService: CoberturaService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.sedeService.getSedes().subscribe((r) => this.sedes.set(r.datos ?? []));
    this.especialidadService.getEspecialidades().subscribe((r) => this.especialidades.set(r.datos ?? []));
    this.coberturaService.getCoberturas().subscribe((r) => this.coberturas.set(r.datos ?? []));

    this.filtros.valueChanges.pipe(debounceTime(350)).subscribe(() => {
      this.page = 1;
      this.cargar();
    });

    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    const valor = this.filtros.value;
    this.usuarioService
      .listar({
        nombre: valor.nombre || undefined,
        apellido: valor.apellido || undefined,
        rol: (valor.rol as any) || undefined,
        id_sede: valor.id_sede ?? undefined,
        page: this.page,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (respuesta) => {
          this.usuarios.set(respuesta.datos?.items ?? []);
          this.total.set(respuesta.datos?.total ?? 0);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.alertService.error('No se pudieron cargar los usuarios.');
        },
      });
  }

  cambiarPagina(evento: PageEvent): void {
    this.page = evento.pageIndex + 1;
    this.pageSize = evento.pageSize;
    this.cargar();
  }

  abrirAlta(): void {
    const ref = this.dialog.open(UsuarioFormDialog, {
      data: { usuario: null, sedes: this.sedes(), especialidades: this.especialidades(), coberturas: this.coberturas() },
    });
    ref.afterClosed().subscribe((resultado: UsuarioAltaRequest | null) => {
      if (!resultado) return;
      this.usuarioService.crear(resultado).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado correctamente.', 'Cerrar', { duration: 3000 });
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo crear el usuario.'),
      });
    });
  }

  abrirEdicion(usuario: Usuario): void {
    const ref = this.dialog.open(UsuarioFormDialog, {
      data: { usuario, sedes: this.sedes(), especialidades: this.especialidades(), coberturas: this.coberturas() },
    });
    ref.afterClosed().subscribe((resultado: UsuarioEdicionRequest | null) => {
      if (!resultado) return;
      this.usuarioService.actualizar(usuario.id, resultado).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado correctamente.', 'Cerrar', { duration: 3000 });
          this.cargar();
        },
        error: (err) => this.mostrarError(err, 'No se pudo actualizar el usuario.'),
      });
    });
  }

  private mostrarError(err: any, fallback: string): void {
    this.alertService.errorHttp(err, fallback);
  }
}
