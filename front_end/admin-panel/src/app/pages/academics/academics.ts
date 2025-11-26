import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { InputField } from '../../shared-component/input-field/input-field';
import { AcademicService } from '../../services/academics/academic-service';

interface Category {
  id: number;
  title: string;
}

interface Program {
  id: number;
  programTitle: string;
  categoryTitle: string;
  categoryId: number;
}

interface CurriculumRecord {
  id: number;
  programId: number;
  programTitle: string;
  categoryTitle: string;
  categoryId: number;
  session: string;
  year: string;
  pdf: File | null;
  pdfPreview: string | null;
}

interface CalendarItem {
  id: number;
  title: string;
  year: string;
  pdf: File | null;
  pdfPreview: string | null;
}

interface SurveyItem {
  id: number;
  title: string;
  year: string;
  pdf: File | null;
  pdfPreview: string | null;
}

@Component({
  selector: 'app-academics',
  imports: [CommonModule, ReactiveFormsModule, InputField],
  templateUrl: './academics.html',
  styleUrl: './academics.scss',
})
export class Academics implements OnInit {
  activeMainTab: string = 'curriculum';
  showForm: boolean = false;
  isEditMode: boolean = false;
  editingId: number | null = null;
  editingIndex: number | null = null;

  showCategoryForm: boolean = false;
  showProgramForm: boolean = false;
  isEditCategoryMode: boolean = false;
  isEditProgramMode: boolean = false;
  editingCategoryId: number | null = null;
  editingProgramId: number | null = null;

  categories: Category[] = [];
  programs: Program[] = [];

  showDeleteModal = false;
  curriculumToDelete: number | null = null;
  calendarToDelete: number | null = null;
  surveyToDelete: number | null = null;

  isLoading: boolean = false;
  isSaving: boolean = false;

  private originalCategoryValue: any = null;
  private originalProgramValue: any = null;
  private originalCurriculumValue: any = null;
  private originalAcademicValue: any = null;

  sessions: string[] = [
    'Session 1',
    'Session 2',
    'Session 3',
    'Session 4',
    'Session 5',
    'Session 6',
    'Session 7',
    'Session 8',
  ];

  categoryForm!: FormGroup;
  programForm!: FormGroup;
  curriculumFormGroup!: FormGroup;
  academicFormGroup!: FormGroup;
  selectionForm!: FormGroup;
  currentItemForm!: FormGroup;

