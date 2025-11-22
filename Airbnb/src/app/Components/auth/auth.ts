// auth.component.ts
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

  // Form models
  loginData = {
    email: '',
    password: ''
  };

  signupData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    month: '',
    day: '',
    year: ''
  };

  // Months for birthday selection
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days (1-31)
  days = Array.from({length: 31}, (_, i) => i + 1);

  // Years (current year - 120 to current year - 13)
  currentYear = new Date().getFullYear();
  years = Array.from({length: 108}, (_, i) => this.currentYear - i - 13);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  navigateToHome() {
    this.router.navigate(['/']);
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    // Clear form data when switching modes
    this.loginData = { email: '', password: '' };
    this.signupData = {
      firstName: '', lastName: '', email: '', password: '',
      month: '', day: '', year: ''
    };
  }

  onLogin() {
    this.isLoading = true;
    console.log('Login attempt:', this.loginData);

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;

      // Use AuthService to handle login
      const userData = {
        email: this.loginData.email,
        firstName: 'User', // In real app, this would come from backend
        lastName: 'Name'
      };

      this.authService.login(userData);

      // Navigate to home on successful login
      this.router.navigate(['/']);
    }, 1500);
  }

  onSignup() {
    this.isLoading = true;
    console.log('Signup attempt:', this.signupData);

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;

      // Use AuthService to handle signup
      const userData = {
        email: this.signupData.email,
        firstName: this.signupData.firstName,
        lastName: this.signupData.lastName
      };

      this.authService.signup(userData);

      // Navigate to home on successful signup
      this.router.navigate(['/']);
    }, 1500);
  }

  onSubmit() {
    if (this.isLoginMode) {
      this.onLogin();
    } else {
      this.onSignup();
    }
  }

  // Get current email based on mode
  get currentEmail(): string {
    return this.isLoginMode ? this.loginData.email : this.signupData.email;
  }

  set currentEmail(value: string) {
    if (this.isLoginMode) {
      this.loginData.email = value;
    } else {
      this.signupData.email = value;
    }
  }

  // Get current password based on mode
  get currentPassword(): string {
    return this.isLoginMode ? this.loginData.password : this.signupData.password;
  }

  set currentPassword(value: string) {
    if (this.isLoginMode) {
      this.loginData.password = value;
    } else {
      this.signupData.password = value;
    }
  }

  // Social login methods - updated to use AuthService
  loginWithGoogle() {
    console.log('Login with Google');
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;

      const userData = {
        email: 'google-user@example.com',
        firstName: 'Google',
        lastName: 'User'
      };

      this.authService.login(userData);
      this.router.navigate(['/']);
    }, 1500);
  }

  loginWithFacebook() {
    console.log('Login with Facebook');
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;

      const userData = {
        email: 'facebook-user@example.com',
        firstName: 'Facebook',
        lastName: 'User'
      };

      this.authService.login(userData);
      this.router.navigate(['/']);
    }, 1500);
  }

  loginWithApple() {
    console.log('Login with Apple');
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;

      const userData = {
        email: 'apple-user@example.com',
        firstName: 'Apple',
        lastName: 'User'
      };

      this.authService.login(userData);
      this.router.navigate(['/']);
    }, 1500);
  }

  // Utility methods
  getAge(): number {
    if (!this.signupData.year || !this.signupData.month || !this.signupData.day) {
      return 0;
    }
    const birthDate = new Date(
      parseInt(this.signupData.year),
      this.months.indexOf(this.signupData.month),
      parseInt(this.signupData.day)
    );
    const ageDiff = Date.now() - birthDate.getTime();
    return Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
  }

  isSignupValid(): boolean {
    if (!this.signupData.firstName || !this.signupData.lastName ||
        !this.signupData.email || !this.signupData.password) {
      return false;
    }

    // Check if birthday is complete and user is at least 13 years old
    if (!this.signupData.month || !this.signupData.day || !this.signupData.year) {
      return false;
    }

    return this.getAge() >= 13;
  }

  isLoginValid(): boolean {
    return !!this.loginData.email && !!this.loginData.password;
  }
}
