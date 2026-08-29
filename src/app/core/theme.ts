import { Injectable, signal, effect, computed } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly theme = signal<ThemeMode>(this.getInitialTheme());

  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
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

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}
