// services/admin.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { AdminStats } from '../Models/AdminStats';
import { AdminUser } from '../Models/AdminUser';
import { AdminListing } from '../Models/AdminListing';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private statsSubject = new BehaviorSubject<AdminStats>(this.getInitialStats());
  private usersSubject = new BehaviorSubject<AdminUser[]>(this.generateMockUsers());
  private listingsSubject = new BehaviorSubject<AdminListing[]>(this.generateMockListings());
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  // Stats Management
  getStats(): Observable<AdminStats> {
    this.setLoading(true);
    // Simulate API call delay
    return new Observable<AdminStats>(observer => {
      setTimeout(() => {
        observer.next(this.statsSubject.value);
        observer.complete();
        this.setLoading(false);
      }, 500);
    });
  }

  updateStats(updates: Partial<AdminStats>): void {
    const current = this.statsSubject.value;
    this.statsSubject.next({ ...current, ...updates });
  }

  // Users Management
  getUsers(): Observable<AdminUser[]> {
    this.setLoading(true);
    return new Observable<AdminUser[]>(observer => {
      setTimeout(() => {
        observer.next(this.usersSubject.value);
        observer.complete();
        this.setLoading(false);
      }, 800);
    });
  }

  updateUserStatus(userId: string, status: 'active' | 'suspended'): Observable<AdminUser> {
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
    return new Observable<boolean>(observer => {
      setTimeout(() => {
        const users = this.usersSubject.value.filter(user => user.id !== userId);
        this.usersSubject.next(users);

        // Update stats
        const stats = this.statsSubject.value;
        this.statsSubject.next({
          ...stats,
          totalUsers: stats.totalUsers - 1
        });

        observer.next(true);
        observer.complete();
      }, 400);
    });
  }

  // Listings Management
  getListings(): Observable<AdminListing[]> {
    this.setLoading(true);
    return new Observable<AdminListing[]>(observer => {
      setTimeout(() => {
        observer.next(this.listingsSubject.value);
        observer.complete();
        this.setLoading(false);
      }, 700);
    });
  }

  updateListingStatus(listingId: string, status: 'active' | 'suspended' | 'pending'): Observable<AdminListing> {
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
      totalUsers: 1250,
      totalListings: 543,
      totalBookings: 2897,
      totalRevenue: 154230,
      pendingVerifications: 23,
      activeHosts: 287,
      monthlyGrowth: 12.5,
      weeklyRevenue: 25480,
      activeBookings: 156
    };
  }

  private generateMockUsers(): AdminUser[] {
    return [
      {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'host',
        joinedDate: new Date('2024-01-15'),
        status: 'active',
        listingsCount: 3,
        bookingsCount: 12,
        lastActive: new Date('2024-03-20'),
        avatar: 'https://example.com/avatar1.jpg'
      },
      {
        id: '2',
        email: 'sarah.smith@example.com',
        firstName: 'Sarah',
        lastName: 'Smith',
        role: 'guest',
        joinedDate: new Date('2024-02-20'),
        status: 'active',
        listingsCount: 0,
        bookingsCount: 5,
        lastActive: new Date('2024-03-18'),
        avatar: 'https://example.com/avatar2.jpg'
      },
      {
        id: '3',
        email: 'mike.johnson@example.com',
        firstName: 'Mike',
        lastName: 'Johnson',
        role: 'host',
        joinedDate: new Date('2024-01-10'),
        status: 'suspended',
        listingsCount: 2,
        bookingsCount: 8,
        lastActive: new Date('2024-03-10'),
        avatar: 'https://example.com/avatar3.jpg'
      },
      {
        id: '4',
        email: 'emily.wilson@example.com',
        firstName: 'Emily',
        lastName: 'Wilson',
        role: 'guest',
        joinedDate: new Date('2024-03-01'),
        status: 'active',
        listingsCount: 0,
        bookingsCount: 2,
        lastActive: new Date('2024-03-19'),
        avatar: 'https://example.com/avatar4.jpg'
      }
    ];
  }

  private generateMockListings(): AdminListing[] {
    return [
      {
        id: '1',
        title: 'Luxury Beach Villa with Private Pool',
        host: 'John Doe',
        hostId: '1',
        type: 'Entire Villa',
        status: 'active',
        price: 350,
        location: 'Malibu, CA',
        rating: 4.9,
        reviewCount: 47,
        createdAt: new Date('2024-01-20'),
        lastBooking: new Date('2024-03-15'),
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        images: ['https://example.com/listing1-1.jpg'],
        amenities: ['Pool', 'Ocean View', 'WiFi', 'Kitchen']
      },
      {
        id: '2',
        title: 'Cozy Downtown Apartment',
        host: 'Mike Johnson',
        hostId: '3',
        type: 'Entire Apartment',
        status: 'suspended',
        price: 120,
        location: 'New York, NY',
        rating: 4.7,
        reviewCount: 23,
        createdAt: new Date('2024-02-15'),
        lastBooking: new Date('2024-03-10'),
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        images: ['https://example.com/listing2-1.jpg'],
        amenities: ['WiFi', 'Kitchen', 'Washer']
      },
      {
        id: '3',
        title: 'Mountain View Cabin',
        host: 'John Doe',
        hostId: '1',
        type: 'Entire Cabin',
        status: 'pending',
        price: 200,
        location: 'Aspen, CO',
        rating: 4.8,
        reviewCount: 15,
        createdAt: new Date('2024-03-01'),
        lastBooking: new Date('2024-03-18'),
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        images: ['https://example.com/listing3-1.jpg'],
        amenities: ['Fireplace', 'Mountain View', 'Hot Tub', 'WiFi']
      },
      {
        id: '4',
        title: 'Modern City Loft',
        host: 'Sarah Chen',
        hostId: '5',
        type: 'Entire Loft',
        status: 'active',
        price: 180,
        location: 'Chicago, IL',
        rating: 4.6,
        reviewCount: 34,
        createdAt: new Date('2024-02-01'),
        lastBooking: new Date('2024-03-16'),
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        images: ['https://example.com/listing4-1.jpg'],
        amenities: ['WiFi', 'Gym', 'Pool', 'Parking']
      }
    ];
  }
}
