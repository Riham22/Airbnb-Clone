import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../Models/User';
import { AuthService } from './auth';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    // Use a single, consistent API base URL, matching your backend
    private apiUrl = 'https://localhost:7020/api/User';

    constructor(private http: HttpClient, private authService: AuthService) { }

    getUser(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    /**
     * Update the user's profile. Fields not included in userData will be left unchanged by the backend.
     */
    updateUser(id: string, userData: any): Observable<any> {
        // If photoURL is a base64 string, backend will save it properly
        return this.http.put(`${this.apiUrl}/${id}`, userData);
    }

    /**
     * Delete the user account by ID. (Irreversible!)
     */
    deleteUser(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    /**
     * Helper to upload a photo as FILE (multipart form)
     */
    uploadPhoto(id: string, file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/${id}/upload-photo`, formData);
    }

    /**
     * Helper to upload a photo as base64 string (usually for frontend FileReader usage)
     */
    uploadPhotoBase64(id: string, base64: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/upload-base64-photo`, { Base64Image: base64 });
    }

    /**
     * Get the current user profile using ID from AuthService
     */
    getMyProfile(): Observable<User> {
        const currentUser = this.authService.getCurrentUser();
        const userId = currentUser?.id || currentUser?.userId || currentUser?.sub;
        if (!userId) {
            throw new Error('User ID not found in token');
        }
        return this.getUser(userId);
    }
}
