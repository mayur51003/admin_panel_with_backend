import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ThemeToggle } from '../../../services/theme/theme-toggle';
import { CommitteeService } from '../../../services/clgCommittee/committee-service';
import { InputField } from '../../../shared-component/input-field/input-field';

interface Member {
  id?: number;
  name: string;
  designation: string;
  qualification: string;
  photo?: string;
  photoFile?: File;
  photoPreview?: string;
  email?: string;
  phone?: string;
  isExisting?: boolean;
}

interface Committee {
  id: number;
  title: string;
  description: string;
  status: boolean;
  members: Member[];
}

@Component({
  selector: 'app-college-committees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputField],
  templateUrl: './college-committees.html',
  styleUrl: './college-committees.scss',
})
export class CollegeCommittees implements OnInit {
  committees: Committee[] = [];
  showForm = false;
  isEditMode = false;
  editingCommitteeId: number | null = null;
  currentTheme: 'light' | 'dark' | 'system' = 'light';

  committeeForm!: FormGroup;
  memberForm!: FormGroup;

  uploadedFileName = '';
  editingMemberIndex: number | null = null;
  showDeleteModal = false;
  committeeToDelete: number | null = null;

  showCommitteeValidation = false;
  showMemberValidation = false;
  resetMemberTrigger = false;

  isLoading = false;
  isSubmitting = false;

  private originalCommitteeValue: any = null;
  private originalMembersValue: any[] = [];

