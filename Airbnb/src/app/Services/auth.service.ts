import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private authStateSubject = new BehaviorSubject<boolean>(this.hasToken());
    public authState$ = this.authStateSubject.asObservable();

    constructor(private router: Router) {
        // Check auth state on initialization
        this.checkAuthState();
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.hasToken();
    }

    /**
     * Get the current user's role from localStorage
     * Returns 'admin', 'host', 'user', or null
     */
    getUserRole(): string | null {
        const user = this.getCurrentUser();
        return user?.role || null;
    }

    /**
     * Get current user data from localStorage
     */
    getCurrentUser(): any {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error('Error parsing user data:', e);
                return null;
            }
        }
        return null;
    }

    /**
     * Get user ID
     */
    getUserId(): string | null {
        const user = this.getCurrentUser();
        return user?.id || null;
    }

    /**
     * Logout user
     */
    logout(): void {
        // Clear all auth-related data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('refreshToken');

        // Update auth state
        this.authStateSubject.next(false);

        // Navigate to home page
        this.router.navigate(['/']);
    }

    /**
     * Login user (store token and user data)
     */
    login(token: string, user: any): void {
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.authStateSubject.next(true);
    }

    /**
     * Get authentication token
     */
    getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Check if token exists
     */
    private hasToken(): boolean {
        return !!localStorage.getItem('token');
    }

    /**
     * Check and update auth state
     */
    private checkAuthState(): void {
        const isAuth = this.hasToken();
        this.authStateSubject.next(isAuth);
    }

    /**
     * Check if user has a specific role
     */
    hasRole(role: string): boolean {
        const userRole = this.getUserRole();
        return userRole === role;
    }

    /**
     * Check if user is admin
     */
    isAdmin(): boolean {
        return this.hasRole('admin');
    }

    /**
     * Check if user is host
     */
    isHost(): boolean {
        return this.hasRole('host');
    }
}
