import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './features/home/home';
import { Login } from './features/auth/login/login';
import { Registro } from './features/auth/registro/registro';
import { Perfil } from './features/perfil/perfil';
import { EnConstruccion } from './features/en-construccion/en-construccion';
import { AccessDenied } from './features/access-denied/access-denied';
import { NotFound } from './features/not-found/not-found';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Sedes } from './features/admin/sedes/sedes';
import { Especialidades } from './features/admin/especialidades/especialidades';
import { Coberturas } from './features/admin/coberturas/coberturas';
import { Usuarios } from './features/admin/usuarios/usuarios';
import { Auditoria } from './features/admin/auditoria/auditoria';
import { Reportes } from './features/admin/reportes/reportes';
import { MedicoAgenda } from './features/medico/agenda/agenda';
import { MedicoTurnos } from './features/medico/turnos/turnos';
import { MedicoHistorial } from './features/medico/historial/historial';
import { OperadorAgendaTurnos } from './features/operador/agenda-turnos/agenda-turnos';
import { OperadorPacientes } from './features/operador/pacientes/pacientes';
import { AsignarTurno } from './features/operador/asignar-turno/asignar-turno';
import { NuevoTurno } from './features/paciente/nuevo-turno/nuevo-turno';
import { MisTurnos } from './features/paciente/mis-turnos/mis-turnos';
import { MisDatos } from './features/paciente/mis-datos/mis-datos';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'login', component: Login },
      { path: 'registro', component: Registro },
      { path: 'perfil', component: Perfil, canActivate: [authGuard] },
      { path: 'acceso-denegado', component: AccessDenied },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        children: [
          { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
          { path: 'sedes', component: Sedes },
          { path: 'especialidades', component: Especialidades },
          { path: 'coberturas', component: Coberturas },
          { path: 'usuarios', component: Usuarios },
          { path: 'auditoria', component: Auditoria },
          { path: 'reportes', component: Reportes },
          { path: '**', component: EnConstruccion },
        ],
      },
      {
        path: 'medico',
        canActivate: [roleGuard],
        data: { roles: ['medico'] },
        children: [
          { path: '', redirectTo: 'turnos', pathMatch: 'full' },
          { path: 'agenda', component: MedicoAgenda },
          { path: 'turnos', component: MedicoTurnos },
          { path: 'historial', component: MedicoHistorial },
          { path: '**', component: EnConstruccion },
        ],
      },
      {
        path: 'operador',
        canActivate: [roleGuard],
        data: { roles: ['operador'] },
        children: [
          { path: '', redirectTo: 'agenda-turnos', pathMatch: 'full' },
          { path: 'agenda-turnos', component: OperadorAgendaTurnos },
          { path: 'pacientes', component: OperadorPacientes },
          { path: 'asignar-turno', component: AsignarTurno },
          { path: '**', component: EnConstruccion },
        ],
      },
      {
        path: 'paciente',
        canActivate: [roleGuard],
        data: { roles: ['paciente'] },
        children: [
          { path: '', redirectTo: 'turnos', pathMatch: 'full' },
          { path: 'turnos', component: MisTurnos },
          { path: 'solicitar-turno', component: NuevoTurno },
          { path: 'datos', component: MisDatos },
          { path: '**', component: EnConstruccion },
        ],
      },
      { path: '**', component: NotFound },
    ],
  },
];
