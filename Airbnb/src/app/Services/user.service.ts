import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../Models/User';
import { AuthService } from './auth';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'https://localhost:7020/api/User';

    constructor(private http: HttpClient, private authService: AuthService) { }

    getUser(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    updateUser(id: string, user: Partial<User>): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, user);
    }

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
}
