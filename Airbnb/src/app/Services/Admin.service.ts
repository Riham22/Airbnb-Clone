import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'https://localhost:7020/api/Admin';
  private loading = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  getLoadingState() {
    return this.loading.asObservable();
  }

  getStats(): Observable<any> {
    this.loading.next(true);
    return this.http.get(`${this.apiUrl}/Stats`).pipe(
      finalize(() => this.loading.next(false))
    );
  }

  getUsers(): Observable<any[]> {
    this.loading.next(true);
    return this.http.get<any[]>(`${this.apiUrl}/Users`).pipe(
      finalize(() => this.loading.next(false))
    );
  }

  getListings(): Observable<any[]> {
    this.loading.next(true);
    // You need to create this endpoint
    return this.http.get<any[]>(`${this.apiUrl}/Listings`).pipe(
      finalize(() => this.loading.next(false))
    );
  }

  updateUserStatus(userId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/Users/${userId}/status`, { status });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`https://localhost:7020/api/User/${userId}`);
  }

  updateListingStatus(listingId: string, status: string): Observable<any> {
    // You need to create this endpoint
    return this.http.patch(`${this.apiUrl}/Listings/${listingId}/status`, { status });
  }

  deleteListing(listingId: string): Observable<any> {
    // You need to create this endpoint
    return this.http.delete(`${this.apiUrl}/Listings/${listingId}`);
  }
}