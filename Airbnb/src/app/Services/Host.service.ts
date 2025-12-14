// services/host.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HostStats } from '../Models/HostStats';
import { HostBooking } from '../Models/HostBooking';
import { HostListing } from '../Models/HostListing';

@Injectable({
  providedIn: 'root'
})
export class HostService {
  private apiUrl = 'https://localhost:7020/api';
  private statsSubject = new BehaviorSubject<HostStats>(this.getInitialStats());
  private bookingsSubject = new BehaviorSubject<HostBooking[]>([]);
  private listingsSubject = new BehaviorSubject<HostListing[]>([]);

  constructor(private http: HttpClient) { }

  // Stats Management
  getStats(): Observable<HostStats> {
    // For now, return mock stats. Backend would need /api/Host/stats endpoint
    return this.statsSubject.asObservable();
  }

  // Bookings Management - Connected to backend
  getBookings(): Observable<HostBooking[]> {
    // Note: This uses BookingController's GET /api/Booking endpoint
    // The backend returns user's bookings, but hosts need property bookings
    // Ideally backend should have /api/Booking/host endpoint
    return this.http.get<any>(`${this.apiUrl}/Booking`).pipe(
      tap((response: any) => {
        const bookings = response.data || response || [];
        this.bookingsSubject.next(bookings);
      })
    );
  }

  updateBookingStatus(bookingId: number, status: string): Observable<any> {
    // Use cancel endpoint for now. Backend needs more flexible status update.
    if (status === 'cancelled') {
      return this.http.put(`${this.apiUrl}/Booking/${bookingId}/cancel`, {});
    }
    // For other statuses, update local state only
    const bookings = this.bookingsSubject.value.map(booking =>
      booking.id === bookingId ? { ...booking, status: status as any } : booking
    );
    this.bookingsSubject.next(bookings);
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  // Listings Management - Connected to backend
  getListings(): Observable<HostListing[]> {
    return this.http.get<any>(`${this.apiUrl}/properties`).pipe(
      tap((response: any) => {
        const properties = response.data || response || [];
        // Map properties to HostListing format
        const hostListings: HostListing[] = properties.map((p: any) => ({
          id: p.id,
          title: p.title || p.name,
          type: 'property',
          status: p.isPublished ? 'active' : 'inactive',
          price: p.pricePerNight || p.price,
          location: p.city && p.country ? `${p.city}, ${p.country}` : p.location,
          rating: p.averageRating || p.rating,
          reviewCount: p.reviewsCount || p.reviewCount,
          bookingsCount: 0, // Not available from backend
          images: [p.coverImageUrl || p.imageUrl],
          hostId: p.hostId || p.HostId
        }));
        this.listingsSubject.next(hostListings);
      })
    );
  }

  createListing(listing: Omit<HostListing, 'id'>): void {
    // Backend would need POST /api/properties endpoint
    const listings = this.listingsSubject.value;
    const newListing: HostListing = {
      ...listing,
      id: Math.max(0, ...listings.map(l => l.id)) + 1
    };
    this.listingsSubject.next([...listings, newListing]);
  }

  updateListingStatus(listingId: number, status: 'active' | 'inactive'): void {
    // Backend would need PUT /api/properties/{id}/status endpoint
    const listings = this.listingsSubject.value.map(listing =>
      listing.id === listingId ? { ...listing, status } : listing
    );
    this.listingsSubject.next(listings);
  }

  // Mock Data (fallback)
  private getInitialStats(): HostStats {
    return {
      totalEarnings: 0,
      monthlyEarnings: 0,
      activeListings: 0,
      totalBookings: 0,
      occupancyRate: 0,
      averageRating: 0,
      responseRate: 0
    };
  }
}
