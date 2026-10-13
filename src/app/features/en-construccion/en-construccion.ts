import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

const TITULOS: Record<string, string> = {
  turnos: 'Mis turnos',
  'solicitar-turno': 'Solicitar turno',
  historia: 'Mi historia clínica',
  usuarios: 'Usuarios',
  reportes: 'Reportes',
  auditoria: 'Auditoría',
  agenda: 'Mi agenda',
  historias: 'Historias clínicas',
  pacientes: 'Pacientes',
};

@Component({
  selector: 'app-en-construccion',
  imports: [MatIconModule, MatCardModule],
  templateUrl: './en-construccion.html',
  styleUrl: './en-construccion.scss',
})
export class EnConstruccion {
  private readonly router = inject(Router);

  titulo(): string {
    const segmentos = this.router.url.split('/').filter(Boolean);
    const ultimo = segmentos.at(-1) ?? '';
    return TITULOS[ultimo] ?? 'Sección';
  }
}
