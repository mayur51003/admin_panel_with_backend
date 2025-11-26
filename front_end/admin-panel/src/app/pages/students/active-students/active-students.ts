import { Component, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi } from 'ag-grid-community';
import { ThemeToggle, Theme } from '../../../services/theme/theme-toggle';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Filter } from '../../../shared-component/filter/filter';

interface IRow {
  id: number;
  name: string;
  status: string;
  email: string;
  classNo: number;
  phone: number;
}

interface ColumnConfig {
  field: string;
  headerName?: string;
  hide: boolean;
  order: number;
}

@Component({
  selector: 'app-active-students',
  imports: [AgGridAngular, CommonModule, FormsModule],
  templateUrl: './active-students.html',
  styleUrls: ['./active-students.scss'],
})
export class ActiveStudents implements OnDestroy, AfterViewInit {
  @ViewChild('grid') grid!: AgGridAngular;

  filterState: {
    [key: string]: {
      text: string;
      selectedValues: Set<string>;
      allValues: string[];
    };
  } = {};

  sidebarExpanded = false;
  searchText = '';
  draggedColumn: ColumnConfig | null = null;

  gridApi!: GridApi;
  activeFilters: { col: string; value: string }[] = [];

  private defaultColumnConfig: ColumnConfig[] = [
    { field: 'id', headerName: 'ID', hide: false, order: 0 },
    { field: 'name', headerName: 'Name', hide: false, order: 1 },
    { field: 'status', headerName: 'Status', hide: false, order: 2 },
    { field: 'email', headerName: 'Email', hide: false, order: 3 },
    { field: 'classNo', headerName: 'Class', hide: false, order: 4 },
    { field: 'phone', headerName: 'Phone', hide: false, order: 5 },
  ];
  columnConfig: ColumnConfig[] = [];
  rowData: IRow[] = [
    {
      id: 1,
      name: 'Amit Sharma',
      status: 'Active',
      email: 'amit.sharma@example.com',
      classNo: 10,
      phone: 9876543210,
    },
    {
      id: 2,
      name: 'Priya Verma',
      status: 'Inactive',
      email: 'priya.verma@example.com',
      classNo: 9,
      phone: 9123456780,
    },
    {
      id: 3,
      name: 'Rahul Mehta',
      status: 'Pending',
      email: 'rahul.mehta@example.com',
      classNo: 12,
      phone: 9988776655,
    },
    {
      id: 4,
      name: 'Sneha Patel',
      status: 'Active',
      email: 'sneha.patel@example.com',
      classNo: 11,
      phone: 9090909090,
    },
    {
      id: 5,
      name: 'Karan Joshi',
      status: 'Inactive',
      email: 'karan.joshi@example.com',
      classNo: 8,
      phone: 9012345678,
    },
    {
      id: 6,
      name: 'Anjali Singh',
      status: 'Active',
      email: 'anjali.singh@example.com',
      classNo: 10,
      phone: 9876512340,
    },
    {
      id: 7,
      name: 'Vikas Kumar',
      status: 'Pending',
      email: 'vikas.kumar@example.com',
      classNo: 12,
      phone: 9123498765,
    },
    {
      id: 8,
      name: 'Neha Gupta',
      status: 'Active',
      email: 'neha.gupta@example.com',
      classNo: 9,
      phone: 9988123456,
    },
    {
      id: 9,
      name: 'Rohan Desai',
      status: 'Inactive',
      email: 'rohan.desai@example.com',
      classNo: 11,
      phone: 9090123456,
    },
    {
      id: 10,
      name: 'Pooja Reddy',
      status: 'Active',
      email: 'pooja.reddy@example.com',
      classNo: 8,
      phone: 9012378945,
    },
    {
      id: 11,
      name: 'Arjun Nair',
      status: 'Pending',
      email: 'arjun.nair@example.com',
      classNo: 10,
      phone: 9876234567,
    },
    {
      id: 12,
      name: 'Kavya Iyer',
      status: 'Active',
      email: 'kavya.iyer@example.com',
      classNo: 12,
      phone: 9123567890,
    },
    {
      id: 13,
      name: 'Siddharth Rao',
      status: 'Inactive',
      email: 'siddharth.rao@example.com',
      classNo: 9,
      phone: 9988765432,
    },
    {
      id: 14,
      name: 'Divya Pillai',
      status: 'Active',
      email: 'divya.pillai@example.com',
      classNo: 11,
      phone: 9090876543,
    },
    {
      id: 15,
      name: 'Aditya Shah',
      status: 'Pending',
      email: 'aditya.shah@example.com',
      classNo: 8,
      phone: 9012456789,
    },
  ];
  displayedRows: IRow[] = [];

