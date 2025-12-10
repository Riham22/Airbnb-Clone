// user.service.ts - Updated to consume /api/User endpoints
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AuthService } from './auth';

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  about?: string;
  location?: string;
  work?: string;
  wantedToTravel?: string;
  pets?: string;
  uselessSkill?: string;
  showTheDecade?: boolean;
  funFact?: string;
  favoriteSong?: string;
  school?: string;
  spendTimeDoing?: string;
  dateOfBirth?: string;
  languageIds?: number[];
  interestIds?: number[];
  roles?: string[];
}

export interface UserProfile extends UserProfileUpdate {
  id?: string;
  email?: string;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
  languages?: any[];
  interests?: any[];
  isVerified?: boolean;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userApiUrl = "https://localhost:7020/api/User";
  private accountApiUrl = "https://localhost:7020/api/Acount";

  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  userProfile$ = this.userProfileSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadUserProfileFromStorage();
  }

  // ============ Get Auth Headers ============
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getUserId(): string | null {
    const currentUser = this.authService.getCurrentUser();

    // Try all possible user ID locations
    const possibleIds = [
      currentUser?.id,
      currentUser?.Id,
      currentUser?.userId,
      currentUser?.UserId,
      currentUser?.sub,
      currentUser?.nameid,
      currentUser?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      currentUser?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid']
    ];

    return possibleIds.find(id => id != null && id !== '') || null;
  }

  // ============ Get User Profile ============
  getMyProfile(): Observable<UserProfile> {
    // Check cache first
    const cachedProfile = this.userProfileSubject.value;
    if (cachedProfile) {
      return of(cachedProfile);
    }

    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get<UserProfile>(`${this.userApiUrl}/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(profile => {
        this.userProfileSubject.next(profile);
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }),
      catchError(error => {
        console.error('Error fetching user profile:', error);
        return throwError(() => error);
      })
    );
  }

  // ============ Update User Profile ============
  updateCurrentUser(userData: UserProfileUpdate): Observable<UserProfile> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.put<UserProfile>(`${this.userApiUrl}/${userId}`, userData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(updatedProfile => {
        // Update local storage
        this.userProfileSubject.next(updatedProfile);
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

        // Also update auth service user data with basic info
        const currentAuthUser = this.authService.getCurrentUser();
        if (currentAuthUser) {
          const updatedAuthUser = {
            ...currentAuthUser,
            firstName: userData.firstName || currentAuthUser.firstName,
            lastName: userData.lastName || currentAuthUser.lastName,
            email: updatedProfile.email || currentAuthUser.email
          };
          this.authService.updateCurrentUser(updatedAuthUser);
        }
      }),
      catchError(error => {
        console.error('Error updating user profile:', error);
        return throwError(() => error);
      })
    );
  }

  // ============ Update Specific Field ============
  updateUserField(field: keyof UserProfileUpdate, value: any): Observable<UserProfile> {
    const updateData = { [field]: value } as UserProfileUpdate;
    return this.updateCurrentUser(updateData);
  }

  // ============ Upload Profile Photo ============
  uploadProfilePhoto(file: File): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.userApiUrl}/${userId}/upload-photo`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`
      })
    }).pipe(
      tap((response: any) => {
        if (response.photoURL) {
          this.updateUserField('photoURL', response.photoURL).subscribe();
        }
      }),
      catchError(error => {
        console.error('Error uploading photo:', error);
        return throwError(() => error);
      })
    );
  }

  // ============ Delete User Account ============
  deleteUser(): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.delete(`${this.accountApiUrl}/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        this.userProfileSubject.next(null);
        localStorage.removeItem('userProfile');
        this.authService.logout();
      }),
      catchError(error => {
        console.error('Error deleting account:', error);
        return throwError(() => error);
      })
    );
  }

  // ============ Change Password ============
  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.accountApiUrl}/ChangePassword`, passwordData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error changing password:', error);
        return throwError(() => error);
      })
    );
  }

  // ============ Get All Languages ============
  getLanguages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.userApiUrl}/languages`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching languages:', error);
        return throwError(() => error);
      })
    );
  }

  // ============ Get All Interests ============
  getInterests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.userApiUrl}/interests`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching interests:', error);
        return throwError(() => error);
      })
    );
  }

  // ============ Search Users ============
  searchUsers(query: string): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.userApiUrl}/search`, {
      headers: this.getAuthHeaders(),
      params: { query }
    }).pipe(
      catchError(error => {
        console.error('Error searching users:', error);
        return throwError(() => error);
      })
    );
  }

  // ============ Get User Stats ============
  getUserStats(userId?: string): Observable<any> {
    const targetUserId = userId || this.getUserId();
    if (!targetUserId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.get(`${this.userApiUrl}/${targetUserId}/stats`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching user stats:', error);
        return throwError(() => error);
      })
    );
  }

  // ============ Follow/Unfollow User ============
  followUser(targetUserId: string): Observable<any> {
    const currentUserId = this.getUserId();
    if (!currentUserId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.post(`${this.userApiUrl}/follow`, {
      followerId: currentUserId,
      followingId: targetUserId
    }, {
      headers: this.getAuthHeaders()
    });
  }

  unfollowUser(targetUserId: string): Observable<any> {
    const currentUserId = this.getUserId();
    if (!currentUserId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http.post(`${this.userApiUrl}/unfollow`, {
      followerId: currentUserId,
      followingId: targetUserId
    }, {
      headers: this.getAuthHeaders()
    });
  }

  // ============ Helper Methods ============
  getCurrentUserProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  refreshUserProfile(): Observable<UserProfile> {
    localStorage.removeItem('userProfile');
    this.userProfileSubject.next(null);
    return this.getMyProfile();
  }

  private loadUserProfileFromStorage(): void {
    try {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        this.userProfileSubject.next(profile);
      }
    } catch (error) {
      console.error('Error loading user profile from storage:', error);
      localStorage.removeItem('userProfile');
    }
  }

  clearUserProfile(): void {
    this.userProfileSubject.next(null);
    localStorage.removeItem('userProfile');
  }

  // ============ Format Date for API ============
  formatDateForApi(date: Date | string): string {
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
}
