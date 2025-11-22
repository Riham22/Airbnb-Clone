// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<any>(null);

  isAuthenticated$ = this.isAuthenticated.asObservable();
  currentUser$ = this.currentUser.asObservable();
login(userData: any) {
  const fullUserData = {
    ...userData,
    lastName: userData.lastName || 'User' 
  };

  this.isAuthenticated.next(true);
  this.currentUser.next(fullUserData);
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('user', JSON.stringify(fullUserData));
}

signup(userData: any) {
  const fullUserData = {
    ...userData,
    lastName: userData.lastName || ''
  };

  this.isAuthenticated.next(true);
  this.currentUser.next(fullUserData);
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('user', JSON.stringify(fullUserData));
}

 logout() {
  this.isAuthenticated.next(false);
  this.currentUser.next(null);
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user');
  console.log('User logged out successfully');
}

  checkAuthentication() {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const user = localStorage.getItem('user');

    if (isAuth && user) {
      this.isAuthenticated.next(true);
      this.currentUser.next(JSON.parse(user));
    }
  }

  getCurrentUser() {
    return this.currentUser.value;
  }

  isLoggedIn() {
    return this.isAuthenticated.value;
  }
}
