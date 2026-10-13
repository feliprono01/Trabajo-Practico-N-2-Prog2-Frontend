import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth';
import { Rol } from '../../core/models/usuario.model';

interface ItemMenu {
  label: string;
  ruta: string;
  icono: string;
}

const MENU_POR_ROL: Record<Rol, ItemMenu[]> = {
  admin: [
    { label: 'Usuarios', ruta: '/admin/usuarios', icono: 'group' },
    { label: 'Reportes', ruta: '/admin/reportes', icono: 'bar_chart' },
    { label: 'Auditoría', ruta: '/admin/auditoria', icono: 'fact_check' },
    { label: 'Mi perfil', ruta: '/perfil', icono: 'person' },
  ],
  medico: [
    { label: 'Mi agenda', ruta: '/medico/agenda', icono: 'event_available' },
    { label: 'Turnos', ruta: '/medico/turnos', icono: 'event_note' },
    { label: 'Historias clínicas', ruta: '/medico/historias', icono: 'description' },
    { label: 'Mi perfil', ruta: '/perfil', icono: 'person' },
  ],
  operador: [
    { label: 'Turnos', ruta: '/operador/turnos', icono: 'event_note' },
    { label: 'Pacientes', ruta: '/operador/pacientes', icono: 'group' },
    { label: 'Mi perfil', ruta: '/perfil', icono: 'person' },
  ],
  paciente: [
    { label: 'Mis turnos', ruta: '/paciente/turnos', icono: 'event_note' },
    { label: 'Solicitar turno', ruta: '/paciente/solicitar-turno', icono: 'add_circle' },
    { label: 'Mi historia clínica', ruta: '/paciente/historia', icono: 'description' },
    { label: 'Mi perfil', ruta: '/perfil', icono: 'person' },
  ],
};

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  private readonly authService = inject(AuthService);

  @Output() itemClick = new EventEmitter<void>();

  readonly usuario = this.authService.usuario;

  items(): ItemMenu[] {
    const rol = this.usuario()?.rol;
    return rol ? MENU_POR_ROL[rol] : [];
  }
}
