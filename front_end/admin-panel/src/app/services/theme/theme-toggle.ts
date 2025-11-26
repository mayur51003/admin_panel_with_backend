import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeToggle {
  private currentTheme: Theme = 'system';
  private theme$ = new BehaviorSubject<Theme>(this.currentTheme);

  constructor() {
    this.loadTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.currentTheme === 'system') {
        this.applyTheme();
      }
    });
  }

  setTheme(theme: Theme) {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme();
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  getResolvedTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return this.currentTheme === 'dark' ? 'dark' : 'light';
  }

  themeChanges() {
    return this.theme$.asObservable();
  }

  public emitCurrentTheme() {
    this.theme$.next(this.getResolvedTheme());
  }
  private loadTheme() {
    const saved = localStorage.getItem('theme') as Theme | null;
    this.currentTheme = saved || 'system';
    this.applyTheme();
  }

  private applyTheme() {
    const themeToApply = this.getResolvedTheme();

    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(themeToApply);

    this.theme$.next(themeToApply);
  }
}
