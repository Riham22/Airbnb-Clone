// Services/Admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminStats } from '../Models/AdminStats';
import { AdminUser } from '../Models/AdminUser';
import { AdminListing } from '../Models/AdminListing';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'https://localhost:7020/api'; // Your API base URL
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  // Account/User related endpoints
  getUsers(): Observable<AdminUser[]> {
    this.setLoading(true);
    return this.http.get<AdminUser[]>(`${this.apiUrl}/Account/Profile`)
      .pipe(
        map(users => {
          this.setLoading(false);
          return users;
        })
      );
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Account/Register`, userData);
  }

  updateUserRole(userId: string, role: string): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.apiUrl}/Account/ChangeRole`, { 
      userId, 
      role 
    });
  }

  updateUserStatus(userId: string, status: string): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.apiUrl}/Account/UpdateStatus`, { 
      userId, 
      status 
    });
  }

  deleteUser(userId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/Account/${userId}`);
  }

  // Stats endpoint
  getStats(): Observable<AdminStats> {
    this.setLoading(true);
    return this.http.get<AdminStats>(`${this.apiUrl}/Dashboard/Stats`)
      .pipe(
        map(stats => {
          this.setLoading(false);
          return stats;
        })
      );
  }

  // Property/Listing endpoints
  getListings(): Observable<AdminListing[]> {
    this.setLoading(true);
    return this.http.get<AdminListing[]>(`${this.apiUrl}/Property`)
      .pipe(
        map(listings => {
          this.setLoading(false);
          return listings;
        })
      );
  }

  createListing(listingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Property`, listingData);
  }

  updateListingStatus(listingId: string, status: string): Observable<AdminListing> {
    return this.http.put<AdminListing>(`${this.apiUrl}/Property/${listingId}/status`, { status });
  }

  deleteListing(listingId: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/Property/${listingId}`);
  }

  // Property Categories
  getPropertyTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/PropertyType`);
  }

  getPropertyCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/PropertyCategory`);
  }

  // Services
  getServices(): Observable<any[]> {
    this.setLoading(true);
    return this.http.get<any[]>(`${this.apiUrl}/Service`)
      .pipe(
        map(services => {
          this.setLoading(false);
          return services;
        })
      );
  }

  createService(serviceData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Service`, serviceData);
  }

  deleteService(serviceId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Service/${serviceId}`);
  }

  getServiceCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ServiceCategory`);
  }

  // Experiences
  getExperiences(): Observable<any[]> {
    this.setLoading(true);
    return this.http.get<any[]>(`${this.apiUrl}/Experience`)
      .pipe(
        map(experiences => {
          this.setLoading(false);
          return experiences;
        })
      );
  }

  createExperience(experienceData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Experience`, experienceData);
  }

  uploadExperienceImage(experienceId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/Experience/${experienceId}/upload`, formData);
  }

  deleteExperience(experienceId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Experience/${experienceId}`);
  }

  getExperienceCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ExpCatogray`);
  }

  getExperienceSubCategories(categoryId?: string): Observable<any[]> {
    const url = categoryId 
      ? `${this.apiUrl}/ExpSubCatogray?categoryId=${categoryId}`
      : `${this.apiUrl}/ExpSubCatogray`;
    return this.http.get<any[]>(url);
  }

  // Analytics
  getAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Analytics`);
  }

 // Test all endpoints - Fixed version
testAllEndpoints(): void {
  console.log('Testing API endpoints...');
  
  // Create properly typed endpoints array
  const endpoints: Array<{ 
    name: string; 
    observable: Observable<any> 
  }> = [
    { name: 'Stats', observable: this.getStats() },
    { name: 'Users', observable: this.getUsers() },
    { name: 'Listings', observable: this.getListings() },
    { name: 'Services', observable: this.getServices() },
    { name: 'Experiences', observable: this.getExperiences() },
    { name: 'Property Types', observable: this.getPropertyTypes() },
    { name: 'Property Categories', observable: this.getPropertyCategories() },
    { name: 'Service Categories', observable: this.getServiceCategories() },
    { name: 'Experience Categories', observable: this.getExperienceCategories() }
  ];

  endpoints.forEach((endpoint, index) => {
    // Use setTimeout to avoid overwhelming the API
    setTimeout(() => {
      console.log(`Testing ${endpoint.name}...`);
      endpoint.observable.subscribe({
        next: (data: any) => console.log(`✅ ${endpoint.name} working:`, data),
        error: (error: any) => console.error(`❌ ${endpoint.name} failed:`, error.message || error)
      });
    }, index * 300);
  });
}

  getLoadingState(): Observable<boolean> {
    return this.loading$;
  }
}