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
  return this.http.post(`${this.apiUrl}/Register`, data, {
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
}
