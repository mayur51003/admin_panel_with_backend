import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ThemeToggle } from '../../../services/theme/theme-toggle';
import { MissionvisionService } from '../../../services/missionvision/missionvision-service';
import { InputField } from '../../../shared-component/input-field/input-field';

@Component({
  selector: 'app-mission-vision',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputField],
  templateUrl: './mission-vision.html',
  styleUrl: './mission-vision.scss',
})
export class MissionVision implements OnInit {
  currentTheme: 'light' | 'dark' | 'system';
  isEditing: boolean = false;
  isSaving: boolean = false;
  showValidation: boolean = false;

  missionText = '';
  visionText = '';

  previousMission = '';
  previousVision = '';

  missionVisionForm!: FormGroup;

  showSuccessPopup = false;
  successMessage = '';

  constructor(
    private themeService: ThemeToggle,
    private fb: FormBuilder,
    private missionvisionService: MissionvisionService
  ) {
    this.themeService.themeChanges().subscribe((theme) => {
      this.currentTheme = theme;
    });
    this.currentTheme = this.themeService.getResolvedTheme();
  }

  ngOnInit() {
    this.initializeForm();
    this.loadMissionVision();
  }

  initializeForm() {
    this.missionVisionForm = this.fb.group({
      mission: ['', [Validators.required]],
      vision: ['', [Validators.required]],
    });
  }

  loadMissionVision() {
    this.missionvisionService.getMissionVision().subscribe((res) => {
      if (res.exists) {
        this.missionText = res.data.mission;
        this.visionText = res.data.vision;

        this.previousMission = res.data.mission;
        this.previousVision = res.data.vision;
      } else {
        this.missionText = '';
        this.visionText = '';
      }
    });
  }

  startEditing() {
    this.isEditing = true;
    this.showValidation = false;

    this.missionVisionForm.patchValue({
      mission: this.missionText,
      vision: this.visionText,
    });
  }

  cancelEditing() {
    this.isEditing = false;
    this.showValidation = false;
    this.missionVisionForm.reset();
  }

  saveMissionVision() {
    this.showValidation = true;
    this.missionVisionForm.markAllAsTouched();

    if (this.missionVisionForm.invalid) return;

    this.isSaving = true;

    const formData = new FormData();

    const isFirstTime = !this.previousMission && !this.previousVision;

    if (isFirstTime) {
      formData.append('mission', this.missionControl.value);
      formData.append('vision', this.visionControl.value);
    } else {
      if (this.missionControl.dirty) {
        formData.append('mission', this.missionControl.value);
      }

      if (this.visionControl.dirty) {
        formData.append('vision', this.visionControl.value);
      }
    }

    this.missionvisionService.storeOrUpdateMissionVision(formData).subscribe({
      next: (res) => {
        if (res.updated_data.mission) this.missionText = res.updated_data.mission;
        if (res.updated_data.vision) this.visionText = res.updated_data.vision;

        this.previousMission = this.missionText;
        this.previousVision = this.visionText;

        this.isEditing = false;
        this.isSaving = false;
        this.showValidation = false;
        this.missionVisionForm.reset();

        this.showSuccessPopup = true;
        this.successMessage = res.message;
        setTimeout(() => (this.showSuccessPopup = false), 3000);
      },
      error: () => (this.isSaving = false),
    });
  }

  get missionControl() {
    return this.missionVisionForm.get('mission') as FormControl;
  }

  get visionControl() {
    return this.missionVisionForm.get('vision') as FormControl;
  }
}
