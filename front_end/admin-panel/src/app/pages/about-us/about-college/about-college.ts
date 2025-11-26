import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AboutCollegeService } from '../../../services/aboutCollege/about-college-service';
import { InputField } from '../../../shared-component/input-field/input-field';

interface CollegeData {
  name: string;
  description: string;
  images: any[];
  established: string;
  location: string;
  affiliations: string[];
  highlights: string[];
}

@Component({
  selector: 'app-about-college',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputField],
  templateUrl: './about-college.html',
  styleUrls: ['./about-college.scss'],
})
export class AboutCollege implements OnInit, OnDestroy {
  currentImageIndex = 0;
  private autoSlideInterval: any;
  private readonly autoSlideDelay = 3000;

  showEditForm = false;
  collegeForm!: FormGroup;
  affiliationForm!: FormGroup;
  highlightForm!: FormGroup;
  showValidation = false;

  originalCollegeData: CollegeData | null = null;

  uploadedFileName = '';
  selectedImageIndex: number | null = null;
  selectedImages: any[] = [];

  resethighlightaffiliationTrigger: boolean = false;
  collegeExists: boolean = false;

  existingImageUrls: string[] = [];
  newImageFiles: File[] = [];

  collegeData: CollegeData = {
    name: '',
    description: '',
    images: [],
    established: '',
    location: '',
    affiliations: [],
    highlights: [],
  };

  constructor(private fb: FormBuilder, private aboutcollegeService: AboutCollegeService) {}

  ngOnInit(): void {
    this.initializeForms();
    if (this.collegeData.images.length > 1) {
      this.startAutoSlide();
    }
    this.loadCollegeData();
  }

  loadCollegeData() {
    this.aboutcollegeService.getAboutCollege().subscribe({
      next: (res) => {
        this.collegeExists = res.exist;

        if (res.exist && res.data) {
          this.collegeData = {
            name: res.data.name || '',
            description: res.data.description || '',
            location: res.data.location || '',
            established: res.data.established || '',
            affiliations: res.data.affiliations || [],
            highlights: res.data.highlights || [],
            images:
              res.data.images?.map((img: any) => ({
                id: img.id,
                url: `http://localhost:8000/storage/${img.image_path}`,
                isExisting: true,
              })) || [],
          };

          this.existingImageUrls = this.collegeData.images.map((img: any) => img.url);

          if (this.collegeData.images.length > 1) {
            this.startAutoSlide();
          }
        } else {
          this.collegeData = {
            name: '',
            description: '',
            images: [],
            established: '',
            location: '',
            affiliations: [],
            highlights: [],
          };
        }

        if (!this.collegeExists) {
          this.openEditForm();
        }
      },
      error: (err) => {
        console.error('Error loading college data', err);
      },
    });
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  initializeForms(): void {
    this.collegeForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      location: ['', [Validators.required]],
      established: ['', [Validators.required]],
    });

    this.affiliationForm = this.fb.group({
      affiliation: ['', [Validators.required]],
    });

