import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { debounceTime, forkJoin } from 'rxjs';
import { ReporteService } from '../../../core/services/reporte';
import { rangoFechasValidator } from '../../../core/utils/fecha.util';
import { RankingMedico, TasaCancelacion } from '../../../core/models/reporte.model';
import { EmptyState } from '../../../shared/empty-state/empty-state';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    BaseChartDirective,
    EmptyState,
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
  readonly cargando = signal(false);
  readonly ranking = signal<RankingMedico[]>([]);
  readonly tasa = signal<TasaCancelacion | null>(null);
  readonly columnasRanking = ['medico', 'cantidad_atendidos'];

  private readonly fb = inject(FormBuilder);

  readonly filtros = this.fb.group(
    {
      fechaDesde: [null as Date | null],
      fechaHasta: [null as Date | null],
    },
    { validators: rangoFechasValidator }
  );

  readonly dataEspecialidad = signal<ChartConfiguration<'bar'>['data']>({
    labels: [],
    datasets: [{ data: [], label: 'Turnos', backgroundColor: '#5c6bc0' }],
  });

  readonly dataSede = signal<ChartConfiguration<'pie'>['data']>({
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#26a69a', '#ef5350', '#ffca28', '#8d6e63', '#42a5f5'] }],
  });

  readonly opcionesBarra: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  constructor(private readonly reporteService: ReporteService) {}

  ngOnInit(): void {
    this.filtros.valueChanges.pipe(debounceTime(350)).subscribe(() => this.cargar());
    this.cargar();
  }

  cargar(): void {
    if (this.filtros.invalid) {
      return;
    }
    this.cargando.set(true);
    const valor = this.filtros.value;
    const filtro = {
      fechaDesde: this.formatearFecha(valor.fechaDesde),
      fechaHasta: this.formatearFecha(valor.fechaHasta),
    };

    forkJoin({
      especialidad: this.reporteService.turnosPorEspecialidad(filtro),
      sede: this.reporteService.turnosPorSede(filtro),
      ranking: this.reporteService.rankingMedicos(filtro),
      tasa: this.reporteService.tasaCancelacion(filtro),
    }).subscribe({
      next: ({ especialidad, sede, ranking, tasa }) => {
        this.dataEspecialidad.set({
          labels: (especialidad.datos ?? []).map((e) => e.especialidad),
          datasets: [{ data: (especialidad.datos ?? []).map((e) => e.cantidad), label: 'Turnos', backgroundColor: '#5c6bc0' }],
        });

        this.dataSede.set({
          labels: (sede.datos ?? []).map((s) => s.sede),
          datasets: [
            { data: (sede.datos ?? []).map((s) => s.cantidad), backgroundColor: ['#26a69a', '#ef5350', '#ffca28', '#8d6e63', '#42a5f5'] },
          ],
        });

        this.ranking.set(ranking.datos ?? []);
        this.tasa.set(tasa.datos ?? null);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  private formatearFecha(fecha: Date | null | undefined): string | undefined {
    if (!fecha) return undefined;
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
