import { Component, OnInit, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth';
import { UsuarioPerfil } from '../../core/models/usuario.model';

const ROL_LABELS: Record<string, string> = {
  admin: 'Administrador',
  medico: 'Médico',
  operador: 'Operador',
  paciente: 'Paciente',
};

@Component({
  selector: 'app-perfil',
  imports: [SlicePipe, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  private readonly authService = inject(AuthService);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly perfil = signal<UsuarioPerfil | null>(null);

  ngOnInit(): void {
    this.authService.perfil().subscribe({
      next: (respuesta) => {
        this.perfil.set(respuesta.datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar tu perfil. Intentá nuevamente más tarde.');
        this.cargando.set(false);
      },
    });
  }

  rolLabel(rol: string): string {
    return ROL_LABELS[rol] ?? rol;
  }

  iniciales(p: UsuarioPerfil): string {
    return `${p.nombre.charAt(0)}${p.apellido.charAt(0)}`.toUpperCase();
  }
}
