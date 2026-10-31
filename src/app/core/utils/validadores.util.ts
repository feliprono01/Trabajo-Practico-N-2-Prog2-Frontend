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

export const fechaNacimientoValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = control.value as string;
  if (!valor) {
    return null;
  }

  const coincidencia = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  if (!coincidencia) {
    return { invalida: true };
  }

  const dia = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const anio = Number(coincidencia[3]);

  if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || anio < 1900) {
    return { invalida: true };
  }

  const fecha = new Date(anio, mes - 1, dia);
  const esFechaReal = fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
  if (!esFechaReal) {
    return { invalida: true };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha > hoy) {
    return { futura: true };
  }

  return null;
};

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
