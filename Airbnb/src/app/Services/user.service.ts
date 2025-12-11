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
  isVerified?: boolean;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
<<<<<<< HEAD
  private userApiUrl = "https://localhost:7020/api/User";
  private accountApiUrl = "https://localhost:7020/api/Acount";

  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  userProfile$ = this.userProfileSubject.asObservable();
=======
  private apiUrl = "https://localhost:7020/api/Account";
>>>>>>> 481bb34615c4b29b09b3b85bc66cb66f22dfc7df

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token found');
      throw new Error('User not authenticated');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getUserId(): string {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      const possibleClaims = [
        'sub',
        'nameid',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
        'UserId',
        'userId',
        'id'
      ];

      for (const claim of possibleClaims) {
        if (payload[claim]) {
          return payload[claim].toString();
        }
      }

      throw new Error('User ID not found in token');
    } catch (e) {
      console.error('Could not parse JWT token:', e);
      throw new Error('Invalid authentication token');
    }
  }

  getMyProfile(): Observable<UserProfile> {
    console.log('getMyProfile called');

    const userId = this.getUserId();
    console.log('User ID:', userId);

    const endpointsToTry = [
      `${this.accountApiUrl}/${userId}`,
      `${this.userApiUrl}/me`,
      `${this.userApiUrl}/current`,
      `${this.userApiUrl}`,
      `${this.userApiUrl}/${userId}`
    ];

    const tryEndpoint = (index: number): Observable<UserProfile> => {
      if (index >= endpointsToTry.length) {
        return throwError(() => new Error('No valid endpoint found for user profile'));
      }

      const endpoint = endpointsToTry[index];
      console.log(`Trying endpoint ${index}: ${endpoint}`);

      return this.http.get<UserProfile>(endpoint, {
        headers: this.getAuthHeaders()
      }).pipe(
        tap(profile => {
          console.log(`Success with endpoint ${endpoint}:`, profile);
          this.userProfileSubject.next(profile);
        }),
        catchError(error => {
          console.warn(`Endpoint ${endpoint} failed:`, error.status);
          if (error.status === 404 || error.status === 401 || error.status === 403) {
            return tryEndpoint(index + 1);
          }
          return throwError(() => new Error(`Failed to load profile: ${error.message}`));
        })
      );
    };

    return tryEndpoint(0);
  }

  updateCurrentUser(userData: UserProfileUpdate): Observable<UserProfile> {
    console.log('updateCurrentUser called with data:', userData);

    const userId = this.getUserId();

    const apiData: UserProfileUpdate = {
      ...userData,
      languageIds: userData.languageIds || [],
      interestIds: userData.interestIds || []
    };

    const endpointsToTry = [
      `${this.accountApiUrl}/${userId}`,
      `${this.userApiUrl}/${userId}`,
      `${this.userApiUrl}/me`,
      `${this.userApiUrl}/current`
    ];

    const tryEndpoint = (index: number): Observable<UserProfile> => {
      if (index >= endpointsToTry.length) {
        return throwError(() => new Error('No valid update endpoint found'));
      }

      const endpoint = endpointsToTry[index];
      console.log(`Trying update endpoint ${index}: ${endpoint}`, apiData);

      return this.http.put<UserProfile>(endpoint, apiData, {
        headers: this.getAuthHeaders()
      }).pipe(
        tap(updatedProfile => {
          console.log(`Update successful with endpoint ${endpoint}:`, updatedProfile);

          this.userProfileSubject.next(updatedProfile);

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
          console.warn(`Update endpoint ${endpoint} failed:`, error.status, error.error);

          if (error.error) {
            console.log('API error response:', error.error);
          }

          if (error.status === 404 || error.status === 405 || error.status === 400) {
            return tryEndpoint(index + 1);
          }
          return throwError(() => new Error(`Failed to update profile: ${error.message}`));
        })
      );
    };

    return tryEndpoint(0);
  }

  uploadProfilePhoto(file: File): Observable<any> {
    console.log('uploadProfilePhoto called with file:', file.name);

    const userId = this.getUserId();

    const formData = new FormData();
    formData.append('file', file);

    const endpointsToTry = [
      `${this.accountApiUrl}/${userId}/upload-photo`,
      `${this.userApiUrl}/${userId}/upload-photo`,
      `${this.userApiUrl}/upload-photo`,
      `${this.userApiUrl}/${userId}/photo`,
      `${this.userApiUrl}/photo`
    ];

    const tryEndpoint = (index: number): Observable<any> => {
      if (index >= endpointsToTry.length) {
        return throwError(() => new Error('No upload endpoint available'));
      }

      const endpoint = endpointsToTry[index];
      console.log(`Trying upload endpoint ${index}: ${endpoint}`);

      return this.http.post(endpoint, formData, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.authService.getToken()}`
        })
      }).pipe(
        tap((response: any) => {
          console.log(`Upload successful with endpoint ${endpoint}:`, response);

          if (response.photoURL) {
            this.updateUserField('photoURL', response.photoURL).subscribe({
              next: () => console.log('Photo URL updated in profile'),
              error: (err) => console.warn('Could not update photo URL in profile:', err)
            });
          }
        }),
        catchError(error => {
          console.warn(`Upload endpoint ${endpoint} failed:`, error.status);
          if (error.status === 404 || error.status === 405) {
            return tryEndpoint(index + 1);
          }
          return throwError(() => new Error(`Failed to upload photo: ${error.message}`));
        })
      );
    };

    return tryEndpoint(0);
  }

  updateUserField(field: keyof UserProfileUpdate, value: any): Observable<UserProfile> {
    const updateData = { [field]: value } as UserProfileUpdate;
    return this.updateCurrentUser(updateData);
  }

  deleteUser(): Observable<any> {
    const userId = this.getUserId();

    return this.http.delete(`${this.accountApiUrl}/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        this.userProfileSubject.next(null);
        this.authService.logout();
      }),
      catchError(error => {
        console.error('Error deleting account:', error);
        return throwError(() => new Error(`Failed to delete account: ${error.message}`));
      })
    );
  }

  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.accountApiUrl}/ChangePassword`, passwordData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error changing password:', error);
        return throwError(() => new Error(`Failed to change password: ${error.message}`));
      })
    );
  }

  getCurrentUserProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

<<<<<<< HEAD
  refreshUserProfile(): Observable<UserProfile> {
    console.log('Refreshing user profile...');
    this.userProfileSubject.next(null);
    return this.getMyProfile();
=======
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
>>>>>>> 481bb34615c4b29b09b3b85bc66cb66f22dfc7df
  }

  debugAuthInfo(): void {
    console.log('=== DEBUG AUTH INFO ===');
    console.log('Token:', this.authService.getToken());
    console.log('Current User:', this.authService.getCurrentUser());
    try {
      console.log('User ID from method:', this.getUserId());
    } catch (e) {
      console.log('Cannot get user ID:', e);
    }
    console.log('Cached Profile:', this.userProfileSubject.value);
    console.log('=== END DEBUG ===');
  }

  formatDateForApi(date: Date | string): string {
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0];
  }
}
