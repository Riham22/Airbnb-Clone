import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../Models/User';


@Injectable({
    providedIn: 'root'
})
export class UserService {
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
    }
}
