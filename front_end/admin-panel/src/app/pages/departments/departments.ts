import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ThemeToggle } from '../../services/theme/theme-toggle';
import { InputField } from '../../shared-component/input-field/input-field';
import { DepartmentService } from '../../services/department/department-service';
import { CourseAutocomplete } from '../../shared-component/course-autocomplete/course-autocomplete';

interface Department {
  id: number;
  department_name: string;
  tagline: string | null;
  about: string | null;
  images: DepartmentImage[];
  status: string;
  created_at: string;
  updated_at: string;
  hod: Hod | null;
  faculties: Faculty[];
  courses: Course[];
  value_added_programs: ValueAddedProgram[];
  previous_hods: PreviousHod[];
}

interface DepartmentImage {
  id: number;
  image_path: string;
  sort_order: number;
}

interface Hod {
  id?: number;
  hod_name: string;
  qualification: string;
  description: string;
  photo: string | null;
}

interface PreviousHod {
  id?: number;
  previous_hod_name: string;
  previous_hod_tenure: string;
}

interface Faculty {
  id?: number;
  faculty_name: string;
  faculty_email: string;
  faculty_dob: string;
  faculty_industrial_exp: number;
  faculty_teaching_exp: number;
  course_taught: string;
  designation: string;
  faculty_joining_date: string;
  qualification: string;
  faculty_photo: string | null;
  nature_of_association: string;
  achievements: string;
  additional_info: string;
}

interface Course {
  id?: number;
  course_title: string;
  duration_in_month_or_years: number;
  intake_capacity: number;
}

interface ValueAddedProgram {
  id?: number;
  value_added_program_title: string;
  co_ordinator_name: string;
  duration_in_months: number;
  intake_capacity: number;
}

@Component({
  selector: 'app-departments',
  imports: [CommonModule, ReactiveFormsModule, InputField, CourseAutocomplete],
  templateUrl: './departments.html',
  styleUrl: './departments.scss',
})
export class Departments implements OnInit {
  currentTheme: 'light' | 'dark' | 'system';
  departments: Department[] = [];

  departmentForm!: FormGroup;

  originalFormValues: any = null;
  originalFacultyValues: any = null;

  availableCourses: string[] = [];
  selectedFacultyCourses: string[] = [];

  courseForm!: FormGroup;
  facultyForm!: FormGroup;
  valueAddedProgramForm!: FormGroup;
  previousHodForm!: FormGroup;

  editingFacultyIndex: number | null = null;
  editingCourseIndex: number | null = null;
  editingValueAddedProgramIndex: number | null = null;
  editingPreviousHodIndex: number | null = null;

  showForm: boolean = false;
  isEditMode: boolean = false;
  editingDepartmentId: number | null = null;
  showDeleteModal = false;
  departmentToDelete: number | null = null;
  selectedDeptImageIndex: number | null = null;

  activeTab: 'about' | 'hod' | 'course' | 'faculty' | 'valueaddedprogram' = 'about';

  hodPhotoFile: File | null = null;
  facultyPhotoFiles: (File | null)[] = [];
  deptImageFiles: File[] = [];

  deletedDeptImageIds: number[] = [];
  originalDeptImages: DepartmentImage[] = [];
  pendingDeptImageChanges: Map<number, File> = new Map();

  previousHodFormTouched = false;
  facultyFormTouched = false;
  courseFormTouched = false;
  valueAddedProgramFormTouched = false;

