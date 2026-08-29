import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Usamos signal (Angular 22)
  private readonly theme = signal<ThemeMode>(this.getInitialTheme());

  readonly isDark = this.theme.asReadonly();

  constructor() {
    // Aplica el tema cada vez que cambia
    effect(() => {
      const mode = this.theme();
      document.documentElement.classList.toggle('dark-theme', mode === 'dark');
      localStorage.setItem('theme', mode);
    });
  }

  toggleTheme(): void {
    this.theme.update(current => current === 'light' ? 'dark' : 'light');
  }

  private getInitialTheme(): ThemeMode {
    const saved = localStorage.getItem('theme') as ThemeMode | null;
    if (saved) return saved;

    // Respeta la preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}
