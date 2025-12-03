import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
<<<<<<< HEAD
import { User } from '../Models/User';

=======
import { AuthService } from './auth';
>>>>>>> 70e224ac28a0e574d0622335918f2e7ba809575d

@Injectable({
    providedIn: 'root'
})
export class UserService {
<<<<<<< HEAD
    // Assuming environment file exists, otherwise fallback to localhost
    private apiUrl = 'https://localhost:7064/api'; // Default ASP.NET Core port, adjust as needed

    constructor(private http: HttpClient) {
        // If environment object existed we would use it, but I'll stick to a hardcoded base for now or check if environment exists
    }

    getUser(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/Users/${id}`);
    }

    updateUser(id: string, user: Partial<User>): Observable<any> {
        return this.http.put(`${this.apiUrl}/Users/${id}`, user);
    }

    // Helper to upload photo if needed separately
    uploadPhoto(id: string, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/Users/${id}/photo`, formData);
=======
    private apiUrl = 'https://localhost:7020/api/User';

    constructor(private http: HttpClient, private authService: AuthService) { }

    getUser(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    updateUser(id: string, userData: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, userData);
    }

    // Helper to get current user's details using ID from token
    getMyProfile(): Observable<any> {
        const currentUser = this.authService.getCurrentUser();
        // Assuming the token has an 'id' or 'sub' field. 
        // Adjust 'id' based on your actual token structure (e.g., 'userId', 'nameid', etc.)
        const userId = currentUser?.id || currentUser?.userId || currentUser?.sub;

        if (!userId) {
            throw new Error('User ID not found in token');
        }
        return this.getUser(userId);
>>>>>>> 70e224ac28a0e574d0622335918f2e7ba809575d
    }
}
