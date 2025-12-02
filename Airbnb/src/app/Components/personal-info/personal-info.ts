import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../Services/user.service';

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
        private router: Router
    ) { }

    ngOnInit() {
        this.loadUserData();
    }

    loadUserData() {
        this.loading = true;
        this.userService.getMyProfile().subscribe({
            next: (data) => {
                this.user = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading profile', err);
                this.error = 'Failed to load user data';
                this.loading = false;
            }
        });
    }

    saveField(field: string) {
        this.userService.updateUser(this.user.id, this.user).subscribe({
            next: (res) => {
                this.stopEditing(field);
            },
            error: (err) => {
                console.error('Error updating profile', err);
                alert('Failed to update profile');
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
}
