import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth';

@Component({
    selector: 'app-forget-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './forget-password.component.html',
    styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent {
    email: string = '';
    isLoading: boolean = false;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(private authService: AuthService) { }

    onSubmit() {
        if (!this.email) return;

        this.isLoading = true;
        this.successMessage = '';
        this.errorMessage = '';

        this.authService.forgetPassword(this.email).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                this.successMessage = res.message || 'Reset link sent successfully!';
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
                console.error('Forget password error:', err);
            }
        });
    }
}
