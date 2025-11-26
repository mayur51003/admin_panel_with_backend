import { Component, HostListener, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Theme, ThemeToggle } from '../../services/theme/theme-toggle';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class Sidebar implements AfterViewInit, OnDestroy {
  collapsed = false;
  isMobile = false;
  isDropdownOpen = false;
  activeMenu: string = 'dashboard';
  activeSubmenu: string = '';

  openMenu: string = '';
  hoverSubmenu: string | null = null;

  theme: Theme = 'system';

  private scrollListener?: () => void;

  constructor(private themeService: ThemeToggle, private elementRef: ElementRef) {
    this.theme = this.themeService.getTheme();
  }

  ngAfterViewInit() {
    this.setupTooltipPositioning();
  }

  setActiveMenu(menu: string, hasSubmenu: boolean = false) {
    if (hasSubmenu) return;

    this.activeMenu = menu;
    this.activeSubmenu = '';
  }

  setActiveSubmenu(parent: string, submenu: string) {
    this.activeMenu = parent;
    this.activeSubmenu = submenu;
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      const sidebarContent = this.elementRef.nativeElement.querySelector('.sidebar-content');
      if (sidebarContent) {
        sidebarContent.removeEventListener('scroll', this.scrollListener);
      }
    }
  }

  private setupTooltipPositioning() {
    const sidebarContent = this.elementRef.nativeElement.querySelector('.sidebar-content');

    if (sidebarContent) {
      this.scrollListener = () => {
        if (this.collapsed) {
          this.updateTooltipPositions();
        }
      };
      sidebarContent.addEventListener('scroll', this.scrollListener);
    }
  }

  private updateTooltipPositions() {
    if (!this.collapsed) return;

    const menuItems = this.elementRef.nativeElement.querySelectorAll('.menu-item[data-label]');

    menuItems.forEach((item: HTMLElement) => {
      const rect = item.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;

      item.style.setProperty('--tooltip-top', centerY + 'px');
      item.style.setProperty('--submenu-top', centerY + 'px');
    });
  }

  onMenuItemHover(event: MouseEvent) {
    if (this.collapsed) {
      const menuItem = event.currentTarget as HTMLElement;
      const rect = menuItem.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;

      menuItem.style.setProperty('--tooltip-top', centerY + 'px');
      menuItem.style.setProperty('--submenu-top', centerY + 'px');
    }
  }

  onSubmenuHover(submenuName: string, event: MouseEvent) {
    this.hoverSubmenu = submenuName;
    if (this.collapsed) {
      this.onMenuItemHover(event);
    }
  }

  onSubmenuLeave() {
    this.hoverSubmenu = null;
  }

  selectTheme(theme: 'light' | 'dark' | 'system') {
    this.theme = theme;
    this.applyTheme();
    this.isDropdownOpen = false;
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  toggleMenu(menu: string) {
    this.isDropdownOpen = false;
    this.openMenu = this.openMenu === menu ? '' : menu;

    setTimeout(() => {
      if (this.collapsed) {
        this.updateTooltipPositions();
      }
    }, 50);
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
    if (this.collapsed) {
      setTimeout(() => this.updateTooltipPositions(), 100);
    }
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    this.collapsed = this.isMobile;
  }

  applyTheme() {
    this.themeService.setTheme(this.theme);
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;

    setTimeout(() => {
      if (this.collapsed) {
        this.updateTooltipPositions();
      }
    }, 350);
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.openMenu = '';
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    if (target.closest('.menu-item.has-submenu')) {
      return;
    }

    if (target.closest('.theme-dropdown')) {
      return;
    }

    this.openMenu = '';
    this.isDropdownOpen = false;
  }
}
