// // auth.component.ts
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router, RouterModule } from '@angular/router';
// import { AuthService } from '../../Services/auth';

// @Component({
//   selector: 'app-auth',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   templateUrl: './auth.html',
//   styleUrl: './auth.css'
// })
// export class AuthComponent {
//   isLoginMode = true;
//   isLoading = false;

//   // Form models
//   loginData = {
//     username: '',
//     password: ''
//   };

//   signupData = {
//     firstName: '',
//     lastName: '',
//     username: '',
//     password: '',
//     month: '',
//     day: '',
//     year: ''
//   };

//   // Months for birthday selection
//   months = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];

//   // Days (1-31)
//   days = Array.from({ length: 31 }, (_, i) => i + 1);

//   // Years (current year - 120 to current year - 13)
//   currentYear = new Date().getFullYear();
//   years = Array.from({ length: 108 }, (_, i) => this.currentYear - i - 13);

//   constructor(
//     private router: Router,
//     private authService: AuthService
//   ) { }

//   navigateToHome() {
//     this.router.navigate(['/']);
//   }

//   toggleMode() {
//     this.isLoginMode = !this.isLoginMode;
//     // Clear form data when switching modes
//     this.loginData = { username: '', password: '' };
//     this.signupData = {
//       firstName: '', lastName: '', username: '', password: '',
//       month: '', day: '', year: ''
//     };
//   }

//   onLogin() {
//     this.isLoading = true;
//     console.log('Login attempt:', this.loginData);

//     const userData = {
//       username: this.loginData.username,
//       password: this.loginData.password
//     };

//     this.authService.login(userData).subscribe({
//       next: () => {
//         this.isLoading = false;
//         this.router.navigate(['/']);
//       },
//       error: (err) => {
//         console.error('Login failed', err);
//         this.isLoading = false;
//         alert('Login failed. Please check your credentials.');
//       }
//     });
//   }

//   onSignup() {
//     this.isLoading = true;
//     console.log('Signup attempt:', this.signupData);
//    const dateOfBirth = `${this.signupData.year}-${this.months.indexOf(this.signupData.month) + 1}-${this.signupData.day}`;

//     const userData = {
//       username: this.signupData.username,
//       firstName: this.signupData.firstName,
//       lastName: this.signupData.lastName,
//       email: this.signupData.username,
//       password: this.signupData.password,
//       dateOfBirth: dateOfBirth
//       // Add other fields as expected by your backend registration endpoint
//     };

//     this.authService.signup(userData).subscribe({
//       next: () => {
//         this.isLoading = false;
//         this.router.navigate(['/']);
//       },
//       error: (err) => {
//         console.error('Signup failed', err);
//         this.isLoading = false;
//         alert('Signup failed. Please try again.');
//       }
//     });
//   }

//   onSubmit() {
//     if (this.isLoginMode) {
//       this.onLogin();
//     } else {
//       this.onSignup();
//     }
//   }

//   // Get current username based on mode
//   get currentEmail(): string {
//     return this.isLoginMode ? this.loginData.username : this.signupData.username;
//   }

//   set currentEmail(value: string) {
//     if (this.isLoginMode) {
//       this.loginData.username = value;
//     } else {
//       this.signupData.username = value;
//     }
//   }

//   // Get current password based on mode
//   get currentPassword(): string {
//     return this.isLoginMode ? this.loginData.password : this.signupData.password;
//   }

//   set currentPassword(value: string) {
//     if (this.isLoginMode) {
//       this.loginData.password = value;
//     } else {
//       this.signupData.password = value;
//     }
//   }

 
//   // Utility methods
//   getAge(): number {
//     if (!this.signupData.year || !this.signupData.month || !this.signupData.day) {
//       return 0;
//     }
//     const birthDate = new Date(
//       parseInt(this.signupData.year),
//       this.months.indexOf(this.signupData.month),
//       parseInt(this.signupData.day)
//     );
//     const ageDiff = Date.now() - birthDate.getTime();
//     return Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
//   }

//   isSignupValid(): boolean {
//     if (!this.signupData.firstName || !this.signupData.lastName ||
//       !this.signupData.username || !this.signupData.password) {
//       return false;
//     }

//     // Check if birthday is complete and user is at least 13 years old
//     if (!this.signupData.month || !this.signupData.day || !this.signupData.year) {
//       return false;
//     }

//     return this.getAge() >= 13;
//   }

//   isLoginValid(): boolean {
//     return !!this.loginData.username && !!this.loginData.password;
//   }
// }
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
    username: '',
    password: ''
  };

  signupData = {
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    month: '',
    day: '',
    year: ''
  };

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  days = Array.from({ length: 31 }, (_, i) => i + 1);

  currentYear = new Date().getFullYear();
  years = Array.from({ length: 108 }, (_, i) => this.currentYear - i - 13);

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.loginData = { username: '', password: '' };
    this.signupData = {
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      month: '',
      day: '',
      year: ''
    };
  }

  // ------------------------
  // LOGIN
  // ------------------------
  onLogin() {
    this.isLoading = true;

    const userData = {
      username: this.loginData.username,
      password: this.loginData.password
    };

    this.authService.login(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.isLoading = false;
        alert('Login failed. Please check your credentials.');
      }
    });
  }

  // ------------------------
  // SIGNUP (fixed version)
  // ------------------------
  onSignup() {
    this.isLoading = true;

    // Zero-pad month/day
    const monthNum = (this.months.indexOf(this.signupData.month) + 1).toString().padStart(2, '0');
    const dayNum = this.signupData.day.toString().padStart(2, '0');

    const dateOfBirth = `${this.signupData.year}-${monthNum}-${dayNum}`;

    const userData = {
      username: this.signupData.username,
      firstName: this.signupData.firstName,
      lastName: this.signupData.lastName,
      email: this.signupData.username,
      password: this.signupData.password,
      dateOfBirth: dateOfBirth
    };

    // IMPORTANT FIX → backend expects registerDTO wrapper
    this.authService.signup(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Signup failed', err);
        this.isLoading = false;
        alert('Signup failed. Please try again.');
      }
    });
  }

  onSubmit() {
    if (this.isLoginMode) {
      this.onLogin();
    } else {
      this.onSignup();
    }
  }

  // Dynamic email/password bindings
  get currentEmail(): string {
    return this.isLoginMode ? this.loginData.username : this.signupData.username;
  }

  set currentEmail(value: string) {
    if (this.isLoginMode) {
      this.loginData.username = value;
    } else {
      this.signupData.username = value;
    }
  }

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
    if (!this.signupData.firstName ||
        !this.signupData.lastName ||
        !this.signupData.username ||
        !this.signupData.password) {
      return false;
    }
    if (!this.signupData.month || !this.signupData.day || !this.signupData.year) {
      return false;
    }
    return this.getAge() >= 13;
  }

  isLoginValid(): boolean {
    return !!this.loginData.username && !!this.loginData.password;
  }
}
