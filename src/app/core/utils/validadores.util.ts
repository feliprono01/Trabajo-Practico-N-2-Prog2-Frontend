import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const noSoloEspaciosValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value;
  if (typeof valor === 'string' && valor.length > 0 && valor.trim().length === 0) {
    return { soloEspacios: true };
  }
  return null;
};

export function contrasenaMinimaValidator(longitudMinima: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (typeof valor !== 'string' || valor.length === 0) {
      return null;
    }
    return valor.trim().length < longitudMinima ? { passwordCorta: true } : null;
  };
}

export function edadMinimaValidator(aniosMinimos: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value as Date | null;
    if (!valor) {
      return null;
    }
    const hoy = new Date();
    let edad = hoy.getFullYear() - valor.getFullYear();
    const aunNoCumplioEsteAnio =
      hoy.getMonth() < valor.getMonth() || (hoy.getMonth() === valor.getMonth() && hoy.getDate() < valor.getDate());
    if (aunNoCumplioEsteAnio) {
      edad--;
    }
    return edad < aniosMinimos ? { edadMinima: aniosMinimos } : null;
  };
}
