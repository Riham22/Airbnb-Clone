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

  public loading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Stats Management
  getStats(): Observable<HostStats> {
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.id || currentUser?.userId || currentUser?.sub;
    if (!userId) throw new Error('No user id');

    this.loading$.next(true);
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
          this.loading$.next(false);
          observer.next(hostStats);
          observer.complete();
        },
        error: (err) => {
          this.loading$.next(false);
          observer.error(err);
        }
      });
    });
  }

  // Bookings Management - Connected to backend
  getBookings(): Observable<HostBooking[]> {
    this.loading$.next(true);
    return this.http.get<any>(`${this.apiUrl}/Booking`).pipe(
      tap((response: any) => {
        const bookings = response.data || response || [];
        this.bookingsSubject.next(bookings);
        this.loading$.next(false);
      }, () => this.loading$.next(false))
    );
  }

  updateBookingStatus(bookingId: number, status: string): Observable<any> {
    this.loading$.next(true);
    // Use cancel endpoint for now. Backend needs more flexible status update.
    if (status === 'cancelled') {
      return this.http.put(`${this.apiUrl}/Booking/${bookingId}/cancel`, {}).pipe(
        tap(() => this.loading$.next(false), () => this.loading$.next(false))
      );
    }
    // For other statuses, update local state only
    const bookings = this.bookingsSubject.value.map(booking =>
      booking.id === bookingId ? { ...booking, status: status as any } : booking
    );
    this.bookingsSubject.next(bookings);
    return new Observable(observer => {
      this.loading$.next(false);
      observer.next({ success: true });
      observer.complete();
    });
  }

  // Listings Management - Connected to backend
  getListings(): Observable<HostListing[]> {
    this.loading$.next(true);
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
        this.loading$.next(false);
      }, () => this.loading$.next(false))
    );
  }

  createListing(listingData: any, files: File[] = []): Observable<any> {
    this.loading$.next(true);
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

    // If files are present, we might need to upload them separately or use FormData
    // For now, assuming JSON payload as per original code, but handling the files arg

    return this.http.post(`${this.apiUrl}/properties`, createDto).pipe(
      tap(() => {
        // Refresh listings after creation
        this.getListings().subscribe();
        this.loading$.next(false);
      }, () => this.loading$.next(false))
    );
  }

  updateListingStatus(listingId: number, status: 'active' | 'inactive'): Observable<any> {
    this.loading$.next(true);
    if (status === 'active') {
      return this.http.put(`${this.apiUrl}/properties/${listingId}/publish`, {}).pipe(
        tap(() => {
          // Refresh listings after status change
          this.getListings().subscribe();
          this.loading$.next(false);
        }, () => this.loading$.next(false))
      );
    } else {
      return this.http.put(`${this.apiUrl}/properties/${listingId}/unpublish`, {}).pipe(
        tap(() => {
          // Refresh listings after status change
          this.getListings().subscribe();
          this.loading$.next(false);
        }, () => this.loading$.next(false))
      );
    }
  }

  updateListing(listingId: number, listingData: any): Observable<any> {
    this.loading$.next(true);
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
        this.loading$.next(false);
      }, () => this.loading$.next(false))
    );
  }

  deleteListing(listingId: number): Observable<any> {
    this.loading$.next(true);
    return this.http.delete(`${this.apiUrl}/properties/${listingId}`).pipe(
      tap(() => {
        this.getListings().subscribe();
        this.loading$.next(false);
      }, () => this.loading$.next(false))
    );
  }

  // Services Management
  getServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/services`);
  }

  createService(serviceData: any, files: File[] = []): Observable<any> {
    this.loading$.next(true);
    return this.http.post(`${this.apiUrl}/services`, serviceData).pipe(
      tap(() => {
        this.getServices().subscribe();
        this.loading$.next(false);
      }, () => this.loading$.next(false))
    );
  }

  updateServiceStatus(serviceId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/services/${serviceId}/status`, { status });
  }

  deleteService(serviceId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/services/${serviceId}`);
  }

  // Experiences Management
  getExperiences(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/experiences`);
  }

  createExperience(experienceData: any, files: File[] = []): Observable<any> {
    this.loading$.next(true);
    return this.http.post(`${this.apiUrl}/experiences`, experienceData).pipe(
      tap(() => {
        this.getExperiences().subscribe();
        this.loading$.next(false);
      }, () => this.loading$.next(false))
    );
  }

  updateExperienceStatus(experienceId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/experiences/${experienceId}/status`, { status });
  }

  deleteExperience(experienceId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/experiences/${experienceId}`);
  }

  // Categories
  getPropertyTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/property-types`);
  }

  getPropertyCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/property-categories`);
  }

  getServiceCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/service-categories`);
  }

  getExperienceCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/experience-categories`);
  }

  getExperienceSubCategories(categoryId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/experience-categories/${categoryId}/subcategories`);
  }

  // Helper
  testEndpoints(): void {
    console.log('Testing endpoints...');
    this.http.get(`${this.apiUrl}/health`).subscribe({
      next: () => console.log('API is healthy'),
      error: (err) => console.error('API health check failed', err)
    });
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
