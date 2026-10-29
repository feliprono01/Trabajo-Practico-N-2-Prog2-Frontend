import { Component, Input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hora-input',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './hora-input.html',
  styleUrl: './hora-input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HoraInput),
      multi: true,
    },
  ],
})
export class HoraInput implements ControlValueAccessor {
  @Input() label = '';

  readonly horas = signal(0);
  readonly minutos = signal(0);
  readonly deshabilitado = signal(false);

  private onChange: (valor: string) => void = () => {};
  private onTouched: () => void = () => {};

  get horaTexto(): string {
    return String(this.horas()).padStart(2, '0');
  }

  get minutoTexto(): string {
    return String(this.minutos()).padStart(2, '0');
  }

  writeValue(valor: string | null): void {
    if (valor && /^\d{2}:\d{2}/.test(valor)) {
      const [h, m] = valor.split(':').map(Number);
      this.horas.set(h);
      this.minutos.set(m);
    } else {
      this.horas.set(0);
      this.minutos.set(0);
    }
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(deshabilitado: boolean): void {
    this.deshabilitado.set(deshabilitado);
  }

  incrementarHora(): void {
    if (this.deshabilitado()) return;
    this.horas.update((h) => (h + 1) % 24);
    this.emitir();
  }

  decrementarHora(): void {
    if (this.deshabilitado()) return;
    this.horas.update((h) => (h - 1 + 24) % 24);
    this.emitir();
  }

  incrementarMinuto(): void {
    if (this.deshabilitado()) return;
    this.minutos.update((m) => (m + 1) % 60);
    this.emitir();
  }

  decrementarMinuto(): void {
    if (this.deshabilitado()) return;
    this.minutos.update((m) => (m - 1 + 60) % 60);
    this.emitir();
  }

  editarHora(valor: string): void {
    const n = Number(valor.replace(/\D/g, ''));
    if (!Number.isNaN(n)) {
      this.horas.set(Math.min(23, Math.max(0, n)));
      this.emitir();
    }
  }

  editarMinuto(valor: string): void {
    const n = Number(valor.replace(/\D/g, ''));
    if (!Number.isNaN(n)) {
      this.minutos.set(Math.min(59, Math.max(0, n)));
      this.emitir();
    }
  }

  private emitir(): void {
    this.onTouched();
    this.onChange(`${this.horaTexto}:${this.minutoTexto}`);
  }
}
