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

        // Prepare update data - only update the field being edited
        const updateData: any = {};

        switch(field) {
            case 'name':
                updateData.firstName = this.user.firstName || this.user.given_name;
                updateData.lastName = this.user.lastName || this.user.family_name;
                break;
            case 'email':
                updateData.email = this.user.email || this.user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
                break;
            case 'phone':
                updateData.phone = this.user.phone;
                break;
            case 'address':
                updateData.address = this.user.address;
                break;
        }

        // Use UserService to update
        this.userService.updateCurrentUser(updateData).subscribe({
            next: (res) => {
                console.log('Field updated successfully:', field, res);
                this.stopEditing(field);

                // Update local auth state
                if (res) {
                    this.user = { ...this.user, ...updateData };
                    // this.authService.updateCurrentUser(this.user);
                }
            },
            error: (err) => {
                console.error('Error updating field', field, err);
                alert('Note: Profile update feature might not be available on this server. Changes saved locally only.');
                this.stopEditing(field);

                // Still update locally even if API fails
                this.user = { ...this.user, ...updateData };
                // this.authService.updateCurrentUser(this.user);
            }
        });
    }

    startEditing(field: string) {
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
