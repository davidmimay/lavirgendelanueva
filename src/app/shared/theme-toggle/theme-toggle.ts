import { Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ThemeService } from '../../core/theme';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [MatIconButton, MatIcon, MatTooltip],
  templateUrl: 'theme-toggle.html',
})
export class ThemeToggle {
  readonly themeService = inject(ThemeService);
}
