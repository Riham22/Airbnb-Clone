import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';

  // Date restrictions for date picker
  maxDate: string;
  minDate: string;

  loginData = {
    username: '',
    password: ''
  };

  signupData = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) { 
    // Set date restrictions (must be at least 13 years old, max 150 years)
    const today = new Date();
    this.maxDate = this.formatDate(new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()));
    this.minDate = this.formatDate(new Date(today.getFullYear() - 150, today.getMonth(), today.getDate()));
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.loginData = { username: '', password: '' };
    this.signupData = {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: ''
    };
  }

  onLogin() {
    if (!this.isLoginValid()) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData = {
      username: this.loginData.username,
      password: this.loginData.password
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.token) {
          this.router.navigate(['/account']);
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }

  onSignup() {
    if (!this.isSignupValid()) {
      this.errorMessage = 'Please fill in all required fields and ensure passwords match.';
      return;
    }

    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.getAge() < 13) {
      this.errorMessage = 'You must be at least 13 years old to create an account.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const signupData = {
      username: this.signupData.username,
      email: this.signupData.email,
      firstName: this.signupData.firstName,
      lastName: this.signupData.lastName,
      password: this.signupData.password,
      dateOfBirth: this.signupData.dateOfBirth
    };

    this.authService.signup(signupData).subscribe({
      next: (response) => {
        this.isLoading = false;
        alert('Signup successful! Please log in with your credentials.');
        this.toggleMode(); // Switch to login mode
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
      }
    });
  }

  onSubmit() {
    this.isLoginMode ? this.onLogin() : this.onSignup();
  }

  // Getter/setters for template binding
  get currentEmail(): string {
    return this.isLoginMode ? this.loginData.username : this.signupData.email;
  }

  set currentEmail(value: string) {
    if (this.isLoginMode) this.loginData.username = value;
    else this.signupData.email = value;
  }

  get currentPassword(): string {
    return this.isLoginMode ? this.loginData.password : this.signupData.password;
  }

  set currentPassword(value: string) {
    if (this.isLoginMode) this.loginData.password = value;
    else this.signupData.password = value;
  }

  getAge(): number {
    if (!this.signupData.dateOfBirth) return 0;
    
    const birthDate = new Date(this.signupData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  isSignupValid(): boolean {
    return !!this.signupData.firstName &&
           !!this.signupData.lastName &&
           !!this.signupData.username &&
           !!this.signupData.email &&
           !!this.signupData.password &&
           !!this.signupData.confirmPassword &&
           !!this.signupData.dateOfBirth &&
           this.getAge() >= 13;
  }

  isLoginValid(): boolean {
    return !!this.loginData.username && !!this.loginData.password;
  }
}