import { Component } from '@angular/core';
import { TurnoWizard } from '../../../shared/turno-wizard/turno-wizard';

@Component({
  selector: 'app-nuevo-turno',
  standalone: true,
  imports: [TurnoWizard],
  template: `
    <h1>Solicitar turno</h1>
    <app-turno-wizard />
  `,
})
export class NuevoTurno {}
