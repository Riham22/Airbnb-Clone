import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../Services/user.service';
import { AuthService } from '../../Services/auth';
import { User } from '../../Models/User';

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

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private authService: AuthService
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

    onSubmit() {
        if (this.profileForm.valid && this.currentUser) {
            this.loading = true;
            this.successMessage = '';
            this.errorMessage = '';

            const updatedData = this.profileForm.getRawValue();

            this.userService.updateUser(this.currentUser.id, updatedData).subscribe({
                next: (res) => {
                    this.successMessage = 'Profile updated successfully';
                    this.loading = false;
                    // Update local auth state if necessary
                },
                error: (err) => {
                    console.error('Error updating profile', err);
                    this.errorMessage = 'Failed to update profile';
                    this.loading = false;
                }
            });
        }
    }
}
