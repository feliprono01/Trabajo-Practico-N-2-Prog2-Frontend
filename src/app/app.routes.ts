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
        children: [{ path: '**', component: EnConstruccion }],
      },
      {
        path: 'medico',
        canActivate: [roleGuard],
        data: { roles: ['medico'] },
        children: [{ path: '**', component: EnConstruccion }],
      },
      {
        path: 'operador',
        canActivate: [roleGuard],
        data: { roles: ['operador'] },
        children: [{ path: '**', component: EnConstruccion }],
      },
      {
        path: 'paciente',
        canActivate: [roleGuard],
        data: { roles: ['paciente'] },
        children: [{ path: '**', component: EnConstruccion }],
      },
      { path: '**', component: NotFound },
    ],
  },
];
