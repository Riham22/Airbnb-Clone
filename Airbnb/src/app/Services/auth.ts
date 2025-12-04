import { Injectable } from '@angular/core';
import { BehaviorSubject, tap, catchError, of, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "https://localhost:7020/api/Account";
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<any>(null);

  isAuthenticated$ = this.isAuthenticated.asObservable();
  currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // Login method
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<{ token: string; expiration: string }>(`${this.apiUrl}/Login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('token_expiration', response.expiration);

          // Fetch user profile after successful login
          this.fetchUserProfile().subscribe({
            next: (user) => {
              this.currentUser.next(user);
              localStorage.setItem('user', JSON.stringify(user));
              this.isAuthenticated.next(true);
            },
            error: (err) => {
              console.error('Failed to fetch user profile:', err);
              this.isAuthenticated.next(true);
            }
          });
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of(null);
      })
    );
  }

  // Signup method
  signup(data: any): Observable<any> {
    const signupData = {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : null
    };

    return this.http.post(`${this.apiUrl}/Register`, signupData, {
      responseType: 'text' as 'json'
    }).pipe(
      tap((response: any) => {
        console.log('Signup successful:', response);
      }),
      catchError(error => {
        console.error('Signup error:', error);
        throw error;
      })
    );
  }

  // Forget Password method - ADDED THIS
  forgetPassword(email: string): Observable<any> {
    const dto = { email };
    return this.http.post(`${this.apiUrl}/ForgetPassword`, dto).pipe(
      tap((response: any) => {
        console.log('Forget password request sent:', response);
      }),
      catchError(error => {
        console.error('Forget password error:', error);
        throw error;
      })
    );
  }

  // Reset Password method - You might need this too
  resetPassword(data: { email: string; token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/ResetPassword`, data).pipe(
      tap((response: any) => {
        console.log('Password reset successful:', response);
      }),
      catchError(error => {
        console.error('Reset password error:', error);
        throw error;
      })
    );
  }

  // Change Password method
  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/ChangePassword`, data).pipe(
      tap((response: any) => {
        console.log('Password changed successfully:', response);
      }),
      catchError(error => {
        console.error('Change password error:', error);
        throw error;
      })
    );
  }

  // Fetch user profile
  fetchUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Profile`).pipe(
      catchError(error => {
        console.error('Failed to fetch profile:', error);
        return of(null);
      })
    );
  }

  // Load user from storage
  loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const tokenExpiration = localStorage.getItem('token_expiration');

    if (token && userData && tokenExpiration) {
      const expirationDate = new Date(tokenExpiration);
      if (expirationDate > new Date()) {
        this.isAuthenticated.next(true);
        this.currentUser.next(JSON.parse(userData));
      } else {
        this.logout();
      }
    }
  }

  // Logout
  logout() {
    localStorage.clear();
    this.isAuthenticated.next(false);
    this.currentUser.next(null);
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if logged in
  isLoggedIn(): boolean {
    return this.isAuthenticated.value;
  }

  // Get current user
  getCurrentUser(): any {
    return this.currentUser.value;
  }

  // Check authentication
  checkAuthentication() {
    const token = this.getToken();
    if (token) {
      const tokenExpiration = localStorage.getItem('token_expiration');
      if (tokenExpiration && new Date(tokenExpiration) > new Date()) {
        this.isAuthenticated.next(true);
        this.loadUserFromStorage();

        this.fetchUserProfile().subscribe(user => {
          if (user) {
            this.currentUser.next(user);
            localStorage.setItem('user', JSON.stringify(user));
          }
        });
      } else {
        this.logout();
      }
    }
  }

  // Optional: Google login
  googleLogin(idToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/GoogleLogin`, { idToken }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('token_expiration', response.expire);
          this.isAuthenticated.next(true);
          
          this.fetchUserProfile().subscribe(user => {
            if (user) {
              this.currentUser.next(user);
              localStorage.setItem('user', JSON.stringify(user));
            }
          });
        }
      }),
      catchError(error => {
        console.error('Google login error:', error);
        throw error;
      })
    );
  }
}