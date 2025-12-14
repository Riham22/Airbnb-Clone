import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../Services/user.service';
import { AuthService } from '../../Services/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

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
    isEditing = false;
    successMessage = '';
    errorMessage = '';
    showDebugInfo = false;
    maxDate: string;

    constructor(
        private fb: FormBuilder,
        public userService: UserService,
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        // Set max date to today for date of birth
        const today = new Date();
        this.maxDate = today.toISOString().split('T')[0];

        // Initialize form with only necessary fields
        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
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

        this.loadUserProfile();
    }

    loadUserProfile(): void {
        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.userService.getMyProfile().pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (userProfile: any) => {
                console.log('User profile loaded successfully:', userProfile);

                if (userProfile) {
                    this.currentUser = userProfile;
                    this.patchForm(userProfile);
                    this.successMessage = 'Profile loaded successfully';

                    setTimeout(() => {
                        this.successMessage = '';
                        this.cdr.detectChanges();
                    }, 3000);
                }
            },
            error: (err: any) => {
                console.error('Failed to load profile:', err);

                if (err.status === 401) {
                    this.errorMessage = 'Session expired. Please log in again.';
                    setTimeout(() => {
                        this.authService.logout();
                        this.router.navigate(['/auth']);
                    }, 2000);
                } else {
                    this.errorMessage = `Could not load profile: ${err.message}`;
                }
            }
        });
    }

    patchForm(user: any): void {
        console.log('Patching form with data:', user);

        const formData: any = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            photoURL: user.photoURL || '',
            about: user.about || '',
            location: user.location || '',
            work: user.work || '',
            wantedToTravel: user.wantedToTravel || '',
            pets: user.pets || '',
            uselessSkill: user.uselessSkill || '',
            funFact: user.funFact || '',
            favoriteSong: user.favoriteSong || '',
            school: user.school || '',
            spendTimeDoing: user.spendTimeDoing || '',
            dateOfBirth: user.dateOfBirth || '',
            showTheDecade: user.showTheDecade !== undefined ? user.showTheDecade : true,
            languageIds: Array.isArray(user.languageIds) ? user.languageIds : [],
            interestIds: Array.isArray(user.interestIds) ? user.interestIds : [],
            roles: Array.isArray(user.roles) ? user.roles : []
        };

        // Format date for input[type="date"]
        if (formData.dateOfBirth && typeof formData.dateOfBirth === 'string') {
            const date = new Date(formData.dateOfBirth);
            if (!isNaN(date.getTime())) {
                formData.dateOfBirth = date.toISOString().split('T')[0];
            }
        }

        console.log('Form data to patch:', formData);
        this.profileForm.patchValue(formData);
        this.cdr.detectChanges();
    }

    toggleEditMode(): void {
        this.isEditing = !this.isEditing;

        if (this.isEditing) {
            this.profileForm.enable();
            // Keep certain fields disabled
            this.profileForm.get('languageIds')?.disable();
            this.profileForm.get('interestIds')?.disable();
            this.profileForm.get('roles')?.disable();
        } else {
            this.profileForm.disable();
        }
        this.cdr.detectChanges();
    }

    onSubmit(): void {
        if (this.profileForm.invalid) {
            this.markFormGroupTouched(this.profileForm);
            this.errorMessage = 'Please fill in all required fields correctly.';
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const formData = this.profileForm.getRawValue();

        // Clean data
        const cleanedData: any = {};
        Object.keys(formData).forEach(key => {
            if (formData[key] === '' || formData[key] === null || formData[key] === undefined) {
                cleanedData[key] = null;
            } else {
                cleanedData[key] = formData[key];
            }
        });

        // Ensure arrays are empty if not provided
        cleanedData.languageIds = Array.isArray(cleanedData.languageIds) ? cleanedData.languageIds : [];
        cleanedData.interestIds = Array.isArray(cleanedData.interestIds) ? cleanedData.interestIds : [];
        cleanedData.roles = Array.isArray(cleanedData.roles) ? cleanedData.roles : [];

        console.log('Submitting cleaned data:', cleanedData);

        this.userService.updateCurrentUser(cleanedData).pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (response: any) => {
                console.log('Update successful:', response);

                if (response.user) {
                    this.currentUser = response.user;
                    this.patchForm(response.user);
                    this.isEditing = false;
                    this.profileForm.disable();
                    this.successMessage = response.message || 'Profile updated successfully!';

                    // Update auth service
                    if (response.user.email || response.user.firstName || response.user.lastName) {
                        const currentAuthUser = this.authService.getCurrentUser();
                        if (currentAuthUser) {
                            const updatedUser = {
                                ...currentAuthUser,
                                firstName: response.user.firstName || currentAuthUser.firstName,
                                lastName: response.user.lastName || currentAuthUser.lastName,
                                email: response.user.email || currentAuthUser.email,
                                photoURL: response.user.photoURL || currentAuthUser.photoURL
                            };
                            this.authService.updateCurrentUser(updatedUser);
                        }
                    }
                } else {
                    this.successMessage = 'Profile updated successfully!';
                }

                setTimeout(() => {
                    this.successMessage = '';
                    this.cdr.detectChanges();
                }, 3000);
            },
            error: (err: HttpErrorResponse) => {
                console.error('Update failed:', err);

                if (err.error?.errors) {
                    const errorMessages = Object.values(err.error.errors).flat().join(', ');
                    this.errorMessage = `Validation errors: ${errorMessages}`;
                } else if (err.error?.message) {
                    this.errorMessage = err.error.message;
                } else {
                    this.errorMessage = 'Failed to update profile. Please try again.';
                }
            }
        });
    }

    onPhotoUpload(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];

        if (!file) return;

        // Validate file
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type.toLowerCase())) {
            this.errorMessage = 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP.';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.errorMessage = 'File is too large. Maximum size is 5MB.';
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.userService.uploadProfilePhoto(file).pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (response: any) => {
                console.log('Photo upload successful:', response);

                if (response.success) {
                    this.successMessage = response.message || 'Photo uploaded successfully!';

                    if (response.photoURL) {
                        this.currentUser.photoURL = response.photoURL;
                        this.profileForm.patchValue({ photoURL: response.photoURL });
                    }

                    if (response.user) {
                        this.currentUser = { ...this.currentUser, ...response.user };
                    }

                    setTimeout(() => {
                        this.successMessage = '';
                        this.cdr.detectChanges();
                    }, 3000);

                    // Clear file input
                    input.value = '';
                }
            },
            error: (err: HttpErrorResponse) => {
                console.error('Photo upload failed:', err);
                this.errorMessage = err.error?.message || 'Failed to upload photo. Please try again.';
                input.value = '';
            }
        });
    }

    deleteAccount(): void {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        this.loading = true;
        this.userService.deleteUser().subscribe({
            next: () => {
                this.loading = false;
                alert('Account deleted successfully.');
                this.authService.logout();
                this.router.navigate(['/auth']);
            },
            error: (err) => {
                this.loading = false;
                console.error('Failed to delete account:', err);
                this.errorMessage = 'Failed to delete account. Please try again.';
            }
        });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth']);
    }

    toggleDebugInfo(): void {
        this.showDebugInfo = !this.showDebugInfo;
        if (this.showDebugInfo) {
            this.userService.debugAuthInfo();
        }
        this.cdr.detectChanges();
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    getFieldError(field: string): string {
        const control = this.profileForm.get(field);
        if (control?.touched && control?.errors) {
            if (control.errors['required']) {
                return 'This field is required';
            }
        }
        return '';
    }

    hasError(field: string): boolean {
        const control = this.profileForm.get(field);
        return !!(control && control.invalid && (control.touched || control.dirty));
    }
}