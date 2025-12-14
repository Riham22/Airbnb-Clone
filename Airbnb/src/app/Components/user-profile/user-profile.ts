import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../Services/auth';
import { UserService } from '../../Services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
  providers: [DatePipe]
})
export class UserProfile implements OnInit {
  currentUser: any = null; // Renamed from 'user' to match template
  loading: boolean = true;
  profileForm!: FormGroup; // Added form group

  isEditing = false; // Renamed from 'isEditMode'
  isSaving = false;
  isUploadingPhoto = false;

  // Delete Account State
  isDeleting = false;
  showDeleteModal = false;

  // Password Change State
  showChangePasswordModal = false;
  isChangingPassword = false;
  passwordData = {
    currentPassword: '',
    newPassword: ''
  };
  confirmPassword = '';

  successMessage: string | null = null;
  errorMessage: string | null = null;
  maxDate: string;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    this.initForm();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadUserStats();

    // Subscribe to user updates
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        if (!this.isEditing) {
          this.patchFormValues();
        }
      }
    });
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]], // Usually read-only
      phone: [''],
      dateOfBirth: [''],
      gender: [''],
      address: [''],
      about: ['', [Validators.maxLength(2000)]]
    });

    // Disable form initially
    this.profileForm.disable();
  }

  patchFormValues(): void {
    if (!this.currentUser) return;

    this.profileForm.patchValue({
      firstName: this.getUserProperty('firstName', 'given_name'),
      lastName: this.getUserProperty('lastName', 'family_name'),
      email: this.getUserProperty('email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'),
      phone: this.currentUser.phone || this.currentUser.phoneNumber || '',
      dateOfBirth: this.datePipe.transform(this.currentUser.dateOfBirth, 'yyyy-MM-dd') || '',
      gender: this.currentUser.gender || '',
      address: this.currentUser.address || '',
      about: this.currentUser.about || this.currentUser.bio || ''
    });
  }

  userStats: any = { tripsCount: 0, wishlistsCount: 0, reviewsCount: 0 };

  loadUserStats(): void {
    this.userService.getUserStats().subscribe({
      next: (stats) => {
        this.userStats = stats;
      },
      error: (err) => {
        console.error('Failed to load user stats', err);
      }
    });
  }

  loadUserData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.userService.getMyProfile().subscribe({
      next: (data: any) => {
        this.currentUser = data || this.authService.getCurrentUser();
        this.patchFormValues();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading profile:', err);
        this.currentUser = this.authService.getCurrentUser();
        this.patchFormValues();
        this.errorMessage = 'Could not load fresh profile data.';
        this.loading = false;
      }
    });
  }

  // Helper method to safely get user properties
  getUserProperty(primaryKey: string, secondaryKey?: string): any {
    if (!this.currentUser) return '';
    return this.currentUser[primaryKey] || (secondaryKey ? this.currentUser[secondaryKey] : '') || '';
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.enable();
      // Keep email read-only usually
      this.profileForm.get('email')?.disable();
    } else {
      this.profileForm.disable();
      this.patchFormValues(); // Reset changes
    }
  }

  onPhotoUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isUploadingPhoto = true;
      console.log('Starting photo upload...');

      this.userService.uploadPhoto(file)
        .pipe(finalize(() => {
          console.log('Upload finalize called. Resetting isUploadingPhoto.');
          this.isUploadingPhoto = false;
          this.cdr.detectChanges(); // Force UI update
        }))
        .subscribe({
          next: (res: any) => {
            console.log('Upload response received:', res);

            // Check for PhotoURL (PascalCase), photoUrl (camelCase), or photoURL (camelCase with caps URL)
            let rawPhotoUrl = res.PhotoURL || res.photoUrl || res.photoURL || res.url;
            console.log('Raw resolved photo URL:', rawPhotoUrl);

            // Resolve full URL
            let photoUrl = '';
            if (rawPhotoUrl) {
              if (rawPhotoUrl.startsWith('http')) {
                photoUrl = rawPhotoUrl;
              } else {
                photoUrl = `https://localhost:7020${rawPhotoUrl.startsWith('/') ? '' : '/'}${rawPhotoUrl}`;
              }
            }
            console.log('Final resolved photo URL:', photoUrl);

            if (this.currentUser) {
              this.currentUser.photoURL = photoUrl;
              // Update auth service to reflect changes in Navbar immediately
              const updatedUser = { ...this.authService.getCurrentUser(), photoURL: photoUrl };
              this.authService.updateCurrentUser(updatedUser);
            }
            this.successMessage = 'Photo updated successfully!';
            setTimeout(() => {
              this.successMessage = null;
              this.cdr.detectChanges();
            }, 3000);
          },
          error: (err) => {
            console.error('Photo upload failed:', err);
            this.errorMessage = 'Failed to upload photo.';
            this.cdr.detectChanges();
          }
        });
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formValues = this.profileForm.getRawValue();

    // Sanitize payload: valid DateOnly format or null
    const payload = {
      ...formValues,
      dateOfBirth: formValues.dateOfBirth ? formValues.dateOfBirth : null,
      phone: formValues.phone || null,
      gender: formValues.gender || null,
      address: formValues.address || null,
      about: formValues.about || null
    };

    this.userService.updateCurrentUser(payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        this.isEditing = false;
        this.profileForm.disable();

        // Update local state
        this.currentUser = { ...this.currentUser, ...formValues };

        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating profile:', error);
        this.isSaving = false;
        this.errorMessage = error.error?.message || 'Failed to update profile.';
      }
    });
  }

  // Validation Helpers
  hasError(field: string): boolean {
    const control = this.profileForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(field: string): string {
    const control = this.profileForm.get(field);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('email')) return 'Invalid email address';
    if (control?.hasError('minlength')) return `Minimum length is ${control.errors?.['minlength'].requiredLength}`;
    return '';
  }

  // Confirmation Methods
  confirmDeleteAccount(): void {
    this.showDeleteModal = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.patchFormValues(); // Reset keys
  }

  // File Upload Helper
  triggerUpload(): void {
    const fileInput = document.getElementById('photoInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Account Deletion
  deleteAccount(): void {
    this.isDeleting = true;
    this.userService.deleteUser().subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.authService.logout();
        this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error deleting account:', error);
        this.isDeleting = false;
        this.errorMessage = 'Failed to delete account. Please try again.';
      }
    });
  }

  // Password Management
  changePassword(): void {
    this.showChangePasswordModal = true;
  }

  cancelChangePassword(): void {
    this.showChangePasswordModal = false;
    this.passwordData = { currentPassword: '', newPassword: '' };
    this.confirmPassword = '';
  }

  updatePassword(): void {
    if (this.passwordData.newPassword !== this.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    this.isChangingPassword = true;

    this.userService.changePassword(this.passwordData).subscribe({
      next: (res: any) => {
        this.isChangingPassword = false;
        this.showChangePasswordModal = false;
        this.passwordData = { currentPassword: '', newPassword: '' };
        this.confirmPassword = '';
        this.successMessage = 'Password changed successfully!';
        setTimeout(() => this.successMessage = null, 3000);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error changing password:', error);
        this.isChangingPassword = false;
        if (error.status === 400) {
          this.errorMessage = 'Current password is incorrect.';
        } else {
          this.errorMessage = 'Failed to change password.';
        }
      }
    });
  }
}
