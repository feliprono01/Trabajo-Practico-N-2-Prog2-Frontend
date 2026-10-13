import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth';

interface Funcionalidad {
  icono: string;
  titulo: string;
  descripcion: string;
}

const FUNCIONALIDADES: Funcionalidad[] = [
  {
    icono: 'event_available',
    titulo: 'Turnos online',
    descripcion: 'Solicitá y gestioná tus turnos con nuestros especialistas, sin llamadas ni esperas.',
  },
  {
    icono: 'description',
    titulo: 'Historia clínica',
    descripcion: 'Accedé a tu historia clínica y a los resultados de tus consultas en cualquier momento.',
  },
  {
    icono: 'notifications_active',
    titulo: 'Notificaciones',
    descripcion: 'Recibí recordatorios y avisos sobre tus próximos turnos directamente en la plataforma.',
  },
];

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly authService = inject(AuthService);

  readonly usuario = this.authService.usuario;
  readonly funcionalidades = FUNCIONALIDADES;
}
