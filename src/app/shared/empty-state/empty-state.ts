import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon>{{ icono }}</mat-icon>
      <p>{{ mensaje }}</p>
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 2.5rem 1rem;
        color: var(--mat-sys-on-surface-variant, #666);
        text-align: center;
      }
      .empty-state mat-icon {
        font-size: 2.5rem;
        width: 2.5rem;
        height: 2.5rem;
        opacity: 0.6;
      }
    `,
  ],
})
export class EmptyState {
  @Input() mensaje = 'No hay datos para mostrar.';
  @Input() icono = 'inbox';
}
