// services/host.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HostStats } from '../Models/HostStats';
import { HostBooking } from '../Models/HostBooking';
import { HostListing } from '../Models/HostListing';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class HostService {
  private apiUrl = 'https://localhost:7020/api';
  private statsSubject = new BehaviorSubject<HostStats>(this.getInitialStats());
  private bookingsSubject = new BehaviorSubject<HostBooking[]>([]);
  private listingsSubject = new BehaviorSubject<HostListing[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Stats Management
  getStats(): Observable<HostStats> {
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.id || currentUser?.userId || currentUser?.sub;
    if (!userId) throw new Error('No user id');

    return new Observable<HostStats>(observer => {
      this.http.get<any>(`${this.apiUrl}/User/${userId}/stats`).subscribe({
        next: (stats) => {
          // Map backend shape to HostStats model
          const hostStats: HostStats = {
            totalEarnings: 0, 
            monthlyEarnings: 0,  
            activeListings: stats.TotalProperties || 0,
            totalBookings: stats.TotalBookings || 0,
            occupancyRate: 0, 
            averageRating: stats.AverageRating || 0,
            responseRate: 0 
          };
          observer.next(hostStats);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
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
    return this.http.get<any>(`${this.apiUrl}/properties/my-properties`).pipe(
      tap((response: any) => {
        const properties = response.data || response || [];
        // Map properties to HostListing format
        const hostListings: HostListing[] = properties.map((p: any) => ({
          id: p.id,
          title: p.title || p.name,
          type: 'property',
          status: p.isPublished ? 'active' : 'inactive',
          price: p.pricePerNight || p.price,
          location: p.city && p.country ? `${p.city}, ${p.country}` : p.location || p.address,
          rating: p.averageRating || p.rating || 0,
          reviewCount: p.reviewsCount || p.reviewCount || 0,
          bookingsCount: p.bookingsCount || 0,
          images: p.images && p.images.length > 0 
            ? p.images.map((img: any) => img.imageUrl || img.url)
            : (p.coverImageUrl ? [p.coverImageUrl] : [p.imageUrl || ''])
        }));
        this.listingsSubject.next(hostListings);
      })
    );
  }

  createListing(listingData: any): Observable<any> {
    // Map to backend CreatePropertyDto format
    const createDto = {
      title: listingData.title,
      description: listingData.description || '',
      pricePerNight: listingData.price || 0,
      currency: 'USD',
      country: listingData.country || '',
      city: listingData.city || '',
      address: listingData.address || '',
      maxGuests: listingData.maxGuests || 1,
      bedrooms: listingData.bedrooms || 1,
      beds: listingData.beds || 1,
      bathrooms: listingData.bathrooms || 1,
      allowsPets: listingData.allowsPets || false,
      cancellationPolicy: listingData.cancellationPolicy || 'Flexible',
      minNights: listingData.minNights || 1,
      maxNights: listingData.maxNights || 365,
      propertyTypeId: listingData.propertyTypeId || 1,
      propertyCategoryId: listingData.propertyCategoryId || 1,
      amenityIds: listingData.amenityIds || []
    };
    return this.http.post(`${this.apiUrl}/properties`, createDto).pipe(
      tap(() => {
        // Refresh listings after creation
        this.getListings().subscribe();
      })
    );
  }

  updateListingStatus(listingId: number, status: 'active' | 'inactive'): Observable<any> {
    if (status === 'active') {
      return this.http.put(`${this.apiUrl}/properties/${listingId}/publish`, {}).pipe(
        tap(() => {
          // Refresh listings after status change
          this.getListings().subscribe();
        })
      );
    } else {
      return this.http.put(`${this.apiUrl}/properties/${listingId}/unpublish`, {}).pipe(
        tap(() => {
          // Refresh listings after status change
          this.getListings().subscribe();
        })
      );
    }
  }

  updateListing(listingId: number, listingData: any): Observable<any> {
    // Map to backend UpdatePropertyDto format
    const updateDto = {
      title: listingData.title,
      description: listingData.description || '',
      pricePerNight: listingData.price || 0,
      address: listingData.address || '',
      maxGuests: listingData.maxGuests || 1,
      bedrooms: listingData.bedrooms || 1,
      beds: listingData.beds || 1,
      bathrooms: listingData.bathrooms || 1,
      allowsPets: listingData.allowsPets || false,
      cancellationPolicy: listingData.cancellationPolicy || 'Flexible',
      minNights: listingData.minNights || 1,
      maxNights: listingData.maxNights || 365,
      amenityIds: listingData.amenityIds || []
    };
    return this.http.put(`${this.apiUrl}/properties/${listingId}`, updateDto).pipe(
      tap(() => {
        // Refresh listings after update
        this.getListings().subscribe();
      })
    );
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