  preHodFormResetTriggered: boolean = false;
  facultyFormResetTrigger: boolean = false;
  courseFormResetTrigger: boolean = false;
  valueaddedprogramFormResetTrigger: boolean = false;

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeToggle,
    private departmentService: DepartmentService
  ) {
    this.themeService.themeChanges().subscribe((theme) => {
      this.currentTheme = theme;
    });
    this.currentTheme = this.themeService.getResolvedTheme();
  }

  ngOnInit() {
    this.initializeForms();
    this.fetchDepartments();
  }

  initializeForms() {
    this.departmentForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      tagline: [''],
      about: [''],
      images: [[]],
      isActive: [true],
      hod: this.fb.group({
        name: ['', Validators.required],
        qualification: ['', Validators.required],
        description: ['', Validators.required],
        photo: [null],
        previousHods: this.fb.array([]),
      }),
      faculty: this.fb.array([]),
      courses: this.fb.array([]),
      valueaddedprogram: this.fb.array([]),
    });

    this.facultyForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dob: ['', Validators.required],
      industrialExp: [0],
      teachingExp: [0, [Validators.required, Validators.min(1)]],
      designation: ['', Validators.required],
      joiningDate: ['', Validators.required],
      qualification: ['', [Validators.required, Validators.minLength(2)]],
      photo: [null],
      natureOfAssociation: ['', Validators.required],
      achievements: [''],
      additionalInfo: [''],
    });

    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(1)]],
      intake: ['', [Validators.required, Validators.min(1)]],
    });

    this.valueAddedProgramForm = this.fb.group({
      title: ['', Validators.required],
      co_ordinator: ['', Validators.required],
      duration: [0, [Validators.required, Validators.min(1)]],
      intake: [0, [Validators.required, Validators.min(1)]],
    });

    this.previousHodForm = this.fb.group({
      name: ['', Validators.required],
      tenure: ['', Validators.required],
    });
  }

  updateAvailableCourses() {
    this.availableCourses = this.coursesArray.controls.map((control) => control.value.title);
    console.log('Available courses updated:', this.availableCourses);
  }

  get coursesArray(): FormArray {
    return this.departmentForm.get('courses') as FormArray;
  }

  get facultyArray(): FormArray {
    return this.departmentForm.get('faculty') as FormArray;
  }

  get valueAddedProgramsArray(): FormArray {
    return this.departmentForm.get('valueaddedprogram') as FormArray;
  }

  get previousHodsArray(): FormArray {
    return this.departmentForm.get('hod.previousHods') as FormArray;
  }

  openForm() {
    this.showForm = true;
    this.isEditMode = false;
    this.editingDepartmentId = null;
    this.activeTab = 'about';
    this.resetAllForms();
  }

  closeForm() {
    this.showForm = false;
    this.isEditMode = false;
    this.editingDepartmentId = null;
    this.resetAllForms();
  }

  resetAllForms() {
    this.departmentForm.reset({
      id: '',
      name: '',
      tagline: '',
      about: '',
      images: [],
      isActive: true,
      hod: {
        name: '',
        qualification: '',
        description: '',
        photo: null,
        previousHods: [],
      },
    });

    this.facultyArray.clear();
    this.coursesArray.clear();
    this.valueAddedProgramsArray.clear();
    this.previousHodsArray.clear();

    this.resetFacultyForm();
    this.resetCourseForm();
    this.resetValueAddedProgramForm();
    this.resetPreviousHodFormComplete();

    this.editingFacultyIndex = null;
    this.editingCourseIndex = null;
    this.editingValueAddedProgramIndex = null;
    this.editingPreviousHodIndex = null;
    this.selectedDeptImageIndex = null;

    this.hodPhotoFile = null;
    this.facultyPhotoFiles = [];
    this.deptImageFiles = [];
    this.deletedDeptImageIds = [];
    this.originalDeptImages = [];
    this.pendingDeptImageChanges.clear();

    this.originalFormValues = null;
  }

  setActiveTab(tab: 'about' | 'hod' | 'course' | 'faculty' | 'valueaddedprogram'): void {
    this.activeTab = tab;
    if (tab === 'faculty') {
      this.updateAvailableCourses();
    }
  }

  onCourseSelectionChanged(selectedCourses: string[]) {
    this.selectedFacultyCourses = selectedCourses;
    console.log('Selected courses for faculty:', this.selectedFacultyCourses);
  }

  addPreviousHod() {
    if (this.previousHodForm.invalid) {
      this.previousHodFormTouched = true;
      this.previousHodForm.markAllAsTouched();
      return;
    }

    const hodData = this.previousHodForm.value;

    if (!this.editingDepartmentId) {
      if (this.editingPreviousHodIndex !== null) {
        this.previousHodsArray.at(this.editingPreviousHodIndex).patchValue(hodData);
        this.editingPreviousHodIndex = null;
      } else {
        this.previousHodsArray.push(this.fb.group(hodData));
      }
      this.resetPreviousHodFormComplete();
    } else {
      const payload = {
        previous_hod_name: hodData.name,
        previous_hod_tenure: hodData.tenure,
      };

      if (this.editingPreviousHodIndex !== null) {
        const previousHodData = this.previousHodsArray.at(this.editingPreviousHodIndex).value;
        const previousHodId = previousHodData.id;

        if (!previousHodId) {
          console.error('Previous HOD ID not found');
          alert('Cannot update: Previous HOD ID is missing');
          return;
        }

        this.departmentService
          .updatePreviousHod(this.editingDepartmentId, previousHodId, payload)
          .subscribe({
            next: (response) => {
              console.log('Previous HOD updated:', response);

              this.previousHodsArray.at(this.editingPreviousHodIndex!).patchValue({
                id: response.previous_hod?.id || previousHodId,
                name: response.previous_hod?.previous_hod_name || payload.previous_hod_name,
                tenure: response.previous_hod?.previous_hod_tenure || payload.previous_hod_tenure,
              });

              this.editingPreviousHodIndex = null;
              this.resetPreviousHodFormComplete();

              alert('Previous HOD updated successfully!');

              this.fetchDepartments();
            },
            error: (error) => {
              console.error('Error updating previous HOD:', error);
              alert('Failed to update previous HOD');
            },
          });
      } else {
        this.departmentService.createPreviousHod(this.editingDepartmentId, payload).subscribe({
          next: (response) => {
            console.log('Previous HOD created:', response);

            this.previousHodsArray.push(
              this.fb.group({
                id: response.previous_hod?.id,
                name: response.previous_hod?.previous_hod_name || payload.previous_hod_name,
                tenure: response.previous_hod?.previous_hod_tenure || payload.previous_hod_tenure,
              })
            );

            this.resetPreviousHodFormComplete();

            alert('Previous HOD added successfully!');

            this.fetchDepartments();
          },
          error: (error) => {
            console.error('Error creating previous HOD:', error);
            console.error('Error details:', error.error);
            alert('Failed to add previous HOD');
          },
        });
      }
    }
  }

  editPreviousHod(index: number) {
    this.editingPreviousHodIndex = index;
    const hodData = this.previousHodsArray.at(index).value;
    this.previousHodForm.patchValue(hodData);
    this.previousHodFormTouched = false;

    const tabContent = document.querySelector('.tab-content');
    if (tabContent) {
      tabContent.scrollTop = 0;
    }
  }

  removePreviousHod(index: number) {
    if (confirm('Are you sure you want to remove this previous HOD?')) {
      if (!this.editingDepartmentId) {
        this.previousHodsArray.removeAt(index);
      } else {
        const previousHodId = this.previousHodsArray.at(index).value.id;

        this.departmentService
          .deletePreviousHod(this.editingDepartmentId, previousHodId)
          .subscribe({
            next: (response) => {
              console.log('Previous HOD deleted:', response);
              alert('Previous HOD deleted successfully!');
              this.previousHodsArray.removeAt(index);
              this.fetchDepartments();
            },
            error: (error) => {
              console.error('Error deleting previous HOD:', error);
              alert('Failed to delete previous HOD');
            },
          });
      }

      if (this.editingPreviousHodIndex === index) {
        this.resetPreviousHodFormComplete();
      } else if (this.editingPreviousHodIndex !== null && this.editingPreviousHodIndex > index) {
        this.editingPreviousHodIndex--;
      }
    }
  }

  cancelEditPreviousHod() {
    this.resetPreviousHodFormComplete();
  }

  resetPreviousHodFormComplete() {
    this.previousHodForm.reset({
      name: '',
      tenure: '',
    });
    this.previousHodForm.markAsUntouched();
    this.previousHodForm.markAsPristine();
    Object.keys(this.previousHodForm.controls).forEach((key) => {
      const control = this.previousHodForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
      control?.markAsPristine();
    });
    this.previousHodFormTouched = false;
    this.editingPreviousHodIndex = null;
    this.preHodFormResetTriggered = !this.preHodFormResetTriggered;
  }

  addFacultyToDepartment() {
    if (this.selectedFacultyCourses.length === 0) {
      this.facultyFormTouched = true;
      alert('Please select at least one course for the faculty member');
      return;
    }

    if (this.facultyForm.invalid) {
      this.facultyFormTouched = true;
      this.facultyForm.markAllAsTouched();
      return;
    }

    const facultyData = {
      ...this.facultyForm.value,
      courseTaught: this.selectedFacultyCourses.join(', '),
    };

    if (!this.editingDepartmentId) {
      if (this.editingFacultyIndex !== null) {
        this.facultyArray.at(this.editingFacultyIndex).patchValue(facultyData);
      } else {
        this.facultyArray.push(this.fb.group(facultyData));
      }
      this.resetFacultyForm();
    } else {
      const formData = new FormData();

      if (this.editingFacultyIndex !== null) {
        formData.append('_method', 'PUT');

        const originalCourses = this.originalFacultyValues.courseTaught || '';
        const newCourses = facultyData.courseTaught;

        if (facultyData.name !== this.originalFacultyValues.name) {
          formData.append('faculty_name', facultyData.name);
        }
        if (facultyData.email !== this.originalFacultyValues.email) {
          formData.append('faculty_email', facultyData.email);
        }
        if (facultyData.dob !== this.originalFacultyValues.dob) {
          formData.append('faculty_dob', facultyData.dob);
        }
        if (facultyData.industrialExp !== this.originalFacultyValues.industrialExp) {
          formData.append('faculty_industrial_exp', facultyData.industrialExp.toString());
        }
        if (facultyData.teachingExp !== this.originalFacultyValues.teachingExp) {
          formData.append('faculty_teaching_exp', facultyData.teachingExp.toString());
        }
        if (newCourses !== originalCourses) {
          formData.append('course_taught', newCourses);
        }
        if (facultyData.designation !== this.originalFacultyValues.designation) {
          formData.append('designation', facultyData.designation);
        }
        if (facultyData.joiningDate !== this.originalFacultyValues.joiningDate) {
          formData.append('faculty_joining_date', facultyData.joiningDate);
        }
        if (facultyData.qualification !== this.originalFacultyValues.qualification) {
          formData.append('qualification', facultyData.qualification);
        }
        if (facultyData.natureOfAssociation !== this.originalFacultyValues.natureOfAssociation) {
          formData.append('nature_of_association', facultyData.natureOfAssociation || '');
        }
        if (facultyData.achievements !== this.originalFacultyValues.achievements) {
          formData.append('achievements', facultyData.achievements || '');
        }
        if (facultyData.additionalInfo !== this.originalFacultyValues.additionalInfo) {
          formData.append('additional_info', facultyData.additionalInfo || '');
        }

        const currentIndex = this.editingFacultyIndex;
        if (this.facultyPhotoFiles[currentIndex]) {
          formData.append('faculty_photo', this.facultyPhotoFiles[currentIndex]!);
        }

        console.log('Sending only changed fields:');
        for (let pair of (formData as any).entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        const facultyId = this.facultyArray.at(this.editingFacultyIndex).value.id;

        if (!facultyId) {
          console.error('Faculty ID not found');
          alert('Cannot update: Faculty ID is missing');
          return;
        }

        console.log('Updating Faculty with ID:', facultyId);

        this.departmentService
          .updateFaculty(this.editingDepartmentId, facultyId, formData)
          .subscribe({
            next: (response) => {
              console.log('Faculty updated:', response);
              alert('Faculty updated successfully!');
              this.facultyArray.at(this.editingFacultyIndex!).patchValue({
                id: facultyId,
                name: facultyData.name,
                email: facultyData.email,
                dob: facultyData.dob,
                industrialExp: facultyData.industrialExp,
                teachingExp: facultyData.teachingExp,
                courseTaught: facultyData.courseTaught,
                designation: facultyData.designation,
                joiningDate: facultyData.joiningDate,
                qualification: facultyData.qualification,
                photo: response.faculty?.faculty_photo
                  ? `http://localhost:8000/storage/${response.faculty.faculty_photo}`
                  : facultyData.photo,
                natureOfAssociation: facultyData.natureOfAssociation,
                achievements: facultyData.achievements,
                additionalInfo: facultyData.additionalInfo,
              });
              this.editingFacultyIndex = null;
              this.originalFacultyValues = null;
              this.resetFacultyForm();
              this.fetchDepartments();
            },
            error: (error) => {
              console.error('Error updating faculty:', error);
              alert('Failed to update faculty');
            },
          });
      } else {
        formData.append('faculty_name', facultyData.name);
        formData.append('faculty_email', facultyData.email);
        formData.append('faculty_dob', facultyData.dob);
        formData.append('faculty_industrial_exp', facultyData.industrialExp.toString());
        formData.append('faculty_teaching_exp', facultyData.teachingExp.toString());
        formData.append('course_taught', facultyData.courseTaught);
        formData.append('designation', facultyData.designation);
        formData.append('faculty_joining_date', facultyData.joiningDate);
        formData.append('qualification', facultyData.qualification);
        formData.append('nature_of_association', facultyData.natureOfAssociation || '');
        formData.append('achievements', facultyData.achievements || '');
        formData.append('additional_info', facultyData.additionalInfo || '');

        const currentIndex = this.facultyArray.length;
        if (this.facultyPhotoFiles[currentIndex]) {
          formData.append('faculty_photo', this.facultyPhotoFiles[currentIndex]!);
        }

        this.departmentService.createFaculty(this.editingDepartmentId, formData).subscribe({
          next: (response) => {
            console.log('Faculty created:', response);
            alert('Faculty added successfully!');
            this.facultyArray.push(
              this.fb.group({
                id: response.faculty?.id || response.id,
                name: facultyData.name,
                email: facultyData.email,
                dob: facultyData.dob,
                industrialExp: facultyData.industrialExp,
                teachingExp: facultyData.teachingExp,
                courseTaught: facultyData.courseTaught,
                designation: facultyData.designation,
                joiningDate: facultyData.joiningDate,
                qualification: facultyData.qualification,
                photo: response.faculty?.faculty_photo
                  ? `http://localhost:8000/storage/${response.faculty.faculty_photo}`
                  : null,
                natureOfAssociation: facultyData.natureOfAssociation,
                achievements: facultyData.achievements,
                additionalInfo: facultyData.additionalInfo,
              })
            );
            this.resetFacultyForm();
            this.fetchDepartments();
          },
          error: (error) => {
            console.error('Error creating faculty:', error);
            alert('Failed to add faculty');
          },
        });
      }
    }
  }

  editFacultyFromDepartment(index: number) {
    this.editingFacultyIndex = index;
    const facultyData = this.facultyArray.at(index).value;

    console.log('Editing faculty:', facultyData);

    this.originalFacultyValues = JSON.parse(JSON.stringify(facultyData));

    if (facultyData.courseTaught) {
      this.selectedFacultyCourses = facultyData.courseTaught
        .split(',')
        .map((c: string) => c.trim())
        .filter((c: string) => c.length > 0);
    } else {
      this.selectedFacultyCourses = [];
    }

    console.log('Selected courses for editing:', this.selectedFacultyCourses);

    this.facultyForm.patchValue({
      name: facultyData.name,
      email: facultyData.email,
      dob: facultyData.dob,
      industrialExp: facultyData.industrialExp || 0,
      teachingExp: facultyData.teachingExp || 0,
      designation: facultyData.designation,
      joiningDate: facultyData.joiningDate,
      qualification: facultyData.qualification,
      photo: facultyData.photo,
      natureOfAssociation: facultyData.natureOfAssociation,
      achievements: facultyData.achievements,
      additionalInfo: facultyData.additionalInfo,
    });

    this.facultyFormTouched = false;
    this.facultyForm.markAsUntouched();
    this.facultyForm.markAsPristine();

    Object.keys(this.facultyForm.controls).forEach((key) => {
      const control = this.facultyForm.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
    });

    const tabContent = document.querySelector('.tab-content');
    if (tabContent) {
      tabContent.scrollTop = 0;
    }
  }

  removeFacultyFromDepartment(index: number) {
    if (confirm('Are you sure you want to remove this faculty member?')) {
      if (!this.editingDepartmentId) {
        this.facultyArray.removeAt(index);
        if (this.facultyPhotoFiles[index]) {
          this.facultyPhotoFiles.splice(index, 1);
        }
      } else {
        const facultyId = this.facultyArray.at(index).value.id;

        this.departmentService.deleteFaculty(this.editingDepartmentId, facultyId).subscribe({
          next: (response) => {
            console.log('Faculty deleted:', response);
            alert('Faculty deleted successfully!');
            this.facultyArray.removeAt(index);
            if (this.facultyPhotoFiles[index]) {
              this.facultyPhotoFiles.splice(index, 1);
            }
            this.fetchDepartments();
          },
          error: (error) => {
            console.error('Error deleting faculty:', error);
            alert('Failed to delete faculty');
          },
        });
      }

      if (this.editingFacultyIndex === index) {
        this.resetFacultyForm();
      } else if (this.editingFacultyIndex !== null && this.editingFacultyIndex > index) {
        this.editingFacultyIndex--;
      }
    }
  }

  cancelEditFaculty() {
    this.resetFacultyForm();
  }

  resetFacultyForm() {
    this.facultyForm.reset({
      name: '',
      email: '',
      dob: '',
      industrialExp: 0,
      teachingExp: 0,
      designation: '',
      joiningDate: '',
      qualification: '',
      photo: null,
      natureOfAssociation: '',
      achievements: '',
      additionalInfo: '',
    });

    this.facultyForm.markAsUntouched();
    this.facultyForm.markAsPristine();

    Object.keys(this.facultyForm.controls).forEach((key) => {
      const control = this.facultyForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
      control?.markAsPristine();
    });

    this.facultyFormTouched = false;
    this.editingFacultyIndex = null;
    this.selectedFacultyCourses = [];

    if (this.editingFacultyIndex !== null) {
      this.facultyPhotoFiles[this.editingFacultyIndex] = null;
    }

    const facultyPhotoInput = document.getElementById('facultyPhoto') as HTMLInputElement;
    if (facultyPhotoInput) {
      facultyPhotoInput.value = '';
    }

    this.facultyFormResetTrigger = !this.facultyFormResetTrigger;
    console.log('Faculty form reset');
  }

  addCourseToDepartment() {
    if (this.courseForm.invalid) {
      this.courseFormTouched = true;
      this.courseForm.markAllAsTouched();
      return;
    }

    const courseData = this.courseForm.value;

    if (!this.editingDepartmentId) {
      if (this.editingCourseIndex !== null) {
        this.coursesArray.at(this.editingCourseIndex).patchValue(courseData);
      } else {
        this.coursesArray.push(this.fb.group(courseData));
      }
      this.resetCourseForm();
      this.updateAvailableCourses();
    } else {
      const payload = {
        course_title: courseData.title,
        duration_in_month_or_years: courseData.duration,
        intake_capacity: courseData.intake,
      };

      if (this.editingCourseIndex !== null) {
        const courseId = this.coursesArray.at(this.editingCourseIndex).value.id;

        this.departmentService.updateCourse(this.editingDepartmentId, courseId, payload).subscribe({
          next: (response) => {
            console.log('Course updated:', response);
            alert('Course updated successfully!');
            this.coursesArray.at(this.editingCourseIndex!).patchValue({
              title: response.course.course_title,
              duration: response.course.duration_in_month_or_years,
              intake: response.course.intake_capacity,
              id: response.course.id,
            });
            this.editingCourseIndex = null;
            this.resetCourseForm();
            this.updateAvailableCourses();
            this.fetchDepartments();
          },
          error: (error) => {
            console.error('Error updating course:', error);
            alert('Failed to update course');
          },
        });
      } else {
        this.departmentService.createCourse(this.editingDepartmentId, payload).subscribe({
          next: (response) => {
            console.log('Course created:', response);
            alert('Course added successfully!');
            this.coursesArray.push(
              this.fb.group({
                title: response.course.course_title,
                duration: response.course.duration_in_month_or_years,
                intake: response.course.intake_capacity,
                id: response.course.id,
              })
            );
            this.resetCourseForm();
            this.updateAvailableCourses();
            this.fetchDepartments();
          },
          error: (error) => {
            console.error('Error creating course:', error);
            alert('Failed to add course');
          },
        });
      }
    }
  }

  editCourseFromDepartment(index: number) {
    this.editingCourseIndex = index;
    const courseData = this.coursesArray.at(index).value;
    this.courseForm.patchValue(courseData);
    this.courseFormTouched = false;

    const tabContent = document.querySelector('.tab-content');
    if (tabContent) {
      tabContent.scrollTop = 0;
    }
  }

  removeCourseFromDepartment(index: number) {
    if (confirm('Are you sure you want to remove this course?')) {
      if (!this.editingDepartmentId) {
        this.coursesArray.removeAt(index);
      } else {
        const courseId = this.coursesArray.at(index).value.id;

        this.departmentService.deleteCourse(this.editingDepartmentId, courseId).subscribe({
          next: (response) => {
            console.log('Course deleted:', response);
            alert('Course deleted successfully!');
            this.coursesArray.removeAt(index);
            this.updateAvailableCourses();
            this.fetchDepartments();
          },
          error: (error) => {
            console.error('Error deleting course:', error);
            alert('Failed to delete course');
          },
        });
      }

      if (this.editingCourseIndex === index) {
        this.resetCourseForm();
      } else if (this.editingCourseIndex !== null && this.editingCourseIndex > index) {
        this.editingCourseIndex--;
      }

      if (!this.editingDepartmentId) {
        this.updateAvailableCourses();
      }
    }
  }

  cancelEditCourse() {
    this.resetCourseForm();
  }

  resetCourseForm() {
    this.courseForm.reset({
      title: '',
      duration: '',
      intake: '',
    });
    this.courseForm.markAsUntouched();
    this.courseForm.markAsPristine();
    Object.keys(this.courseForm.controls).forEach((key) => {
      const control = this.courseForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
      control?.markAsPristine();
    });
    this.courseFormTouched = false;
    this.editingCourseIndex = null;

    this.courseFormResetTrigger = !this.courseFormResetTrigger;
  }

  addValueAddedProgramToDepartment() {
    if (this.valueAddedProgramForm.invalid) {
      this.valueAddedProgramFormTouched = true;
      this.valueAddedProgramForm.markAllAsTouched();
      return;
    }

    const vapData = this.valueAddedProgramForm.value;

    if (!this.editingDepartmentId) {
      if (this.editingValueAddedProgramIndex !== null) {
        this.valueAddedProgramsArray.at(this.editingValueAddedProgramIndex).patchValue(vapData);
        this.editingValueAddedProgramIndex = null;
      } else {
        this.valueAddedProgramsArray.push(this.fb.group(vapData));
      }
      this.resetValueAddedProgramForm();
    } else {
      const payload = {
        value_added_program_title: vapData.title,
        co_ordinator_name: vapData.co_ordinator,
        duration_in_months: vapData.duration,
        intake_capacity: vapData.intake,
      };

      if (this.editingValueAddedProgramIndex !== null) {
        const programId = this.valueAddedProgramsArray.at(this.editingValueAddedProgramIndex).value
          .id;

        if (!programId) {
          console.error('Program ID not found');
          alert('Cannot update: Program ID is missing');
          return;
        }

        this.departmentService
          .updateValueAddedProgram(this.editingDepartmentId, programId, payload)
          .subscribe({
            next: (response) => {
              console.log('Value Added Program updated:', response);

              this.valueAddedProgramsArray.at(this.editingValueAddedProgramIndex!).patchValue({
                id: response.value_added_program?.id || programId,
                title: response.value_added_program?.value_added_program_title || vapData.title,
                co_ordinator:
                  response.value_added_program?.co_ordinator_name || vapData.co_ordinator,
                duration: response.value_added_program?.duration_in_months || vapData.duration,
                intake: response.value_added_program?.intake_capacity || vapData.intake,
              });

              this.editingValueAddedProgramIndex = null;
              this.resetValueAddedProgramForm();

              alert('Value Added Program updated successfully!');
            },
            error: (error) => {
              console.error('Error updating value added program:', error);
              alert('Failed to update value added program');
            },
          });
      } else {
        this.departmentService
          .createValueAddedProgram(this.editingDepartmentId, payload)
          .subscribe({
            next: (response) => {
              console.log('Value Added Program created:', response);

              this.valueAddedProgramsArray.push(
                this.fb.group({
                  id: response.value_added_program?.id || response.id,
                  title: response.value_added_program?.value_added_program_title || vapData.title,
                  co_ordinator:
                    response.value_added_program?.co_ordinator_name || vapData.co_ordinator,
                  duration: response.value_added_program?.duration_in_months || vapData.duration,
                  intake: response.value_added_program?.intake_capacity || vapData.intake,
                })
              );

              this.resetValueAddedProgramForm();
              alert('Value Added Program added successfully!');
            },
            error: (error) => {
              console.error('Error creating value added program:', error);
              alert('Failed to add value added program');
            },
          });
      }
    }
  }

  editValueAddedProgramFromDepartment(index: number) {
    this.editingValueAddedProgramIndex = index;
    const vapData = this.valueAddedProgramsArray.at(index).value;
    this.valueAddedProgramForm.patchValue(vapData);
    this.valueAddedProgramFormTouched = false;

    const tabContent = document.querySelector('.tab-content');
    if (tabContent) {
      tabContent.scrollTop = 0;
    }
  }

  removeValueAddedProgramFromDepartment(index: number) {
    if (confirm('Are you sure you want to remove this value added program?')) {
      if (!this.editingDepartmentId) {
        this.valueAddedProgramsArray.removeAt(index);
      } else {
        const programId = this.valueAddedProgramsArray.at(index).value.id;

        this.departmentService
          .deleteValueAddedProgram(this.editingDepartmentId, programId)
          .subscribe({
            next: (response) => {
              console.log('Value Added Program deleted:', response);
              alert('Value Added Program deleted successfully!');
              this.valueAddedProgramsArray.removeAt(index);
              this.fetchDepartments();
            },
            error: (error) => {
              console.error('Error deleting value added program:', error);
              alert('Failed to delete value added program');
            },
          });
      }

      if (this.editingValueAddedProgramIndex === index) {
        this.resetValueAddedProgramForm();
      } else if (
        this.editingValueAddedProgramIndex !== null &&
        this.editingValueAddedProgramIndex > index
      ) {
        this.editingValueAddedProgramIndex--;
      }
    }
  }

  cancelEditValueAddedProgram() {
    this.resetValueAddedProgramForm();
  }

  resetValueAddedProgramForm() {
    this.valueAddedProgramForm.reset({
      title: '',
      co_ordinator: '',
      duration: 0,
      intake: 0,
    });
    this.valueAddedProgramForm.markAsUntouched();
    this.valueAddedProgramForm.markAsPristine();
    Object.keys(this.valueAddedProgramForm.controls).forEach((key) => {
      const control = this.valueAddedProgramForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
      control?.markAsPristine();
    });
    this.valueAddedProgramFormTouched = false;
    this.editingValueAddedProgramIndex = null;

    this.valueaddedprogramFormResetTrigger = !this.valueaddedprogramFormResetTrigger;
  }

  validateCurrentTab(): boolean {
    if (this.activeTab === 'about') {
      const nameControl = this.departmentForm.get('name');
      return nameControl?.valid || false;
    }

    if (this.activeTab === 'hod') {
      const hodGroup = this.departmentForm.get('hod') as FormGroup;
      return (
        (hodGroup?.get('name')?.valid &&
          hodGroup?.get('qualification')?.valid &&
          hodGroup?.get('description')?.valid) ||
        false
      );
    }

    return true;
  }

  saveCurrentProgress() {
    if (!this.validateCurrentTab()) {
      this.markCurrentTabAsTouched();
      const tabContent = document.querySelector('.tab-content');
      if (tabContent) {
        tabContent.scrollTop = 0;
      }
      return;
    }

    if (this.isEditMode && this.editingDepartmentId) {
      this.updateDepartment();
    } else {
      this.createOrUpdateDepartment();
    }

    this.closeForm();
  }

  saveAndNext() {
    if (!this.validateCurrentTab()) {
      this.markCurrentTabAsTouched();
      const tabContent = document.querySelector('.tab-content');
      if (tabContent) {
        tabContent.scrollTop = 0;
      }
      return;
    }

    const tabs: ('about' | 'hod' | 'course' | 'faculty' | 'valueaddedprogram')[] = [
      'about',
      'hod',
      'course',
      'faculty',
      'valueaddedprogram',
    ];

    const currentIndex = tabs.indexOf(this.activeTab);
    if (currentIndex < tabs.length - 1) {
      this.setActiveTab(tabs[currentIndex + 1]);
    } else {
      this.saveDepartment();
    }

    const tabContent = document.querySelector('.tab-content');
    if (tabContent) {
      tabContent.scrollTop = 0;
    }
  }

  saveDepartment() {
    const nameControl = this.departmentForm.get('name');
    if (!nameControl?.valid) {
      alert('Please enter Department Name in the About section');
      this.setActiveTab('about');
      nameControl?.markAsTouched();
      return;
    }

    if (this.isEditMode && this.editingDepartmentId) {
      this.updateDepartment();
    } else {
      this.createOrUpdateDepartment();
    }
    this.closeForm();
  }

  markCurrentTabAsTouched() {
    if (this.activeTab === 'about') {
      this.departmentForm.get('name')?.markAsTouched();
    } else if (this.activeTab === 'hod') {
      const hodGroup = this.departmentForm.get('hod') as FormGroup;
      hodGroup.get('name')?.markAsTouched();
      hodGroup.get('qualification')?.markAsTouched();
      hodGroup.get('description')?.markAsTouched();
    }
  }

  createOrUpdateDepartment() {
    const formValue = this.departmentForm.value;
    const formData = new FormData();

    if (this.isEditMode && this.editingDepartmentId) {
      console.log('UPDATE MODE - Detecting changes...');

      formData.append('_method', 'PUT');

      if (formValue.name !== this.originalFormValues.name) {
        formData.append('department_name', formValue.name);
      }
      if (formValue.tagline !== this.originalFormValues.tagline) {
        formData.append('tagline', formValue.tagline || '');
      }
      if (formValue.about !== this.originalFormValues.about) {
        formData.append('about', formValue.about || '');
      }
      if (formValue.isActive !== this.originalFormValues.isActive) {
        formData.append('status', formValue.isActive ? 'active' : 'inactive');
      }

      if (formValue.hod?.name !== this.originalFormValues.hod?.name) {
        formData.append('hod_name', formValue.hod?.name || '');
      }
      if (formValue.hod?.qualification !== this.originalFormValues.hod?.qualification) {
        formData.append('hod_qualification', formValue.hod?.qualification || '');
      }
      if (formValue.hod?.description !== this.originalFormValues.hod?.description) {
        formData.append('hod_description', formValue.hod?.description || '');
      }
      if (this.hodPhotoFile) {
        formData.append('hod_photo', this.hodPhotoFile);
      }

      if (this.deletedDeptImageIds.length > 0) {
        formData.append('deleted_image_ids', JSON.stringify(this.deletedDeptImageIds));
      }

      if (this.pendingDeptImageChanges.size > 0) {
        this.pendingDeptImageChanges.forEach((file, index) => {
          const imageId = this.originalDeptImages[index]?.id;

          if (imageId) {
            formData.append(`replaced_image_ids[]`, imageId.toString());
            formData.append(`replaced_image_files[]`, file);
          }
        });
      }

      if (this.deptImageFiles.length > 0) {
        this.deptImageFiles.forEach((file) => {
          formData.append('dept_images[]', file);
        });
      }
      for (let pair of (formData as any).entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      this.departmentService.updateDepartment(this.editingDepartmentId, formData).subscribe({
        next: (response) => {
          console.log('Department updated successfully:', response);
          alert('Department updated successfully!');
          this.closeForm();
          this.fetchDepartments();
        },
        error: (error) => {
          console.error('Error updating department:', error);
          console.error('Error details:', error.error);
          alert('Failed to update department. Check console for details.');
        },
      });
    } else {
      console.log('CREATE MODE');

      formData.append('department_name', formValue.name);
      formData.append('tagline', formValue.tagline || '');
      formData.append('about', formValue.about || '');
      formData.append('status', formValue.isActive ? 'active' : 'inactive');

      formData.append('hod_name', formValue.hod?.name || '');
      formData.append('hod_qualification', formValue.hod?.qualification || '');
      formData.append('hod_description', formValue.hod?.description || '');

      if (this.hodPhotoFile) {
        formData.append('hod_photo', this.hodPhotoFile);
      }

      this.deptImageFiles.forEach((file) => {
        formData.append('dept_images[]', file);
      });

      this.facultyPhotoFiles.forEach((file, index) => {
        if (file) {
          formData.append(`faculty_photos[${index}]`, file);
        }
      });

      formData.append('previous_hods', JSON.stringify(formValue.hod?.previousHods || []));
      formData.append('faculty', JSON.stringify(formValue.faculty || []));
      formData.append('courses', JSON.stringify(formValue.courses || []));
      formData.append('value_added_programs', JSON.stringify(formValue.valueaddedprogram || []));

      this.departmentService.createDepartment(formData).subscribe({
        next: (response) => {
          console.log('Department created successfully:', response);
          alert('Department created successfully!');
          this.closeForm();
          this.fetchDepartments();
        },
        error: (error) => {
          console.error('Error creating department:', error);
          console.error('Error details:', error.error);
          alert('Something went wrong while creating the department. Check console for details.');
        },
      });
    }
  }

  fetchDepartments() {
    this.departmentService.getDepartments().subscribe({
      next: (data: any) => {
        this.departments = data.departments || [];
        console.log('Departments fetched:', this.departments);
      },
      error: (err) => {
        console.error('Error fetching departments', err);
      },
    });
  }

  updateDepartment() {
    this.createOrUpdateDepartment();
  }

  onDepartmentImagesSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (this.selectedDeptImageIndex !== null) {
        const currentImages = this.departmentForm.get('images')?.value || [];

        if (this.isEditMode && this.selectedDeptImageIndex < this.originalDeptImages.length) {
          this.pendingDeptImageChanges.set(this.selectedDeptImageIndex, file);
        } else {
          const adjustedIndex = this.selectedDeptImageIndex - this.originalDeptImages.length;
          this.deptImageFiles[adjustedIndex] = file;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          currentImages[this.selectedDeptImageIndex!] = e.target.result;
          this.departmentForm.patchValue({ images: currentImages });
          this.selectedDeptImageIndex = null;
        };
        reader.readAsDataURL(file);
      } else {
        this.deptImageFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          const currentImages = this.departmentForm.get('images')?.value || [];
          currentImages.push(e.target.result);
          this.departmentForm.patchValue({ images: currentImages });
        };
        reader.readAsDataURL(file);
      }
    }
    event.target.value = '';
  }

  editDepartmentImage(index: number): void {
    this.selectedDeptImageIndex = index;
    const fileInput = document.getElementById('departmentImages') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  removeDepartmentImage(index: number) {
    if (confirm('Are you sure you want to remove this image?')) {
      const currentImages = this.departmentForm.get('images')?.value || [];

      if (this.isEditMode && index < this.originalDeptImages.length) {
        const imageId = this.originalDeptImages[index].id;

        if (!this.pendingDeptImageChanges.has(index)) {
          if (!this.deletedDeptImageIds.includes(imageId)) {
            this.deletedDeptImageIds.push(imageId);
          }
        } else {
          this.pendingDeptImageChanges.delete(index);
        }
      } else {
        const adjustedIndex = index - this.originalDeptImages.length;
        this.deptImageFiles.splice(adjustedIndex, 1);
      }

      currentImages.splice(index, 1);
      this.departmentForm.patchValue({ images: currentImages });

      if (this.selectedDeptImageIndex === index) {
        this.selectedDeptImageIndex = null;
      }
    }
  }

  onHodPhotoSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.hodPhotoFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.departmentForm.get('hod.photo')?.patchValue(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeHodPhoto() {
    this.departmentForm.get('hod.photo')?.patchValue(null);
    this.hodPhotoFile = null;
    const hodPhotoInput = document.getElementById('hodPhoto') as HTMLInputElement;
    if (hodPhotoInput) {
      hodPhotoInput.value = '';
    }
  }

  onFacultyPhotoSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const currentIndex =
        this.editingFacultyIndex !== null ? this.editingFacultyIndex : this.facultyArray.length;

      if (!this.facultyPhotoFiles) {
        this.facultyPhotoFiles = [];
      }
      this.facultyPhotoFiles[currentIndex] = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.facultyForm.patchValue({ photo: e.target.result });
      };
      reader.readAsDataURL(file);

      console.log(`Faculty photo stored at index ${currentIndex}:`, file.name);
    }
  }

  removeFacultyPhoto() {
    this.facultyForm.patchValue({ photo: null });
    const facultyPhotoInput = document.getElementById('facultyPhoto') as HTMLInputElement;
    if (facultyPhotoInput) {
      facultyPhotoInput.value = '';
    }
  }

  editDepartment(department: Department) {
    const imageUrls =
      department.images?.map((img) => `http://localhost:8000/storage/${img.image_path}`) || [];

    this.originalDeptImages = department.images || [];
    this.deletedDeptImageIds = [];
    this.pendingDeptImageChanges.clear();

    this.departmentForm.patchValue({
      id: department.id,
      name: department.department_name,
      tagline: department.tagline,
      about: department.about,
      images: imageUrls,
      isActive: department.status === 'active',
      hod: department.hod
        ? {
            name: department.hod.hod_name,
            qualification: department.hod.qualification,
            description: department.hod.description,
            photo: department.hod.photo
              ? `http://localhost:8000/storage/${department.hod.photo}`
              : null,
          }
        : {
            name: '',
            qualification: '',
            description: '',
            photo: null,
          },
    });

    this.facultyArray.clear();
    (department.faculties || []).forEach((f, index) => {
      this.facultyArray.push(
        this.fb.group({
          id: f.id,
          name: f.faculty_name,
          email: f.faculty_email,
          dob: f.faculty_dob,
          industrialExp: f.faculty_industrial_exp,
          teachingExp: f.faculty_teaching_exp,
          courseTaught: f.course_taught,
          designation: f.designation,
          joiningDate: f.faculty_joining_date,
          qualification: f.qualification,
          photo: f.faculty_photo ? `http://localhost:8000/storage/${f.faculty_photo}` : null,
          natureOfAssociation: f.nature_of_association,
          achievements: f.achievements,
          additionalInfo: f.additional_info,
        })
      );

      this.facultyPhotoFiles[index] = null;
    });

    this.coursesArray.clear();
    (department.courses || []).forEach((c) => {
      this.coursesArray.push(
        this.fb.group({
          id: c.id,
          title: c.course_title,
          duration: c.duration_in_month_or_years,
          intake: c.intake_capacity,
        })
      );
    });

    this.valueAddedProgramsArray.clear();
    (department.value_added_programs || []).forEach((v) => {
      this.valueAddedProgramsArray.push(
        this.fb.group({
          id: v.id,
          title: v.value_added_program_title,
          co_ordinator: v.co_ordinator_name,
          duration: v.duration_in_months,
          intake: v.intake_capacity,
        })
      );
    });

    this.previousHodsArray.clear();
    if (department.previous_hods) {
      department.previous_hods.forEach((h) => {
        this.previousHodsArray.push(
          this.fb.group({
            id: h.id,
            name: h.previous_hod_name,
            tenure: h.previous_hod_tenure,
          })
        );
      });
    }

    this.updateAvailableCourses();

    this.originalFormValues = JSON.parse(JSON.stringify(this.departmentForm.value));
    console.log('Original form values stored:', this.originalFormValues);

    this.isEditMode = true;
    this.editingDepartmentId = department.id;
    this.showForm = true;
    this.activeTab = 'about';
  }

  deleteDepartment(id: number) {
    this.openDeleteModal(id);
  }

  openDeleteModal(id: number) {
    this.departmentToDelete = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.departmentToDelete = null;
  }

  confirmDelete() {
    if (this.departmentToDelete !== null) {
      this.departmentService.deleteDepartment(this.departmentToDelete).subscribe({
        next: (response) => {
          console.log('Department deleted successfully:', response);
          alert('Department deleted successfully!');
          this.fetchDepartments();
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('Error deleting department:', error);
          alert('Failed to delete department.');
        },
      });
    }
  }

  generateId(): string {
    return 'dept_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getDateInputStyles() {
    return {
      'color-scheme': this.currentTheme === 'dark' ? 'dark' : 'light',
    };
  }

  getFacultyCount(department: Department): number {
    return department.faculties?.length || 0;
  }

  getFacultyArrayStatus() {
    console.log('Faculty Array Length:', this.facultyArray.length);
    console.log('Faculty Array Contents:', this.facultyArray.value);
    console.log('Selected Courses:', this.selectedFacultyCourses);
    console.log('Faculty Form Valid:', this.facultyForm.valid);
    console.log('Faculty Form Errors:', this.facultyForm.errors);
  }

  isInvalid(formPath: string): boolean {
    const field = this.departmentForm.get(formPath);
    return field ? field.invalid && field.touched : false;
  }

  isPreviousHodInvalid(fieldName: string): boolean {
    if (!this.previousHodFormTouched) return false;
    const field = this.previousHodForm.get(fieldName);
    return field ? field.invalid : false;
  }

  isFacultyInvalid(fieldName: string): boolean {
    if (!this.facultyFormTouched) return false;
    const field = this.facultyForm.get(fieldName);
    return field ? field.invalid : false;
  }

  isCourseInvalid(fieldName: string): boolean {
    if (!this.courseFormTouched) return false;
    const field = this.courseForm.get(fieldName);
    return field ? field.invalid : false;
  }

  isValueAddedProgramInvalid(fieldName: string): boolean {
    if (!this.valueAddedProgramFormTouched) return false;
    const field = this.valueAddedProgramForm.get(fieldName);
    return field ? field.invalid : false;
  }
}
