import { Component, ViewChild, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { Header } from '../header/header';
import { Menu } from '../menu/menu';
import { Footer } from '../footer/footer';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, MatSidenavModule, Header, Menu, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly authService = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  @ViewChild('sidenav') sidenav?: MatSidenav;

  readonly usuario = this.authService.usuario;

  readonly esMovil = toSignal(
    this.breakpointObserver.observe('(max-width: 839px)').pipe(map((resultado) => resultado.matches)),
    { initialValue: false }
  );

  toggleSidenav(): void {
    this.sidenav?.toggle();
  }

  cerrarSidenavSiMovil(): void {
    if (this.esMovil()) {
      this.sidenav?.close();
    }
  }
}
