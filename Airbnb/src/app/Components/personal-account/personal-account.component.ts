import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
    showDebugInfo = false;

    constructor(
        private fb: FormBuilder,
        public userService: UserService,
        private authService: AuthService,
        private router: Router
    ) {
        this.profileForm = this.fb.group({
            firstName: [''],
            lastName: [''],
            email: [{ value: '', disabled: true }],
            username: [{ value: '', disabled: true }],
            photoURL: [''],
            about: [''],
            location: [''],
            work: [''],
            wantedToTravel: [''],
            pets: [''],
            uselessSkill: [''],
            funFact: [''],
            favoriteSong: [''],
            school: [''],
            spendTimeDoing: [''],
            dateOfBirth: [''],
            showTheDecade: [true],
            languageIds: [[]],
            interestIds: [[]],
            roles: [[]]
        });
    }

    ngOnInit(): void {
        console.log('PersonalAccountComponent initialized');

        if (!this.authService.isLoggedIn()) {
            console.log('User not logged in, redirecting to auth');
            this.router.navigate(['/auth']);
            return;
        }

        this.currentUser = this.authService.getCurrentUser();
        console.log('Initial currentUser from AuthService:', this.currentUser);

        if (this.currentUser) {
            this.patchForm(this.currentUser);
            this.loadUserProfile();
        } else {
            this.errorMessage = 'No user data available. Please log in again.';
            setTimeout(() => {
                this.router.navigate(['/auth']);
            }, 2000);
        }
    }

    loadUserProfile(): void {
        this.loading = true;
        this.userService.getMyProfile().subscribe({
            next: (userProfile: any) => {
                console.log('User profile loaded successfully from API:', userProfile);
                this.loading = false;

                if (userProfile) {
                    this.currentUser = { ...this.currentUser, ...userProfile };
                    this.patchForm(this.currentUser);
                    this.successMessage = 'Profile loaded successfully';

                    setTimeout(() => {
                        this.successMessage = '';
                    }, 3000);
                }
            },
            error: (err: any) => {
                console.error('Failed to fetch profile from API:', err.message);
                this.loading = false;

                if (err.status === 401) {
                    this.errorMessage = 'Session expired. Please log in again.';
                    setTimeout(() => {
                        this.authService.logout();
                        this.router.navigate(['/auth']);
                    }, 2000);
                } else if (err.status === 404) {
                    this.errorMessage = 'Profile endpoint not found. Please check API configuration.';
                } else {
                    this.errorMessage = `Could not load profile: ${err.message}`;
                }
            }
        });
    }

    patchForm(user: any) {
        console.log('Patching form with user data from API:', user);

        const formData: any = {};

        Object.keys(this.profileForm.controls).forEach(field => {
            const possibleSources = [
                user[field],
                user[field.toLowerCase()],
                user[field.toUpperCase()],
                user[`${field}Name`],
                user[`${field.toLowerCase()}Name`]
            ];

            const claimName = `http://schemas.xmlsoap.org/ws/2005/05/identity/claims/${field.toLowerCase()}`;
            possibleSources.push(user[claimName]);

            const value = possibleSources.find(val => val != null && val !== '');
            formData[field] = value || '';
        });

        if (!formData.email) {
            if (user.email) {
                formData.email = user.email;
            } else if (user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']) {
                formData.email = user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
            }
        }

        if (!formData.firstName && user.given_name) {
            formData.firstName = user.given_name;
        }
        if (!formData.lastName && user.family_name) {
            formData.lastName = user.family_name;
        }

        if (!formData.languageIds || !Array.isArray(formData.languageIds)) {
            formData.languageIds = [];
        }
        if (!formData.interestIds || !Array.isArray(formData.interestIds)) {
            formData.interestIds = [];
        }
        if (!formData.roles || !Array.isArray(formData.roles)) {
            formData.roles = [];
        }
        if (formData.showTheDecade === undefined || formData.showTheDecade === null) {
            formData.showTheDecade = true;
        }

        console.log('Form data to patch:', formData);
        this.profileForm.patchValue(formData);
    }

    onSubmit() {
        console.log('Form submission started');

        if (!this.currentUser) {
            this.errorMessage = 'No user data available. Please log in again.';
            return;
        }

        this.loading = true;
        this.successMessage = '';
        this.errorMessage = '';

        const formValue = this.profileForm.getRawValue();

        if (formValue.dateOfBirth) {
            try {
                formValue.dateOfBirth = this.userService.formatDateForApi(formValue.dateOfBirth);
            } catch (e) {
                console.warn('Invalid date format:', e);
            }
        }

        console.log('Data to update via API:', formValue);

        this.userService.updateCurrentUser(formValue).subscribe({
            next: (updatedProfile: any) => {
                console.log('Profile updated successfully via API:', updatedProfile);
                this.loading = false;
                this.successMessage = 'Profile updated successfully!';

                this.currentUser = { ...this.currentUser, ...updatedProfile };
                this.patchForm(this.currentUser);

                setTimeout(() => {
                    this.successMessage = '';
                }, 3000);
            },
            error: (err: HttpErrorResponse) => {
                console.error('Failed to update profile via API:', err);
                this.loading = false;

                if (err.error && err.error.errors) {
                    const errorMessages = Object.values(err.error.errors).flat().join(', ');
                    this.errorMessage = `Validation errors: ${errorMessages}`;
                } else if (err.error && err.error.message) {
                    this.errorMessage = err.error.message;
                } else if (err.status === 401) {
                    this.errorMessage = 'Session expired. Please log in again.';
                    setTimeout(() => {
                        this.authService.logout();
                        this.router.navigate(['/auth']);
                    }, 2000);
                } else if (err.status === 400) {
                    this.errorMessage = 'Invalid data. Please check your input.';
                } else if (err.status === 404) {
                    this.errorMessage = 'Update endpoint not found. Please check API configuration.';
                } else {
                    this.errorMessage = `Failed to update profile: ${err.message}`;
                }
            }
        });
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/auth']);
    }

    toggleDebugInfo() {
        this.showDebugInfo = !this.showDebugInfo;
        if (this.showDebugInfo) {
            this.userService.debugAuthInfo();
        }
    }

    onPhotoUpload(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            this.errorMessage = 'Please upload a valid image file (JPEG, PNG, GIF, WebP)';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.errorMessage = 'File size should be less than 5MB';
            return;
        }

        this.loading = true;
        this.userService.uploadProfilePhoto(file).subscribe({
            next: (response: any) => {
                this.loading = false;
                console.log('Upload response:', response);

                if (response.success || response.photoURL) {
                    this.successMessage = 'Photo uploaded successfully!';

                    if (response.photoURL) {
                        this.profileForm.patchValue({ photoURL: response.photoURL });
                    }

                    this.userService.refreshUserProfile().subscribe({
                        next: (profile) => {
                            this.currentUser = { ...this.currentUser, ...profile };
                            this.patchForm(this.currentUser);
                        }
                    });

                    setTimeout(() => {
                        this.successMessage = '';
                    }, 3000);
                }
            },
            error: (err: HttpErrorResponse) => {
                this.loading = false;
                console.error('Upload error:', err);
                this.errorMessage = err.error?.message || 'Failed to upload photo. Please try again.';
            }
        });
    }
}