    this.highlightForm = this.fb.group({
      highlight: ['', [Validators.required]],
    });
  }

  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextImage();
    }, this.autoSlideDelay);
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.collegeData.images.length;
  }

  prevImage(): void {
    this.stopAutoSlide();
    this.currentImageIndex =
      this.currentImageIndex === 0
        ? this.collegeData.images.length - 1
        : this.currentImageIndex - 1;
    this.startAutoSlide();
  }

  goToImage(index: number): void {
    this.stopAutoSlide();
    this.currentImageIndex = index;
    this.startAutoSlide();
  }

  openEditForm(): void {
    this.originalCollegeData = JSON.parse(JSON.stringify(this.collegeData));
    this.collegeForm.patchValue({
      name: this.collegeData.name,
      description: this.collegeData.description,
      location: this.collegeData.location,
      established: this.collegeData.established,
    });
    this.showEditForm = true;
    this.showValidation = false;
  }

  cancelEdit(): void {
    if (this.originalCollegeData) {
      this.collegeData = JSON.parse(JSON.stringify(this.originalCollegeData));
    }
    this.showEditForm = false;
    this.originalCollegeData = null;
    this.collegeForm.reset();
    this.affiliationForm.reset();
    this.highlightForm.reset();
    this.showValidation = false;
    this.resethighlightaffiliationTrigger = !this.resethighlightaffiliationTrigger;
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file!');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB!');
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (this.selectedImageIndex !== null) {
      const existingImage = this.collegeData.images[this.selectedImageIndex];

      if (existingImage.isExisting && existingImage.id) {
        this.updateImageViaAPI(existingImage.id, file, this.selectedImageIndex);
      } else {
        this.collegeData.images[this.selectedImageIndex] = {
          file: file,
          preview: previewUrl,
          isExisting: false,
        };
      }
      this.selectedImageIndex = null;
    } else {
      this.collegeData.images.push({
        file: file,
        preview: previewUrl,
        isExisting: false,
      });
    }

    event.target.value = '';
  }

  updateImageViaAPI(imageId: number, file: File, index: number): void {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('image', file);

    this.aboutcollegeService.updateCollegeImage(imageId, formData).subscribe({
      next: (res) => {
        alert('Image updated successfully!');
        this.collegeData.images[index] = {
          id: res.data.id,
          url: `http://localhost:8000/storage/${res.data.image_path}`,
          isExisting: true,
        };
      },
      error: (err) => {
        console.error('Error updating image:', err);
        alert('Failed to update image!');
      },
    });
  }

  editImage(index: number): void {
    this.selectedImageIndex = index;
    const fileInput = document.getElementById('collegeImages') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  deleteImage(index: number): void {
    const image = this.collegeData.images[index];

    if (image.isExisting && image.id) {
      if (confirm('Are you sure you want to delete this image?')) {
        this.deleteImageViaAPI(image.id, index);
      }
    } else {
      this.collegeData.images.splice(index, 1);
      if (this.currentImageIndex >= this.collegeData.images.length) {
        this.currentImageIndex = 0;
      }
    }
  }

  deleteImageViaAPI(imageId: number, index: number): void {
    this.aboutcollegeService.deleteCollegeImage(imageId).subscribe({
      next: (res) => {
        console.error('Successfully deleted:', res);
        alert('Image deleted successfully!');
        this.collegeData.images.splice(index, 1);
        if (this.currentImageIndex >= this.collegeData.images.length) {
          this.currentImageIndex = 0;
        }
      },
      error: (err) => {
        console.error('Error deleting image:', err);
        alert('Failed to delete image!');
      },
    });
  }

  addAffiliation(): void {
    if (this.affiliationForm.invalid) {
      this.affiliationForm.get('affiliation')?.markAsTouched();
      return;
    }

    const affiliationValue = this.affiliationForm.get('affiliation')?.value?.trim();
    if (affiliationValue) {
      this.collegeData.affiliations.push(affiliationValue);
      this.affiliationForm.reset();
      this.resethighlightaffiliationTrigger = !this.resethighlightaffiliationTrigger;
    }
  }

  deleteAffiliation(index: number): void {
    this.collegeData.affiliations.splice(index, 1);
  }

  addHighlight(): void {
    if (this.highlightForm.invalid) {
      this.highlightForm.get('highlight')?.markAsTouched();
      return;
    }

    const highlightValue = this.highlightForm.get('highlight')?.value?.trim();
    if (highlightValue) {
      this.collegeData.highlights.push(highlightValue);
      this.highlightForm.reset();
      this.resethighlightaffiliationTrigger = !this.resethighlightaffiliationTrigger;
    }
  }

  deleteHighlight(index: number): void {
    this.collegeData.highlights.splice(index, 1);
  }

  saveCollegeData(): void {
    this.showValidation = true;

    if (this.collegeForm.invalid) {
      Object.keys(this.collegeForm.controls).forEach((key) => {
        this.collegeForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.collegeData.images.length === 0) {
      alert('Please add at least one college image!');
      return;
    }

    if (this.collegeData.affiliations.length === 0) {
      alert('Please add at least one affiliation!');
      return;
    }

    if (this.collegeData.highlights.length === 0) {
      alert('Please add at least one highlight!');
      return;
    }

    const formData = new FormData();

    Object.keys(this.collegeForm.controls).forEach((key) => {
      const control = this.collegeForm.get(key);
      if (control?.dirty) {
        formData.append(key, control.value);
      }
    });

    const originalAff = this.originalCollegeData?.affiliations || [];
    if (JSON.stringify(originalAff) !== JSON.stringify(this.collegeData.affiliations)) {
      this.collegeData.affiliations.forEach((item, i) => {
        formData.append(`affiliations[${i}]`, item);
      });
    }

    const originalHigh = this.originalCollegeData?.highlights || [];
    if (JSON.stringify(originalHigh) !== JSON.stringify(this.collegeData.highlights)) {
      this.collegeData.highlights.forEach((item, i) => {
        formData.append(`highlights[${i}]`, item);
      });
    }

    const newImages = this.collegeData.images.filter((img: any) => !img.isExisting);
    newImages.forEach((imgObj: any) => {
      formData.append('images[]', imgObj.file, imgObj.file.name);
    });

    if (this.collegeExists) {
      formData.append('_method', 'PUT');
      this.aboutcollegeService.updateAboutCollege(formData).subscribe({
        next: (res) => {
          alert(res.message || 'College info updated successfully!');
          this.showEditForm = false;
          this.originalCollegeData = null;
          this.loadCollegeData();
        },
        error: (err) => {
          console.error('Update error:', err);
          if (err.error?.errors) {
            const errors = Object.values(err.error.errors).flat().join('\n');
            alert('Validation Error:\n' + errors);
          } else {
            alert(err.error?.message || 'Failed to update college data.');
          }
        },
      });
    } else {
      this.aboutcollegeService.createAboutCollege(formData).subscribe({
        next: (res) => {
          alert(res.message || 'College created successfully!');
          this.showEditForm = false;
          this.originalCollegeData = null;
          this.collegeExists = true;
          this.loadCollegeData();
        },
        error: (err) => {
          console.error('Create error:', err);
          if (err.error?.errors) {
            const errors = Object.values(err.error.errors).flat().join('\n');
            alert('Validation Error:\n' + errors);
          } else {
            alert(err.error?.message || 'Failed to create college data.');
          }
        },
      });
    }
  }
}
