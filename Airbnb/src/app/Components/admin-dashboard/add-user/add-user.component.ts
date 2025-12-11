import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../../Services/Admin.service';

@Component({
    selector: 'app-add-user',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './add-user.component.html',
    styleUrls: ['./add-user.component.css']
})
export class AddUserComponent {
    newUser = {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    };
    isLoading = false;

    constructor(
        private adminService: AdminService,
        private router: Router
    ) { }

    goBack() {
        this.router.navigate(['/admin']);
    }

    onSubmit() {
        if (!this.newUser.firstName || !this.newUser.lastName || !this.newUser.email || !this.newUser.password) {
            alert('Please fill in all fields');
            return;
        }

        this.isLoading = true;
        const userPayload = {
            Username: this.newUser.email,
            Email: this.newUser.email,
            Password: this.newUser.password,
            FirstName: this.newUser.firstName,
            LastName: this.newUser.lastName,
            DateOfBirth: '2000-01-01'
        };

        this.adminService.createUser(userPayload).subscribe({
            next: () => {
                alert('User created successfully');
                this.isLoading = false;
                this.router.navigate(['/admin']);
            },
            error: (err) => {
                console.error('Create User Error:', err);
                alert(`Failed to create user: ${err.error?.message || err.message}`);
                this.isLoading = false;
            }
        });
    }
}
