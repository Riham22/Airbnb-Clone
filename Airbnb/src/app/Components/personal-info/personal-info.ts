import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../Services/user.service';
import { AuthService } from '../../Services/auth';

@Component({
    selector: 'app-personal-info',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './personal-info.html',
    styleUrls: ['./personal-info.css']
})
export class PersonalInfoComponent implements OnInit {
    user: any = {};
    tempUser: any = {}; // Buffer for editing
    loading = true;
    error: string | null = null;

    // Edit states
    editingName = false;
    editingEmail = false;
    editingPhone = false;
    editingAddress = false;

    constructor(
        private userService: UserService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        // Check if user is logged in
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/auth']);
            return;
        }

        this.loadUserData();
    }

    loadUserData() {
        this.loading = true;
        this.userService.getMyProfile().subscribe({
            next: (data: any) => {
                if (data) {
                    this.user = data;
                    console.log('Loaded user data:', this.user);
                } else {
                    // Fallback to auth service data
                    this.user = this.authService.getCurrentUser() || {};
                    console.log('Using auth service data:', this.user);
                }
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Error loading profile', err);
                // Fallback to auth service data
                this.user = this.authService.getCurrentUser() || {};
                console.log('Using fallback auth service data:', this.user);
                this.loading = false;
            }
        });
    }

    saveField(field: string) {
        if (!this.user.id && !this.user.Id && !this.user.userId) {
            alert('Cannot save: No user ID available');
            return;
        }

        const userId = this.user.id || this.user.Id || this.user.userId;

        // Prepare update data - use tempUser values
        const updateData: any = {};

        switch (field) {
            case 'name':
                updateData.firstName = this.tempUser.firstName;
                updateData.lastName = this.tempUser.lastName;
                break;
            case 'email':
                updateData.email = this.tempUser.email;
                break;
            case 'phone':
                updateData.phone = this.tempUser.phoneNumber; // Careful with mapping
                break;
            case 'address':
                updateData.address = this.tempUser.address;
                break;
        }

        // Use UserService to update
        this.userService.updateCurrentUser(updateData).subscribe({
            next: (res) => {
                console.log('Field updated successfully:', field, res);

                // Update main user object with confirmed changes
                if (field === 'name') {
                    this.user.firstName = this.tempUser.firstName;
                    this.user.lastName = this.tempUser.lastName;
                } else if (field === 'email') {
                    this.user.email = this.tempUser.email;
                } else if (field === 'phone') {
                    this.user.phoneNumber = this.tempUser.phoneNumber;
                } else if (field === 'address') {
                    this.user.address = this.tempUser.address;
                }

                this.stopEditing(field);

                // Update local auth state
                // this.authService.updateCurrentUser(this.user);
                alert('Profile updated successfully'); // Feedback for user
            },
            error: (err) => {
                console.error('Error updating field', field, err);
                // alert('Note: Profile update feature might not be available on this server. Changes saved locally only.');
                alert(`Failed to update profile: ${err.message || 'Unknown error'}`);

                // OPTIONAL: If we want to support local-only updates when backend fails (as requested before?)
                // For now, let's treat error as error to be safe, but keep old behavior if user insists
                // this.stopEditing(field);
                // this.user = { ...this.user, ...updateData };
            }
        });
    }

    startEditing(field: string) {
        // Initialize tempUser with current values
        this.tempUser = { ...this.user };

        if (field === 'name') this.editingName = true;
        if (field === 'email') this.editingEmail = true;
        if (field === 'phone') this.editingPhone = true;
        if (field === 'address') this.editingAddress = true;
    }

    stopEditing(field: string) {
        if (field === 'name') this.editingName = false;
        if (field === 'email') this.editingEmail = false;
        if (field === 'phone') this.editingPhone = false;
        if (field === 'address') this.editingAddress = false;

        // Clear temp user (optional, but clean)
        this.tempUser = {};
    }

    // Helper methods to get user properties safely
    getFullName(): string {
        const firstName = this.user.firstName || this.user.given_name || '';
        const lastName = this.user.lastName || this.user.family_name || '';
        return `${firstName} ${lastName}`.trim() || 'Not set';
    }

    getEmail(): string {
        return this.user.email ||
            this.user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
            'Not set';
    }

    getPhone(): string {
        return this.user.phone || this.user.phoneNumber || 'Not set';
    }

    getAddress(): string {
        return this.user.address || this.user.location || 'Not set';
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/auth']);
    }
}
