import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  EmbeddedViewRef,
  TemplateRef,
  ViewContainerRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IHeaderAngularComp } from 'ag-grid-angular';
import { IHeaderParams } from 'ag-grid-community';

interface CustomHeaderParams extends IHeaderParams {
  columnName: string;
  filterState: any;
  filterChanged: (event: { col: string; selected: string[] }) => void;
}

@Component({
  selector: 'app-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.html',
  styleUrls: ['./filter.scss'],
})
export class Filter implements IHeaderAngularComp, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('dropdownTemplate') dropdownTemplate!: TemplateRef<any>;
  @ViewChild('filterInput') filterInputElement!: ElementRef<HTMLInputElement>;

  params!: CustomHeaderParams;
  columnName!: string;
  filterState!: any;
  filterChanged!: (event: { col: string; selected: string[] }) => void;

  filterVisible = false;
  filterText = '';
  filteredValues: string[] = [];

  private buttonElement: HTMLElement | null = null;
  private dropdownContainer: HTMLElement | null = null;
  private viewRef: EmbeddedViewRef<any> | null = null;
  private scrollListener: (() => void) | null = null;
  private documentClickListener: ((event: Event) => void) | null = null;

  private static openDropdownInstance: Filter | null = null;

  constructor(private renderer: Renderer2, private viewContainerRef: ViewContainerRef) {}

  agInit(params: CustomHeaderParams): void {
    this.params = params;
    this.columnName = params.columnName;
    this.filterState = params.filterState;
    this.filterChanged = params.filterChanged;

    if (this.filterState && this.columnName) {
      this.filteredValues = [...this.filterState[this.columnName].allValues];
    }
  }

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.filterState && this.columnName) {
      this.filteredValues = [...this.filterState[this.columnName].allValues];
    }
  }

  ngOnDestroy(): void {
    this.destroyDropdown();
    this.removeScrollListener();
    this.removeDocumentClickListener();
    if (Filter.openDropdownInstance === this) Filter.openDropdownInstance = null;
  }

  refresh(): boolean {
    return true;
  }

  toggleFilter(event: MouseEvent | TouchEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.buttonElement = event.currentTarget as HTMLElement;

    if (this.filterVisible) this.closeDropdown();
    else this.openDropdown();
  }

  private openDropdown(): void {
    if (Filter.openDropdownInstance && Filter.openDropdownInstance !== this) {
      Filter.openDropdownInstance.closeDropdown();
    }
    Filter.openDropdownInstance = this;

    this.filterVisible = true;

    setTimeout(() => {
      if (!this.dropdownTemplate || !this.buttonElement) return;

      this.viewRef = this.viewContainerRef.createEmbeddedView(this.dropdownTemplate);
      this.dropdownContainer = this.viewRef.rootNodes[0] as HTMLElement;

      const gridWrapper = this.buttonElement.closest('.ag-root-wrapper');
      (gridWrapper || document.body).appendChild(this.dropdownContainer);

      this.dropdownContainer.style.position = gridWrapper ? 'absolute' : 'fixed';
      this.dropdownContainer.style.zIndex = '99999';

      this.updateDropdownPosition();

      setTimeout(() => {
        this.addScrollListener();
        this.addDocumentClickListener();
      }, 150);

      setTimeout(() => {
        const input = this.dropdownContainer?.querySelector(
          '.column-filter-input'
        ) as HTMLInputElement;
        if (input) input.focus();
      }, 200);
    }, 50);
  }

  private closeDropdown(): void {
    this.filterVisible = false;
    this.destroyDropdown();
    this.removeScrollListener();
    this.removeDocumentClickListener();
    this.buttonElement = null;
    if (Filter.openDropdownInstance === this) Filter.openDropdownInstance = null;
  }

  private destroyDropdown(): void {
    if (this.dropdownContainer?.parentNode) {
      this.dropdownContainer.parentNode.removeChild(this.dropdownContainer);
    }
    this.viewRef?.destroy();
    this.viewRef = null;
    this.dropdownContainer = null;
  }

  private addDocumentClickListener(): void {
    this.documentClickListener = (event: Event) => {
      const target = event.target as HTMLElement;
      if (this.dropdownContainer?.contains(target) || this.buttonElement?.contains(target)) return;
      this.closeDropdown();
    };

    setTimeout(() => {
      document.addEventListener('click', this.documentClickListener!, true);
      document.addEventListener('touchstart', this.documentClickListener!, true);
    }, 100);
  }

  private removeDocumentClickListener(): void {
    if (!this.documentClickListener) return;
    document.removeEventListener('click', this.documentClickListener, true);
    document.removeEventListener('touchstart', this.documentClickListener, true);
    this.documentClickListener = null;
  }

  private addScrollListener(): void {
    if (!this.buttonElement) return;

    this.scrollListener = () => {
      if (this.filterVisible) this.updateDropdownPosition();
    };

    const scrollables = [
      this.buttonElement.closest('.ag-body-viewport'),
      this.buttonElement.closest('.ag-body-horizontal-scroll-viewport'),
      this.buttonElement.closest('.ag-center-cols-viewport'),
    ];
    scrollables.forEach((c) => c?.addEventListener('scroll', this.scrollListener!, true));
    window.addEventListener('scroll', this.scrollListener!, true);
    window.addEventListener('resize', this.scrollListener!, true);
  }

  private removeScrollListener(): void {
    if (!this.scrollListener || !this.buttonElement) return;
    const scrollables = [
      this.buttonElement.closest('.ag-body-viewport'),
      this.buttonElement.closest('.ag-body-horizontal-scroll-viewport'),
      this.buttonElement.closest('.ag-center-cols-viewport'),
    ];
    scrollables.forEach((c) => c?.removeEventListener('scroll', this.scrollListener!, true));
    window.removeEventListener('scroll', this.scrollListener!, true);
    window.removeEventListener('resize', this.scrollListener!, true);
    this.scrollListener = null;
  }

  private updateDropdownPosition(): void {
    if (!this.dropdownContainer || !this.buttonElement) return;

    const rect = this.buttonElement.getBoundingClientRect();
    const gridRect = this.buttonElement.closest('.ag-root-wrapper')?.getBoundingClientRect();
    if (!gridRect) return;

    const dropdownWidth = this.dropdownContainer.offsetWidth || 180;
    const dropdownHeight = this.dropdownContainer.offsetHeight || 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.bottom - gridRect.top + 2;
    let left = rect.left - gridRect.left;

    if (rect.left + dropdownWidth > viewportWidth - 10) {
      left = Math.max(rect.right - gridRect.left - dropdownWidth, 10);
    }

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      top = rect.top - gridRect.top - dropdownHeight - 2;
      this.renderer.setStyle(this.dropdownContainer, 'max-height', `${spaceAbove - 20}px`);
    } else {
      top = rect.bottom - gridRect.top + 2;
      this.renderer.setStyle(this.dropdownContainer, 'max-height', `${spaceBelow - 20}px`);
    }

    this.renderer.setStyle(this.dropdownContainer, 'overflow-y', 'auto');
    this.renderer.setStyle(this.dropdownContainer, 'top', `${top}px`);
    this.renderer.setStyle(this.dropdownContainer, 'left', `${left}px`);
  }

  onFilterInput(): void {
    const txt = this.filterText.toLowerCase().trim();
    const allValues: string[] = this.filterState[this.columnName]?.allValues || [];

    if (!txt) {
      this.filteredValues = [...allValues];
    } else {
      this.filteredValues = allValues.filter((v: string) =>
        String(v || '')
          .toLowerCase()
          .includes(txt)
      );
    }
  }

  onCheckboxChange(value: string, checked: boolean, event?: Event): void {
    event?.stopPropagation();
    const state = this.filterState[this.columnName];
    if (!state) return;
    checked ? state.selectedValues.add(value) : state.selectedValues.delete(value);
    this.emitChange();
  }

  clearSearch(event?: MouseEvent): void {
    event?.stopPropagation();
    event?.preventDefault();
    this.filterText = '';
    this.filteredValues = [...this.filterState[this.columnName].allValues];
    setTimeout(() => {
      const input = this.dropdownContainer?.querySelector(
        '.column-filter-input'
      ) as HTMLInputElement;
      input?.focus();
    }, 0);
  }

  onLabelClick(value: string, event: MouseEvent | TouchEvent): void {
    event.stopPropagation();
    event.preventDefault();
    const state = this.filterState[this.columnName];
    if (!state) return;
    state.selectedValues.has(value)
      ? state.selectedValues.delete(value)
      : state.selectedValues.add(value);
    this.emitChange();
  }

  private emitChange(): void {
    const state = this.filterState[this.columnName];
    if (!state) return;
    this.filterChanged({ col: this.columnName, selected: [...state.selectedValues] });
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.filterVisible) this.updateDropdownPosition();
  }
}
