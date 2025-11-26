import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { ThemeToggle } from './services/theme/theme-toggle';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('admin-panel');
  sidebarCollapsed = false;

  currentTheme: 'light' | 'dark' | 'system';
  constructor(private themeService: ThemeToggle) {
    this.themeService.themeChanges().subscribe((theme) => {
      this.currentTheme = theme;
    });
    this.currentTheme = this.themeService.getResolvedTheme();
  }
}
