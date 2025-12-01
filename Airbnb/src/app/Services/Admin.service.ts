// services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { AdminStats } from '../Models/AdminStats';
import { AdminUser } from '../Models/AdminUser';
import { AdminListing } from '../Models/AdminListing';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'https://localhost:7020/api';
  private statsSubject = new BehaviorSubject<AdminStats>(this.getInitialStats());
  private usersSubject = new BehaviorSubject<AdminUser[]>([]);
  private listingsSubject = new BehaviorSubject<AdminListing[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  // Stats Management - Calculated from data
  getStats(): Observable<AdminStats> {
    this.setLoading(true);
    // Calculate stats from users, properties, and bookings
    return new Observable<AdminStats>(observer => {
      let totalUsers = 0;
      let totalListings = 0;
      let totalBookings = 0;

      // Get users count
      this.http.get<any>(`${this.apiUrl}/User`).subscribe({
        next: (users) => {
          totalUsers = users.length || 0;

          // Get properties count
          this.http.get<any>(`${this.apiUrl}/properties`).subscribe({
            next: (props) => {
              totalListings = props.length || 0;

              // Get bookings count (requires auth)
              this.http.get<any>(`${this.apiUrl}/Booking`).subscribe({
                next: (bookings) => {
                  const bookingsData = bookings.data || bookings || [];
                  totalBookings = bookingsData.length || 0;

                  const stats: AdminStats = {
                    totalUsers,
                    totalListings,
                    totalBookings,
                    totalRevenue: totalBookings * 150, // Estimated
                    pendingVerifications: 0,
                    activeHosts: Math.floor(totalUsers * 0.3), // Estimated
                    monthlyGrowth: 0,
                    weeklyRevenue: 0,
                    activeBookings: totalBookings
                  };

                  this.statsSubject.next(stats);
                  observer.next(stats);
                  observer.complete();
                  this.setLoading(false);
                },
                error: () => {
                  // Use partial stats if bookings fail
                  const stats: AdminStats = {
                    totalUsers,
                    totalListings,
                    totalBookings: 0,
                    totalRevenue: 0,
                    pendingVerifications: 0,
                    activeHosts: Math.floor(totalUsers * 0.3),
                    monthlyGrowth: 0,
                    weeklyRevenue: 0,
                    activeBookings: 0
                  };
                  this.statsSubject.next(stats);
                  observer.next(stats);
                  observer.complete();
                  this.setLoading(false);
                }
              });
            },
            error: () => {
              observer.error('Failed to load properties');
              this.setLoading(false);
            }
          });
        },
        error: () => {
          observer.error('Failed to load users');
          this.setLoading(false);
        }
      });
    });
  }

  updateStats(updates: Partial<AdminStats>): void {
    const current = this.statsSubject.value;
    this.statsSubject.next({ ...current, ...updates });
  }

  // Users Management - Connected to backend
  getUsers(): Observable<AdminUser[]> {
    this.setLoading(true);
    return this.http.get<any>(`${this.apiUrl}/User`).pipe(
      map((users: any[]) => {
        // Map backend users to AdminUser format
        const adminUsers: AdminUser[] = users.map(u => ({
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.roles?.[0] || 'guest', // First role
          joinedDate: new Date(), // Not in backend response
          status: 'active', // Default status
          listingsCount: 0, // Not available from backend
          bookingsCount: 0, // Not available from backend
          lastActive: new Date(), // Not available from backend
          avatar: u.photoURL || ''
        }));
        this.usersSubject.next(adminUsers);
        return adminUsers;
      }),
      tap(() => this.setLoading(false))
    );
  }

  updateUserStatus(userId: string, status: 'active' | 'suspended'): Observable<AdminUser> {
    // Backend doesn't have status update endpoint
    // Update local state only
    return new Observable<AdminUser>(observer => {
      setTimeout(() => {
        const users = this.usersSubject.value.map(user =>
          user.id === userId ? { ...user, status, updatedAt: new Date() } : user
        );
        this.usersSubject.next(users);

        const updatedUser = users.find(user => user.id === userId);
        if (updatedUser) {
          observer.next(updatedUser);
        } else {
          observer.error(new Error('User not found'));
        }
        observer.complete();
      }, 300);
    });
  }

  deleteUser(userId: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/User/${userId}`).pipe(
      tap(() => {
        const users = this.usersSubject.value.filter(user => user.id !== userId);
        this.usersSubject.next(users);

        // Update stats
        const stats = this.statsSubject.value;
        this.statsSubject.next({
          ...stats,
          totalUsers: stats.totalUsers - 1
        });
      }),
      map(() => true)
    );
  }

  // Listings Management - Connected to backend
  getListings(): Observable<AdminListing[]> {
    this.setLoading(true);
    return this.http.get<any>(`${this.apiUrl}/properties`).pipe(
      map((properties: any[]) => {
        // Map backend properties to AdminListing format
        const adminListings: AdminListing[] = properties.map(p => ({
          id: p.id.toString(),
          title: p.title || p.name,
          host: 'Host', // Not available from backend
          hostId: p.hostId || '1',
          type: 'Property',
          status: p.isPublished ? 'active' : 'pending',
          price: p.pricePerNight || p.price,
          location: p.city && p.country ? `${p.city}, ${p.country}` : p.location,
          rating: p.averageRating || p.rating || 0,
          reviewCount: p.reviewsCount || p.reviewCount || 0,
          createdAt: new Date(), // Not in response
          lastBooking: new Date(), // Not in response
          bedrooms: p.bedrooms || 0,
          bathrooms: p.bathrooms || 0,
          maxGuests: p.maxGuests || 0,
          images: [p.coverImageUrl || p.imageUrl],
          amenities: p.amenities || []
        }));
        this.listingsSubject.next(adminListings);
        return adminListings;
      }),
      tap(() => this.setLoading(false))
    );
  }

  updateListingStatus(listingId: string, status: 'active' | 'suspended' | 'pending'): Observable<AdminListing> {
    // Backend doesn't have property status update endpoint
    // Update local state only
    return new Observable<AdminListing>(observer => {
      setTimeout(() => {
        const listings = this.listingsSubject.value.map(listing =>
          listing.id === listingId ? { ...listing, status, updatedAt: new Date() } : listing
        );
        this.listingsSubject.next(listings);

        const updatedListing = listings.find(listing => listing.id === listingId);
        if (updatedListing) {
          observer.next(updatedListing);
        } else {
          observer.error(new Error('Listing not found'));
        }
        observer.complete();
      }, 300);
    });
  }

  deleteListing(listingId: string): Observable<boolean> {
    // Backend doesn't have delete property endpoint yet
    // Update local state only
    return new Observable<boolean>(observer => {
      setTimeout(() => {
        const listings = this.listingsSubject.value.filter(listing => listing.id !== listingId);
        this.listingsSubject.next(listings);

        // Update stats
        const stats = this.statsSubject.value;
        this.statsSubject.next({
          ...stats,
          totalListings: stats.totalListings - 1
        });

        observer.next(true);
        observer.complete();
      }, 400);
    });
  }

  // Loading state
  getLoadingState(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private getInitialStats(): AdminStats {
    return {
      totalUsers: 0,
      totalListings: 0,
      totalBookings: 0,
      totalRevenue: 0,
      pendingVerifications: 0,
      activeHosts: 0,
      monthlyGrowth: 0,
      weeklyRevenue: 0,
      activeBookings: 0
    };
  }
}