  curriculumPdfFile: File | null = null;
  curriculumPdfPreview: string | null = null;
  academicPdfFile: File | null = null;
  academicPdfPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private academicService: AcademicService
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.loadCategories();
    this.loadPrograms();
    this.loadCurriculums();
    this.loadAcademics();
    this.loadSurveys();
  }

  loadCategories(): void {
    this.academicService.getCategories().subscribe({
      next: (response) => {
        const rawCategories = response.data || response;

        this.categories = rawCategories.map((cat: any) => ({
          id: cat.id,
          title: cat.category_title || cat.title,
        }));
        console.log('Categories loaded:', this.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        alert('Failed to load categories');
      },
    });
  }

  loadPrograms(): void {
    this.academicService.getPrograms().subscribe({
      next: (response) => {
        const rawPrograms = response.data || response;

        this.programs = rawPrograms.map((prog: any) => ({
          id: prog.id,
          programTitle: prog.program_title || prog.programTitle,
          categoryTitle: prog.category_title || prog.categoryTitle,
          categoryId: prog.category_id || prog.categoryId,
        }));
        console.log('Programs loaded:', this.programs);
      },
      error: (error) => {
        console.error('Error loading programs:', error);
        alert('Failed to load programs');
      },
    });
  }

  loadCurriculums(): void {
    this.academicService.getCurriculums().subscribe({
      next: (response) => {
        const curriculums = response.data || response;
        this.curriculumArray.clear();
        curriculums.forEach((curriculum: any) => {
          this.addCurriculumToArray(this.mapCurriculumFromAPI(curriculum));
        });
        console.log('Curriculums loaded:', curriculums);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading curriculums:', error);
        this.isLoading = false;
      },
    });
  }

  loadAcademics(): void {
    this.academicService.getAcademics().subscribe({
      next: (response) => {
        const academics = response.data || response;
        this.academicArray.clear();
        academics.forEach((item: any) => {
          this.addAcademicToArray(this.mapAcademicFromAPI(item));
        });
        console.log('Academics loaded:', academics);
      },
      error: (error) => {
        console.error('Error loading academics:', error);
      },
    });
  }

  loadSurveys(): void {
    this.academicService.getSurveys().subscribe({
      next: (response) => {
        const surveys = response.data || response;
        if (this.activeMainTab === 'survey') {
          this.academicArray.clear();
        }
        surveys.forEach((survey: any) => {
          if (this.activeMainTab === 'survey') {
            this.addAcademicToArray(this.mapSurveyFromAPI(survey));
          }
        });
        console.log('Surveys loaded:', surveys);
      },
      error: (error) => {
        console.error('Error loading surveys:', error);
      },
    });
  }

  mapCurriculumFromAPI(data: any): CurriculumRecord {
    return {
      id: data.id,
      programId: data.programId || data.program_id,
      programTitle: data.program?.program_title || '',
      categoryTitle: data.category?.category_title || '',
      categoryId: data.categoryId || data.category_id,
      session: data.session,
      year: data.year,
      pdf: null,
      pdfPreview:
        data.pdfpath || data.pdf_path ? `http://localhost:8000/storage/${data.pdf_path}` : null,
    };
  }

  mapAcademicFromAPI(data: any): CalendarItem {
    return {
      id: data.id,
      title: data.calendar_title || data.title,
      year: data.year,
      pdf: null,
      pdfPreview:
        data.pdfpath || data.pdf_path ? `http://localhost:8000/storage/${data.pdf_path}` : null,
    };
  }

  mapSurveyFromAPI(data: any): SurveyItem {
    return {
      id: data.id,
      title: data.survey_title || data.title,
      year: data.year,
      pdf: null,
      pdfPreview:
        data.pdf_path || data.pdfpath
          ? `http://localhost:8000/storage/${data.pdf_path || data.pdfpath}`
          : null,
    };
  }

  initializeForms() {
    this.selectionForm = this.fb.group({
      selectedCategoryId: [null],
      selectedProgramId: [null],
    });

    this.categoryForm = this.fb.group({
      title: ['', Validators.required],
    });

    this.programForm = this.fb.group({
      programTitle: ['', Validators.required],
      categoryTitle: [''],
      categoryId: [null],
    });

    this.curriculumFormGroup = this.fb.group({
      curriculumArray: this.fb.array([]),
    });

    this.academicFormGroup = this.fb.group({
      academicArray: this.fb.array([]),
    });

    this.currentItemForm = this.fb.group({
      session: [''],
      year: ['', Validators.required],
      title: ['', Validators.required],
    });
  }

  get curriculumArray(): FormArray {
    return this.curriculumFormGroup.get('curriculumArray') as FormArray;
  }

  get academicArray(): FormArray {
    return this.academicFormGroup.get('academicArray') as FormArray;
  }

  createCurriculumFormGroup(data?: CurriculumRecord): FormGroup {
    return this.fb.group({
      id: [data?.id || Date.now()],
      programId: [data?.programId || null, Validators.required],
      programTitle: [data?.programTitle || ''],
      categoryTitle: [data?.categoryTitle || ''],
      categoryId: [data?.categoryId || null],
      session: [data?.session || '', Validators.required],
      year: [data?.year || '', Validators.required],
      pdf: [data?.pdf || null],
      pdfPreview: [data?.pdfPreview || null],
    });
  }

  createAcademicFormGroup(data?: CalendarItem | SurveyItem): FormGroup {
    return this.fb.group({
      id: [data?.id || Date.now()],
      title: [data?.title || '', Validators.required],
      year: [data?.year || '', Validators.required],
      pdf: [data?.pdf || null],
      pdfPreview: [data?.pdfPreview || null],
    });
  }

  addCurriculumToArray(data?: CurriculumRecord): void {
    this.curriculumArray.push(this.createCurriculumFormGroup(data));
  }

  addAcademicToArray(data?: CalendarItem | SurveyItem): void {
    this.academicArray.push(this.createAcademicFormGroup(data));
  }

  removeCurriculumFromArray(index: number): void {
    this.curriculumArray.removeAt(index);
  }

  removeAcademicFromArray(index: number): void {
    this.academicArray.removeAt(index);
  }

  getSafeUrl(url: string | null): SafeResourceUrl | null {
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  get selectedCategoryId(): number | null {
    return this.selectionForm.get('selectedCategoryId')?.value;
  }

  get selectedProgramId(): number | null {
    return this.selectionForm.get('selectedProgramId')?.value;
  }

  openForm(): void {
    this.showForm = true;
    this.isEditMode = false;
    this.editingId = null;
    this.editingIndex = null;

    if (this.activeMainTab === 'curriculum') {
      this.selectionForm.reset({
        selectedCategoryId: null,
        selectedProgramId: null,
      });
      this.selectionForm.get('selectedProgramId')?.disable();
      this.currentItemForm.patchValue({
        session: '',
        year: '',
        title: '',
      });
      this.curriculumPdfFile = null;
      this.curriculumPdfPreview = null;
    } else {
      this.currentItemForm.patchValue({
        session: '',
        year: '',
        title: '',
      });
      this.academicPdfFile = null;
      this.academicPdfPreview = null;
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editingId = null;
    this.editingIndex = null;
    this.resetCurrentForm();
  }

  resetCurrentForm(): void {
    this.currentItemForm.reset();
    this.selectionForm.reset({
      selectedCategoryId: null,
      selectedProgramId: null,
    });

    this.curriculumPdfFile = null;
    this.curriculumPdfPreview = null;
    this.academicPdfFile = null;
    this.academicPdfPreview = null;
  }

  openCategoryForm(): void {
    this.showCategoryForm = true;
    this.isEditCategoryMode = false;
    this.editingCategoryId = null;
    this.originalCategoryValue = null;
    this.categoryForm.reset();
  }

  closeCategoryForm(): void {
    this.showCategoryForm = false;
    this.isEditCategoryMode = false;
    this.editingCategoryId = null;
    this.originalCategoryValue = null;
    this.categoryForm.reset();
  }

  onEditCategory(category: Category): void {
    this.originalCategoryValue = { ...category };
    this.showCategoryForm = true;
    this.isEditCategoryMode = true;
    this.editingCategoryId = category.id;

    this.categoryForm.patchValue({
      title: category.title,
    });
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formdata = new FormData();
    const title = this.categoryForm.value.title;

    if (this.isEditCategoryMode && this.editingCategoryId !== null) {
      if (this.originalCategoryValue.title !== title) {
        formdata.append('category_title', title);
      }

      formdata.append('_method', 'PUT');

      this.academicService.updateCategory(this.editingCategoryId, formdata).subscribe({
        next: (response) => {
          const updatedData = response.data;
          const index = this.categories.findIndex((c) => c.id === this.editingCategoryId);

          if (index !== -1 && updatedData.category_title !== undefined) {
            this.categories[index].title = updatedData.category_title;
          }

          this.closeCategoryForm();
          this.isSaving = false;
          alert('Category updated successfully');
        },
        error: (error) => {
          console.error('Error updating category:', error);
          alert('Failed to update category');
          this.isSaving = false;
        },
      });
    } else {
      formdata.append('category_title', title);

      this.academicService.createCategory(formdata).subscribe({
        next: (response) => {
          const newCategory: Category = {
            id: response.data?.id || response.id,
            title: response.data?.category_title || response.category_title,
          };

          this.categories.push(newCategory);
          this.selectionForm.patchValue({ selectedCategoryId: newCategory.id });
          this.closeCategoryForm();
          this.isSaving = false;
          alert('Category created successfully');
        },
        error: (error) => {
          console.error('Error creating category:', error);
          alert('Failed to create category');
          this.isSaving = false;
        },
      });
    }
  }

  onCategoryChange(event: any): void {
    const programControl = this.selectionForm.get('selectedProgramId');

    if (this.selectedCategoryId) {
      programControl?.enable();
    } else {
      programControl?.disable();
    }
    this.selectionForm.patchValue({ selectedProgramId: null });
    this.currentItemForm.patchValue({ session: '', year: '' });
    this.curriculumPdfFile = null;
    this.curriculumPdfPreview = null;
  }

  getSelectedCategory(): Category | null {
    const categoryId = this.selectedCategoryId;
    if (!categoryId) return null;
    const numericId = Number(categoryId);
    return this.categories.find((cat) => cat.id === numericId) || null;
  }

  getFilteredPrograms(): Program[] {
    const categoryId = this.selectedCategoryId;
    if (!categoryId) return [];

    const numericId = Number(categoryId);
    return this.programs.filter((p) => p.categoryId === numericId);
  }

  openProgramForm(): void {
    const categoryId = this.selectedCategoryId;
    if (!categoryId) {
      alert('Please select a category first!');
      return;
    }

    const selectedCategory = this.getSelectedCategory();
    if (!selectedCategory) {
      alert('Selected category not found!');
      return;
    }

    this.showProgramForm = true;
    this.isEditProgramMode = false;
    this.editingProgramId = null;
    this.originalProgramValue = null;

    this.programForm.patchValue({
      programTitle: '',
      categoryTitle: selectedCategory.title,
      categoryId: selectedCategory.id,
    });
    this.programForm.get('categoryTitle')?.disable();
  }

  closeProgramForm(): void {
    this.showProgramForm = false;
    this.isEditProgramMode = false;
    this.editingProgramId = null;
    this.originalProgramValue = null;
    this.programForm.reset();
  }

  onEditProgram(program: Program): void {
    this.originalProgramValue = { ...program };
    this.showProgramForm = true;
    this.isEditProgramMode = true;
    this.editingProgramId = program.id;

    this.programForm.patchValue({
      programTitle: program.programTitle,
      categoryTitle: program.categoryTitle,
      categoryId: program.categoryId,
    });
    this.programForm.get('categoryTitle')?.disable();
  }

  addProgram(): void {
    if (this.programForm.invalid) {
      this.programForm.markAllAsTouched();
      return;
    }

    const formValue = this.programForm.getRawValue();
    this.isSaving = true;

    if (this.isEditProgramMode && this.editingProgramId !== null) {
      const formData = new FormData();

      if (this.originalProgramValue.programTitle !== formValue.programTitle) {
        formData.append('program_title', formValue.programTitle);
      }

      if (this.originalProgramValue.categoryId !== formValue.categoryId) {
        formData.append('category_id', formValue.categoryId.toString());
      }

      formData.append('_method', 'PUT');

      this.academicService.updateProgram(this.editingProgramId, formData).subscribe({
        next: (response) => {
          const updatedData = response.data;
          const index = this.programs.findIndex((p) => p.id === this.editingProgramId);

          if (index !== -1) {
            if (updatedData.program_title !== undefined) {
              this.programs[index].programTitle = updatedData.program_title;
            }
            if (updatedData.category !== undefined) {
              this.programs[index].categoryTitle = updatedData.category.category_title;
            }
            if (updatedData.category_id !== undefined) {
              this.programs[index].categoryId = updatedData.category_id;
            }
          }

          this.closeProgramForm();
          this.isSaving = false;
          alert('Program updated successfully!');
        },
        error: (error) => {
          console.error('Error updating program:', error);
          alert('Failed to update program');
          this.isSaving = false;
        },
      });
    } else {
      const formData = new FormData();
      formData.append('program_title', formValue.programTitle);
      formData.append('category_id', formValue.categoryId.toString());

      this.academicService.createProgram(formData).subscribe({
        next: (response) => {
          const data = response.data || response;

          const newProgram: Program = {
            id: data.id,
            programTitle: data.program_title,
            categoryTitle: data.category?.category_title || formValue.categoryTitle,
            categoryId: Number(data.category_id),
          };

          this.programs.push(newProgram);
          this.selectionForm.patchValue({ selectedProgramId: newProgram.id });
          this.closeProgramForm();
          this.isSaving = false;
          alert('Program created successfully!');
        },
        error: (error) => {
          console.error('Error creating program:', error);
          alert('Failed to create program');
          this.isSaving = false;
        },
      });
    }
  }

  onProgramSelect(event: any): void {
    this.currentItemForm.patchValue({ session: '', year: '' });
    this.curriculumPdfFile = null;
    this.curriculumPdfPreview = null;
  }

  saveCurriculum(): void {
    const programId = this.selectedProgramId;
    if (!programId) {
      alert('Please select a program');
      return;
    }

    const session = this.currentItemForm.get('session')?.value;
    const year = this.currentItemForm.get('year')?.value;

    if (!session || !year) {
      this.currentItemForm.markAllAsTouched();
      alert('Please fill in all required fields');
      return;
    }

    if (!this.curriculumPdfFile && !this.isEditMode) {
      alert('Please upload a PDF file');
      return;
    }

    const selectedProgram = this.programs.find((p) => p.id === programId);
    if (!selectedProgram) {
      alert('Selected program not found');
      return;
    }

    this.isSaving = true;

    if (this.isEditMode && this.editingId !== null) {
      const formData = new FormData();

      if (this.originalCurriculumValue.programId !== programId) {
        formData.append('program_id', programId.toString());
      }

      if (this.originalCurriculumValue.categoryId !== selectedProgram.categoryId) {
        formData.append('category_id', selectedProgram.categoryId.toString());
      }

      if (this.originalCurriculumValue.session !== session) {
        formData.append('session', session);
      }

      if (this.originalCurriculumValue.year !== year) {
        formData.append('year', year);
      }

      if (this.curriculumPdfFile) {
        formData.append('pdf_path', this.curriculumPdfFile);
      }

      formData.append('_method', 'PUT');

      this.academicService.updateCurriculum(this.editingId, formData).subscribe({
        next: (response) => {
          if (this.editingIndex !== null) {
            const formGroup = this.curriculumArray.at(this.editingIndex) as FormGroup;
            const updatedData = response.data;

            const updateFields: any = { id: updatedData.id };

            if (updatedData.program_id !== undefined)
              updateFields.programId = updatedData.program_id;
            if (updatedData.program?.program_title !== undefined)
              updateFields.programTitle = updatedData.program.program_title;
            if (updatedData.category?.category_title !== undefined)
              updateFields.categoryTitle = updatedData.category.category_title;
            if (updatedData.category_id !== undefined)
              updateFields.categoryId = updatedData.category_id;
            if (updatedData.session !== undefined) updateFields.session = updatedData.session;
            if (updatedData.year !== undefined) updateFields.year = updatedData.year;
            if (updatedData.pdf_path !== undefined) {
              updateFields.pdfPreview = `http://localhost:8000/storage/${updatedData.pdf_path}`;
            }

            formGroup.patchValue(updateFields);
          }
          this.closeForm();
          this.isSaving = false;
          alert('Curriculum updated successfully!');
        },
        error: (error) => {
          console.error('Error updating curriculum:', error);
          alert('Failed to update curriculum');
          this.isSaving = false;
        },
      });
    } else {
      const formData = new FormData();
      formData.append('program_id', programId.toString());
      formData.append('category_id', selectedProgram.categoryId.toString());
      formData.append('session', session);
      formData.append('year', year);

      if (this.curriculumPdfFile) {
        formData.append('pdf_path', this.curriculumPdfFile);
      }

      this.academicService.createCurriculum(formData).subscribe({
        next: (response) => {
          const createdData = response.data;
          const newRecord: CurriculumRecord = {
            id: createdData.id,
            programId: createdData.program_id,
            programTitle: createdData.program?.program_title || '',
            categoryTitle: createdData.category?.category_title || '',
            categoryId: createdData.category_id,
            session: createdData.session,
            year: createdData.year,
            pdf: null,
            pdfPreview: createdData.pdf_path
              ? `http://localhost:8000/storage/${createdData.pdf_path}`
              : null,
          };
          this.addCurriculumToArray(newRecord);
          this.closeForm();
          this.isSaving = false;
          alert('Curriculum created successfully!');
        },
        error: (error) => {
          console.error('Error creating curriculum:', error);
          alert('Failed to create curriculum');
          this.isSaving = false;
        },
      });
    }
  }

  onProgramFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.curriculumPdfFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.curriculumPdfPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid PDF file');
    }
    event.target.value = '';
  }

  onEditCurriculum(index: number): void {
    const formGroup = this.curriculumArray.at(index) as FormGroup;
    const curriculum = formGroup.value;

    // Store original values
    this.originalCurriculumValue = { ...curriculum };

    this.selectionForm.patchValue({
      selectedCategoryId: curriculum.categoryId,
      selectedProgramId: curriculum.programId,
    });
    this.selectionForm.get('selectedProgramId')?.enable();
    this.currentItemForm.patchValue({
      session: curriculum.session,
      year: curriculum.year,
    });

    this.curriculumPdfFile = curriculum.pdf;
    this.curriculumPdfPreview = curriculum.pdfPreview;

    this.editingId = curriculum.id;
    this.editingIndex = index;
    this.isEditMode = true;
    this.showForm = true;
  }

  onDeleteCurriculum(index: number): void {
    this.editingIndex = index;
    this.openDeleteModal(index);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.academicPdfFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.academicPdfPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid PDF file');
    }
    event.target.value = '';
  }

  saveAcademicRecord(): void {
    const title = this.currentItemForm.get('title')?.value;
    const year = this.currentItemForm.get('year')?.value;

    if (!title || !year) {
      this.currentItemForm.markAllAsTouched();
      alert('Please fill in all required fields');
      return;
    }

    if (!this.academicPdfFile && !this.isEditMode) {
      alert('Please upload a PDF file');
      return;
    }

    this.isSaving = true;
    const formData = new FormData();

    if (this.isEditMode && this.editingId !== null) {
      // Only send changed fields
      if (this.activeMainTab === 'survey') {
        if (this.originalAcademicValue.title !== title) {
          formData.append('survey_title', title);
        }
      } else {
        if (this.originalAcademicValue.title !== title) {
          formData.append('calendar_title', title);
        }
      }

      if (this.originalAcademicValue.year !== year) {
        formData.append('year', year);
      }

      if (this.academicPdfFile) {
        formData.append('pdf_path', this.academicPdfFile);
      }

      formData.append('_method', 'PUT');
    } else {
      if (this.activeMainTab === 'survey') {
        formData.append('survey_title', title);
      } else {
        formData.append('calendar_title', title);
      }

      formData.append('year', year);

      if (this.academicPdfFile) {
        formData.append('pdf_path', this.academicPdfFile);
      }
    }

    if (this.activeMainTab === 'survey') {
      this.saveSurvey(formData);
    } else {
      this.saveAcademic(formData);
    }
  }

  saveAcademic(formData: FormData): void {
    if (this.isEditMode && this.editingId !== null) {
      this.academicService.updateAcademic(this.editingId, formData).subscribe({
        next: (response) => {
          if (this.editingIndex !== null) {
            const formGroup = this.academicArray.at(this.editingIndex) as FormGroup;
            const updatedData = response.data;

            const updateFields: any = { id: updatedData.id };

            if (updatedData.calendar_title !== undefined)
              updateFields.title = updatedData.calendar_title;
            if (updatedData.year !== undefined) updateFields.year = updatedData.year;
            if (updatedData.pdf_path !== undefined) {
              updateFields.pdfPreview = `http://localhost:8000/storage/${updatedData.pdf_path}`;
            }

            formGroup.patchValue(updateFields);
          }
          this.closeForm();
          this.isSaving = false;
          alert('Academic calendar updated successfully!');
        },
        error: (error) => {
          console.error('Error updating academic calendar:', error);
          alert('Failed to update academic calendar');
          this.isSaving = false;
        },
      });
    } else {
      this.academicService.createAcademic(formData).subscribe({
        next: (response) => {
          const createdData = response.data;
          const newItem: CalendarItem = {
            id: createdData.id,
            title: createdData.calendar_title,
            year: createdData.year,
            pdf: null,
            pdfPreview: createdData.pdf_path
              ? `http://localhost:8000/storage/${createdData.pdf_path}`
              : null,
          };

          this.addAcademicToArray(newItem);
          this.closeForm();
          this.isSaving = false;
          alert('Academic calendar created successfully!');
        },
        error: (error) => {
          console.error('Error creating academic calendar:', error);
          alert('Failed to create academic calendar');
          this.isSaving = false;
        },
      });
    }
  }

  saveSurvey(formData: FormData): void {
    if (this.isEditMode && this.editingId !== null) {
      this.academicService.updateSurvey(this.editingId, formData).subscribe({
        next: (response) => {
          if (this.editingIndex !== null) {
            const formGroup = this.academicArray.at(this.editingIndex) as FormGroup;
            const updatedData = response.data;

            const updateFields: any = { id: updatedData.id };

            if (updatedData.survey_title !== undefined)
              updateFields.title = updatedData.survey_title;
            if (updatedData.year !== undefined) updateFields.year = updatedData.year;
            if (updatedData.pdf_path !== undefined) {
              updateFields.pdfPreview = `http://localhost:8000/storage/${updatedData.pdf_path}`;
            }

            formGroup.patchValue(updateFields);
          }
          this.closeForm();
          this.isSaving = false;
          alert('Survey updated successfully!');
        },
        error: (error) => {
          console.error('Error updating survey:', error);
          alert('Failed to update survey');
          this.isSaving = false;
        },
      });
    } else {
      this.academicService.createSurvey(formData).subscribe({
        next: (response) => {
          const createdData = response.data;
          const newItem: SurveyItem = {
            id: createdData.id,
            title: createdData.survey_title,
            year: createdData.year,
            pdf: null,
            pdfPreview: createdData.pdf_path
              ? `http://localhost:8000/storage/${createdData.pdf_path}`
              : null,
          };

          this.addAcademicToArray(newItem);
          this.closeForm();
          this.isSaving = false;
          alert('Survey created successfully!');
        },
        error: (error) => {
          console.error('Error creating survey:', error);
          alert('Failed to create survey');
          this.isSaving = false;
        },
      });
    }
  }

  onEdit(index: number): void {
    const formGroup = this.academicArray.at(index) as FormGroup;
    const item = formGroup.value;

    this.originalAcademicValue = { ...item };

    this.currentItemForm.patchValue({
      title: item.title || '',
      year: item.year || '',
    });

    this.academicPdfFile = item.pdf;
    this.academicPdfPreview = item.pdfPreview;
    this.editingId = item.id;
    this.editingIndex = index;
    this.isEditMode = true;
    this.showForm = true;
  }

  onDelete(index: number): void {
    this.editingIndex = index;
    this.openDeleteModal(index);
  }

  setMainTab(tab: string): void {
    this.activeMainTab = tab;
    this.resetCurrentForm();

    if (tab === 'calendar') {
      this.academicArray.clear();
      this.loadAcademics();
    } else if (tab === 'survey') {
      this.academicArray.clear();
      this.loadSurveys();
    }
  }

  getCurrentArray(): FormArray {
    if (this.activeMainTab === 'curriculum') {
      return this.curriculumArray;
    } else {
      return this.academicArray;
    }
  }

  getButtonTitle(): string {
    if (this.activeMainTab === 'curriculum') {
      return 'Curriculum';
    } else if (this.activeMainTab === 'calendar') {
      return 'Academic Calendar';
    } else if (this.activeMainTab === 'survey') {
      return 'Student Survey';
    }
    return '';
  }

  getHeaderTitle(): string {
    if (this.activeMainTab === 'curriculum') {
      return 'Curriculum & Syllabus';
    } else if (this.activeMainTab === 'calendar') {
      return 'Academic Calendar';
    } else if (this.activeMainTab === 'survey') {
      return 'Student Satisfaction Survey';
    }
    return '';
  }

  openDeleteModal(index: number) {
    if (this.activeMainTab === 'curriculum') {
      this.curriculumToDelete = index;
    } else if (this.activeMainTab === 'calendar') {
      this.calendarToDelete = index;
    } else if (this.activeMainTab === 'survey') {
      this.surveyToDelete = index;
    }
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.curriculumToDelete = null;
    this.surveyToDelete = null;
    this.calendarToDelete = null;
    this.editingIndex = null;
  }

  confirmDelete() {
    if (this.curriculumToDelete !== null) {
      this.deleteCurriculumAPI(this.curriculumToDelete);
    } else if (this.surveyToDelete !== null) {
      this.deleteSurveyAPI(this.surveyToDelete);
    } else if (this.calendarToDelete !== null) {
      this.deleteAcademicAPI(this.calendarToDelete);
    }
  }

  deleteCurriculumAPI(index: number): void {
    const formGroup = this.curriculumArray.at(index) as FormGroup;
    const curriculumId = formGroup.get('id')?.value;

    if (!curriculumId) {
      this.removeCurriculumFromArray(index);
      this.closeDeleteModal();
      return;
    }

    this.academicService.deleteCurriculum(curriculumId).subscribe({
      next: (response) => {
        this.removeCurriculumFromArray(index);
        this.closeDeleteModal();
        alert('Curriculum deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting curriculum:', error);
        alert('Failed to delete curriculum');
        this.closeDeleteModal();
      },
    });
  }

  deleteAcademicAPI(index: number): void {
    const formGroup = this.academicArray.at(index) as FormGroup;
    const academicId = formGroup.get('id')?.value;

    if (!academicId) {
      this.removeAcademicFromArray(index);
      this.closeDeleteModal();
      return;
    }

    this.academicService.deleteAcademic(academicId).subscribe({
      next: (response) => {
        this.removeAcademicFromArray(index);
        this.closeDeleteModal();
        alert('Academic calendar deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting academic calendar:', error);
        alert('Failed to delete academic calendar');
        this.closeDeleteModal();
      },
    });
  }

  deleteSurveyAPI(index: number): void {
    const formGroup = this.academicArray.at(index) as FormGroup;
    const surveyId = formGroup.get('id')?.value;

    if (!surveyId) {
      this.removeAcademicFromArray(index);
      this.closeDeleteModal();
      return;
    }

    this.academicService.deleteSurvey(surveyId).subscribe({
      next: (response) => {
        this.removeAcademicFromArray(index);
        this.closeDeleteModal();
        alert('Survey deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting survey:', error);
        alert('Failed to delete survey');
        this.closeDeleteModal();
      },
    });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getCurriculumPdfFileName(): string {
    return this.curriculumPdfFile?.name || '';
  }

  getAcademicPdfFileName(): string {
    return this.academicPdfFile?.name || '';
  }
}