  colDefs: ColDef<IRow>[] = [];

  defaultColDef: ColDef = { flex: 1, minWidth: 120, filter: true };

  public gridThemeClass!: string;
  private sub!: Subscription;

  constructor(private themeService: ThemeToggle) {
    this.columnConfig = this.defaultColumnConfig.map((c) => ({ ...c }));
    this.displayedRows = [...this.rowData];

    this.columnConfig.forEach((col) => {
      const values = [...new Set(this.rowData.map((r) => String((r as any)[col.field])))];
      this.filterState[col.field] = {
        text: '',
        allValues: values,
        selectedValues: new Set<string>(),
      };
    });

    this.updateColDefs();
  }

  updateColDefs() {
    this.colDefs = this.columnConfig
      .filter((c) => !c.hide)
      .sort((a, b) => a.order - b.order)
      .map((c) => ({
        field: c.field as keyof IRow,
        headerName: c.headerName,
        headerComponent: Filter,
        headerComponentParams: {
          columnName: c.field,
          filterState: this.filterState,
          filterChanged: this.onFilterChanged.bind(this),
          popupParent: document.body,
        },
      }));
  }

  ngAfterViewInit() {
    this.sub = this.themeService.themeChanges().subscribe((theme: Theme) => {
      const resolvedTheme = theme === 'system' ? this.themeService.getResolvedTheme() : theme;
      setTimeout(() => {
        this.gridThemeClass = resolvedTheme === 'dark' ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
      });
    });
    this.themeService.emitCurrentTheme();
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.updateActiveFilters();
  }

  updateActiveFilters() {
    this.activeFilters = [];
    Object.keys(this.filterState).forEach((col) => {
      this.filterState[col].selectedValues.forEach((val) => {
        this.activeFilters.push({ col, value: val });
      });
    });
  }

  onFilterChanged(event: { col: string; selected: string[] }) {
    const col = event.col;
    this.filterState[col].selectedValues = new Set(event.selected);

    this.displayedRows = this.rowData.filter((row) => {
      return Object.keys(this.filterState).every((key) => {
        const selected = this.filterState[key].selectedValues;
        return selected.size === 0 || selected.has(String((row as any)[key]));
      });
    });

    this.updateActiveFilters();
  }

  removeFilterChip(col: string, value: string) {
    this.filterState[col].selectedValues.delete(value);
    this.onFilterChanged({ col, selected: [...this.filterState[col].selectedValues] });

    this.updateColDefs();

    if (this.gridApi) {
      setTimeout(() => {
        this.gridApi.refreshHeader();
      }, 0);
    }
  }

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }

  filteredColumns(): ColumnConfig[] {
    if (!this.searchText.trim()) return this.columnConfig.sort((a, b) => a.order - b.order);
    return this.columnConfig
      .filter((col) =>
        (col.headerName?.toLowerCase() || col.field.toLowerCase()).includes(
          this.searchText.toLowerCase()
        )
      )
      .sort((a, b) => a.order - b.order);
  }

  toggleColumn(column: ColumnConfig) {
    column.hide = !column.hide;
    this.updateColDefs();
  }

  onDragStart(event: DragEvent, column: ColumnConfig) {
    this.draggedColumn = column;
    if (event.dataTransfer) event.dataTransfer.setData('text/html', column.field);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetColumn: ColumnConfig) {
    event.preventDefault();
    if (!this.draggedColumn || this.draggedColumn === targetColumn) return;

    const draggedIndex = this.columnConfig.findIndex((c) => c === this.draggedColumn);
    const targetIndex = this.columnConfig.findIndex((c) => c === targetColumn);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const reordered = [...this.columnConfig];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);
    reordered.forEach((col, index) => (col.order = index));
    this.columnConfig = reordered;
    this.draggedColumn = null;
    this.updateColDefs();
  }

  showAllColumns() {
    this.columnConfig.forEach((c) => (c.hide = false));
    this.updateColDefs();
  }

  hideAllColumns() {
    this.columnConfig.forEach((c) => (c.hide = true));
    this.updateColDefs();
  }

  resetColumns() {
    this.columnConfig = this.defaultColumnConfig.map((c) => ({ ...c }));
    this.searchText = '';
    this.updateColDefs();
  }
}
