import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ThemeService } from '../../core/theme';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [MatIconButton, MatIcon, MatTooltip],
  template: `
    <button mat-icon-button
            (click)="themeService.toggleTheme()"
            [matTooltip]="themeService.isDark() ? 'Modo día' : 'Modo noche'"
            aria-label="Cambiar tema">
      <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
  `
})
export class ThemeToggle {
  readonly themeService = inject(ThemeService);
}
