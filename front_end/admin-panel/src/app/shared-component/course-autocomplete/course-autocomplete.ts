import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-course-autocomplete',
  imports: [CommonModule],
  templateUrl: './course-autocomplete.html',
  styleUrl: './course-autocomplete.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CourseAutocomplete),
      multi: true,
    },
  ],
})
export class CourseAutocomplete implements ControlValueAccessor, OnInit, OnChanges {
  @Input() label: string = 'Courses Taught';
  @Input() placeholder: string = 'Start typing or Select Course';
  @Input() required: boolean = false;
  @Input() availableCourses: string[] = [];
  @Input() showValidation: boolean = false;
  @Input() resetTrigger: boolean = false;

  @Input() selectedCourses: string[] = [];
  @Output() selectedCoursesChange = new EventEmitter<string[]>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchQuery: string = '';
  filteredCourses: string[] = [];
  showDropdown: boolean = false;
  highlightedIndex: number = -1;
  private previousResetTrigger: boolean = false;
  private _touched: boolean = false;
  private _isTyping: boolean = false;

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.previousResetTrigger = this.resetTrigger;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['resetTrigger'] &&
      changes['resetTrigger'].currentValue !== this.previousResetTrigger
    ) {
      this.resetComponent();
      this.previousResetTrigger = changes['resetTrigger'].currentValue;
      return;
    }

    if (changes['showValidation']) {
      if (changes['showValidation'].currentValue && this.selectedCourses.length === 0) {
        this._touched = true;
      } else if (!changes['showValidation'].currentValue) {
        this._touched = false;
      }
    }
  }

  get hasError(): boolean {
    if (this._isTyping && this.searchQuery.trim().length > 0) {
      return false;
    }

    if (this.selectedCourses.length > 0) {
      return false;
    }
    const shouldShowError = this._touched && this.showValidation;
    return shouldShowError && this.required && this.selectedCourses.length === 0;
  }

  get errorMessage(): string {
    if (this.hasError) {
      return `${this.label || 'This field'} is required.`;
    }
    return '';
  }

  writeValue(value: string[]): void {
    this.selectedCourses = value && Array.isArray(value) ? value : [];

    if (this.selectedCourses.length === 0) {
      this._touched = false;
      this._isTyping = false;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  resetComponent(): void {
    this.searchQuery = '';
    this.selectedCourses = [];
    this.filteredCourses = [];
    this.showDropdown = false;
    this.highlightedIndex = -1;
    this._touched = false;
    this._isTyping = false;
    this.notifyChanges();
  }

  onInputChange(event: any) {
    this._isTyping = true;
    this.searchQuery = event.target.value;
    const query = this.searchQuery.trim().toLowerCase();

    if (query) {
      this.filteredCourses = this.availableCourses.filter(
        (course) => course.toLowerCase().includes(query) && !this.selectedCourses.includes(course)
      );
      this.showDropdown = true;
      this.highlightedIndex = 0;
    } else {
      this.showDropdown = false;
      this.filteredCourses = [];
      this._isTyping = false;
    }
  }

  onFocus() {
    if (this.searchQuery.trim()) {
      this._isTyping = true;
      const query = this.searchQuery.trim().toLowerCase();
      this.filteredCourses = this.availableCourses.filter(
        (course) => course.toLowerCase().includes(query) && !this.selectedCourses.includes(course)
      );
      if (this.filteredCourses.length > 0) {
        this.showDropdown = true;
      }
    }
  }

  onBlur() {
    setTimeout(() => {
      this._touched = true;
      this._isTyping = false;
      this.showDropdown = false;
      this.highlightedIndex = -1;
      this.onTouched();
    }, 250);
  }

  selectCourse(course: string) {
    if (!this.selectedCourses.includes(course)) {
      this.selectedCourses.push(course);
      this.notifyChanges();
    }
    this.searchQuery = '';
    this._isTyping = false;
    this.showDropdown = false;
    this.filteredCourses = [];
    this.highlightedIndex = -1;

    setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
  }

  removeTag(index: number) {
    this.selectedCourses.splice(index, 1);
    this.notifyChanges();
    setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (this.filteredCourses.length > 0 && this.highlightedIndex >= 0) {
        this.selectCourse(this.filteredCourses[this.highlightedIndex]);
      } else if (this.searchQuery.trim()) {
        const customCourse = this.searchQuery.trim();
        if (!this.selectedCourses.includes(customCourse)) {
          this.selectedCourses.push(customCourse);
          this.notifyChanges();
        }
        this.searchQuery = '';
        this._isTyping = false;
        this.showDropdown = false;
        this.filteredCourses = [];
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.filteredCourses.length > 0) {
        this.highlightedIndex = Math.min(
          this.highlightedIndex + 1,
          this.filteredCourses.length - 1
        );
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.filteredCourses.length > 0) {
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
      }
    } else if (event.key === 'Escape') {
      this.showDropdown = false;
      this.highlightedIndex = -1;
      this._isTyping = false;
    } else if (event.key === 'Backspace' && !this.searchQuery && this.selectedCourses.length > 0) {
      event.preventDefault();
      this.removeTag(this.selectedCourses.length - 1);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
      this.highlightedIndex = -1;
      this._isTyping = false;
    }
  }

  private notifyChanges(): void {
    this.onChange(this.selectedCourses);
    this.selectedCoursesChange.emit(this.selectedCourses);
  }

  public isValid(): boolean {
    if (!this.required) return true;
    return this.selectedCourses.length > 0;
  }

  public markAsTouched(): void {
    this._touched = true;
  }

  public reset(): void {
    this.resetComponent();
  }
}
