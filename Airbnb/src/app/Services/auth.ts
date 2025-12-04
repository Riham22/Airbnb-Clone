// import { Injectable } from '@angular/core';
// import { BehaviorSubject, tap } from 'rxjs';
// import { HttpClient } from '@angular/common/http';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {

//   private apiUrl = "https://localhost:7020/api/Account";

//   private isAuthenticated = new BehaviorSubject<boolean>(false);
//   private currentUser = new BehaviorSubject<any>(null);

//   isAuthenticated$ = this.isAuthenticated.asObservable();
//   currentUser$ = this.currentUser.asObservable();

//   constructor(private http: HttpClient) {
//     this.loadUserFromStorage();
//   }

//   // ------------------------
//   // LOGIN
//   // ------------------------
//   login(credentials: any) {
//     return this.http.post(`${this.apiUrl}/Login`, credentials).pipe(
//       tap((res: any) => {
//         const token = res.token;
//         localStorage.setItem('token', token);
//         const decodedUser = this.decodeToken(token);
//         this.currentUser.next(decodedUser);
//         this.isAuthenticated.next(true);
//         localStorage.setItem('user', JSON.stringify(decodedUser));
//       })
//     );
//   }

//   // ------------------------
//   // SIGNUP
//   // ------------------------
//   signup(data: any) {
//     return this.http.post(`${this.apiUrl}/Register`, data).pipe(
//       tap((res: any) => {
//         const token = res.token;
//         localStorage.setItem('token', token);
//         const decodedUser = this.decodeToken(token);
//         this.currentUser.next(decodedUser);
//         this.isAuthenticated.next(true);
//         localStorage.setItem('user', JSON.stringify(decodedUser));
//       })
//     );
//   }

//   // ------------------------
//   // FORGET PASSWORD
//   // ------------------------
//   forgetPassword(email: string) {
//     return this.http.post(`${this.apiUrl}/ForgetPassword`, { email });
//   }

//   // ------------------------
//   // LOGOUT
//   // ------------------------
//   logout() {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     this.isAuthenticated.next(false);
//     this.currentUser.next(null);
//   }

//   // ------------------------
//   // HELPERS
//   // ------------------------
//   checkAuthentication() {
//     this.loadUserFromStorage();
//   }

//   loadUserFromStorage() {
//     const token = localStorage.getItem('token');
//     const user = localStorage.getItem('user');

//     if (token && user) {
//       this.isAuthenticated.next(true);
//       this.currentUser.next(JSON.parse(user));
//     }
//   }

//   decodeToken(token: string) {
//     try {
//       return JSON.parse(atob(token.split('.')[1]));
//     } catch (e) {
//       return null;
//     }
//   }

//   getToken() {
//     return localStorage.getItem('token');
//   }

//   isLoggedIn() {
//     return this.isAuthenticated.value;
//   }

//   getCurrentUser() {
//     return this.currentUser.value;
//   }
// }

import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
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

  // ------------------------
  // LOGIN (returns JSON)
  // ------------------------
  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/Login`, credentials).pipe(
      tap((res: any) => {
        const token = res.token;
        localStorage.setItem('token', token);

        const decodedUser = this.decodeToken(token);
        this.currentUser.next(decodedUser);
        this.isAuthenticated.next(true);
        localStorage.setItem('user', JSON.stringify(decodedUser));
      })
    );
  }

  // ------------------------
  // SIGNUP (returns TEXT)
  // ------------------------
  signup(data: any) {
    const payload = {
      username: data.username,       // make sure matches DTO
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
  forgetPassword(email: string) {
    return this.http.post(`${this.apiUrl}/ForgetPassword`, { email });
  }

  // ------------------------
  // LOGOUT
  // ------------------------
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isAuthenticated.next(false);
    this.currentUser.next(null);
  }

  // ------------------------
  // HELPERS
  // ------------------------
  checkAuthentication() {
    this.loadUserFromStorage();
  }

  loadUserFromStorage() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      this.isAuthenticated.next(true);
      this.currentUser.next(JSON.parse(user));
    }
  }

  decodeToken(token: string) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return this.isAuthenticated.value;
  }

  getCurrentUser() {
    return this.currentUser.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Debug: Log the user object to see what's inside
    console.log('🔍 Checking admin status for user:', user);

    // Check for Admin role (case-insensitive)
    const role = user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      user.role ||
      user.Role;

    console.log('🔍 Found role:', role);

    // TEMPORARY WORKAROUND: If no role claim exists, check username
    if (!role) {
      const username = user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || user.name || user.username;
      console.log('⚠️ No role found, checking username:', username);
      const isAdminByUsername = username && username.toLowerCase() === 'admin';
      console.log('🔍 Is admin by username?', isAdminByUsername);
      return isAdminByUsername;
    }

    console.log('🔍 Is admin by role?', role && role.toLowerCase() === 'admin');

    return role && role.toLowerCase() === 'admin';
  }
}
