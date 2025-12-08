import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
<<<<<<< HEAD
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
=======
import { Observable } from 'rxjs';
import { User } from '../Models/User';
>>>>>>> 6c1b37138f6275b6b13adc2f9f507f0959f26db3
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
<<<<<<< HEAD
  private apiUrl = "https://localhost:7020/api/Acount";

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

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
=======
    private apiUrl = 'https://localhost:7020/api/User';

    constructor(private http: HttpClient, private authService: AuthService) { }

    getUser(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
>>>>>>> 6c1b37138f6275b6b13adc2f9f507f0959f26db3
    }
  }

<<<<<<< HEAD
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
=======
    updateUser(id: string, user: Partial<User>): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, user);
>>>>>>> 6c1b37138f6275b6b13adc2f9f507f0959f26db3
    }
  }

<<<<<<< HEAD
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
=======
    // Helper to upload photo if needed separately
    uploadPhoto(id: string, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/${id}/photo`, formData);
    }

    // Helper to get current user's details using ID from token
    getMyProfile(): Observable<User> {
        const currentUser = this.authService.getCurrentUser();
        // Assuming the token has an 'id' or 'sub' field. 
        // Adjust 'id' based on your actual token structure (e.g., 'userId', 'nameid', etc.)
        const userId = currentUser?.id || currentUser?.userId || currentUser?.sub;

        if (!userId) {
            throw new Error('User ID not found in token');
        }
        return this.getUser(userId);
    }
>>>>>>> 6c1b37138f6275b6b13adc2f9f507f0959f26db3
}