  deletedMemberIds: number[] = [];

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeToggle,
    private committeeService: CommitteeService
  ) {
    this.themeService.themeChanges().subscribe((theme) => {
      this.currentTheme = theme;
    });
    this.currentTheme = this.themeService.getResolvedTheme();
  }

  ngOnInit(): void {
    this.initializeForms();
    this.loadCommittees();
  }

  loadCommittees(): void {
    this.isLoading = true;
    this.committeeService.getCommittees().subscribe({
      next: (response: any) => {
        const committees = response.data || response;
        this.committees = committees.map((committee: any) =>
          this.mapApiCommitteeToLocal(committee)
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading committees:', error);
        alert('Failed to load committees');
        this.isLoading = false;
      },
    });
  }

  private mapApiCommitteeToLocal(apiCommittee: any): Committee {
    return {
      id: apiCommittee.id,
      title: apiCommittee.committee_title,
      description: apiCommittee.committee_description,
      status: apiCommittee.status,
      members: apiCommittee.members
        ? apiCommittee.members.map((member: any) => this.mapApiMemberToLocal(member))
        : [],
    };
  }

  private mapApiMemberToLocal(apiMember: any): Member {
    return {
      id: apiMember.id,
      name: apiMember.member_name,
      designation: apiMember.designation,
      qualification: apiMember.qualification || '',
      photo: apiMember.photo,
      photoPreview: apiMember.photo
        ? `http://localhost:8000/storage/${apiMember.photo}`
        : undefined,
      email: apiMember.email || '',
      phone: apiMember.phone || '',
      isExisting: true,
    };
  }

  initializeForms(): void {
    this.committeeForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: [true],
      members: this.fb.array([]),
    });

    this.memberForm = this.fb.group({
      name: ['', Validators.required],
      designation: ['', Validators.required],
      qualification: [''],
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      photoFile: [null],
    });
  }

  get membersArray(): FormArray {
    return this.committeeForm.get('members') as FormArray;
  }

  openForm(): void {
    this.showForm = true;
    this.isEditMode = false;
    this.editingCommitteeId = null;
    this.originalCommitteeValue = null;
    this.originalMembersValue = [];
    this.deletedMemberIds = [];
    this.resetForm();
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editingCommitteeId = null;
    this.originalCommitteeValue = null;
    this.originalMembersValue = [];
    this.deletedMemberIds = [];
    this.resetForm();
  }

  resetForm(): void {
    this.committeeForm.reset({
      title: '',
      description: '',
      status: true,
    });

    this.membersArray.clear();

    this.memberForm.reset({
      name: '',
      designation: '',
      qualification: '',
      email: '',
      phone: '',
      photoFile: null,
    });

    this.uploadedFileName = '';
    this.showCommitteeValidation = false;
    this.showMemberValidation = false;
    this.resetMemberTrigger = !this.resetMemberTrigger;
    this.editingMemberIndex = null;
  }

  addMemberToNewCommittee(): void {
    this.showMemberValidation = true;

    if (this.memberForm.invalid) {
      Object.keys(this.memberForm.controls).forEach((key) => {
        this.memberForm.get(key)?.markAsTouched();
      });
      return;
    }

    const memberData = this.memberForm.value;

    if (this.editingMemberIndex !== null) {
      const existingMember = this.membersArray.at(this.editingMemberIndex).value;
      this.membersArray.at(this.editingMemberIndex).patchValue({
        name: memberData.name,
        designation: memberData.designation,
        qualification: memberData.qualification,
        email: memberData.email,
        phone: memberData.phone,
        photoFile: memberData.photoFile || existingMember.photoFile,
        photoPreview: memberData.photoFile
          ? URL.createObjectURL(memberData.photoFile)
          : existingMember.photoPreview,
      });
      this.editingMemberIndex = null;
    } else {
      this.membersArray.push(
        this.fb.group({
          id: [null],
          name: [memberData.name],
          designation: [memberData.designation],
          qualification: [memberData.qualification],
          email: [memberData.email],
          phone: [memberData.phone],
          photo: [null],
          photoFile: [memberData.photoFile],
          photoPreview: [memberData.photoFile ? URL.createObjectURL(memberData.photoFile) : null],
          isExisting: [false],
        })
      );
    }

    this.memberForm.reset({
      name: '',
      designation: '',
      qualification: '',
      email: '',
      phone: '',
      photoFile: null,
    });
    this.uploadedFileName = '';
    this.showMemberValidation = false;
    this.resetMemberTrigger = !this.resetMemberTrigger;
  }

  saveCommittee(): void {
    this.showCommitteeValidation = true;

    if (this.committeeForm.invalid) {
      Object.keys(this.committeeForm.controls).forEach((key) => {
        this.committeeForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.membersArray.length === 0) {
      alert('Please add at least one member to the committee');
      return;
    }

    this.isSubmitting = true;
    const committeeData = this.committeeForm.value;

    if (this.isEditMode && this.editingCommitteeId !== null) {
      this.updateCommittee(committeeData);
    } else {
      this.createCommittee(committeeData);
    }
  }

  private createCommittee(committeeData: any): void {
    const formData = new FormData();
    formData.append('committee_title', committeeData.title);
    formData.append('committee_description', committeeData.description);

    const statusValue = committeeData.status === true || committeeData.status === 'true';
    formData.append('status', statusValue ? '1' : '0'); // Send as '1' or '0'

    this.committeeService.createCommittee(formData).subscribe({
      next: (response: any) => {
        const createdCommittee = response.data || response;
        const committeeId = createdCommittee.id;

        this.saveCommitteeMembers(committeeId);
      },
      error: (error) => {
        console.error('Error creating committee:', error);
        alert('Failed to create committee');
        this.isSubmitting = false;
      },
    });
  }

  private updateCommittee(committeeData: any): void {
    const formData = new FormData();

    formData.append('_method', 'PUT');

    formData.append('committee_title', committeeData.title);
    formData.append('committee_description', committeeData.description);

    const statusValue = committeeData.status === true || committeeData.status === 'true';
    formData.append('status', statusValue ? '1' : '0');

    this.committeeService.updateCommittee(this.editingCommitteeId!, formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.handleMemberUpdates(this.editingCommitteeId!);
        } else {
          alert('Failed to update committee: ' + (response.message || 'Unknown error'));
          this.isSubmitting = false;
        }
      },
      error: (error) => {
        console.error('Error updating committee:', error);
        alert('Failed to update committee');
        this.isSubmitting = false;
      },
    });
  }

  private saveCommitteeMembers(committeeId: number): void {
    const members = this.membersArray.value;

    if (members.length === 0) {
      this.loadCommittees();
      this.closeForm();
      this.isSubmitting = false;
      alert('Committee created successfully!');
      return;
    }

    let completedRequests = 0;
    const totalMembers = members.length;
    let hasError = false;

    members.forEach((member: any) => {
      const memberFormData = new FormData();
      memberFormData.append('committee_id', committeeId.toString());
      memberFormData.append('member_name', member.name);
      memberFormData.append('designation', member.designation);
      memberFormData.append('qualification', member.qualification || '');
      memberFormData.append('email', member.email || '');
      memberFormData.append('phone', member.phone || '');

      if (member.photoFile instanceof File) {
        memberFormData.append('photo', member.photoFile);
      }

      this.committeeService.createCommitteeMember(memberFormData).subscribe({
        next: () => {
          completedRequests++;
          if (completedRequests === totalMembers) {
            this.loadCommittees();
            this.closeForm();
            this.isSubmitting = false;
            if (!hasError) {
              alert('Committee and members created successfully!');
            }
          }
        },
        error: (error) => {
          console.error('Error creating committee member:', error);
          hasError = true;
          completedRequests++;
          if (completedRequests === totalMembers) {
            this.loadCommittees();
            this.closeForm();
            this.isSubmitting = false;
            alert('Committee created but some members failed to save');
          }
        },
      });
    });
  }

  private handleMemberUpdates(committeeId: number): void {
    if (this.deletedMemberIds.length > 0) {
      let deletionCompleted = 0;
      const totalDeletions = this.deletedMemberIds.length;

      this.deletedMemberIds.forEach((memberId) => {
        this.committeeService.deleteCommitteeMember(memberId).subscribe({
          next: () => {
            deletionCompleted++;
            if (deletionCompleted === totalDeletions) {
              this.proceedWithMemberUpdates(committeeId);
            }
          },
          error: (error) => {
            console.error('Error deleting member:', error);
            deletionCompleted++;
            if (deletionCompleted === totalDeletions) {
              this.proceedWithMemberUpdates(committeeId);
            }
          },
        });
      });
    } else {
      this.proceedWithMemberUpdates(committeeId);
    }
  }

  private proceedWithMemberUpdates(committeeId: number): void {
    const members = this.membersArray.value;

    if (members.length === 0) {
      this.loadCommittees();
      this.closeForm();
      this.isSubmitting = false;
      alert('Committee updated successfully!');
      return;
    }

    let completedRequests = 0;
    const totalMembers = members.length;
    let hasError = false;

    members.forEach((member: any) => {
      if (member.id && member.isExisting) {
        const memberFormData = new FormData();

        memberFormData.append('_method', 'PUT');

        memberFormData.append('committee_id', committeeId.toString());
        memberFormData.append('member_name', member.name);
        memberFormData.append('designation', member.designation);
        memberFormData.append('qualification', member.qualification || '');
        memberFormData.append('email', member.email || '');
        memberFormData.append('phone', member.phone || '');

        if (member.photoFile instanceof File) {
          memberFormData.append('photo', member.photoFile);
        }

        this.committeeService.updateCommitteeMember(member.id, memberFormData).subscribe({
          next: (response) => {
            completedRequests++;
            if (completedRequests === totalMembers) {
              this.finishUpdate(hasError);
            }
          },
          error: (error) => {
            console.error('Error updating committee member:', error);
            hasError = true;
            completedRequests++;
            if (completedRequests === totalMembers) {
              this.finishUpdate(hasError);
            }
          },
        });
      } else {
        const memberFormData = new FormData();
        memberFormData.append('committee_id', committeeId.toString());
        memberFormData.append('member_name', member.name);
        memberFormData.append('designation', member.designation);
        memberFormData.append('qualification', member.qualification || '');
        memberFormData.append('email', member.email || '');
        memberFormData.append('phone', member.phone || '');

        if (member.photoFile instanceof File) {
          memberFormData.append('photo', member.photoFile);
        }

        this.committeeService.createCommitteeMember(memberFormData).subscribe({
          next: () => {
            completedRequests++;
            if (completedRequests === totalMembers) {
              this.finishUpdate(hasError);
            }
          },
          error: (error) => {
            console.error('Error creating committee member:', error);
            hasError = true;
            completedRequests++;
            if (completedRequests === totalMembers) {
              this.finishUpdate(hasError);
            }
          },
        });
      }
    });
  }
  private finishUpdate(hasError: boolean): void {
    this.loadCommittees();
    this.closeForm();
    this.isSubmitting = false;
    if (hasError) {
      alert('Committee updated but some members failed to save');
    } else {
      alert('Committee updated successfully!');
    }
  }

  editMemberFromNewCommittee(index: number): void {
    const memberData = this.membersArray.at(index).value;
    this.memberForm.patchValue({
      name: memberData.name,
      designation: memberData.designation,
      qualification: memberData.qualification,
      email: memberData.email,
      phone: memberData.phone,
      photoFile: memberData.photoFile,
    });
    this.editingMemberIndex = index;
    this.showMemberValidation = false;
    this.uploadedFileName = memberData.photoFile
      ? memberData.photoFile.name
      : memberData.photo
      ? 'Current Photo'
      : '';
  }

  removeMemberFromNewCommittee(index: number): void {
    const member = this.membersArray.at(index).value;

    if (member.id && this.isEditMode) {
      this.deletedMemberIds.push(member.id);
    }

    this.membersArray.removeAt(index);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        event.target.value = '';
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('File size should not exceed 2MB');
        event.target.value = '';
        return;
      }

      this.memberForm.patchValue({
        photoFile: file,
      });
      this.uploadedFileName = file.name;
    }
    event.target.value = '';
  }

  editCommittee(id: number): void {
    this.isLoading = true;
    this.committeeService.getCommittee(id).subscribe({
      next: (response: any) => {
        const committeeData = response.data || response;
        const committee = this.mapApiCommitteeToLocal(committeeData);

        this.originalCommitteeValue = {
          title: committee.title,
          description: committee.description,
          status: committee.status,
        };

        this.originalMembersValue = committee.members.map((m) => ({ ...m }));

        this.committeeForm.patchValue({
          title: committee.title,
          description: committee.description,
          status: committee.status,
        });

        this.membersArray.clear();
        committee.members.forEach((member) => {
          this.membersArray.push(
            this.fb.group({
              id: [member.id],
              name: [member.name],
              designation: [member.designation],
              qualification: [member.qualification],
              email: [member.email],
              phone: [member.phone],
              photo: [member.photo],
              photoFile: [null],
              photoPreview: [member.photoPreview],
              isExisting: [true],
            })
          );
        });

        this.isEditMode = true;
        this.editingCommitteeId = id;
        this.showForm = true;
        this.showCommitteeValidation = false;
        this.deletedMemberIds = [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading committee:', error);
        alert('Failed to load committee details');
        this.isLoading = false;
      },
    });
  }
  openDeleteModal(id: number): void {
    this.committeeToDelete = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.committeeToDelete = null;
  }

  confirmDelete(): void {
    if (this.committeeToDelete !== null) {
      this.isLoading = true;
      this.committeeService.deleteCommittee(this.committeeToDelete).subscribe({
        next: (response: any) => {
          this.loadCommittees();
          alert('Committee deleted successfully!');
          this.closeDeleteModal();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting committee:', error);
          alert('Failed to delete committee');
          this.closeDeleteModal();
          this.isLoading = false;
        },
      });
    }
  }

  get members(): Member[] {
    return this.membersArray.value;
  }

  getMemberPhoto(member: any): string {
    if (member.photoPreview) {
      return member.photoPreview;
    }
    if (member.photo) {
      if (member.photo.startsWith('http') || member.photo.startsWith('blob:')) {
        return member.photo;
      }
      return `http://localhost:8000/storage/${member.photo}`;
    }
    return '';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.touched || this.showCommitteeValidation) : false;
  }

  isMemberFieldInvalid(fieldName: string): boolean {
    const field = this.memberForm.get(fieldName);
    return field ? field.invalid && (field.touched || this.showMemberValidation) : false;
  }
}
