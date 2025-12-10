import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth';
import { UserService, UserProfileUpdate, UserProfile } from '../../Services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  userProfile: UserProfile | null = null;
  loading: boolean = true;
  editUser: UserProfileUpdate = {};
  error: string = '';
  isEditMode = false;
  isSaving = false;
  isDeleting = false;
  showDeleteModal = false;

  // Additional fields for user profile
  languages: any[] = [];
  interests: any[] = [];
  selectedLanguages: number[] = [];
  selectedInterests: number[] = [];
  userStats: any = {};

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
    this.loadLanguages();
    this.loadInterests();
    this.loadUserStats();

    // Subscribe to user profile updates
    this.userService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
      if (profile) {
        this.updateSelectionFromProfile(profile);
      }
    });

    // Subscribe to auth user updates
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  loadUserData(): void {
    this.loading = true;
    this.error = '';

    this.userService.getMyProfile().subscribe({
      next: (profile: UserProfile) => {
        this.userProfile = profile;
        this.user = this.authService.getCurrentUser();
        this.updateSelectionFromProfile(profile);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading profile:', err);
        this.error = err.message || 'Could not load profile data. Please try again.';
        this.user = this.authService.getCurrentUser();
        this.loading = false;
      }
    });
  }

  loadLanguages(): void {
    this.userService.getLanguages().subscribe({
      next: (languages) => {
        this.languages = languages;
      },
      error: (err) => {
        console.error('Error loading languages:', err);
      }
    });
  }

  loadInterests(): void {
    this.userService.getInterests().subscribe({
      next: (interests) => {
        this.interests = interests;
      },
      error: (err) => {
        console.error('Error loading interests:', err);
      }
    });
  }

  loadUserStats(): void {
    this.userService.getUserStats().subscribe({
      next: (stats) => {
        this.userStats = stats;
      },
      error: (err) => {
        console.error('Error loading user stats:', err);
        this.userStats = { trips: 0, wishlists: 0, reviews: 0 };
      }
    });
  }

  // Helper methods
  getFirstName(): string {
    return this.userProfile?.firstName ||
           this.getUserProperty('firstName', 'given_name') ||
           'User';
  }

  getEmail(): string {
    return this.user?.email ||
           this.getUserProperty('email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress') ||
           'No email';
  }

  getUsername(): string {
    return this.user?.username ||
           this.getUserProperty('username', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name') ||
           this.getEmail();
  }

  getInitials(): string {
    const firstName = this.userProfile?.firstName || this.getUserProperty('firstName', 'given_name');
    const lastName = this.userProfile?.lastName || this.getUserProperty('lastName', 'family_name');
    return `${firstName?.charAt(0) || 'U'}${lastName?.charAt(0) || 'S'}`;
  }

  getUserStats(): any {
    return this.userStats;
  }

  getUserProperty(primaryKey: string, secondaryKey?: string): any {
    if (!this.user) return '';
    if (this.user[primaryKey]) return this.user[primaryKey];
    if (secondaryKey && this.user[secondaryKey]) return this.user[secondaryKey];
    return '';
  }

  updateSelectionFromProfile(profile: UserProfile): void {
    if (profile.languages) {
      this.selectedLanguages = profile.languages.map((lang: any) => lang.id || lang.languageId);
    }
    if (profile.interests) {
      this.selectedInterests = profile.interests.map((interest: any) => interest.id || interest.interestId);
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.resetEditUser();
    }
  }

  resetEditUser(): void {
    this.editUser = {
      firstName: this.userProfile?.firstName || '',
      lastName: this.userProfile?.lastName || '',
      photoURL: this.userProfile?.photoURL || '',
      about: this.userProfile?.about || '',
      location: this.userProfile?.location || '',
      work: this.userProfile?.work || '',
      wantedToTravel: this.userProfile?.wantedToTravel || '',
      pets: this.userProfile?.pets || '',
      uselessSkill: this.userProfile?.uselessSkill || '',
      showTheDecade: this.userProfile?.showTheDecade || false,
      funFact: this.userProfile?.funFact || '',
      favoriteSong: this.userProfile?.favoriteSong || '',
      school: this.userProfile?.school || '',
      spendTimeDoing: this.userProfile?.spendTimeDoing || '',
      dateOfBirth: this.userProfile?.dateOfBirth || '',
      languageIds: [...this.selectedLanguages],
      interestIds: [...this.selectedInterests]
    };
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.resetEditUser();
  }

  saveChanges(): void {
    this.isSaving = true;
    this.error = '';

    // Format date of birth if it exists
    if (this.editUser.dateOfBirth) {
      this.editUser.dateOfBirth = this.userService.formatDateForApi(this.editUser.dateOfBirth);
    }

    // Update language and interest IDs
    this.editUser.languageIds = this.selectedLanguages;
    this.editUser.interestIds = this.selectedInterests;

    console.log('Sending update:', this.editUser);

    this.userService.updateCurrentUser(this.editUser).subscribe({
      next: (updatedProfile: UserProfile) => {
        this.isSaving = false;
        this.isEditMode = false;
        this.userProfile = updatedProfile;
        this.updateSelectionFromProfile(updatedProfile);
        this.error = '';
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error updating profile:', error);
        this.isSaving = false;
        this.error = error.error?.message || error.message || 'Failed to update profile. Please try again.';
      }
    });
  }

  onPhotoUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      this.error = 'Please select an image file';
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      this.error = 'Image size should be less than 5MB';
      return;
    }

    this.isSaving = true;
    this.userService.uploadProfilePhoto(file).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.userProfile = { ...this.userProfile, photoURL: response.photoURL };
        this.editUser.photoURL = response.photoURL;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error uploading photo:', error);
        this.isSaving = false;
        this.error = error.error?.message || 'Failed to upload photo. Please try again.';
      }
    });
  }

  // Language/Interest selection
  toggleLanguage(languageId: number): void {
    const index = this.selectedLanguages.indexOf(languageId);
    if (index > -1) {
      this.selectedLanguages.splice(index, 1);
    } else {
      this.selectedLanguages.push(languageId);
    }
  }

  toggleInterest(interestId: number): void {
    const index = this.selectedInterests.indexOf(interestId);
    if (index > -1) {
      this.selectedInterests.splice(index, 1);
    } else {
      this.selectedInterests.push(interestId);
    }
  }

  isLanguageSelected(languageId: number): boolean {
    return this.selectedLanguages.includes(languageId);
  }

  isInterestSelected(interestId: number): boolean {
    return this.selectedInterests.includes(interestId);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  confirmDeleteAccount(): void {
    this.showDeleteModal = true;
  }

  deleteAccount(): void {
    this.isDeleting = true;

    this.userService.deleteUser().subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error deleting account:', error);
        this.isDeleting = false;
        this.error = error.error?.message || 'Failed to delete account. Please try again.';
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
    if (!this.passwordData.currentPassword) {
      this.error = 'Please enter current password';
      return;
    }

    if (!this.passwordData.newPassword) {
      this.error = 'Please enter new password';
      return;
    }

    if (this.passwordData.newPassword !== this.confirmPassword) {
      this.error = 'New passwords do not match';
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.error = 'New password must be at least 6 characters long';
      return;
    }

    this.isChangingPassword = true;
    this.error = '';

    this.userService.changePassword(this.passwordData).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.showChangePasswordModal = false;
        this.passwordData = { currentPassword: '', newPassword: '' };
        this.confirmPassword = '';
        alert('Password changed successfully!');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error changing password:', error);
        this.isChangingPassword = false;
        this.error = error.error?.message || 'Failed to change password. Please try again.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
