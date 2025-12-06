import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../Services/user.service';
import { AuthService } from '../../Services/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'app-personal-account',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './personal-account.component.html',
    styleUrls: ['./personal-account.component.css']
})
export class PersonalAccountComponent implements OnInit {
    profileForm: FormGroup;
    currentUser: any = null;
    loading = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private authService: AuthService,
        private router: Router
    ) {
        this.profileForm = this.fb.group({
            firstName: [''],
            lastName: [''],
            email: [{ value: '', disabled: true }],
            username: [{ value: '', disabled: true }],
            // Additional fields - only include if they exist in your API
            dateOfBirth: [''],
            location: [''],
            about: ['']
        });
    }

    ngOnInit(): void {
        // Check if user is logged in first
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/auth']);
            return;
        }

        // Get current user from Auth Service
        this.currentUser = this.authService.getCurrentUser();

        if (this.currentUser) {
            console.log('Current user from AuthService:', this.currentUser);
            this.patchForm(this.currentUser);

            // Try to get updated profile data from UserService (cached)
            this.userService.getMyProfile().subscribe({
                next: (user: any) => {
                    if (user) {
                        this.currentUser = { ...this.currentUser, ...user };
                        this.patchForm(this.currentUser);
                    }
                },
                error: (err: any) => {
                    console.log('Could not fetch fresh profile, using cached data:', err.message);
                }
            });
        } else {
            this.errorMessage = 'No user data available. Please log in again.';
        }
    }

    patchForm(user: any) {
        console.log('Patching form with user data:', user);
        this.profileForm.patchValue({
            firstName: user.firstName || user.given_name || '',
            lastName: user.lastName || user.family_name || '',
            email: user.email || user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
            username: user.username || user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '',
            dateOfBirth: user.dateOfBirth || '',
            location: user.location || '',
            about: user.about || ''
        });
    }

    onSubmit() {
        if (this.profileForm.valid && this.currentUser) {
            this.loading = true;
            this.successMessage = '';
            this.errorMessage = '';

            const updatedData = this.profileForm.getRawValue();

            // Get user ID from current user
            const userId = this.currentUser.id ||
                          this.currentUser.Id ||
                          this.currentUser.userId ||
                          this.currentUser['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

            if (!userId) {
                this.errorMessage = 'Cannot update: No user ID found';
                this.loading = false;
                return;
            }

            // Use UserService to update - this will use AuthService.updateUserProfile
            this.userService.updateCurrentUser(updatedData).subscribe({
                next: (res: any) => {
                    this.successMessage = 'Profile updated successfully';
                    this.loading = false;

                    // Update local user data
                    this.currentUser = { ...this.currentUser, ...updatedData };
                    // this.authService.updateCurrentUser(this.currentUser);
                },
                error: (err: HttpErrorResponse) => {
                    console.error('Error updating profile', err);
                    this.errorMessage = err.error?.message || 'Failed to update profile. Note: Profile update endpoint might not be available.';
                    this.loading = false;
                }
            });
        }
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/auth']);
    }
    
}
