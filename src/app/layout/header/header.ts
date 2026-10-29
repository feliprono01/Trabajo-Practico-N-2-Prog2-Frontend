import { Component, EventEmitter, Input, Output, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth';
import { NotificacionService } from '../../core/services/notificacion';
import { Notificacion } from '../../core/models/notificacion.model';

const ROL_LABELS: Record<string, string> = {
  admin: 'Administrador',
  medico: 'Médico',
  operador: 'Operador',
  paciente: 'Paciente',
};

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly authService = inject(AuthService);
  private readonly notificacionService = inject(NotificacionService);
  private readonly router = inject(Router);

  @Input() mostrarToggleMenu = false;
  @Output() toggleMenu = new EventEmitter<void>();

  readonly usuario = this.authService.usuario;
  readonly contadorNoLeidas = this.notificacionService.contadorNoLeidas;
  readonly notificaciones = signal<Notificacion[]>([]);
  readonly cargandoNotificaciones = signal(false);

  constructor() {
    effect(() => {
      if (this.usuario()) {
        this.notificacionService.refrescarContador();
      }
    });
  }

  rolLabel(): string {
    const rol = this.usuario()?.rol;
    return rol ? (ROL_LABELS[rol] ?? rol) : '';
  }

  iniciales(): string {
    const u = this.usuario();
    if (!u) {
      return '';
    }
    return `${u.nombre.charAt(0)}${u.apellido.charAt(0)}`.toUpperCase();
  }

  abrirNotificaciones(): void {
    this.cargandoNotificaciones.set(true);
    this.notificacionService.listar().subscribe({
      next: (r) => {
        this.notificaciones.set(r.datos ?? []);
        this.cargandoNotificaciones.set(false);
      },
      error: () => this.cargandoNotificaciones.set(false),
    });
  }

  marcarLeida(notificacion: Notificacion): void {
    if (notificacion.leida) return;
    this.notificacionService.marcarLeida(notificacion.id).subscribe(() => {
      this.notificaciones.update((actual) =>
        actual.map((n) => (n.id === notificacion.id ? { ...n, leida: 1 } : n))
      );
    });
  }

  marcarTodasLeidas(): void {
    this.notificacionService.marcarTodasLeidas().subscribe(() => {
      this.notificaciones.update((actual) => actual.map((n) => ({ ...n, leida: 1 })));
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
