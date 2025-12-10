import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth';
import { UserService } from '../../Services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  user: any = null;
  loading: boolean = true;
  editUser: any = {};
  error: string = '';
  isEditMode = false;
  isSaving = false;
  isUploadingPhoto = false; // New state for photo upload
  isDeleting = false;
  showDeleteModal = false;

  // Password change
  showChangePasswordModal = false;
  isChangingPassword = false;
  passwordData = {
    currentPassword: '',
    newPassword: ''
  };
  confirmPassword = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserData();

    // Subscribe to user updates
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });

    this.loadUserStats();
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
    this.error = '';

    // Use UserService.getMyProfile() - this returns cached data from AuthService
    this.userService.getMyProfile().subscribe({
      next: (data: any) => {
        if (data) {
          this.user = data;
          console.log('Loaded user data:', this.user);
        } else {
          // Fallback to current user from AuthService
          this.user = this.authService.getCurrentUser();
          console.log('Using AuthService current user:', this.user);
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading profile:', err);
        // Fallback to current user from AuthService
        this.user = this.authService.getCurrentUser();
        this.error = 'Could not load fresh profile data. Using cached data.';
        this.loading = false;
      }
    });
  }

  // Helper method to safely get user properties
  getUserProperty(primaryKey: string, secondaryKey?: string): any {
    if (!this.user) return '';

    // Try primary key first
    if (this.user[primaryKey]) {
      return this.user[primaryKey];
    }

    // Try secondary key if provided
    if (secondaryKey && this.user[secondaryKey]) {
      return this.user[secondaryKey];
    }

    // Return empty string if not found
    return '';
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.resetEditUser();
    }
  }

  resetEditUser(): void {
    this.editUser = {
      firstName: this.getUserProperty('firstName', 'given_name'),
      lastName: this.getUserProperty('lastName', 'family_name'),
      email: this.getUserProperty('email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'),
      username: this.getUserProperty('username', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'),
      dateOfBirth: this.user?.dateOfBirth || ''
    };
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.resetEditUser();
  }

  triggerUpload(): void {
    const fileInput = document.getElementById('photoInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isUploadingPhoto = true;
      this.userService.uploadPhoto(file).subscribe({
        next: (res: any) => {
          console.log('Photo uploaded:', res);
          this.isUploadingPhoto = false;

          // Initial path depends on backend return. 
          // If returns partial path "images/profiles/...", we need to prepend base URL or handle static serving
          // Assuming base URL is 'https://localhost:7020/'

          // Update user photo locally
          const photoUrl = `https://localhost:7020/${res.photoUrl}`;

          // Update both main user and edit buffer (if relevant)
          if (this.user) this.user.photoURL = photoUrl;

          // Also update AuthService local storage
          // this.authService.updateCurrentUser(this.user);

          alert('Photo updated successfully!');
        },
        error: (err) => {
          console.error('Photo upload failed:', err);
          this.isUploadingPhoto = false;

          let msg = 'Failed to upload photo.';
          if (err.status) msg += ` Status: ${err.status} ${err.statusText}`;
          if (err.error && typeof err.error === 'string') msg += ` - ${err.error}`;
          else if (err.error && err.error.message) msg += ` - ${err.error.message}`;

          alert(msg);
        }
      });
    }
  }

  saveChanges(): void {
    // Get user ID from multiple possible locations
    const userId = this.getUserProperty('id', 'userId') ||
      this.user?.Id ||
      this.user?.user_id ||
      this.user?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    if (!userId) {
      alert('Cannot save: No user ID found');
      return;
    }

    this.isSaving = true;

    // Use UserService.updateCurrentUser() - this uses AuthService.updateUserProfile()
    this.userService.updateCurrentUser(this.editUser).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        this.isEditMode = false;

        // Success - update local state
        this.user = { ...this.user, ...this.editUser };
        alert('Profile updated successfully!');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating profile:', error);
        this.isSaving = false;

        // Improve error message
        let errorMessage = 'Failed to update profile via API.';
        if (error.error && typeof error.error === 'string') {
          errorMessage += ` ${error.error}`;
        } else if (error.message) {
          errorMessage += ` ${error.message}`;
        }

        // Do NOT update locally if API fails, to avoid confusion
        // Show clear error to user
        alert(errorMessage);

        // Optional: if user wants to 'force' local update, we could offer that, 
        // but for now let's strict to "Server Validated" updates.
      }
    });
  }

  confirmDeleteAccount(): void {
    this.showDeleteModal = true;
  }

  // In UserProfile component, update the deleteAccount method:
  deleteAccount(): void {
    this.isDeleting = true;

    this.userService.deleteUser().subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        // Redirect after successful deletion
        this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error deleting account:', error);
        this.isDeleting = false;

        if (error.status === 404) {
          alert('Delete account endpoint might not be available.');
        } else {
          alert('Failed to delete account. Please try again.');
        }
      }
    });
  }


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

    // Use UserService.changePassword() - this uses AuthService.changePassword()
    // this.userService.changePassword(this.passwordData).subscribe({
    //   next: (res: any) => {
    //     this.isChangingPassword = false;
    //     this.showChangePasswordModal = false;
    //     this.passwordData = { currentPassword: '', newPassword: '' };
    //     this.confirmPassword = '';

    //     alert('Password changed successfully!');
    //   },
    //   error: (error: HttpErrorResponse) => {
    //     console.error('Error changing password:', error);
    //     this.isChangingPassword = false;

    //     if (error.status === 404) {
    //       alert('Change password endpoint might not be available.');
    //     } else if (error.status === 400) {
    //       alert('Current password is incorrect.');
    //     } else {
    //       alert('Failed to change password. Please try again.');
    //     }
    //   }
    // });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
