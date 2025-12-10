import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = "https://localhost:7020/api/Account";

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // ============ Get User Profile ============
  getMyProfile(): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && (currentUser.id || currentUser.Id || currentUser.userId || currentUser.username)) {
      console.log('Returning cached user from AuthService');
      return of(currentUser);
    }

    console.log('No user cached');
    return of(null);
  }

  // ============ Update Current User ============
  updateCurrentUser(userData: any): Observable<any> {
    try {
      return this.authService.updateUserProfile(userData).pipe(
        catchError(error => {
          console.error('Error updating profile via AuthService:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Cannot update profile:', error);
      return throwError(() => error);
    }
  }

  // ============ Delete User Account ============
  deleteUser(): Observable<any> {
    try {
      return this.authService.deleteUserAccount().pipe(
        catchError(error => {
          console.error('Error deleting account via AuthService:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Cannot delete account:', error);
      return throwError(() => error);
    }
  }

  // ============ Change Password ============
  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.authService.changePassword(passwordData).pipe(
      catchError(error => {
        console.error('Error changing password:', error);
        return throwError(() => error);
      })
    );
  }

  // ============ Update Specific Field ============
  updateUserField(field: string, value: any): Observable<any> {
    const updateData = { [field]: value };
    return this.updateCurrentUser(updateData);
  }

  // ============ Upload Profile Photo ============
  uploadPhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/upload-photo`, formData).pipe(
      catchError(error => {
        console.error('Error uploading photo:', error);
        return throwError(() => error);
      })
    );
  }

  // ============ Get User Stats ============
  getUserStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`).pipe(
      catchError(error => {
        console.error('Error fetching user stats:', error);
        return throwError(() => error);
      })
    );
  }

  // ============ Helper Methods ============
  getCurrentUserId(): string | null {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id || currentUser?.Id || currentUser?.userId || null;
  }

  isCurrentUserAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getCurrentUsername(): string | null {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.username || currentUser?.email || null;
  }
}
