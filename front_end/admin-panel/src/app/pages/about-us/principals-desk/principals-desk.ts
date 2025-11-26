import { Component, OnInit } from '@angular/core';
import { ThemeToggle } from '../../../services/theme/theme-toggle';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrincipalService } from '../../../services/principal/principal-service';
import { InputField } from '../../../shared-component/input-field/input-field';

interface Principal {
  id: number;
  name: string;
  designation: string;
  photo_path: string;
  joining_date: string;
  end_date: string;
  message: string;
  quote: string;
  photo_url: string;
}

@Component({
  selector: 'app-principals-desk',
  imports: [CommonModule, ReactiveFormsModule, InputField],
  templateUrl: './principals-desk.html',
  styleUrl: './principals-desk.scss',
})
export class PrincipalsDesk implements OnInit {
  currentTheme: 'light' | 'dark' | 'system';

  principals: Principal[] = [];
  principalForm!: FormGroup;

  showForm = false;
  isEditing = false;
  editingId: number | null = null;
  isLoading = false;

  showDeleteModal = false;
  principalToDelete: number | null = null;

  uploadedFileName = '';
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;

  constructor(
    private themeService: ThemeToggle,
    private fb: FormBuilder,
    private principalService: PrincipalService
  ) {
    this.themeService.themeChanges().subscribe((theme) => {
      this.currentTheme = theme;
    });
    this.currentTheme = this.themeService.getResolvedTheme();
  }

  ngOnInit() {
    this.initializeForm();
    this.loadPrincipals();
  }

  loadPrincipals() {
    this.isLoading = true;
    this.principalService.getPrincipals().subscribe({
      next: (response) => {
        this.principals = response.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading principals:', error);
        this.isLoading = false;
      },
    });
  }

  initializeForm() {
    this.principalForm = this.fb.group({
      name: ['', Validators.required],
      designation: ['', Validators.required],
      joiningDate: ['', Validators.required],
      endDate: [''],
      quote: [''],
      message: ['', Validators.required],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.principalForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  addNew() {
    this.principalForm.reset();
    this.uploadedFileName = '';
    this.selectedFile = null;
    this.isEditing = false;
    this.editingId = null;
    this.showForm = true;
  }

  editPrincipal(principal: Principal) {
    this.principalForm.patchValue({
      name: principal.name,
      designation: principal.designation,
      joiningDate: principal.joining_date,
      endDate: principal.end_date,
      quote: principal.quote,
      message: principal.message,
    });

    this.uploadedFileName = principal.photo_path ? 'Photo Uploaded' : '';

    this.selectedFile = null;
    this.imagePreviewUrl = principal.photo_path ? this.getPhotoUrl(principal.photo_path) : null;
    this.isEditing = true;
    this.editingId = principal.id;
    this.showForm = true;
  }

  savePrincipal() {
    if (this.principalForm.invalid) {
      this.principalForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const formValue = this.principalForm.value;

    this.isLoading = true;

    if (this.isEditing && this.editingId) {
      Object.keys(this.principalForm.controls).forEach((key) => {
        const control = this.principalForm.get(key);

        if (control?.dirty) {
          formData.append(key, control.value);
        }
      });

      if (this.selectedFile) {
        formData.append('photo', this.selectedFile);
      }

      formData.append('_method', 'PUT');

      this.principalService.updatePrincipal(this.editingId, formData).subscribe({
        next: (response) => {
          console.log('Principal Updated Successfully', response);
          this.loadPrincipals();
          this.cancelForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating principal:', error);
          this.isLoading = false;
        },
      });

      return;
    }

    formData.append('name', formValue.name);
    formData.append('designation', formValue.designation);
    formData.append('joining_date', formValue.joiningDate);
    formData.append('end_date', formValue.endDate || '');
    formData.append('quote', formValue.quote || '');
    formData.append('message', formValue.message);

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    this.principalService.createPrincipal(formData).subscribe({
      next: (response) => {
        console.log('Principal created successfully', response);
        this.loadPrincipals();
        this.cancelForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating principal:', error);
        alert('Error adding principal. Please try again.');
        this.isLoading = false;
      },
    });
  }

  cancelForm() {
    this.showForm = false;
    this.principalForm.reset();
    this.uploadedFileName = '';
    this.imagePreviewUrl = null;
    this.selectedFile = null;
    this.isEditing = false;
    this.editingId = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadedFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePreviewImage() {
    this.imagePreviewUrl = null;
    this.selectedFile = null;
    this.uploadedFileName = '';
    const fileInput = document.getElementById('principalPhoto') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getDateInputStyles() {
    return {
      'color-scheme': this.currentTheme === 'dark' ? 'dark' : 'light',
    };
  }

  getPhotoUrl(photoPath: string): string {
    if (!photoPath) return 'assets/default-avatar.png';
    return `http://localhost:8000/storage/${photoPath}`;
  }

  openDeleteModal(id: number) {
    this.principalToDelete = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.principalToDelete = null;
  }

  confirmDelete() {
    if (this.principalToDelete !== null) {
      this.principalService.deletePrincipal(this.principalToDelete).subscribe({
        next: () => {
          this.loadPrincipals();
          this.closeDeleteModal();
        },

        error: (err) => {
          console.error('Delete error:', err);
          this.closeDeleteModal();
        },
      });
    }
  }
}
