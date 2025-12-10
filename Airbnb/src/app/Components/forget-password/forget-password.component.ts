import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent {
  // For forget password form
  email: string = '';

  // For reset password form (if you want both in same component)
  resetData = {
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: ''
  };

  isForgetMode: boolean = true;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  // Submit forget password request
  onSubmitForget() {
    if (!this.email || this.email.trim() === '') {
      this.errorMessage = 'Please enter your email or username';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.forgetPassword(this.email).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage = res.message || 'Reset link sent to your email!';

        // If token is returned (for development), show reset form
        if (res.resetToken) {
          this.resetData.email = this.email;
          this.resetData.token = res.resetToken;
          this.isForgetMode = false;
          this.successMessage += ' You can now reset your password.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to send reset link. Please try again.';
        console.error('Forget password error:', err);
      }
    });
  }

  // Submit reset password
  onSubmitReset() {
    if (!this.validateResetForm()) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const resetData = {
      email: this.resetData.email,
      token: this.resetData.token,
      newPassword: this.resetData.newPassword
    };

    this.authService.resetPassword(resetData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage = res.message || 'Password reset successful! You can now login.';

        // Redirect to login after delay
        setTimeout(() => {
          this.router.navigate(['/auth']);
        }, 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to reset password. Please try again.';
        console.error('Reset password error:', err);
      }
    });
  }

  // Toggle between forget and reset modes
  toggleMode() {
    this.isForgetMode = !this.isForgetMode;
    this.clearMessages();
  }

  // Validation helpers
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateResetForm(): boolean {
    if (!this.resetData.email || !this.validateEmail(this.resetData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    if (!this.resetData.token) {
      this.errorMessage = 'Reset token is required';
      return false;
    }

    if (!this.resetData.newPassword || this.resetData.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return false;
    }

    if (this.resetData.newPassword !== this.resetData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    return true;
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }



}
