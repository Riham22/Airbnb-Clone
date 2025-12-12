import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../Services/user.service';
import { AuthService } from '../../Services/auth';
import { User } from '../../Models/User';
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
    currentUser: User | null = null;
    loading = false;
    successMessage = '';
    errorMessage = '';
    photoPreview: string | ArrayBuffer | null = null; // for previewing image
    photoFile: File | null = null; // hold selected photo
    showDeleteModal = false;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private authService: AuthService,
        private router: Router
    ) {
        this.profileForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: [{ value: '', disabled: true }], // Email usually not editable directly
            photoURL: [''],
            dateOfBirth: [''],
            work: [''],
            wantedToTravel: [''],
            pets: [''],
            uselessSkill: [''],
            showTheDecade: [false],
            funFact: [''],
            favoriteSong: [''],
            school: [''],
            spendTimeDoing: [''],
            location: [''],
            about: ['']
        });
    }

    ngOnInit(): void {
        // Get current user from Auth Service (assuming it has ID)
        const authUser = this.authService.getCurrentUser();
        if (authUser && authUser.id) {
            this.loading = true;
            this.userService.getUser(authUser.id).subscribe({
                next: (user) => {
                    this.currentUser = user;
                    this.patchForm(user);
                    this.photoPreview = user.photoURL || null;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error fetching user', err);
                    this.errorMessage = 'Failed to load user data';
                    this.loading = false;
                }
            });
        } else {
            // Fallback or redirect if no user logged in
            this.errorMessage = 'No user logged in';
        }
    }

    patchForm(user: User) {
        this.profileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            photoURL: user.photoURL,
            dateOfBirth: user.dateOfBirth,
            work: user.work,
            wantedToTravel: user.wantedToTravel,
            pets: user.pets,
            uselessSkill: user.uselessSkill,
            showTheDecade: user.showTheDecade,
            funFact: user.funFact,
            favoriteSong: user.favoriteSong,
            school: user.school,
            spendTimeDoing: user.spendTimeDoing,
            location: user.location,
            about: user.about
        });
    }

    onPhotoFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.photoFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                this.photoPreview = e.target?.result;
                // Also update form value so on submit we'll send base64 string if new file
                this.profileForm.patchValue({ photoURL: this.photoPreview });
            };
            reader.readAsDataURL(this.photoFile);
        }
    }

    onSubmit() {
        if (this.profileForm.valid && this.currentUser) {
            this.loading = true;
            this.successMessage = '';
            this.errorMessage = '';
            let updatedData = this.profileForm.getRawValue();

            // If photoFile set and photoPreview is a base64 string, send it
            if (this.photoFile && this.photoPreview && typeof this.photoPreview === 'string' && this.photoPreview.startsWith('data:image')) {
                updatedData.photoURL = this.photoPreview;
            } else if (this.currentUser.photoURL && !updatedData.photoURL) {
                // If no new file selected, preserve the original photoURL
                updatedData.photoURL = this.currentUser.photoURL;
            }

            this.userService.updateUser(this.currentUser.id, updatedData).subscribe({
                next: (res) => {
                    this.successMessage = 'Profile updated successfully';
                    this.loading = false;
                    // Update local auth state or profile as needed
                },
                error: (err) => {
                    console.error('Error updating profile', err);
                    this.errorMessage = 'Failed to update profile';
                    this.loading = false;
                }
            });
        }
    }

    deleteAccount() {
        this.showDeleteModal = true;
    }

    confirmDeleteAccount() {
        if (!this.currentUser) return;
        this.loading = true;
        this.userService.deleteUser(this.currentUser.id).subscribe({
            next: (res) => {
                this.successMessage = 'Account deleted successfully.';
                this.errorMessage = '';
                this.loading = false;
                this.currentUser = null;
                this.profileForm.reset();
                this.showDeleteModal = false;
                setTimeout(() => {
                    this.router.navigate(['/auth']);
                }, 1200); // Give user short feedback
            },
            error: (err) => {
                this.successMessage = '';
                this.loading = false;
                this.showDeleteModal = false;
                this.errorMessage = 'Failed to delete account.';
            }
        });
    }

    cancelDelete() {
        this.showDeleteModal = false;
    }
}
