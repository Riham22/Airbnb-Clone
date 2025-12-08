import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "https://localhost:7020/api/Acount";

  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<any>(null);

  isAuthenticated$ = this.isAuthenticated.asObservable();
  currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // ============ Enhanced Get User ID Method ============
  private getUserIdFromUser(user: any): string | null {
    if (!user) return null;

    // Check all possible ID property names
    const possibleIds = [
      user.id,
      user.Id,
      user.userId,
      user.UserId,
      user.sub, // JWT standard claim
      user.nameid, // Alternative JWT claim
      user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'], // .NET JWT claim
      user['http://schemas.microsoft.com/ws/2008/06/identity/claims/primarysid'], // Another .NET claim
      user.uid,
      user.Uid
    ];

    // Find the first non-null, non-undefined value
    const userId = possibleIds.find(id => id !== null && id !== undefined && id !== '');

    console.log('Looking for user ID. Possible IDs:', possibleIds, 'Found:', userId);

    return userId || null;
  }

  // ============ Update Current User (Local State) ============
  updateCurrentUser(updatedUser: any): void {
    this.currentUser.next(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('User updated in AuthService:', updatedUser);
  }

  // ============ Update User Profile via API ============
  updateUserProfile(userData: any): Observable<any> {
    const currentUser = this.currentUser.value;
    const userId = this.getUserIdFromUser(currentUser);

    if (!userId) {
      console.error('No user ID found for update. Current user:', currentUser);
      throw new Error('No user ID found for update. Please check if user is logged in.');
    }

    console.log('Updating user profile for ID:', userId, 'Data:', userData);

    return this.http.put(`${this.apiUrl}/${userId}`, userData).pipe(
      tap((response: any) => {
        console.log('Profile update API response:', response);

        // Merge the updated data with existing user data
        const updatedUser = { ...currentUser, ...userData };
        this.updateCurrentUser(updatedUser);
      })
    );
  }

  // ============ Delete User Account ============
  deleteUserAccount(): Observable<any> {
    const currentUser = this.currentUser.value;
    const userId = this.getUserIdFromUser(currentUser);

    if (!userId) {
      console.error('No user ID found for deletion. Current user:', currentUser);
      throw new Error('No user ID found for deletion. Please check if user is logged in.');
    }

    console.log('Deleting user account ID:', userId);

    return this.http.delete(`${this.apiUrl}/${userId}`).pipe(
      tap(() => {
        console.log('Account deleted successfully');
        this.logout();
      })
    );
  }

  // ============ Change Password ============
  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/ChangePassword`, data).pipe(
      tap((response: any) => {
        console.log('Password change successful:', response);
      })
    );
  }

  // ------------------------
  // LOGIN (returns JSON)
  // ------------------------
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Login`, credentials).pipe(
      tap((res: any) => {
        const token = res.token;
        localStorage.setItem('token', token);

        const decodedUser = this.decodeToken(token);

        // Log the decoded user to see what properties are available
        console.log('Decoded user from token:', decodedUser);

        this.currentUser.next(decodedUser);
        this.isAuthenticated.next(true);
        localStorage.setItem('user', JSON.stringify(decodedUser));
      })
    );
  }

  // ------------------------
  // SIGNUP (returns TEXT)
  // ------------------------
  signup(data: any): Observable<any> {
    const payload = {
      username: data.username,
      password: data.password,
      email: data.email,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString().split('T')[0]
        : null
    };

    console.log("📤 Sending register payload:", payload);

    return this.http.post(`${this.apiUrl}/Register`, payload, {
      responseType: 'text' as 'json'
    });
  }

  // ------------------------
  // FORGET PASSWORD
  // ------------------------
  forgetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/ForgetPassword`, { email });
  }

  // ------------------------
  // RESET PASSWORD
  // ------------------------
  resetPassword(data: { email: string; token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/ResetPassword`, data);
  }

  // ------------------------
  // LOGOUT
  // ------------------------
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticated.next(false);
    this.currentUser.next(null);
  }

  // ------------------------
  // HELPERS
  // ------------------------
  checkAuthentication(): void {
    this.loadUserFromStorage();
  }

  loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('Loaded user from storage:', parsedUser);
        this.currentUser.next(parsedUser);
        this.isAuthenticated.next(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        this.logout();
      }
    }
  }

  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated.value;
  }

  getCurrentUser(): any {
    return this.currentUser.value;
  }

  getCurrentUserId(): string | null {
    return this.getUserIdFromUser(this.currentUser.value);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const role = user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      user.role || user.Role;

    console.log('Checking admin status - Role:', role);

    if (!role) {
      const username = user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || user.name || user.username;
      return username && username.toLowerCase() === 'admin';
    }

    return role.toLowerCase() === 'admin';
  }
}
