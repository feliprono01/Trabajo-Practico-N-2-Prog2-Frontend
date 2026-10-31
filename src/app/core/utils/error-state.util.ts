import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/**
 * Por defecto, Angular Material marca un campo como inválido (contorno y
 * label en rojo) apenas el control queda "touched" (al perder el foco), sin
 * esperar a que se intente enviar el formulario. Este matcher pospone esa
 * marca visual hasta que `intentoEnviar()` sea true, para que coincida con
 * el momento en que se muestran los `mat-error` de cada campo.
 */
export class SoloAlEnviarErrorStateMatcher implements ErrorStateMatcher {
  constructor(private readonly intentoEnviar: () => boolean) {}

  isErrorState(control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean {
    return !!control && control.invalid && this.intentoEnviar();
  }
}
