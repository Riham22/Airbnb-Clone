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
  ) {}

  ngOnInit(): void {
    this.loadUserData();

    // Subscribe to user updates
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
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

        if (res) {
          // Update was successful via API
          this.user = { ...this.user, ...this.editUser };
          // this.authService.updateCurrentUser(this.user);
          alert('Profile updated successfully!');
        } else {
          // API endpoint might not exist, update locally only
          this.user = { ...this.user, ...this.editUser };
          // this.authService.updateCurrentUser(this.user);
          alert('Profile updated locally (API endpoint might not be available).');
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating profile:', error);
        this.isSaving = false;

        // Even if API fails, update locally
        this.user = { ...this.user, ...this.editUser };
        // this.authService.updateCurrentUser(this.user);

        alert('Profile updated locally (API error occurred).');
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
